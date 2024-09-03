import {IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {GameQueryRepository} from "../game.query-repository";
import {GameStatus} from "../../api/output/game-response.dto";
import {UsersTopQueryParamsDTO} from "../../api/input/users-top-query-params.dto";
import {PaginatedUsersTopResponseDTO} from "../../api/output/user-top-response.dto";

export class GetUsersTop {
    constructor( public queryParams:UsersTopQueryParamsDTO
    ) {}
}

@QueryHandler(GetUsersTop)
export class GetUsersTopQuery implements IQueryHandler<GetUsersTop> {
    constructor(private gameQueryRepository: GameQueryRepository) {}

    async execute(query: GetUsersTop): Promise<PaginatedUsersTopResponseDTO> {
        const { queryParams } = query;
        const finishedStatus = GameStatus.Finished
        return await this.gameQueryRepository.getUsersTop(finishedStatus, queryParams);
    }
}