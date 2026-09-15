import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Role } from '../../generated/client/enums.js';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  name: string;

  @IsEnum(Role)
  role: Role;
}
