import {AccessTokenPayloadDTO} from "../../../auth/api/dto/input/access-token-params.dto";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {AnswerStatus, GameStatus} from "../../api/output/game-response.dto";
import {GameRepository} from "../../infrastructure/game.repository";
import {GameQueryRepository} from "../../infrastructure/game.query-repository";
import {ForbiddenException, Injectable} from "@nestjs/common";
import {AnswerDto} from "../../api/input/answer.dto";
import {AnswerResponseDto} from "../../api/output/answer-response.dto";
import {FinishGameParams} from "../../interfaces/lastAnswerParmas.interface";
import {Players} from "../../interfaces/playersForAnsweringQuestion.interface";
import {Game} from "../../domain/game.entity";
import {Player} from "../../domain/player.entity";
import {Answers} from "../../domain/answers.entity";
import {SchedulerRegistry} from "@nestjs/schedule";
import {AddAnswerParamsInterface} from "../../interfaces/addAnswerParams.interface";

export class AnswerQuestionCommand {
    constructor(public user: AccessTokenPayloadDTO,
                public answer: AnswerDto) {
    }
}

@CommandHandler(AnswerQuestionCommand)
@Injectable()
export class AnswerQuestionUseCase implements ICommandHandler<AnswerQuestionCommand> {
    constructor(private gameRepository: GameRepository,
                private gameQueryRepository: GameQueryRepository) {
    }

    async execute(command: AnswerQuestionCommand): Promise<AnswerResponseDto> {
        const {user, answer} = command
        const players = await this.isPlayerActive(user)
        const game: Game = players ? players.game : null
        const gameId = game ? game.id : null
        const isUserInTheGame = await this.checkGameUsers(user.userId, players)
        const currentPlayerStatus = await this.currentPlayerStatus(user, gameId)

        if (!players) {
            throw new ForbiddenException('User dont have active games');
        }

        if (game.status !== GameStatus.Active) {
            throw new ForbiddenException(`Game is not started yet`)
        }

        if (currentPlayerStatus === GameStatus.Finished) {
            throw new ForbiddenException(`User answered to all questions`)
        }

        if (!isUserInTheGame) {
            throw new ForbiddenException(`User is not participant of this game`)
        }

        const nextQuestionIndex = await this.getNextQuestionIndex(players)
        const answerQuestion = await this.answerNextQuestion(players, nextQuestionIndex, answer)

        return new AnswerResponseDto(answerQuestion);
    }

    private async isPlayerActive(user: AccessTokenPayloadDTO) {
        const playerStatus = GameStatus.Active
        return await this.gameQueryRepository.isPlayerActive(user.userId, playerStatus)
    }

    private async currentPlayerStatus(user: AccessTokenPayloadDTO, gameId: number) {
        return this.gameQueryRepository.getCurrentPlayerStatus(user.userId, gameId)
    }

    private async getNextQuestionIndex(players: Players): Promise<number> {
        const playerAnswers = players.activePlayer.answers
        return playerAnswers ? playerAnswers.length : 0
    }

    private async answerNextQuestion(players: Players, questionIndex: number, playerAnswer: AnswerDto): Promise<Answers> {
        const gameId = players.game.id
        const activePlayer = players.activePlayer.player
        const otherPlayer = players.otherPlayer.player
        const question = await this.gameQueryRepository.getNextQuestion(gameId, questionIndex)
        const answerStatus = this._getAnswerStatus(question, playerAnswer.answer)
        const playerNewStatus = questionIndex !== 4 ? GameStatus.Active : GameStatus.Finished
        const lastAnswerAddedAt = questionIndex == 4 ? new Date() : null
        const standardPointsAmount = answerStatus == AnswerStatus.Correct ? 1 : 0

        const addAnswerParams: AddAnswerParamsInterface = {question, answerStatus, activePlayer, standardPointsAmount, playerNewStatus, lastAnswerAddedAt}
        const result =  this.gameRepository.addAnswer(addAnswerParams);
        if (questionIndex == 4 && otherPlayer.status == GameStatus.Finished) {
            await this.finishGame(players, activePlayer)
        }
        return result
    }

    private _getAnswerStatus(question: any, answer: string): AnswerStatus {
        return question.checkAnswer(answer) ? AnswerStatus.Correct : AnswerStatus.Incorrect;
    }

    private async finishGame(
        players: Players, activePlayer: Player) {
        const playerStatus = GameStatus.Finished
        const lastAnswerAddedAt = new Date()
        const bonusPoints = 1

        if (players.otherPlayer.player.status == GameStatus.Finished) {
            const playerHasCorrectAnswers = activePlayer.answers.some(
                answer => answer.status === AnswerStatus.Correct
            );
            const playersBonusPoints = playerHasCorrectAnswers ? bonusPoints : 0;
            const gameStatus = playerStatus
            const gameFinishedAt = lastAnswerAddedAt

            const finishGameParams: FinishGameParams = {
                players,
                activePlayer,
                playersBonusPoints,
                gameStatus,
                gameFinishedAt
            }
            return await this.gameRepository.finishGame(finishGameParams);
        }
    }

    private async checkGameUsers(userId: string, players: any) {
        return (
            players?.game?.playerOne?.user?.id === +userId ||
            players?.game?.playerTwo?.user?.id === +userId
        );
    }
}