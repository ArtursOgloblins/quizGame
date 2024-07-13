import {UserQueryParamsDTO} from "../../api/dto/input/user-queryParams.dto";
import {IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {UsersQueryRepository} from "../users.query-repostory";
import {PaginatedUserResponseDTO} from "../../api/dto/output/paginated-users-response.dto";


export class FindUsers {
  constructor(public readonly params: UserQueryParamsDTO) {}
}

@QueryHandler(FindUsers)
export class FindUsersQuery implements IQueryHandler<FindUsers> {
  constructor(private usersQueryRepository: UsersQueryRepository) {}

  async execute(query: FindUsers): Promise<PaginatedUserResponseDTO> {
    const { params } = query;

    return await this.usersQueryRepository.getAllUsers(params);
  }
}
