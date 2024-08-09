import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Game} from "../domain/game.entity";
import {GameResponseDTO, GameStatus} from "../api/output/game-response.dto";
import {Player} from "../domain/player.entity";
import {GameQuestions} from "../domain/game-questions.entity";
import {Players} from "../interfaces/playersForAnsweringQuestion.interface";
import {Answers} from "../domain/answers.entity";
import {GamesQueryParamsDTO} from "../api/input/games-query-params.dto";
import {PaginatedGamesResponseDto} from "../api/output/paginated-games-response.dto";
import {UserStatisticResponseDTO} from "../api/output/user-statistic-response.dto";

Injectable()
export class GameQueryRepository {
    constructor(
        @InjectRepository(Game)
        private readonly gameQueryRepository: Repository<Game>,
        @InjectRepository(Player)
        private readonly playerQueryRepository: Repository<Player>,
        @InjectRepository(GameQuestions)
        private readonly gameQuestionsRepository: Repository<GameQuestions>
    ) {}



    public async isPlayerActive(userId: string, playerStatus: GameStatus): Promise<Players> {
        try {
            const game = await this.gameQueryRepository
                .createQueryBuilder('g')
                .leftJoinAndSelect('g.playerOne', 'playerOne')
                .leftJoinAndSelect('g.playerTwo', 'playerTwo')
                .leftJoinAndSelect('playerOne.answers', 'answersOne')
                .leftJoinAndSelect('playerTwo.answers', 'answersTwo')
                .leftJoinAndSelect('playerOne.user', 'userOne')
                .leftJoinAndSelect('playerTwo.user', 'userTwo')
                .where('(playerOne.user.id = :userId AND playerOne.status = :playerStatus) OR ' +
                    '(playerTwo.user.id = :userId AND playerTwo.status = :playerStatus)', { userId, playerStatus })
                .getOne()
            if (!game) {
                return null
            }
            const activePlayer = game.playerOne.user.id === +userId ? game.playerOne : game.playerTwo
            const otherPlayer = game.playerOne.user.id === +userId ? game.playerTwo : game.playerOne
            return {
                game,
                activePlayer: {
                    player: activePlayer,
                    answers: activePlayer.answers
                },
                otherPlayer: {
                    player: otherPlayer,
                    status:  otherPlayer ? otherPlayer.status as GameStatus : null,
                    answers: otherPlayer ? otherPlayer.answers as Answers[] : null
                }
            }
        } catch (error) {
            console.log('Error in isPlayerActive', error);
            throw error;
        }
    }

    public async getCurrentPlayerStatus(userId: string, gameId: number) {
        try {
            const game = await this.gameQueryRepository
                .createQueryBuilder('g')
                .leftJoinAndSelect('g.playerOne', 'playerOne')
                .leftJoinAndSelect('g.playerTwo', 'playerTwo')
                .leftJoinAndSelect('playerOne.user', 'userOne')
                .leftJoinAndSelect('playerTwo.user', 'userTwo')
                .andWhere('g.id = :gameId', { gameId })
                .andWhere('(userOne.id = :userId OR userTwo.id = :userId)', { userId })
                .getOne()
            if (!game) {
                return null
            }
            const activePlayer = game.playerOne.user.id === +userId ? game.playerOne : game.playerTwo
            return activePlayer.status
        } catch (error) {
            console.log('Error in getCurrentPlayerStatus', error);
            throw error;
        }
    }

    public async getNextQuestion(gameId: number, questionIndex: number) {
        try {
            const question = await this.gameQuestionsRepository
                .createQueryBuilder('q')
                .leftJoinAndSelect('q.question', 'question')
                .where('q.questionIndex = :questionIndex', { questionIndex })
                .andWhere('q.gameId = :gameId', { gameId })
                .getOne();
            return question || null;
        } catch (error) {
            console.log('Error in getNextQuestion', error);
            throw error;
        }
    }

    public async getGameQuestions(gameId: number) {
        try {
            return await this.gameQuestionsRepository
                .createQueryBuilder('gq')
                .leftJoinAndSelect('gq.question', 'q')
                .where('gq.gameId = :gameId', { gameId })
                .select(['gq.id', 'gq.questionIndex', 'q.body', 'q.correctAnswers'])
                .orderBy('gq.questionIndex', 'DESC')
                .getMany();
        } catch (error) {
            console.log('Error in getGameQuestions', error);
            throw error;
        }
    }

