import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ResendDto {
  @IsString({ message: 'Email must be a string.' })
  @IsEmail({}, { message: 'Invalid email format.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;
}
