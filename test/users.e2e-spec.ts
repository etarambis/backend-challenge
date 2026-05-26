import * as request from 'supertest';
import { App } from 'supertest/types';
import { INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../src/database/entities/user.entity';
import { initTestApp } from './helpers/test-app.helper';

// ── Fixtures ──────────────────────────────────────────────────────────────────
const POKEMON_FIXTURES: Record<number, string> = {
  1: 'bulbasaur',
  4: 'charmander',
  7: 'squirtle',
  6: 'charizard',
  9: 'blastoise',
  25: 'pikachu',
};

const BASE_IDS = [1, 4, 7];
const BASE_POKEMONS = BASE_IDS.map((id) => ({
  id,
  name: POKEMON_FIXTURES[id],
}));

const userPayload = (overrides: Record<string, unknown> = {}) => ({
  email: 'ash@example.com',
  name: 'Ash Ketchum',
  password: 'password123',
  pokemonIds: BASE_IDS,
  ...overrides,
});

// ── Suite ─────────────────────────────────────────────────────────────────────
describe('Users (e2e)', () => {
  let app: INestApplication<App>;
  let usersRepo: Repository<User>;
  let httpGetSpy: jest.SpyInstance;

  beforeAll(async () => {
    ({ app, usersRepo, httpGetSpy } = await initTestApp(POKEMON_FIXTURES));
  });

  afterAll(async () => {
    await usersRepo.clear();
    await app.close();
  });

  beforeEach(async () => {
    await usersRepo.clear();
    httpGetSpy.mockClear();
  });

  // ── POST /users ─────────────────────────────────────────────────────────────
  describe('POST /users', () => {
    it('creates a user and returns resolved pokemon details', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/users')
        .send(userPayload())
        .expect(201);

      expect(body).toMatchObject({
        email: 'ash@example.com',
        name: 'Ash Ketchum',
        pokemons: BASE_POKEMONS,
      });
      expect(body.id).toBeDefined();
      // 3 calls to validate IDs on create + 3 calls to enrich the response
      expect(httpGetSpy).toHaveBeenCalledTimes(6);
    });

    it('calls GET /pokemon/:id for each pokemon ID', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send(userPayload())
        .expect(201);

      BASE_IDS.forEach((id) => {
        expect(httpGetSpy).toHaveBeenCalledWith(`/pokemon/${id}`);
      });
    });

    it('returns 409 when email already exists', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send(userPayload())
        .expect(201);
      await request(app.getHttpServer())
        .post('/users')
        .send(userPayload())
        .expect(409);
    });

    it('returns 400 when pokemonIds has fewer than 3 items', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send(userPayload({ pokemonIds: [1, 2] }))
        .expect(400);
    });

    it('returns 400 when pokemonIds has more than 3 items', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send(userPayload({ pokemonIds: [1, 2, 3, 4] }))
        .expect(400);
    });

    it('returns 400 when required fields are missing', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({ email: 'incomplete@example.com' })
        .expect(400);
    });
  });

  // ── GET /users ──────────────────────────────────────────────────────────────
  // "describe" es una funcion de jest que se encarga de agrupar tests relacionados
  describe('GET /users', () => {
    it('returns all users with resolved pokemon details', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send(userPayload())
        .expect(201);

      const { body } = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(body).toHaveLength(1);
      expect(body[0]).toMatchObject({
        email: 'ash@example.com',
        pokemons: BASE_POKEMONS,
      });
    });

    describe('GET /users/:id', () => {
      it('returns a single user with resolved pokemon details', async () => {
        const { body: created } = await request(app.getHttpServer())
          .post('/users')
          .send(userPayload())
          .expect(201);

        const { body } = await request(app.getHttpServer())
          .get(`/users/${created.id}`)
          .expect(200);

        expect(body).toMatchObject({ id: created.id, pokemons: BASE_POKEMONS });
      });

      it('returns 404 for an unknown id', async () => {
        await request(app.getHttpServer()).get('/users/9999').expect(404);
      });
    });
    it('returns empty array when no users exist', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/users')
        .expect(200);
      expect(body).toEqual([]);
    });
  });

  // ── GET /users/:id ──────────────────────────────────────────────────────────

  // ── PUT /users/:id ──────────────────────────────────────────────────────────
  describe('PUT /users/:id', () => {
    it('replaces all user fields including pokemons', async () => {
      const { body: created } = await request(app.getHttpServer())
        .post('/users')
        .send(userPayload())
        .expect(201);

      const newIds = [25, 6, 9];
      const { body } = await request(app.getHttpServer())
        .put(`/users/${created.id}`)
        .send(userPayload({ email: 'misty@example.com', pokemonIds: newIds }))
        .expect(200);

      expect(body.email).toBe('misty@example.com');
      expect(body.pokemons).toEqual(
        newIds.map((id) => ({ id, name: POKEMON_FIXTURES[id] })),
      );
    });

    it('returns 404 for an unknown id', async () => {
      await request(app.getHttpServer())
        .put('/users/9999')
        .send(userPayload())
        .expect(404);
    });
  });

  // ── PATCH /users/:id ────────────────────────────────────────────────────────
  describe('PATCH /users/:id', () => {
    it('partially updates a user', async () => {
      const { body: created } = await request(app.getHttpServer())
        .post('/users')
        .send(userPayload())
        .expect(201);

      const { body } = await request(app.getHttpServer())
        .patch(`/users/${created.id}`)
        .send({ name: 'Misty' })
        .expect(200);

      expect(body.name).toBe('Misty');
      expect(body.email).toBe('ash@example.com');
      expect(body.pokemons).toEqual(BASE_POKEMONS);
    });

    it('returns 404 for an unknown id', async () => {
      await request(app.getHttpServer())
        .patch('/users/9999')
        .send({ name: 'Ghost' })
        .expect(404);
    });
  });

  // ── DELETE /users/:id ────────────────────────────────────────────────────────
  describe('DELETE /users/:id', () => {
    it('deletes a user and returns 204', async () => {
      const { body: created } = await request(app.getHttpServer())
        .post('/users')
        .send(userPayload())
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/users/${created.id}`)
        .expect(204);
      await request(app.getHttpServer())
        .get(`/users/${created.id}`)
        .expect(404);
    });

    it('returns 404 for an unknown id', async () => {
      await request(app.getHttpServer()).delete('/users/9999').expect(404);
    });
  });
});