    public async getPendingGame(pendingStatus: GameStatus) {
        try {
            const game = await this.gameQueryRepository
                .createQueryBuilder('g')
                .leftJoinAndSelect('g.playerOne', 'playerOne')
                .leftJoinAndSelect('playerOne.user', 'userOne')
                .leftJoinAndSelect('playerOne.answers', 'answersOne')
                .leftJoinAndSelect('g.gameQuestions', 'gameQuestions')
                .leftJoinAndSelect('gameQuestions.question', 'question')
                .where('g.status = :pendingStatus', { pendingStatus })
                .getOne();
            return game || null;
        } catch (error) {
            console.log('Error in getPendingGame', error);
            throw error;
        }
    }

    public async getGameById(gameId: number) {
        try {
            const game = await this.gameQueryRepository
                .createQueryBuilder('g')
                .leftJoinAndSelect('g.playerOne', 'playerOne')
                .leftJoinAndSelect('g.playerTwo', 'playerTwo')
                .leftJoinAndSelect('playerOne.user', 'userOne')
                .leftJoinAndSelect('playerTwo.user', 'userTwo')
                .leftJoinAndSelect('playerOne.answers', 'answersOne')
                .leftJoinAndSelect('answersOne.question', 'questionOne')
                .leftJoinAndSelect('playerTwo.answers', 'answersTwo')
                .leftJoinAndSelect('answersTwo.question', 'questionTwo')
                .leftJoinAndSelect('g.gameQuestions', 'gameQuestions')
                .leftJoinAndSelect('gameQuestions.question', 'question')
                .where('g.id = :gameId', { gameId })
                .orderBy('gameQuestions.questionIndex', 'ASC')
                .addOrderBy('answersOne.createdAt', 'ASC')
                .addOrderBy('answersTwo.createdAt', 'ASC')
                .getOne();
            return game || null;
        } catch (error) {
            console.log('Error in getGameById', error);
            throw error;
        }
    }

    public async getUsersActiveGame(userId: string, activeStatus: GameStatus, pendingStatus: GameStatus) {
        try {
            const game = await this.gameQueryRepository
                .createQueryBuilder('g')
                .leftJoinAndSelect('g.playerOne', 'playerOne')
                .leftJoinAndSelect('g.playerTwo', 'playerTwo')
                .leftJoinAndSelect('playerOne.user', 'userOne')
                .leftJoinAndSelect('playerTwo.user', 'userTwo')
                .leftJoinAndSelect('playerOne.answers', 'answersOne')
                .leftJoinAndSelect('answersOne.question', 'questionOne')
                .leftJoinAndSelect('playerTwo.answers', 'answersTwo')
                .leftJoinAndSelect('answersTwo.question', 'questionTwo')
                .leftJoinAndSelect('g.gameQuestions', 'gameQuestions')
                .leftJoinAndSelect('gameQuestions.question', 'question')
                .where('(g.status = :activeStatus OR g.status = :pendingStatus)', { activeStatus, pendingStatus })
                .andWhere('(userOne.id = :userId OR userTwo.id = :userId)', { userId })
                .orderBy('gameQuestions.questionIndex', 'ASC')
                .addOrderBy('answersOne.createdAt', 'ASC')
                .addOrderBy('answersTwo.createdAt', 'ASC')
                .getOne();

            return game || null;
        } catch (error) {
            console.log('Error in getUsersActiveGame', error);
            throw error;
        }
    }

