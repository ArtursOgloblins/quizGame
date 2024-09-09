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
import {AddAnswerParamsInterface} from "../interfaces/addAnswerParams.interface";

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

    public async addAnswer(params: AddAnswerParamsInterface) {
        try {
            const {
                question,
                answerStatus,
                activePlayer,
                standardPointsAmount,
                playerNewStatus,
                lastAnswerAddedAt
            } = params
            return await this.gameQuestionsRepository.manager.transaction(async (manager: EntityManager) => {
                console.log("START TRANSACTION")
                activePlayer.score += standardPointsAmount
                activePlayer.status = playerNewStatus
                activePlayer.lastAnswerAddedAt = lastAnswerAddedAt
                await manager.save(Player, activePlayer);

                const answer = new Answers();
                answer.body = question.question.body;
                answer.status = answerStatus;
                answer.player = activePlayer;
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


    public async finishGame(params: FinishGameParams) {
        try {
            const {
                players,
                activePlayer,
                playersBonusPoints,
                gameStatus,
                gameFinishedAt
            } = params

            return await this.gameQuestionsRepository.manager.transaction(async (manager: EntityManager) => {
                console.log('FINISH GAME')
                activePlayer.score += playersBonusPoints;
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

    public async answerRemainQuestions(mappedGames: { gameId: number, otherPlayerId: number | null }[], unansweredQuestionsMap: Record<number, GameQuestions[]>): Promise<void> {
        return await this.answersRepository.manager.transaction(async (manager: EntityManager) => {
            for (const game of mappedGames) {
                if (game.otherPlayerId === null) {
                    console.log(`Skipping game ${game.gameId} as there is no other player`);
                    continue;
                }

                const unAnsweredQuestions = unansweredQuestionsMap[game.gameId];

                if (!unAnsweredQuestions || unAnsweredQuestions.length === 0) {
                    console.log(`No unanswered questions for game ${game.gameId}`);
                    continue;
                }

                await manager.createQueryBuilder()
                    .insert()
                    .into('answers')
                    .values(unAnsweredQuestions.map(question => ({
                        body: question.question.body,
                        status: AnswerStatus.Incorrect,
                        player: { id: game.otherPlayerId },
                        question: { id: question.question.id },
                        gameQuestion: { id: question.id }
                    })))
                    .execute();

                await manager.createQueryBuilder()
                    .update(Player)
                    .set({ status: GameStatus.Finished })
                    .where('id = :playerId', { playerId: game.otherPlayerId })
                    .execute();

                console.log(`All remaining questions for game ${game.gameId} processed as incorrect`);
            }
        });
    }

    public async finishDelayedGame(mappedGames: { gameId: number, firstPlayerId: number | null, otherPlayerId: number | null }[]): Promise<void> {
        try {
            return await this.answersRepository.manager.transaction(async (manager: EntityManager) => {
                const bonusPoints = 1
                const finishedStatus = GameStatus.Finished
                const gameFinishedAt = new Date()
                for (const game of mappedGames) {
                    if (game.otherPlayerId === null) {
                        console.log(`Skipping game ${game.gameId} as there is no other player`);
                        continue;
                    }

                    const playerOne = await this.playerRepository
                        .createQueryBuilder('p')
                        .leftJoinAndSelect('p.answers', 'answers')
                        .where('p.id = :playerId', {playerId: game.firstPlayerId})
                        .getOne()

                    console.log('playerOne', playerOne)

                    const otherPlayer = await this.playerRepository
                        .createQueryBuilder('p')
                        .leftJoinAndSelect('p.answers', 'answers')
                        .where('p.id = :playerId', {playerId: game.otherPlayerId})
                        .getOne()

                    const playerOneHasCorrectAnswers = playerOne.answers.some(
                        answer => answer.status === AnswerStatus.Correct
                    );

                    playerOne.score += playerOneHasCorrectAnswers ? bonusPoints : 0;

                    if (playerOne.score === otherPlayer.score) {
                        playerOne.gameResult = PlayerGameResult.Draw
                        otherPlayer.gameResult = PlayerGameResult.Draw
                    } else if (playerOne.score > otherPlayer.score) {
                        playerOne.gameResult = PlayerGameResult.Win
                        otherPlayer.gameResult = PlayerGameResult.Lose
                    } else {
                        playerOne.gameResult = PlayerGameResult.Lose
                        otherPlayer.gameResult = PlayerGameResult.Win
                    }

                    await manager.createQueryBuilder()
                        .update(Game)
                        .set({ status: finishedStatus, finishGameDate: gameFinishedAt})
                        .where("id = :id", { id: game.gameId})
                        .execute();

                    await manager.createQueryBuilder()
                        .update(Player)
                        .set({score: playerOne.score,
                            gameResult: playerOne.gameResult})
                        .where('id = :id',{id: game.firstPlayerId})
                        .execute()

                    await manager.createQueryBuilder()
                        .update(Player)
                        .set({score: otherPlayer.score,
                            gameResult: otherPlayer.gameResult})
                        .where('id = :id',{id: game.otherPlayerId})
                        .execute()
                }
            });
        } catch (error) {
            console.log('Error in finishGame', error);
            throw error;
        }
    }
}
