import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Game} from "../domain/game.entity";
import {GameStatus} from "../api/output/game-response.dto";
import {Player} from "../domain/player.entity";

Injectable()
export class GameQueryRepository {
    constructor(
        @InjectRepository(Game)
        private readonly gameQueryRepository: Repository<Game>,
        @InjectRepository(Player)
        private readonly playerQueryRepository: Repository<Player>
    ) {}

    public async getPendingGame(status: GameStatus) {
        try {
           const game = await this.gameQueryRepository
               .createQueryBuilder('g')
               .leftJoinAndSelect('g.playerOne', 'playerOne')
               .leftJoinAndSelect('playerOne.user', 'userOne')
               .leftJoinAndSelect('playerOne.answers', 'answersOne')
               .leftJoinAndSelect('g.gameQuestions', 'gameQuestions')
               .leftJoinAndSelect('gameQuestions.question', 'question')
               .where('g.status = :status', { status })
               .getOne();
            return game || null;
        } catch (error) {
            console.log('Error in getPendingGame', error);
            throw error;
        }
    }

    public async isPlayerActive(userId: string, playerStatus: GameStatus) {
        try {
            const player = await this.playerQueryRepository
                .createQueryBuilder('p')
                .where('p.user.id = :userId', {userId})
                .andWhere('p.status = :playerStatus', {playerStatus})
                .getOne()
            return player || null
        } catch (error) {
            console.log('Error in isPlayerActive', error);
            throw error;
        }
    }
}
