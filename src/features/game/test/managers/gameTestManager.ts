import {INestApplication} from "@nestjs/common";
import request from 'supertest';
import {AnswerDto} from "../../api/input/answer.dto";
import {GameQueryRepository} from "../../infrastructure/game.query-repository";
import {GameStatus} from "../../api/output/game-response.dto";

export class GameTestManager {
    constructor(
        protected readonly app: INestApplication,
        protected readonly gameQueryRepository: GameQueryRepository
    ) {
    }

    WRONG_ANSWER: AnswerDto = {
        answer: 'wrong answer'
    };

    async getGameQuestions(gameId: number) {
        return await this.gameQueryRepository.getGameQuestions(gameId)
    }

    async getCorrectAnswer(questions: any, questionIndex: number) {
        const nextQuestion = questions.find(q => q.questionIndex === questionIndex)
        const correctAnswer = nextQuestion.question.correctAnswers[0]
        return {answer: correctAnswer}
    }

    async connectPlayerToTheGame(jwt: string) {
        const response = await request(this.app.getHttpServer())
            .post('/pair-game-quiz/pairs/connection')
            .set('Authorization', `Bearer ${jwt}`);
        if (response.status !== 200) {
            console.error(response.body);
        }
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            id: expect.any(String),
            firstPlayerProgress: {
                answers: [],
                player: {
                    id: expect.any(String),
                    login: expect.any(String),
                },
                score: 0,
            },
            secondPlayerProgress: null,
            questions: null,
            status: 'PendingSecondPlayer',
            pairCreatedDate: expect.any(String),
            startGameDate: null,
            finishGameDate: null,
        });
        return response.body;
    }

    async connectSecondPlayerToTheGame(jwt: string) {
        const response = await request(this.app.getHttpServer())
            .post('/pair-game-quiz/pairs/connection')
            .set('Authorization', `Bearer ${jwt}`);
        if (response.status !== 200) {
            console.error(response.body);
        }
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            id: expect.any(String),
            firstPlayerProgress: {
                answers: [],
                player: {
                    id: expect.any(String),
                    login: expect.any(String),
                },
                score: 0,
            },
            secondPlayerProgress: {
                answers: [],
                player: {
                    id: expect.any(String),
                    login: expect.any(String),
                },
                score: 0,
            },
            questions: expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(String),
                    body: expect.any(String),
                }),
            ]),
            status: 'Active',
            pairCreatedDate: expect.any(String),
            startGameDate: expect.any(String),
            finishGameDate: null
        });
        return response.body;
    }

    async getGameByIdWithOnePlayer(jwt: string, gameId: number) {
        const response = await request(this.app.getHttpServer())
            .get(`/pair-game-quiz/pairs/${gameId}`)
            .set('Authorization', `Bearer ${jwt}`);
        if (response.status !== 403) {
            console.error(response.body);
        }
        expect(response.status).toBe(403);
    }

    async connectPlayerToTheGameTwice(jwt: string) {
        const response = await request(this.app.getHttpServer())
            .post('/pair-game-quiz/pairs/connection')
            .set('Authorization', `Bearer ${jwt}`);
        if (response.status !== 403) {
            console.error(response.body);
        }
        expect(response.status).toBe(403);
    }

    async getGameById(jwt: string, gameId: number) {
        const response = await request(this.app.getHttpServer())
            .get(`/pair-game-quiz/pairs/${gameId}`)
            .set('Authorization', `Bearer ${jwt}`);
        if (response.status !== 200) {
            console.error(response.body);
        }
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            id: expect.any(String),
            firstPlayerProgress: {
                answers: [],
                player: {
                    id: expect.any(String),
                    login: expect.any(String),
                },
                score: 0,
            },
            secondPlayerProgress: {
                answers: [],
                player: {
                    id: expect.any(String),
                    login: expect.any(String),
                },
                score: 0,
            },
            questions: expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(String),
                    body: expect.any(String),
                }),
            ]),
            status: 'Active',
            pairCreatedDate: expect.any(String),
            startGameDate: expect.any(String),
            finishGameDate: null
        });
        return response.body
    }

    async getActiveGame(jwt: string,) {
        const response = await request(this.app.getHttpServer())
            .get(`/pair-game-quiz/pairs/my-current`)
            .set('Authorization', `Bearer ${jwt}`);
        if (response.status !== 200) {
            console.error(response.body);
        }
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            id: expect.any(String),
            firstPlayerProgress: {
                answers: expect.arrayContaining([
                    expect.objectContaining({
                        questionId: expect.any(String),
                        answerStatus: expect.any(String),
                        addedAt: expect.any(String),
                    }),
                ]),
                player: {
                    id: expect.any(String),
                    login: expect.any(String),
                },
                score: 2,
            },
            secondPlayerProgress: {
                answers: expect.arrayContaining([
                    expect.objectContaining({
                        questionId: expect.any(String),
                        answerStatus: expect.any(String),
                        addedAt: expect.any(String),
                    }),
                ]),
                player: {
                    id: expect.any(String),
                    login: expect.any(String),
                },
                score: 1,
            },
            questions: expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(String),
                    body: expect.any(String),
                }),
            ]),
            status: 'Active',
            pairCreatedDate: expect.any(String),
            startGameDate: expect.any(String),
            finishGameDate: null
        });
        return response.body
    }

    async getActivePendingGame(jwt: string) {
        const response = await request(this.app.getHttpServer())
            .get(`/pair-game-quiz/pairs/my-current`)
            .set('Authorization', `Bearer ${jwt}`);

        if (response.status !== 200) {
            console.error(response.body);
        }

        expect(response.status).toBe(200);

        expect(response.body).toMatchObject({
            status: 'PendingSecondPlayer',
            pairCreatedDate: expect.any(String),
            startGameDate: null,
            finishGameDate: null
        });

        return response.body;
    }

    async getActiveGameWithNoResults(jwt: string,) {
        const response = await request(this.app.getHttpServer())
            .get(`/pair-game-quiz/pairs/my-current`)
            .set('Authorization', `Bearer ${jwt}`);
        if (response.status !== 200) {
            console.error(response.body);
        }
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            id: expect.any(String),
            firstPlayerProgress: {
                answers: expect.any(Array),
                player: {
                    id: expect.any(String),
                    login: expect.any(String),
                },
                score: expect.any(Number),
            },
            secondPlayerProgress: {
                answers: expect.any(Array),
                player: {
                    id: expect.any(String),
                    login: expect.any(String),
                },
                score: expect.any(Number),
            },
            questions: expect.any(Array),
            status: GameStatus.Active,
            pairCreatedDate: expect.any(String),
            startGameDate: expect.any(String),
            finishGameDate: null
        });
        return response.body
    }

    async getActiveGameWithId(jwt: string, gameId: number) {
        const response = await request(this.app.getHttpServer())
            .get(`/pair-game-quiz/pairs/my-current`)
            .set('Authorization', `Bearer ${jwt}`);
        if (response.status !== 200) {
            console.error(response.body);
        }
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            id: gameId,
            firstPlayerProgress: {
                answers: expect.any(Array),
                player: {
                    id: expect.any(String),
                    login: expect.any(String),
                },
                score: expect.any(Number),
            },
            secondPlayerProgress: {
                answers: expect.any(Array),
                player: {
                    id: expect.any(String),
                    login: expect.any(String),
                },
                score: expect.any(Number),
            },
            questions: expect.any(Array),
            status: 'Active',
            pairCreatedDate: expect.any(String),
            startGameDate: expect.any(String),
            finishGameDate: null
        });
        return response.body
    }

    async getFinishedGamAsCurrent(jwt: string,) {
        const response = await request(this.app.getHttpServer())
            .get(`/pair-game-quiz/pairs/my-current`)
            .set('Authorization', `Bearer ${jwt}`);
        if (response.status !== 404) {
            console.error(response.body);
        }
        expect(response.status).toBe(404);
    }

    async giveAnswerMoreThenFiveTimes(jwt: string, answer: AnswerDto) {
        const response = await request(this.app.getHttpServer())
            .post(`/pair-game-quiz/pairs/my-current/answers`)
            .set('Authorization', `Bearer ${jwt}`)
            .send(answer);
        if (response.status !== 403) {
            console.error(response.body);
        }
        expect(response.status).toBe(403);
    }

    async giveAnswer(jwt: string, answer: AnswerDto) {
        const response = await request(this.app.getHttpServer())
            .post(`/pair-game-quiz/pairs/my-current/answers`)
            .set('Authorization', `Bearer ${jwt}`)
            .send(answer);
        if (response.status !== 200) {
            console.error(response.body);
        }
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            id: expect.any(String),
            answerStatus: 'Incorrect',
            addedAt: expect.any(String),
            questionId: expect.any(String),
        });
    }

    async giveCorrectAnswer(jwt: string, answer: AnswerDto) {
        const response = await request(this.app.getHttpServer())
            .post(`/pair-game-quiz/pairs/my-current/answers`)
            .set('Authorization', `Bearer ${jwt}`)
            .send(answer);
        if (response.status !== 200) {
            console.error(response.body);
        }
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            id: expect.any(String),
            answerStatus: 'Correct',
            addedAt: expect.any(String),
            questionId: expect.any(String),
        });
    }


    async giveAnswerInNotActiveGame(jwt: string, answer: AnswerDto) {
        const response = await request(this.app.getHttpServer())
            .post(`/pair-game-quiz/pairs/my-current/answers`)
            .set('Authorization', `Bearer ${jwt}`)
            .send(answer);
        if (response.status !== 403) {
            console.error(response.body);
        }
        expect(response.status).toBe(403);
    }

    async giveAnswerInOtherActiveGame(jwt: string, answer: AnswerDto) {
        const response = await request(this.app.getHttpServer())
            .post(`/pair-game-quiz/pairs/my-current/answers`)
            .set('Authorization', `Bearer ${jwt}`)
            .send(answer);
        if (response.status !== 403) {
            console.error(response.body);
        }
        expect(response.status).toBe(403);
    }

    async getFinishedGameById(jwt: string, gameId: number) {
        const response = await request(this.app.getHttpServer())
            .get(`/pair-game-quiz/pairs/${gameId}`)
            .set('Authorization', `Bearer ${jwt}`);
        if (response.status !== 200) {
            console.error(response.body);
        }
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            id: expect.any(String),
            firstPlayerProgress: {
                answers: expect.arrayContaining([
                    expect.objectContaining({
                        questionId: expect.any(String),
                        answerStatus: expect.any(String),
                        addedAt: expect.any(String),
                    }),
                ]),
                player: {
                    id: expect.any(String),
                    login: expect.any(String),
                },
                score: 2,
            },
            secondPlayerProgress: {
                answers: expect.arrayContaining([
                    expect.objectContaining({
                        questionId: expect.any(String),
                        answerStatus: expect.any(String),
                        addedAt: expect.any(String),
                    }),
                ]),
                player: {
                    id: expect.any(String),
                    login: expect.any(String),
                },
                score: 2,
            },
            questions: expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(String),
                    body: expect.any(String),
                }),
            ]),
            status: GameStatus.Finished,
            pairCreatedDate: expect.any(String),
            startGameDate: expect.any(String),
            finishGameDate: expect.any(String)
        });
        return response.body
    }

    async getOtherGameById(jwt: string, gameId: number) {
        const response = await request(this.app.getHttpServer())
            .get(`/pair-game-quiz/pairs/${gameId}`)
            .set('Authorization', `Bearer ${jwt}`);
        if (response.status !== 403) {
            console.error(response.body);
        }
        expect(response.status).toBe(403);
    }

    async getAllUsersGames(jwt: string) {
        const response = await request(this.app.getHttpServer())
            .get(`/pair-game-quiz/pairs/my?sortBy=status&sortDirection=asc`)
            .set('Authorization', `Bearer ${jwt}`);

        if (response.status !== 403) {
            console.error(response.body);
        }

        expect(response.status).toBe(200);

        const items = response.body.items;

        expect(items.length).toBe(4);

        expect(items[0].status).toBe('Active');

        // Проверяем, что массив игр отсортирован по статусу в порядке возрастания
        for (let i = 0; i < items.length - 1; i++) {
            const currentStatus = items[i].status;
            const nextStatus = items[i + 1].status;

            // Проверяем основной критерий - сортировка по статусу
            expect(currentStatus <= nextStatus).toBe(true);

            // Если статусы одинаковы, проверяем сортировку по дате создания пары
            if (currentStatus === nextStatus) {
                const currentDate = new Date(items[i].pairCreatedDate);
                const nextDate = new Date(items[i + 1].pairCreatedDate);
                expect(currentDate >= nextDate).toBe(true);
            }
        }
    }
}