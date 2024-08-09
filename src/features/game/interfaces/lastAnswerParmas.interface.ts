import {AnswerStatus, GameStatus} from "../api/output/game-response.dto";
import {GameQuestions} from "../domain/game-questions.entity";


export interface AddLastAnswerParams {
    question: GameQuestions;
    answerStatus: AnswerStatus;
    players: any;
    activePlayerPoints: number,
    otherPlayerBonusPoints: number,
    activePlayerStatus: GameStatus;
    gameStatus: GameStatus;
    gameFinishedAt: Date | null;
}