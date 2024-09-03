import {AccessTokenPayloadDTO} from "../../../auth/api/dto/input/access-token-params.dto";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {AnswerStatus, GameStatus} from "../../api/output/game-response.dto";
import {GameRepository} from "../../infrastructure/game.repository";
import {GameQueryRepository} from "../../infrastructure/game.query-repository";
import {ForbiddenException} from "@nestjs/common";
import {AnswerDto} from "../../api/input/answer.dto";
import {AnswerResponseDto} from "../../api/output/answer-response.dto";
import {AddLastAnswerParams} from "../../interfaces/lastAnswerParmas.interface";
import {GameQuestions} from "../../domain/game-questions.entity";
import {Players} from "../../interfaces/playersForAnsweringQuestion.interface";
import {Game} from "../../domain/game.entity";

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

    private async answerNextQuestion(players: any, questionIndex: number, playerAnswer: AnswerDto) {
        const gameId = players.game.id
        const activePlayer = players.activePlayer.player
        console.log('players.activePlayer.player', activePlayer)
        const question = await this.gameQueryRepository.getNextQuestion(gameId, questionIndex)
        const answerStatus = this._getAnswerStatus(question, playerAnswer.answer)
        const playerNewStatus = questionIndex !== 4 ? GameStatus.Active : GameStatus.Finished
        const standardPointsAmount = answerStatus == AnswerStatus.Correct ? 1 :0

        if (questionIndex !== 4) {
            return await this.gameRepository.addAnswer(question, answerStatus, activePlayer, standardPointsAmount, playerNewStatus)
        } else {
            await this.startSecondPlayerTimer(players);
            return this._processLastQuestion(players, question, answerStatus, standardPointsAmount)
        }
    }

    private _getAnswerStatus(question: any, answer: string): AnswerStatus {
        return question.checkAnswer(answer) ? AnswerStatus.Correct : AnswerStatus.Incorrect;
    }

    private async _processLastQuestion(
        players: Players,
        question: GameQuestions,
        answerStatus: AnswerStatus,
        activePlayerPoints: number,) {

        const activePlayerStatus = GameStatus.Finished;

        const isOtherPlayerFinished = players.otherPlayer.status === GameStatus.Finished;
        const gameStatus = isOtherPlayerFinished ? GameStatus.Finished : GameStatus.Active;

        const otherPlayerHasCorrectAnswers = players.otherPlayer.answers.some(
            answer => answer.status === AnswerStatus.Correct
        );

        let otherPlayerBonusPoints = 0
        if (isOtherPlayerFinished) {
            otherPlayerBonusPoints = otherPlayerHasCorrectAnswers ? 1 : 0;
        }

        const gameFinishedAt = gameStatus === GameStatus.Finished ? new Date() : null;

        const addLastAnswerParams: AddLastAnswerParams = {
            question,
            answerStatus,
            players,
            activePlayerPoints,
            otherPlayerBonusPoints,
            activePlayerStatus,
            gameStatus,
            gameFinishedAt
        }

        return await this.gameRepository.addLastAnswer(addLastAnswerParams);
    }

    private async startSecondPlayerTimer(players: Players): Promise<void> {
        const SECOND_PLAYER_TIMEOUT = 10000; // 10 секунд
        const secondPlayer = players.otherPlayer.player;

        setTimeout(async () => {
            if (secondPlayer.status !== GameStatus.Finished) {
                await this.processRemainingQuestionsAsIncorrect(players);
            }
        }, SECOND_PLAYER_TIMEOUT);
    }

    private async processRemainingQuestionsAsIncorrect(players: Players): Promise<void> {
        const unansweredQuestionIndexes = await this.gameQueryRepository.getUnansweredQuestionIndexes(players.otherPlayer.player.id, players.game.id);

        for (const index of unansweredQuestionIndexes) {
            await this.answerNextQuestion(players, index, { answer: '' });
        }

        await this._processLastQuestion(players, null, AnswerStatus.Incorrect, 0);
    }

    private async checkGameUsers(userId: string, players: any) {
        return (
            players?.game?.playerOne?.user?.id === +userId ||
            players?.game?.playerTwo?.user?.id === +userId
        );
    }
}