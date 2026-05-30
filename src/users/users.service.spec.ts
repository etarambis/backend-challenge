import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../database/entities/user.entity';
import { CreateUserDto } from './dto';
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

  it('should return a user by id', async () => {
    repository.findById.mockResolvedValue(mockUser);

    const result = await service.findById(1);

    expect(result.id).toBe(1);
    expect(result.email).toBe('john@example.com');
    expect(repository.findById).toHaveBeenCalledWith(1);
  });

  it('should throw when user is not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.findById(999)).rejects.toThrow(NotFoundException);
  });

  it('should create a user without pokemonIds', async () => {
    repository.findByEmail.mockResolvedValue(null);
    repository.create.mockResolvedValue({
      ...mockUser,
      pokemonIds: [],
      pokemonDetails: [],
    });

    const result = await service.create({
      email: 'john@example.com',
      name: 'John Doe',
      password: 'password123',
    } as CreateUserDto);

    expect(result.pokemons).toEqual([]);
    expect(repository.create).toHaveBeenCalledWith({
      email: 'john@example.com',
      name: 'John Doe',
      password: 'password123',
      pokemonIds: [],
    });
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

  it('should throw when replacing a missing user', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      service.replace(999, {
        email: 'jane@example.com',
        name: 'Jane Doe',
        password: 'newpassword123',
        pokemonIds: [1],
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw when email already exists on replace', async () => {
    repository.findById.mockResolvedValue(mockUser);
    repository.findByEmail.mockResolvedValue({ ...mockUser, id: 2 });

    await expect(
      service.replace(1, {
        email: 'other@example.com',
        name: 'Jane Doe',
        password: 'newpassword123',
        pokemonIds: [1],
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should throw when replace update returns null', async () => {
    repository.findById.mockResolvedValue(mockUser);
    repository.findByEmail.mockResolvedValue(null);
    repository.update.mockResolvedValue(null);

    await expect(
      service.replace(1, {
        email: 'john@example.com',
        name: 'Jane Doe',
        password: 'newpassword123',
        pokemonIds: [1],
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should replace a user without changing email', async () => {
    repository.findById.mockResolvedValue(mockUser);
    repository.update.mockResolvedValue({ ...mockUser, name: 'Jane Doe' });

    const result = await service.replace(1, {
      email: 'john@example.com',
      name: 'Jane Doe',
      password: 'newpassword123',
      pokemonIds: [1, 4, 7],
    });

    expect(result.name).toBe('Jane Doe');
    expect(repository.findByEmail).not.toHaveBeenCalled();
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

  it('should update a user', async () => {
    repository.findById.mockResolvedValue(mockUser);
    repository.update.mockResolvedValue({ ...mockUser, name: 'Jane Doe' });

    const result = await service.update(1, { name: 'Jane Doe' });

    expect(result.name).toBe('Jane Doe');
    expect(repository.update).toHaveBeenCalledWith(1, { name: 'Jane Doe' });
  });

  it('should throw when updating a missing user', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.update(999, { name: 'Jane Doe' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw when email already exists on update', async () => {
    repository.findById.mockResolvedValue(mockUser);
    repository.findByEmail.mockResolvedValue({ ...mockUser, id: 2 });

    await expect(
      service.update(1, { email: 'other@example.com' }),
    ).rejects.toThrow(ConflictException);
  });

  it('should throw when update returns null', async () => {
    repository.findById.mockResolvedValue(mockUser);
    repository.update.mockResolvedValue(null);

    await expect(service.update(1, { name: 'Jane Doe' })).rejects.toThrow(
      NotFoundException,
    );
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
