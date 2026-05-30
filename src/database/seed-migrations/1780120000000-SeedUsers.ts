import { MigrationInterface, QueryRunner } from 'typeorm';
import { isSeedEnvironment } from '../seed-guard';

const SEED_USERS = [
  {
    email: 'john.doe@example.com',
    name: 'John Doe',
    password: 'SecurePass123',
    pokemonIds: [25, 1, 4],
  },
  {
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    password: 'SecurePass456',
    pokemonIds: [7, 133, 25],
  },
  {
    email: 'ash.ketchum@example.com',
    name: 'Ash Ketchum',
    password: 'Pokeball789',
    pokemonIds: [25, 6, 9],
  },
] as const;

export class SeedUsers1780120000000 implements MigrationInterface {
  name = 'SeedUsers1780120000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!isSeedEnvironment()) {
      return;
    }

    for (const user of SEED_USERS) {
      await queryRunner.query(
        `INSERT INTO "users" ("email", "name", "password", "pokemonIds")
         VALUES ($1, $2, $3, $4)
         ON CONFLICT ("email") DO NOTHING`,
        [user.email, user.name, user.password, user.pokemonIds],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!isSeedEnvironment()) {
      return;
    }

    await queryRunner.query(`DELETE FROM "users" WHERE "email" = ANY($1)`, [
      SEED_USERS.map((user) => user.email),
    ]);
  }
}
