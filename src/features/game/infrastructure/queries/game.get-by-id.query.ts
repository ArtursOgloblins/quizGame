import {IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {GameQueryRepository} from "../game.query-repository";
import {GameResponseDTO} from "../../api/output/game-response.dto";
import {ForbiddenException, NotFoundException} from "@nestjs/common";
import {AccessTokenPayloadDTO} from "../../../auth/api/dto/input/access-token-params.dto";
import {Game} from "../../domain/game.entity";

export class GetGameById {
    constructor(public readonly gameId: number,
                public readonly user: AccessTokenPayloadDTO) {}
}

@QueryHandler(GetGameById)
export class GetGameByIdQuery implements IQueryHandler<GetGameById> {
    constructor(private gameQueryRepository: GameQueryRepository) {}

    async execute(query: GetGameById): Promise<GameResponseDTO> {
        const { gameId, user } = query;
        const game: Game = await this.gameQueryRepository.getGameById(gameId);

        if (!game) {
            throw new NotFoundException(`Game with ID ${gameId} not found.`);
        }

        const isUserInTheGame = await this.checkGameUsers(user.userId, game)
        if (!isUserInTheGame) {
            throw new ForbiddenException(`User is not participant of this game`)
        }
        return new GameResponseDTO(game)

    }

    private async checkGameUsers(userId: string, game: Game) {
        return game.playerOne?.user?.id === +userId || game.playerTwo?.user?.id === +userId
    }
}