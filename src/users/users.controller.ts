import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBadRequestResponse({
  description: 'Validation failed (invalid email, missing fields, etc.)',
})
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'List all users',
    description:
      'Returns every user stored in the system, including their pokemon names.',
  })
  @ApiOkResponse({
    description: 'List of users',
    type: UserResponseDto,
    isArray: true,
  })
  findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a user by ID',
    description:
      'Returns a single user by their incremental numeric ID, including pokemon names fetched from PokeAPI.',
  })
  @ApiParam({
    name: 'id',
    description: 'Incremental user ID',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description: 'User found',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  findById(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    return this.usersService.findById(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new user',
    description:
      'Creates a user with a new incremental ID. Email must be unique.',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiConflictResponse({ description: 'Email already exists' })
  create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(dto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Replace a user (full update)',
    description:
      'Replaces all user fields. Both email and name are required in the body.',
  })
  @ApiParam({
    name: 'id',
    description: 'Incremental user ID',
    type: Number,
    example: 1,
  })
  @ApiBody({ type: CreateUserDto })
  @ApiOkResponse({
    description: 'User replaced successfully',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiConflictResponse({ description: 'Email already exists' })
  replace(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.replace(id, dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a user (partial update)',
    description: 'Updates only the fields sent in the request body.',
  })
  @ApiParam({
    name: 'id',
    description: 'Incremental user ID',
    type: Number,
    example: 1,
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiConflictResponse({ description: 'Email already exists' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a user',
    description:
      'Permanently removes a user by ID. Returns no content on success.',
  })
  @ApiParam({
    name: 'id',
    description: 'Incremental user ID',
    type: Number,
    example: 1,
  })
  @ApiNoContentResponse({ description: 'User deleted successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.usersService.delete(id);
  }
}
