import {GameStatus} from "../api/output/game-response.dto";
import {Game} from "../domain/game.entity";
import {Player} from "../domain/player.entity";
import {Answers} from "../domain/answers.entity";

export interface Players {
    game: Game;
    activePlayer: {
        player: Player;
        answers: Answers[]
    };
    otherPlayer: {
        player: Player;
        status: GameStatus | null,
        answers: Answers[] | null
    }
}