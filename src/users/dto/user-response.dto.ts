import { ApiProperty } from '@nestjs/swagger';
import { PokemonDto } from './pokemon.dto';

export class UserResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Incremental unique identifier of the user',
  })
  id: number;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address of the user',
  })
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  name: string;

  @ApiProperty({
    example: 'MySecurePass123',
    description: 'User password (plain text for now, will be hashed later)',
  })
  password: string;

  @ApiProperty({
    type: [PokemonDto],
    example: [
      { id: 25, name: 'pikachu' },
      { id: 1, name: 'bulbasaur' },
      { id: 4, name: 'charmander' },
    ],
    description: 'Pokemons held by the user, resolved from PokeAPI',
  })
  pokemons: PokemonDto[];
}
