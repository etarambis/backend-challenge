import { PokemonClient } from '../database/clients/pokemon.client';
import { User } from '../database/entities/user.entity';

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  pokemonIds: number[];
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  password?: string;
  pokemonIds?: number[];
}

export abstract class UsersRepository {
  constructor(protected readonly pokemonClient: PokemonClient) {}

  abstract findAll(): Promise<User[]>;
  abstract findById(id: number): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract create(data: CreateUserData): Promise<User>;
  abstract update(id: number, data: UpdateUserData): Promise<User | null>;
  abstract delete(id: number): Promise<boolean>;
}
