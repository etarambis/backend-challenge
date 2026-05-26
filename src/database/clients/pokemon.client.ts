import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface PokemonDetail {
  id: number;
  name: string;
}

@Injectable()
export class PokemonClient {
  private readonly http: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    this.http = axios.create({
      baseURL: this.configService.get<string>('POKEAPI_BASE_URL'),
    });
  }

  async getPokemonById(pokemonId: number): Promise<PokemonDetail> {
    try {
      const { data } = await this.http.get<{ name: string }>(
        `/pokemon/${pokemonId}`,
      );
      return { id: pokemonId, name: data.name };
    } catch {
      throw new NotFoundException(`Pokemon with id "${pokemonId}" not found`);
    }
  }

  async getPokemonDetails(pokemonIds: number[]): Promise<PokemonDetail[]> {
    return Promise.all(pokemonIds.map((id) => this.getPokemonById(id)));
  }
}
