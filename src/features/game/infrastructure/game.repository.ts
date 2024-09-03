import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {EntityManager, Repository} from "typeorm";
import {Game} from "../domain/game.entity";
import {Player, PlayerGameResult} from "../domain/player.entity";
import {GameQuestions} from "../domain/game-questions.entity";
import {AnswerStatus, GameStatus} from "../api/output/game-response.dto";
import {Questions} from "../../questions/domain/qustions.entity";
import {AccessTokenPayloadDTO} from "../../auth/api/dto/input/access-token-params.dto";
import {gameRandomQuestions} from "../api/output/game-random-question.dto";
import {Answers} from "../domain/answers.entity";
import {AddLastAnswerParams} from "../interfaces/lastAnswerParmas.interface";

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
    ) {
    }

    public async registerNewGame(user: AccessTokenPayloadDTO, gameStatus: GameStatus, questions: gameRandomQuestions[]) {
        return await this.gameRepository.manager.transaction(async (manager: EntityManager) => {

            const game = manager.create(Game, {
                status: gameStatus,
                pairCreatedDate: new Date(),
                startGameDate: null,
                finishGameDate: null
            })
            await manager.save(Game, game)

            const player = manager.create(Player, {
                user: {id: +user.userId, login: user.username},
                status: GameStatus.Active,
                score: 0,
                answers: [],
                game: game
            })
            await manager.save(Player, player)

            game.playerOne = player;
            await manager.save(Game, game);

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
        return await this.gameRepository.manager.transaction(async (manager: EntityManager) => {
            const player = manager.create(Player, {
                user: {id: +user.userId, login: user.username},
                status: GameStatus.Active,
                score: 0,
                answers: [],
                game: existingGame
            })
            await manager.save(Player, player)

            existingGame.playerTwo = player
            existingGame.status = activeStatus
            existingGame.startGameDate = new Date()

            await manager.save(Game, existingGame)
            return existingGame
        })
    }

    public async addAnswer(question: GameQuestions, answerStatus: AnswerStatus, player: Player, points: number, playerStatus: GameStatus) {
        try {
            return await this.gameQuestionsRepository.manager.transaction(async (manager: EntityManager) => {

                player.score += points
                player.status = playerStatus
                await manager.save(Player, player);

                const answer = new Answers();
                answer.body = question.question.body;
                answer.status = answerStatus;
                answer.player = player;
                answer.question = question.question;
                answer.gameQuestion = question;
                await manager.save(Answers, answer);

                return answer;
            });
        } catch (error) {
            console.log('Error in addAnswer', error);
            throw error;
        }
    }

    public async addLastAnswer(params: AddLastAnswerParams) {
        try {
            const {
                question,
                answerStatus,
                players,
                activePlayerPoints,
                otherPlayerBonusPoints,
                activePlayerStatus,
                gameStatus,
                gameFinishedAt
            } = params
            return await this.gameQuestionsRepository.manager.transaction(async (manager: EntityManager) => {
                const activePlayer = players.activePlayer.player
                const otherPlayer = players.otherPlayer.player

                activePlayer.score += activePlayerPoints;
                activePlayer.status = activePlayerStatus;
                otherPlayer.score += otherPlayerBonusPoints;

                if (activePlayer.score === otherPlayer.score) {
                    activePlayer.gameResult = PlayerGameResult.Draw
                    otherPlayer.gameResult = PlayerGameResult.Draw
                } else if (activePlayer.score > otherPlayer.score) {
                    activePlayer.gameResult = PlayerGameResult.Win
                    otherPlayer.gameResult = PlayerGameResult.Lose
                } else {
                    activePlayer.gameResult = PlayerGameResult.Lose
                    otherPlayer.gameResult = PlayerGameResult.Win
                }

                await manager.save(Player, activePlayer);
                await manager.save(Player, otherPlayer);


                players.game.status = gameStatus;
                players.game.finishGameDate = gameFinishedAt;
                await manager.save(Game, players.game);

                const answer = new Answers();
                answer.body = question.question.body;
                answer.status = answerStatus;
                answer.player = players.activePlayer.player
                answer.question = question.question;
                answer.gameQuestion = question;
                await manager.save(Answers, answer);
                console.log('Saved Answer:', answer);

                return answer;
            });
        } catch (error) {
            console.log('Error in addLastAnswer', error);
            throw error;
        }
    }
}