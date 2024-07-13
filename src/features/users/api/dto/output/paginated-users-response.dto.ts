import { UserResponseDTO } from './user-response.dto';

export class PaginatedUserResponseDTO {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: UserResponseDTO[];
}
