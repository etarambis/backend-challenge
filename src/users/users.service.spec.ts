import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../database/entities/user.entity';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { PokemonClient } from '../database/clients/pokemon.client';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;

  const mockUser: User = {
    id: 1,
    email: 'john@example.com',
    name: 'John Doe',
    password: 'password123',
    pokemonIds: [1, 4, 7],
    pokemonDetails: [
      { id: 1, name: 'bulbasaur' },
      { id: 4, name: 'charmander' },
      { id: 7, name: 'squirtle' },
    ],
  };

  beforeEach(async () => {
    repository = {
      pokemonClient: {} as PokemonClient,
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<UsersRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should return all users', async () => {
    repository.findAll.mockResolvedValue([mockUser]);

    const result = await service.findAll();

    expect(result).toHaveLength(1);
    expect(result[0].email).toBe('john@example.com');
    expect(result[0].pokemons).toEqual(mockUser.pokemonDetails);
    expect(repository.findAll).toHaveBeenCalled();
  });

  it('should throw when user is not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.findById(999)).rejects.toThrow(NotFoundException);
  });

  it('should create a user', async () => {
    repository.findByEmail.mockResolvedValue(null);
    repository.create.mockResolvedValue(mockUser);

    const result = await service.create({
      email: 'john@example.com',
      name: 'John Doe',
      password: 'password123',
      pokemonIds: [1, 4, 7],
    });

    expect(result.id).toBe(1);
    expect(result.pokemons).toEqual(mockUser.pokemonDetails);
    expect(repository.create).toHaveBeenCalledWith({
      email: 'john@example.com',
      name: 'John Doe',
      password: 'password123',
      pokemonIds: [1, 4, 7],
    });
  });

  it('should replace a user', async () => {
    repository.findById.mockResolvedValue(mockUser);
    repository.findByEmail.mockResolvedValue(null);
    repository.update.mockResolvedValue({
      ...mockUser,
      email: 'jane@example.com',
      name: 'Jane Doe',
      password: 'newpassword123',
    });

    const result = await service.replace(1, {
      email: 'jane@example.com',
      name: 'Jane Doe',
      password: 'newpassword123',
      pokemonIds: [1, 4, 7],
    });

    expect(result.email).toBe('jane@example.com');
    expect(repository.update).toHaveBeenCalledWith(1, {
      email: 'jane@example.com',
      name: 'Jane Doe',
      password: 'newpassword123',
      pokemonIds: [1, 4, 7],
    });
  });

  it('should throw when email already exists on create', async () => {
    repository.findByEmail.mockResolvedValue(mockUser);

    await expect(
      service.create({
        email: 'john@example.com',
        name: 'John Doe',
        password: 'password123',
        pokemonIds: [1, 4, 7],
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should delete a user', async () => {
    repository.delete.mockResolvedValue(true);

    await expect(service.delete(1)).resolves.toBeUndefined();
  });

  it('should throw when deleting a missing user', async () => {
    repository.delete.mockResolvedValue(false);

    await expect(service.delete(999)).rejects.toThrow(NotFoundException);
  });
});
