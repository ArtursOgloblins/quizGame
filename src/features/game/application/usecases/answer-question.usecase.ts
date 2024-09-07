import {AccessTokenPayloadDTO} from "../../../auth/api/dto/input/access-token-params.dto";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {AnswerStatus, GameStatus} from "../../api/output/game-response.dto";
import {GameRepository} from "../../infrastructure/game.repository";
import {GameQueryRepository} from "../../infrastructure/game.query-repository";
import {ForbiddenException} from "@nestjs/common";
import {AnswerDto} from "../../api/input/answer.dto";
import {AnswerResponseDto} from "../../api/output/answer-response.dto";
import {FinishGameParams} from "../../interfaces/lastAnswerParmas.interface";
import {Players} from "../../interfaces/playersForAnsweringQuestion.interface";
import {Game} from "../../domain/game.entity";
import {Player} from "../../domain/player.entity";
import {Answers} from "../../domain/answers.entity";

export class AnswerQuestionCommand {
    constructor(public user: AccessTokenPayloadDTO,
                public answer: AnswerDto) {
    }
}

@CommandHandler(AnswerQuestionCommand)
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
        const standardPointsAmount = answerStatus == AnswerStatus.Correct ? 1 :0

        const result = await this.gameRepository.addAnswer(question, answerStatus, activePlayer, standardPointsAmount, playerNewStatus);

        if (questionIndex === 4) {
            // If second player does not answer to all questions
            if (players.otherPlayer.status !== GameStatus.Finished) {
                console.log('Starting timer for second player to finish their answers');

                setTimeout(async () => {
                    // Timer expired, processing remaining questions as incorrect
                    console.log('players.otherPlayer.status', players.otherPlayer.status)
                    if (players.otherPlayer.status !== GameStatus.Finished) {
                        console.log('Timer expired, processing remaining questions as incorrect');
                        await this.processRemainingQuestionsAsIncorrect(players);
                        await this.finishGame(players, activePlayer);
                    }
                }, 1000);
                return result
            } else {
                await this.finishGame(players, activePlayer);
                return result
            }
        }
        return result
    }

    private _getAnswerStatus(question: any, answer: string): AnswerStatus {
        return question.checkAnswer(answer) ? AnswerStatus.Correct : AnswerStatus.Incorrect;
    }

    private async finishGame(
        players: Players, playerFinishedFirst: Player) {
        const gameStatus = GameStatus.Finished
        const bonusPoints = 1

        const playerHasCorrectAnswers = playerFinishedFirst.answers.some(
            answer => answer.status === AnswerStatus.Correct
        );

        const playersBonusPoints = playerHasCorrectAnswers ? bonusPoints : 0;

        const gameFinishedAt = gameStatus === GameStatus.Finished ? new Date() : null;

        const finishGameParams: FinishGameParams = {
            players,
            playerFinishedFirst,
            playersBonusPoints,
            gameStatus,
            gameFinishedAt
        }

        return await this.gameRepository.finishGame(finishGameParams);
    }

    private async processRemainingQuestionsAsIncorrect(players: Players): Promise<void> {
        const unansweredQuestionIndexes = await this.gameQueryRepository.getUnansweredQuestionIndexes(players.otherPlayer.player.id, players.game.id);
        console.log('unansweredQuestionIndexes', unansweredQuestionIndexes)
        const player = await this.gameRepository.findPlayerById(players.otherPlayer.player.id)
        const gameId = players.game.id;

        for (const index of unansweredQuestionIndexes) {
            const question = await this.gameQueryRepository.getNextQuestion(gameId, index);
            const playerNewStatus = index !== 4 ? GameStatus.Active : GameStatus.Finished
            console.log(`Processing question at index ${index}, player ID: ${players.otherPlayer.player.id}`);
            await this.gameRepository.addAnswer(question, AnswerStatus.Incorrect, player, 0, playerNewStatus);
        }

        console.log('All remaining questions processed in order as incorrect');
    }

    private async checkGameUsers(userId: string, players: any) {
        return (
            players?.game?.playerOne?.user?.id === +userId ||
            players?.game?.playerTwo?.user?.id === +userId
        );
    }
}