import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsString({ message: 'Text must be a string.' })
  @IsNotEmpty({ message: 'Text is required.' })
  @MaxLength(5000, { message: 'Text must be at most 5000 characters.' })
  text: string;
}
