import { ApiProperty } from '@nestjs/swagger';

export class PokemonDto {
  @ApiProperty({ example: 25, description: 'Pokemon ID from PokeAPI' })
  id: number;

  @ApiProperty({ example: 'pikachu', description: 'Pokemon name from PokeAPI' })
  name: string;
}
