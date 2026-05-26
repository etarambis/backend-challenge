import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PokemonClient } from './clients/pokemon.client';
import { entities } from './entities';
import { getTypeOrmConfig } from './typeorm.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getTypeOrmConfig,
    }),
    TypeOrmModule.forFeature(entities),
  ],
  providers: [PokemonClient],
  exports: [TypeOrmModule, PokemonClient],
})
export class DatabaseModule {}
