import { config } from 'dotenv';
import { resolve } from 'path';
import { DataSource } from 'typeorm';
import { assertSeedsAllowed } from './seed-guard';
import { buildSeedTypeOrmOptions } from './typeorm.config';

config({ path: resolve(__dirname, '../../.env') });

assertSeedsAllowed(process.env.NODE_ENV);

export default new DataSource(buildSeedTypeOrmOptions(process.env));
