import {Injectable} from "@nestjs/common";
import {InjectDataSource, InjectRepository} from "@nestjs/typeorm";
import {Brackets, DataSource, Repository} from "typeorm";
import {Game} from "../domain/game.entity";
import {GameResponseDTO, GameStatus} from "../api/output/game-response.dto";
import {Player, PlayerGameResult} from "../domain/player.entity";
import {GameQuestions} from "../domain/game-questions.entity";
import {Players} from "../interfaces/playersForAnsweringQuestion.interface";
import {Answers} from "../domain/answers.entity";
import {GamesQueryParamsDTO} from "../api/input/games-query-params.dto";
import {PaginatedGamesResponseDto} from "../api/output/paginated-games-response.dto";
import {UserStatisticResponseDTO} from "../api/output/user-statistic-response.dto";
import {PaginatedUsersTopResponseDTO, TopPlayerResponse} from "../api/output/user-top-response.dto";
import {UsersTopQueryParamsDTO} from "../api/input/users-top-query-params.dto";

Injectable()
export class GameQueryRepository {
    constructor(
        @InjectDataSource() protected dataSource: DataSource,
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

    public async _getUsersGamesIds(userId: string, params: GamesQueryParamsDTO) {
        try {
            const sortBy = params.sortBy || 'status';
            const sortDirection = params.sortDirection?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
            const pageNumber = params.pageNumber || 1;
            const pageSize = params.pageSize || 10;
            const skipAmount = (pageNumber - 1) * pageSize;

            const validSortColumns = {
                pairCreatedDate: 'g.pairCreatedDate',
                status: 'g.status',
                startGameDate: 'g.startGameDate'
            };

            const sortByColumn = validSortColumns[sortBy] || 'g.pairCreatedDate';
            console.log('sortByColumn', sortByColumn)

            const queryBuilder = this.gameQueryRepository
                .createQueryBuilder('g')
                .select('g.id')
                .leftJoin('g.playerOne', 'playerOne')
                .leftJoin('g.playerTwo', 'playerTwo')
                .leftJoin('playerOne.user', 'userOne')
                .leftJoin('playerTwo.user', 'userTwo')
                .where('(userOne.id = :userId OR userTwo.id = :userId)', { userId })
                .orderBy(sortByColumn, 'ASC')
                .addOrderBy('g.pairCreatedDate', 'DESC')
                .limit(pageSize)
                .offset(skipAmount);

            const [games, totalCount] = await queryBuilder.getManyAndCount();
            const gameIds = games.map(game => game.id.toString());
            console.log('gameIds', gameIds)

            return { gameIds, totalCount };


        } catch (error) {
            console.log('Error in _getUsersGamesIds', error);
            throw error;
        }
    }

    public async _getGameDetails(gameIds: string[]): Promise<Game[]> {
        try {
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
                .where('g.id IN (:...gameIds)', { gameIds })
                .orderBy('gameQuestions.questionIndex', 'ASC')
                .addOrderBy('answersOne.createdAt', 'ASC')
                .addOrderBy('answersTwo.createdAt', 'ASC')

            const games = await queryBuilder.getMany();

            return games;
        } catch (error) {
            console.log('Error in _getGameDetails', error);
            throw error;
        }
    }

    public async getAllMyGames(userId: string, activeStatus: GameStatus, pendingStatus: GameStatus, params: GamesQueryParamsDTO): Promise<PaginatedGamesResponseDto> {
        try {
            const { gameIds, totalCount } = await this._getUsersGamesIds(userId, params);
            const pageNumber = Number(params.pageNumber) || 1;
            const pageSize = Number(params.pageSize) || 10;

            if (gameIds.length === 0) {
                return {
                    pagesCount: 0,
                    page: +params.pageNumber || 1,
                    pageSize: +params.pageSize || 10,
                    totalCount: 0,
                    items: [],
                };
            }

            const games = await this._getGameDetails(gameIds);

            const mappedGames = gameIds.map(id => {
                const game = games.find(game => +game.id === +id);
                return game ? new GameResponseDTO(game) : null;
            }).filter(game => game !== null);

            return {
                pagesCount: Math.ceil(totalCount / pageSize),
                page: pageNumber,
                pageSize: pageSize,
                totalCount: totalCount,
                items: mappedGames,
            };
        } catch (error) {
            console.log('Error in getAllMyGames', error);
            throw error;
        }
    }

    public async getMyStatistic(userId: string, finishedStatus: GameStatus): Promise<UserStatisticResponseDTO> {
        try {
            const stats = await this.playerQueryRepository
                .createQueryBuilder('p')
                .where('(p.user.id = :userId)', { userId })
                .andWhere('p.status = :finishedStatus', { finishedStatus })
                .select([
                    'SUM(p.score) as sumScore',
                    'AVG(p.score) as avgScores',
                    'COUNT(p.id) as gamesCount',
                    'SUM(CASE WHEN p.gameResult = :win THEN 1 ELSE 0 END) as winsCount',
                    'SUM(CASE WHEN p.gameResult = :lose THEN 1 ELSE 0 END) as lossesCount',
                    'SUM(CASE WHEN p.gameResult = :draw THEN 1 ELSE 0 END) as drawsCount',
                ])
                .setParameters({
                    userId,
                    finishedStatus,
                    win: PlayerGameResult.Win,
                    lose: PlayerGameResult.Lose,
                    draw: PlayerGameResult.Draw
                })
                .getRawOne();
            console.log('stats', stats)

            const mappedStats = new UserStatisticResponseDTO({
                sumScore: +stats.sumscore || 0,
                avgScores: +parseFloat(stats.avgscores).toFixed(2),
                gamesCount: +stats.gamescount || 0,
                winsCount: +stats.winscount || 0,
                lossesCount: +stats.lossescount || 0,
                drawsCount: +stats.drawscount || 0,
            });

            console.log('mappedStats', mappedStats)

            return mappedStats
        } catch (error) {
            console.log('Error in getMyStatistic', error);
            throw error;
        }
    }

    public async getUsersTop(finishedStatus: GameStatus, params: UsersTopQueryParamsDTO): Promise<PaginatedUsersTopResponseDTO> {
        try {
            const sortParams = params.sort || ['avgScores desc', 'sumScore desc'];
            const sortDirections = ['ASC', 'DESC'] as const;
            const pageNumber = params.pageNumber || 1;
            const pageSize = params.pageSize || 10;
            const skipAmount = (pageNumber - 1) * pageSize;

            const validSortColumns = {
                sumScore: 'sumScore',
                avgScores: 'avgScores',
                winsCount: 'winsCount',
                lossesCount: 'lossesCount',
                drawsCount: 'drawsCount',
            };

            const baseQueryBuilder  = this.playerQueryRepository
                .createQueryBuilder('p')
                .where('(p.status = :finishedStatus)', {finishedStatus})
                .leftJoin('p.user', 'user')
                .select([
                    'SUM(p.score) as sumScore',
                    'AVG(p.score) as avgScores',
                    'COUNT(p.id) as gamesCount',
                    'SUM(CASE WHEN p.gameResult = :win THEN 1 ELSE 0 END) as winsCount',
                    'SUM(CASE WHEN p.gameResult = :lose THEN 1 ELSE 0 END) as lossesCount',
                    'SUM(CASE WHEN p.gameResult = :draw THEN 1 ELSE 0 END) as drawsCount',
                    'p.user.id as userId',
                    'user.login as userLogin',
                ])
                .groupBy('p.user.id, user.login')
                .setParameters({
                    finishedStatus,
                    win: PlayerGameResult.Win,
                    lose: PlayerGameResult.Lose,
                    draw: PlayerGameResult.Draw
                })

            const totalCountQuery = this.playerQueryRepository
                .createQueryBuilder('p')
                .select('COUNT(DISTINCT p.user.id)', 'totalCount')
                .where('(p.status = :finishedStatus)', { finishedStatus })
                .setParameters({
                    finishedStatus
                });

            // Применение сортировки
            sortParams.forEach((sortParam) => {
                const [sortBy, sortDirection] = sortParam.split(' ');
                const sortByColumn = validSortColumns[sortBy] || 'avgScores';
                const direction = sortDirections.includes(sortDirection?.toUpperCase() as 'ASC' | 'DESC') ? sortDirection.toUpperCase() as 'ASC' | 'DESC' : 'DESC';

                baseQueryBuilder .addOrderBy(sortByColumn, direction);
            });

            // Ограничение и смещение для пагинации
            baseQueryBuilder .limit(pageSize).offset(skipAmount);

            // Выполнение запроса и получение результата
            const players = await baseQueryBuilder.getRawMany();
            const totalCountResult = await totalCountQuery.getRawOne();
            const totalCount = parseInt(totalCountResult.totalCount, 10);

            console.log('rawPlayers', players)
            console.log('totalCount', totalCount)

            const mappedPlayers = players.map(player => new TopPlayerResponse({
                sumScore: +player.sumscore || 0,
                avgScores: +parseFloat(player.avgscores).toFixed(2),
                gamesCount: +player.gamescount || 0,
                winsCount: +player.winscount || 0,
                lossesCount: +player.lossescount || 0,
                drawsCount: +player.drawscount || 0,
                userId: player.userid,
                login: player.userlogin,
            }))

            console.log('mappedPlayers', mappedPlayers)

            return {
                pagesCount: Math.ceil(totalCount / pageSize),
                page: pageNumber,
                pageSize: pageSize,
                totalCount: totalCount,
                items: mappedPlayers,
            };
        } catch (error) {
            console.log('Error in getUsersTop', error);
            throw error;
        }
    }


    async getUnansweredQuestions(gamesToFinish: { gameId: number, otherPlayerId: number | null}[] ): Promise<Record<number, GameQuestions[]>> {
        try {
            const unansweredQuestionsMap: Record<number, GameQuestions[]> = {};
            for (const game of gamesToFinish) {
                if (game.otherPlayerId === null) {
                    console.log(`Skipping game ${game.gameId} as there is no active player`);
                    continue;
                }
                unansweredQuestionsMap[game.gameId] = await this.gameQuestionsRepository
                    .createQueryBuilder('gq')
                    .leftJoin('gq.answers', 'answers')
                    .leftJoinAndSelect('gq.question', 'questions')
                    .where('gq.game.id = :gameId', {gameId: game.gameId})
                    .andWhere(`gq.id NOT IN
                         (SELECT gq_sub.id
                         FROM game_questions gq_sub
                         LEFT JOIN answers a_sub
                         ON gq_sub.id = a_sub."gameQuestionId"
                         WHERE a_sub."playerId" = :playerId)`, {playerId: game.otherPlayerId})
                    .getMany();
            }
            return unansweredQuestionsMap
        } catch (error) {
            console.log('Error in getUnansweredQuestions', error);
            throw error;
        }
    }

    async getGamesToFinish(): Promise<Game[]> {
        try {
            return await this.gameQueryRepository
                .createQueryBuilder('g')
                .leftJoinAndSelect('g.playerOne', 'playerOne')
                .leftJoinAndSelect('g.playerTwo', 'playerTwo')
                .where("g.status = 'Active'")
                .andWhere(
                    new Brackets(qb => {
                        qb.where('(playerOne.lastAnswerAddedAt IS NOT NULL AND playerOne.lastAnswerAddedAt < NOW() - INTERVAL \'7 seconds\')')
                            .orWhere('(playerTwo.lastAnswerAddedAt IS NOT NULL AND playerTwo.lastAnswerAddedAt < NOW() - INTERVAL \'7 seconds\')');
                    })
                )
                .getMany();
        } catch (error) {
            console.log('Error in getGamesToFinish', error);
            throw error;
        }
    }
}
