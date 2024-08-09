import {IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {GameQueryRepository} from "../game.query-repository";
import {GameResponseDTO, GameStatus} from "../../api/output/game-response.dto";
import {NotFoundException} from "@nestjs/common";
import {AccessTokenPayloadDTO} from "../../../auth/api/dto/input/access-token-params.dto";

export class GetCurrentGame {
    constructor(public user: AccessTokenPayloadDTO) {}
}

@QueryHandler(GetCurrentGame)
export class GetCurrentGameQuery implements IQueryHandler<GetCurrentGame> {
    constructor(private gameQueryRepository: GameQueryRepository) {}

    async execute(query: GetCurrentGame): Promise<GameResponseDTO> {
        const { user } = query;
        const userId = user.userId
        const activeStatus = GameStatus.Active
        const pendingStatus = GameStatus.PendingSecondPlayer
        const game = await this.gameQueryRepository.getUsersActiveGame(userId, activeStatus, pendingStatus);

        if (!game) {
            throw new NotFoundException(`Game not found.`);
        } else {
            const activeGameResponse = new GameResponseDTO(game)
            console.log('activeGameResponse',activeGameResponse)
            return activeGameResponse
        }
    }
}
