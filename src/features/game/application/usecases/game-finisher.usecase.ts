import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {GameRepository} from "../../infrastructure/game.repository";
import {GameQueryRepository} from "../../infrastructure/game.query-repository";
import {QuestionsQueryRepository} from "../../../questions/infrastructure/questions.query-repository";
import {Injectable} from "@nestjs/common";
import {GameStatus} from "../../api/output/game-response.dto";

export class GameFinisherCommand {
    constructor() {
    }
}

@CommandHandler(GameFinisherCommand)
@Injectable()
export class GameFinisherUseCase implements ICommandHandler<GameFinisherCommand> {
    constructor(private gameRepository: GameRepository,
                private gameQueryRepository: GameQueryRepository) {
    }

    async execute ():Promise<void> {
        const games =  await this.gameQueryRepository.getGamesToFinish()
        console.log('gamesToFinish', games);
        if (games.length > 0) {
            const mappedGamesToFinish = games.map(game => {
                const firstPlayer = [game.playerOne, game.playerTwo].find(player => player.status === GameStatus.Finished)
                const otherPlayer = [game.playerOne, game.playerTwo].find(player => player.status === GameStatus.Active)
                return {
                    gameId: game.id,
                    otherPlayerId: otherPlayer ? otherPlayer.id : null,
                    firstPlayerId: firstPlayer ? firstPlayer.id: null
                }
            })
            console.log(mappedGamesToFinish)

            const unansweredQuestionsMap  = await this.gameQueryRepository.getUnansweredQuestions(mappedGamesToFinish)
            await this.gameRepository.answerRemainQuestions(mappedGamesToFinish, unansweredQuestionsMap);
            await this.gameRepository.finishDelayedGame(mappedGamesToFinish)
        }
    }
}