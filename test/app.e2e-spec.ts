import * as request from 'supertest';
import { App } from 'supertest/types';
import { INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../src/database/entities/user.entity';
import { initTestApp } from './helpers/test-app.helper';

const POKEMON_FIXTURES: Record<number, string> = {
  1: 'bulbasaur',
  4: 'charmander',
  7: 'squirtle',
};

const BASE_IDS = [1, 4, 7];

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let usersRepo: Repository<User>;

  beforeAll(async () => {
    ({ app, usersRepo } = await initTestApp(POKEMON_FIXTURES));
  });

  afterAll(async () => {
    await usersRepo.clear();
    await app.close();
  });

  beforeEach(async () => {
    await usersRepo.clear();
  });

  // ── Health ───────────────────────────────────────────────────────────────────
  it('GET / returns Hello World', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('GET /health returns status ok', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok' });
  });

  // ── GET /users ────────────────────────────────────────────────────────────────
  describe('GET /users', () => {
    it('returns an empty list when no users exist', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/users')
        .expect(200);
      expect(body).toEqual([]);
    });

    it('returns the list of users with their pokemons', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'ash@example.com',
          name: 'Ash Ketchum',
          password: 'password123',
          pokemonIds: BASE_IDS,
        })
        .expect(201);

      const { body } = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(body).toHaveLength(1);
      expect(body[0]).toMatchObject({
        email: 'ash@example.com',
        name: 'Ash Ketchum',
        pokemons: BASE_IDS.map((id) => ({ id, name: POKEMON_FIXTURES[id] })),
      });
    });

    it('returns multiple users', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'ash@example.com',
          name: 'Ash',
          password: 'password123',
          pokemonIds: BASE_IDS,
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'misty@example.com',
          name: 'Misty',
          password: 'password123',
          pokemonIds: BASE_IDS,
        })
        .expect(201);

      const { body } = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(body).toHaveLength(2);
      expect(body.map((u: { email: string }) => u.email)).toEqual(
        expect.arrayContaining(['ash@example.com', 'misty@example.com']),
      );
    });
  });
});
