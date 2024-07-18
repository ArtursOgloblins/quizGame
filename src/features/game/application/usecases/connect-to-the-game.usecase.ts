import {AccessTokenPayloadDTO} from "../../../auth/api/dto/input/access-token-params.dto";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {GameResponseDTO, GameStatus} from "../../api/output/game-response.dto";
import {GameRepository} from "../../infrastructure/game.repository";
import {GameQueryRepository} from "../../infrastructure/game.query-repository";
import {QuestionsQueryRepository} from "../../../questions/infrastructure/questions.query-repository";
import {ForbiddenException} from "@nestjs/common";

export class ConnectToTheGameCommand {
    constructor(public user: AccessTokenPayloadDTO) {}
}

@CommandHandler(ConnectToTheGameCommand)
export class ConnectToTheGameUseCase implements ICommandHandler<ConnectToTheGameCommand> {
    constructor(private gameRepository: GameRepository,
                private gameQueryRepository: GameQueryRepository,
                private questionsQueryRepository: QuestionsQueryRepository) {
    }

    async execute (command: ConnectToTheGameCommand): Promise<GameResponseDTO> {
        const { user } = command
        const pendingStatus = GameStatus.PendingSecondPlayer
        const activeStatus= GameStatus.Active
        const existingGame = await this.isExistingGame(pendingStatus);
        const isPlayerInActiveGame = await this.isPlayerActive(user)

        const questionsNumber = 5
        const randomQuestions = await this.questionsQueryRepository.getRandomQuestions(questionsNumber)

        if (isPlayerInActiveGame) {
            throw new ForbiddenException('User is already in Active game');
        }

        let game: any
        if (!existingGame) {
            game = await this.gameRepository.registerNewGame(user, pendingStatus, randomQuestions);
        } else {
            game = await this.gameRepository.addSecondPlayerToTheGame(existingGame, user, activeStatus);
        }

        const gameResponse = new GameResponseDTO(game);
        console.log('gameResponse', gameResponse);
        return gameResponse;
    }

        private async isPlayerActive(user: AccessTokenPayloadDTO) {
            const playerStatus = GameStatus.Active
            return await this.gameQueryRepository.isPlayerActive(user.userId, playerStatus)
        }

        private async  isExistingGame(pendingStatus: GameStatus) {
            return await this.gameQueryRepository.getPendingGame(pendingStatus)
        }
}