    public async getAllMyGames(userId: string, activeStatus: GameStatus, pendingStatus: GameStatus, params: GamesQueryParamsDTO): Promise<PaginatedGamesResponseDto> {
        try {
            const sortBy = params.sortBy || 'pairCreatedDate';
            const sortDirection = params.sortDirection || 'desc';
            const pageNumber = params.pageNumber || 1;
            const pageSize = params.pageSize || 10;
            const validSortColumns = {
                pairCreatedDate: 'g.pairCreatedDate'
            };

            const validSortDirections = ['ASC', 'DESC'];
            const skipAmount = (pageNumber - 1) * pageSize;

            const sortByColumn = validSortColumns[sortBy] || 'g.pairCreatedDate'; // если `sortBy` не найден, используем 'g.createdAt'
            const sortOrder = validSortDirections.includes(sortDirection.toUpperCase()) ? sortDirection.toUpperCase() : 'DESC'; // переводим в верхний регистр

            const queryBuilder = this.gameQueryRepository
                .createQueryBuilder('g')
                .leftJoinAndSelect('g.playerOne', 'playerOne')
                .leftJoinAndSelect('g.playerTwo', 'playerTwo')
                .leftJoinAndSelect('playerOne.user', 'userOne')
                .leftJoinAndSelect('playerTwo.user', 'userTwo')
                .leftJoinAndSelect('playerOne.answers', 'answersOne')
                .leftJoinAndSelect('answersOne.question', 'questionOne')
                .leftJoinAndSelect('playerTwo.answers', 'answersTwo')
                .leftJoinAndSelect('answersTwo.question', 'questionTwo')
                .leftJoinAndSelect('g.gameQuestions', 'gameQuestions')
                .leftJoinAndSelect('gameQuestions.question', 'question')
                //.where('(g.status = :activeStatus OR g.status = :pendingStatus)', { activeStatus, pendingStatus })
                .where('(userOne.id = :userId OR userTwo.id = :userId)', { userId });

            queryBuilder
                .orderBy('g.status', 'ASC')
                .addOrderBy(sortByColumn, sortOrder as 'ASC' | 'DESC')
                .addOrderBy('gameQuestions.questionIndex', 'ASC')
                .addOrderBy('answersOne.createdAt', 'ASC')
                .addOrderBy('answersTwo.createdAt', 'ASC')
                .take(pageSize)
                .skip(skipAmount);

            const [games, totalCount] = await queryBuilder.getManyAndCount();

            const mappedGames = games.map((game) => new GameResponseDTO(game))

            return {
                pagesCount: Math.ceil(totalCount / pageSize),
                page: +pageNumber,
                pageSize: +pageSize,
                totalCount: totalCount,
                items: mappedGames,
            }
        } catch (error) {
            console.log('Error in getAllMyGames', error);
            throw error;
        }
    }

    public async getMyStatistic(userId: string, finishedStatus: GameStatus): Promise<UserStatisticResponseDTO> {
        try {
            const stats = await this.gameQueryRepository
                .createQueryBuilder('g')
                .leftJoin('g.playerOne', 'playerOne')
                .leftJoin('g.playerTwo', 'playerTwo')
                .where('g.status = :finishedStatus', { finishedStatus })
                .andWhere('(playerOne.user.id = :userId OR playerTwo.user.id = :userId)', { userId })
                .select([
                    'SUM(CASE WHEN playerOne.user.id = :userId THEN playerOne.score ELSE playerTwo.score END) as sumScore',
                    'AVG(CASE WHEN playerOne.user.id = :userId THEN playerOne.score ELSE playerTwo.score END) as avgScores',
                    'COUNT(g.id) as gamesCount',
                    'SUM(CASE WHEN (playerOne.user.id = :userId AND playerOne.score > playerTwo.score) OR (playerTwo.user.id = :userId AND playerTwo.score > playerOne.score) THEN 1 ELSE 0 END) as winsCount',
                    'SUM(CASE WHEN (playerOne.user.id = :userId AND playerOne.score < playerTwo.score) OR (playerTwo.user.id = :userId AND playerTwo.score < playerOne.score) THEN 1 ELSE 0 END) as lossesCount',
                    'SUM(CASE WHEN playerOne.score = playerTwo.score THEN 1 ELSE 0 END) as drawsCount',
                ])
                .setParameters({ userId, finishedStatus })
                .getRawOne();

            return new UserStatisticResponseDTO({
                sumScore: parseFloat(stats.sumScore),
                avgScores: parseFloat(stats.avgScores),
                gamesCount: parseInt(stats.gamesCount, 10),
                winsCount: parseInt(stats.winsCount, 10),
                lossesCount: parseInt(stats.lossesCount, 10),
                drawsCount: parseInt(stats.drawsCount, 10),
            });
        } catch (error) {
            console.log('Error in getMyStatistic', error);
            throw error;
        }
    }
}
