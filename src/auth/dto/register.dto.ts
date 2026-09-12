import {
  IsEmail,
  IsLowercase,
  IsNotEmpty,
  IsString,
  MinLength,
  Validate,
} from 'class-validator';

export class RegisterDto {
  @IsString({ message: 'Username must be a string.' })
  @IsNotEmpty({ message: 'Username is required.' })
  @IsLowercase({ message: 'Username must be in lowercase' })
  username: string;

  @IsString({ message: 'Email must be a string.' })
  @IsEmail({}, { message: 'Invalid email format.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;

  @IsString({ message: 'Password must be a string.' })
  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(6, {
    message: 'Password must be at least 6 characters long.',
  })
  password: string;
}
