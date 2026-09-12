import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmationDto {
  @IsString({ message: 'The Token must be a string.' })
  @IsNotEmpty({ message: 'The token field must not be empty.' })
  token: string;
}
