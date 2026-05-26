import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserResponseDto } from './dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  const mockResponse: UserResponseDto = {
    id: 1,
    email: 'john@example.com',
    name: 'John Doe',
    password: 'password123',
    pokemons: [
      { id: 1, name: 'bulbasaur' },
      { id: 4, name: 'charmander' },
      { id: 7, name: 'squirtle' },
    ],
  };

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      replace: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should delegate findAll to the service', async () => {
    service.findAll.mockResolvedValue([]);

    await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
  });

  it('should delegate create to the service', async () => {
    const dto = {
      email: 'john@example.com',
      name: 'John Doe',
      password: 'password123',
      pokemonIds: [1, 4, 7],
    };
    service.create.mockResolvedValue(mockResponse);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result.email).toBe(dto.email);
    expect(result.pokemons).toEqual(mockResponse.pokemons);
  });

  it('should delegate replace to the service', async () => {
    const dto = {
      email: 'jane@example.com',
      name: 'Jane Doe',
      password: 'newpassword123',
      pokemonIds: [1, 4, 7],
    };
    service.replace.mockResolvedValue({
      ...mockResponse,
      email: dto.email,
      name: dto.name,
    });

    const result = await controller.replace(1, dto);

    expect(service.replace).toHaveBeenCalledWith(1, dto);
    expect(result.name).toBe(dto.name);
  });
});
