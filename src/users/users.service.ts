import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../database/entities/user.entity';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.findAll();
    return users.map((u) => this.toResponse(u));
  }

  async findById(id: number): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }
    return this.toResponse(user);
  }

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(
        `User with email "${dto.email}" already exists`,
      );
    }

    const user = await this.usersRepository.create({
      email: dto.email,
      name: dto.name,
      password: dto.password,
      pokemonIds: dto.pokemonIds ?? [],
    });
    return this.toResponse(user);
  }

  async replace(id: number, dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }

    if (dto.email !== user.email) {
      const existing = await this.usersRepository.findByEmail(dto.email);
      if (existing) {
        throw new ConflictException(
          `User with email "${dto.email}" already exists`,
        );
      }
    }

    const updated = await this.usersRepository.update(id, {
      email: dto.email,
      name: dto.name,
      password: dto.password,
      pokemonIds: dto.pokemonIds,
    });
    if (!updated) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }
    return this.toResponse(updated);
  }

  async update(id: number, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.usersRepository.findByEmail(dto.email);
      if (existing) {
        throw new ConflictException(
          `User with email "${dto.email}" already exists`,
        );
      }
    }

    const updated = await this.usersRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }
    return this.toResponse(updated);
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.usersRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }
  }

  private toResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password,
      pokemons: user.pokemonDetails ?? [],
    };
  }
}
