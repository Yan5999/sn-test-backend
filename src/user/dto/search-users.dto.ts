import { IsNotEmpty, IsString } from 'class-validator';

import { PaginationDto } from '../../libs/common/dto/pagination.dto';

export class SearchUsersDto extends PaginationDto {
  @IsString()
  @IsNotEmpty({ message: 'Search query is required.' })
  query: string;
}
