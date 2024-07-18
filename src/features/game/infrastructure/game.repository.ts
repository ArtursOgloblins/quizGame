import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {EntityManager, Repository} from "typeorm";
import {Game} from "../domain/game.entity";
import {Player} from "../domain/player.entity";
import {GameQuestions} from "../domain/game-questions.entity";
import {GameStatus} from "../api/output/game-response.dto";
import {Questions} from "../../questions/domain/qustions.entity";
import {AccessTokenPayloadDTO} from "../../auth/api/dto/input/access-token-params.dto";
import {gameRandomQuestions} from "../api/output/game-random-question.dto";

Injectable()
export class GameRepository {
    constructor(
        @InjectRepository(Game)
        private readonly gameRepository: Repository<Game>,
        @InjectRepository(Player)
        private readonly playerRepository: Repository<Player>,
        @InjectRepository(Questions)
        private readonly questionsRepository: Repository<Questions>,
        @InjectRepository(GameQuestions)
        private readonly gameQuestionsRepository: Repository<GameQuestions>
    ) {}

    public async registerNewGame(user: AccessTokenPayloadDTO, gameStatus: GameStatus, questions: gameRandomQuestions[]) {
        return await this.gameRepository.manager.transaction(async (manager: EntityManager) => {
            const player = manager.create(Player, {
                user: {id: +user.userId, login: user.username},
                status: GameStatus.Active,
                score: 0,
                answers: []
            })
            await manager.save(Player, player)

            const game = manager.create(Game, {
                status: gameStatus,
                playerOne: player,
                pairCreatedDate: new Date(),
                startGameDate: null,
                finishGameDate: null
            })
            await manager.save(Game, game)

            const gameQuestions = questions.map((question, index) =>
                manager.create(GameQuestions, {
                    game: game,
                    question: question,
                    questionIndex: index
                })
            );

            await manager.save(GameQuestions, gameQuestions);

            game.gameQuestions = gameQuestions;
            await manager.save(Game, game);
            console.log('game from repo', game)
            return game
        })
    }

    public async addSecondPlayerToTheGame(existingGame: Game, user: AccessTokenPayloadDTO, activeStatus: GameStatus) {
        console.log('Player Two joined the game')
        return await this.gameRepository.manager.transaction(async (manager: EntityManager) => {
            const player = manager.create(Player, {
                user: {id: +user.userId, login: user.username},
                status: GameStatus.Active,
                score: 0,
                answers: []
            })
            await manager.save(Player, player)

            existingGame.playerTwo = player
            existingGame.status = activeStatus
            existingGame.startGameDate = new Date()

            await manager.save(Game, existingGame)
            console.log(existingGame)
            return existingGame
        })
    }
}