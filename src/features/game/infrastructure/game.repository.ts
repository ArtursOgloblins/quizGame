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
import {FinishGameParams} from "../interfaces/lastAnswerParmas.interface";

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
        private readonly gameQuestionsRepository: Repository<GameQuestions>,
        @InjectRepository(Answers)
        private readonly answersRepository: Repository<Answers>
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
                console.log("ŠTART TRANSACTION")
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
                console.log("FINISH TRANSACTION")
                return answer;
            });
        } catch (error) {
            console.log('Error in addAnswer', error);
            throw error;
        }
    }

    public async answerRemainQuestions(player: Player, unAnsweredQuestions: GameQuestions[]) {
        return await this.answersRepository.manager.transaction(async (manager: EntityManager)=> {
        await manager.createQueryBuilder()
                .insert()
                .into('answers')
                .values(unAnsweredQuestions.map(question => ({
                    body: question.question.body,
                    status:AnswerStatus.Incorrect,
                    player: {id: player.id},
                    question: { id: question.question.id },
                    gameQuestion: { id: question.id }
                })))
                .execute()

            await manager.createQueryBuilder()
                .update(Player)
                .set({status: GameStatus.Finished})
                .where('id = :playerId',{playerId: player.id})
                .execute()
        })
    }

    public async finishGame(params: FinishGameParams) {
        try {
            const {
                players,
                playerFinishedFirst,
                playersBonusPoints,
                gameStatus,
                gameFinishedAt
            } = params

            return await this.gameQuestionsRepository.manager.transaction(async (manager: EntityManager) => {
                console.log('FINISH GAME')
                playerFinishedFirst.score += playersBonusPoints;
                const activePlayer = players.activePlayer.player
                const otherPlayer = players.otherPlayer.player

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

                await manager.createQueryBuilder()
                    .update(Game)
                    .set({ status: gameStatus, finishGameDate: gameFinishedAt})
                    .where("id = :id", { id:  players.game.id})
                    .execute();

                await manager.createQueryBuilder()
                    .update(Player)
                    .set({score: activePlayer.score,
                    gameResult: activePlayer.gameResult})
                    .where('id = :id',{id: activePlayer.id})
                    .execute()

                await manager.createQueryBuilder()
                    .update(Player)
                    .set({score: otherPlayer.score,
                        gameResult: otherPlayer.gameResult})
                    .where('id = :id',{id: otherPlayer.id})
                    .execute()
            });
        } catch (error) {
            console.log('Error in finishGame', error);
            throw error;
        }
    }

    async findPlayerById(id: number) : Promise<Player> {
        return this.playerRepository.findOneBy({id})
    }
}