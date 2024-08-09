import {IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {GameQueryRepository} from "../game.query-repository";
import {GameStatus} from "../../api/output/game-response.dto";
import {AccessTokenPayloadDTO} from "../../../auth/api/dto/input/access-token-params.dto";
import {GamesQueryParamsDTO} from "../../api/input/games-query-params.dto";
import {PaginatedGamesResponseDto} from "../../api/output/paginated-games-response.dto";

export class GetAllUserGames {
    constructor(public user: AccessTokenPayloadDTO,
                public queryParams:GamesQueryParamsDTO
    ) {}
}

@QueryHandler(GetAllUserGames)
export class GetAllUserGamesQuery implements IQueryHandler<GetAllUserGames> {
    constructor(private gameQueryRepository: GameQueryRepository) {}

    async execute(query: GetAllUserGames): Promise<PaginatedGamesResponseDto> {
        const { user, queryParams } = query;
        const userId = user.userId
        const activeStatus = GameStatus.Active
        const pendingStatus = GameStatus.PendingSecondPlayer
        return await this.gameQueryRepository.getAllMyGames(userId, activeStatus, pendingStatus, queryParams);
    }
}
