import {AnswerStatus, GameStatus} from "../api/output/game-response.dto";
import {GameQuestions} from "../domain/game-questions.entity";
import {Players} from "./playersForAnsweringQuestion.interface";
import {Player} from "../domain/player.entity";


export interface FinishGameParams {
    players: Players;
    playerFinishedFirst: Player,
    playersBonusPoints: number,
    gameStatus: GameStatus;
    gameFinishedAt: Date | null;
}