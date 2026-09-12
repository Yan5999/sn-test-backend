import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsString({ message: 'Text must be a string.' })
  @IsNotEmpty({ message: 'Text is required.' })
  @MaxLength(1000, { message: 'Comment must be at most 1000 characters.' })
  text: string;
}
