import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PokemonClient } from './pokemon.client';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PokemonClient', () => {
  let client: PokemonClient;
  let httpGet: jest.Mock;

  beforeEach(() => {
    httpGet = jest.fn();
    mockedAxios.create.mockReturnValue({ get: httpGet } as never);

    const configService = {
      get: jest.fn().mockReturnValue('https://pokeapi.co/api/v2'),
    } as unknown as ConfigService;

    client = new PokemonClient(configService);
  });

  it('should fetch pokemon by id', async () => {
    httpGet.mockResolvedValue({ data: { name: 'bulbasaur' } });

    const result = await client.getPokemonById(1);

    expect(result).toEqual({ id: 1, name: 'bulbasaur' });
    expect(httpGet).toHaveBeenCalledWith('/pokemon/1');
  });

  it('should throw NotFoundException when pokemon is not found', async () => {
    httpGet.mockRejectedValue(new Error('404'));

    await expect(client.getPokemonById(999)).rejects.toThrow(NotFoundException);
  });

  it('should fetch details for multiple pokemon ids', async () => {
    httpGet
      .mockResolvedValueOnce({ data: { name: 'bulbasaur' } })
      .mockResolvedValueOnce({ data: { name: 'charmander' } });

    const result = await client.getPokemonDetails([1, 4]);

    expect(result).toEqual([
      { id: 1, name: 'bulbasaur' },
      { id: 4, name: 'charmander' },
    ]);
  });
});
