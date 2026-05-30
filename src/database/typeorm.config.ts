import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { entities } from './entities';

export interface DatabaseEnv {
  DATABASE_URL?: string;
  DB_HOST?: string;
  DB_PORT?: string;
  DB_USERNAME?: string;
  DB_PASSWORD?: string;
  DB_DATABASE?: string;
  RUN_MIGRATIONS?: string;
}

const parseDatabaseUrl = (databaseUrl: string) => {
  const url = new URL(databaseUrl);

  return {
    host: url.hostname,
    port: parseInt(url.port || '5432', 10),
    username: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
  };
};

export const buildTypeOrmOptions = (
  env: DatabaseEnv,
): DataSourceOptions => {
  const databaseUrl = env.DATABASE_URL;
  const runMigrations = env.RUN_MIGRATIONS === 'true';

  const connection = databaseUrl
    ? parseDatabaseUrl(databaseUrl)
    : {
        host: env.DB_HOST ?? 'localhost',
        port: parseInt(env.DB_PORT ?? '5432', 10),
        username: env.DB_USERNAME ?? 'postgres',
        password: env.DB_PASSWORD ?? 'postgres',
        database: env.DB_DATABASE ?? 'challenge_cursor',
      };

  return {
    type: 'postgres',
    ...connection,
    entities,
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    migrationsTableName: 'custom_migration_table',
    migrationsRun: runMigrations,
    synchronize: false,
    ...(databaseUrl && {
      ssl: { rejectUnauthorized: false },
    }),
  };
};

export const buildSeedTypeOrmOptions = (
  env: DatabaseEnv,
): DataSourceOptions => ({
  ...buildTypeOrmOptions(env),
  migrations: [__dirname + '/seed-migrations/*{.ts,.js}'],
  migrationsTableName: 'custom_seed_migration_table',
  migrationsRun: false,
});

export const getTypeOrmConfig = (
  config: ConfigService,
): TypeOrmModuleOptions =>
  buildTypeOrmOptions({
    DATABASE_URL: config.get<string>('DATABASE_URL'),
    DB_HOST: config.get<string>('DB_HOST'),
    DB_PORT: config.get<string>('DB_PORT'),
    DB_USERNAME: config.get<string>('DB_USERNAME'),
    DB_PASSWORD: config.get<string>('DB_PASSWORD'),
    DB_DATABASE: config.get<string>('DB_DATABASE'),
    RUN_MIGRATIONS: config.get<string>('RUN_MIGRATIONS'),
  });
