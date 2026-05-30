import { config } from 'dotenv';
import { resolve } from 'path';
import { DataSource } from 'typeorm';
import { buildTypeOrmOptions } from './typeorm.config';

config({ path: resolve(__dirname, '../../.env') });
config({ path: resolve(__dirname, '../../.env.test'), override: true });

export default new DataSource(buildTypeOrmOptions(process.env));
