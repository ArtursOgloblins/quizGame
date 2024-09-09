import {Player} from "../domain/player.entity";
import {AnswerStatus, GameStatus} from "../api/output/game-response.dto";
import {GameQuestions} from "../domain/game-questions.entity";

export interface AddAnswerParamsInterface {
    question: GameQuestions,
    answerStatus: AnswerStatus,
    activePlayer: Player,
    standardPointsAmount: number,
    playerNewStatus: GameStatus,
    lastAnswerAddedAt: Date | null
}