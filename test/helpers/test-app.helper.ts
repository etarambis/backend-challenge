import * as dotenv from 'dotenv';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { PokemonClient } from '../../src/database/clients/pokemon.client';
import { User } from '../../src/database/entities/user.entity';

export interface TestContext {
  app: INestApplication<App>;
  usersRepo: Repository<User>;
  httpGetSpy: jest.SpyInstance;
}

/**
 * Extrae el pathname de una URL completa o retorna el string tal cual
 * cuando ya es un path (ej. /pokemon/1).
 * Permite que el mock compare por el path del endpoint sin importar el dominio.
 *
 *   https://pokeapi.co/api/v2/pokemon/1  →  /pokemon/1
 *   /pokemon/1                           →  /pokemon/1
 */
function toPath(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url.startsWith('/') ? url : `/${url}`;
  }
}

/**
 * Levanta la aplicación NestJS contra la base de datos de testing e
 * instala un mock con jest.spyOn sobre el método HTTP GET del PokemonClient.
 *
 * La configuración de la base de datos es tomada de .env.test, que sobreescribe
 * la variable DB_DATABASE de .env (el resto de las variables se mantienen igual).
 *
 * @param pokemonFixtures  Mapa de { [pokemonId]: nombre } usado para resolver
 *                         las respuestas de PokeAPI sin hacer llamadas reales a internet.
 */
export async function initTestApp(
  pokemonFixtures: Record<number, string>,
): Promise<TestContext> {
  // Sobreescribe DB_DATABASE (y cualquier otra variable de test) antes de que
  // el módulo NestJS arranque y el ConfigService lea process.env.
  dotenv.config({ path: '.env.test', override: true, quiet: true });

  const module: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = module.createNestApplication<INestApplication<App>>();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();

  const usersRepo = module.get<Repository<User>>(getRepositoryToken(User));

  // El spy se limita al axios instance propio del PokemonClient para que
  // ningún otro tráfico HTTP (TypeORM, health checks, etc.) sea interceptado.
  const pokemonClient = module.get(PokemonClient);
  const http = pokemonClient['http'];

  const httpGetSpy = jest
    .spyOn(http, 'get')
    .mockImplementation((url: string) => {
      const path = toPath(url);
      const id = Number(path.split('/').pop());
      const name = pokemonFixtures[id] ?? `pokemon-${id}`;
      return Promise.resolve({ data: { id, name } });
    });

  return { app, usersRepo, httpGetSpy };
}
