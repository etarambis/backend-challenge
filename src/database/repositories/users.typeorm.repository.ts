import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateUserData,
  UpdateUserData,
  UsersRepository,
} from '../../users/users.repository';
import { PokemonClient } from '../clients/pokemon.client';
import { User } from '../entities/user.entity';

@Injectable()
export class TypeOrmUsersRepository extends UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    pokemonClient: PokemonClient,
  ) {
    super(pokemonClient);
  }

  async findAll(): Promise<User[]> {
    const users = await this.usersRepository.find({ order: { id: 'ASC' } });
    return this.enrichManyWithPokemonNames(users);
  }

  async findById(id: number): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) return null;
    return this.enrichWithPokemonNames(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .where('LOWER(user.email) = LOWER(:email)', { email })
      .getOne();
    if (!user) return null;
    return this.enrichWithPokemonNames(user);
  }

  async create(data: CreateUserData): Promise<User> {
    await this.pokemonClient.getPokemonDetails(data.pokemonIds);

    const user = this.usersRepository.create({
      email: data.email,
      name: data.name,
      password: data.password,
      pokemonIds: data.pokemonIds,
    });
    const saved = await this.usersRepository.save(user);
    return this.enrichWithPokemonNames(saved);
  }

  async update(id: number, data: UpdateUserData): Promise<User | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    if (data.pokemonIds && data.pokemonIds.length > 0) {
      await this.pokemonClient.getPokemonDetails(data.pokemonIds);
    }

    await this.usersRepository.update(id, data);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.usersRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  private async enrichWithPokemonNames(user: User): Promise<User> {
    user.pokemonDetails =
      user.pokemonIds.length > 0
        ? await this.pokemonClient.getPokemonDetails(user.pokemonIds)
        : [];
    return user;
  }

  private enrichManyWithPokemonNames(users: User[]): Promise<User[]> {
    return Promise.all(users.map((u) => this.enrichWithPokemonNames(u)));
  }
}
