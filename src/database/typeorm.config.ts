import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { entities } from './entities';

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

export const getTypeOrmConfig = (
  config: ConfigService,
): TypeOrmModuleOptions => {
  const databaseUrl = config.get<string>('DATABASE_URL');
  const isProduction = config.get<string>('NODE_ENV') === 'production';
  // 1. Capturamos la variable FORCE_SYNC que seteamos en Heroku
  const forceSync = config.get<string>('FORCE_SYNC') === 'true';

  const connection = databaseUrl
    ? parseDatabaseUrl(databaseUrl)
    : {
        host: config.get<string>('DB_HOST', 'localhost'),
        port: parseInt(config.get<string>('DB_PORT', '5432'), 10),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_DATABASE', 'challenge_cursor'),
      };

  return {
    type: 'postgres',
    ...connection,
    entities,
    // 2. Si forceSync es true, se sincronizará la BD aunque estemos en producción
    synchronize: forceSync || !isProduction,
    ...(databaseUrl && {
      ssl: { rejectUnauthorized: false },
    }),
  };
};