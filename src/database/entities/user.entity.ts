
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { PokemonDetail } from '../clients/pokemon.client';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  password: string;

  @Column('int', { array: true, default: '{}' })
  pokemonIds: number[];

  // Populated by the repository after resolving details from PokeAPI — not persisted
  pokemonDetails: PokemonDetail[] = [];
}
