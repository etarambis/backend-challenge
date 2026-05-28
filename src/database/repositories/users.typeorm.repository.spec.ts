import { Repository } from 'typeorm';
import { PokemonClient } from '../clients/pokemon.client';
import { User } from '../entities/user.entity';
import { TypeOrmUsersRepository } from './users.typeorm.repository';

describe('TypeOrmUsersRepository', () => {
  let repository: TypeOrmUsersRepository;
  let typeOrmRepo: jest.Mocked<Repository<User>>;
  let pokemonClient: jest.Mocked<PokemonClient>;

  const pokemonDetails = [
    { id: 1, name: 'bulbasaur' },
    { id: 4, name: 'charmander' },
  ];

  const mockUser: User = {
    id: 1,
    email: 'john@example.com',
    name: 'John Doe',
    password: 'password123',
    pokemonIds: [1, 4],
    pokemonDetails: [],
  };

  beforeEach(() => {
    typeOrmRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;

    pokemonClient = {
      getPokemonDetails: jest.fn(),
      getPokemonById: jest.fn(),
    } as unknown as jest.Mocked<PokemonClient>;

    pokemonClient.getPokemonDetails.mockResolvedValue(pokemonDetails);

    repository = new TypeOrmUsersRepository(typeOrmRepo, pokemonClient);
  });

  it('should find all users enriched with pokemon names', async () => {
    typeOrmRepo.find.mockResolvedValue([mockUser]);

    const result = await repository.findAll();

    expect(typeOrmRepo.find).toHaveBeenCalledWith({ order: { id: 'ASC' } });
    expect(result[0].pokemonDetails).toEqual(pokemonDetails);
  });

  it('should return null when user is not found by id', async () => {
    typeOrmRepo.findOne.mockResolvedValue(null);

    const result = await repository.findById(999);

    expect(result).toBeNull();
  });

  it('should find user by id enriched with pokemon names', async () => {
    typeOrmRepo.findOne.mockResolvedValue({ ...mockUser });

    const result = await repository.findById(1);

    expect(result?.pokemonDetails).toEqual(pokemonDetails);
  });

  it('should return null when user is not found by email', async () => {
    const getOne = jest.fn().mockResolvedValue(null);
    typeOrmRepo.createQueryBuilder.mockReturnValue({
      where: jest.fn().mockReturnValue({ getOne }),
    } as never);

    const result = await repository.findByEmail('missing@example.com');

    expect(result).toBeNull();
  });

  it('should find user by email enriched with pokemon names', async () => {
    const getOne = jest.fn().mockResolvedValue({ ...mockUser });
    const where = jest.fn().mockReturnValue({ getOne });
    typeOrmRepo.createQueryBuilder.mockReturnValue({ where } as never);

    const result = await repository.findByEmail('john@example.com');

    expect(where).toHaveBeenCalledWith('LOWER(user.email) = LOWER(:email)', {
      email: 'john@example.com',
    });
    expect(result?.pokemonDetails).toEqual(pokemonDetails);
  });

  it('should create a user and enrich with pokemon names', async () => {
    typeOrmRepo.create.mockReturnValue(mockUser);
    typeOrmRepo.save.mockResolvedValue(mockUser);
    typeOrmRepo.findOne.mockResolvedValue(mockUser);

    const result = await repository.create({
      email: mockUser.email,
      name: mockUser.name,
      password: mockUser.password,
      pokemonIds: mockUser.pokemonIds,
    });

    expect(pokemonClient.getPokemonDetails).toHaveBeenCalledWith([1, 4]);
    expect(result.pokemonDetails).toEqual(pokemonDetails);
  });

  it('should return null when updating a missing user', async () => {
    typeOrmRepo.findOne.mockResolvedValue(null);

    const result = await repository.update(999, { name: 'Jane Doe' });

    expect(result).toBeNull();
  });

  it('should update a user without validating pokemon when ids are empty', async () => {
    const userWithoutPokemon = { ...mockUser, pokemonIds: [] };
    typeOrmRepo.findOne.mockResolvedValue(userWithoutPokemon);
    typeOrmRepo.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });

    await repository.update(1, { name: 'Jane Doe' });

    expect(pokemonClient.getPokemonDetails).not.toHaveBeenCalled();
    expect(typeOrmRepo.update).toHaveBeenCalledWith(1, { name: 'Jane Doe' });
  });

  it('should update a user and validate pokemon ids', async () => {
    typeOrmRepo.findOne.mockResolvedValue({ ...mockUser });
    typeOrmRepo.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });

    await repository.update(1, { pokemonIds: [1, 4] });

    expect(pokemonClient.getPokemonDetails).toHaveBeenCalledWith([1, 4]);
  });

  it('should delete a user', async () => {
    typeOrmRepo.delete.mockResolvedValue({ affected: 1, raw: [] });

    const result = await repository.delete(1);

    expect(result).toBe(true);
  });

  it('should return false when deleting a missing user', async () => {
    typeOrmRepo.delete.mockResolvedValue({ affected: 0, raw: [] });

    const result = await repository.delete(999);

    expect(result).toBe(false);
  });

  it('should skip pokemon lookup when user has no pokemon ids', async () => {
    const userWithoutPokemon = { ...mockUser, pokemonIds: [] };
    typeOrmRepo.findOne.mockResolvedValue(userWithoutPokemon);

    const result = await repository.findById(1);

    expect(pokemonClient.getPokemonDetails).not.toHaveBeenCalled();
    expect(result?.pokemonDetails).toEqual([]);
  });
});
