import {AnswerStatus, GameStatus} from "../api/output/game-response.dto";
import {Players} from "./playersForAnsweringQuestion.interface";
import {Player} from "../domain/player.entity";


export interface FinishGameParams {
    players: Players;
    activePlayer: Player,
    playersBonusPoints: number,
    gameStatus: GameStatus;
    gameFinishedAt: Date | null;
}