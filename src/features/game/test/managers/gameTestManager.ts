import {INestApplication} from "@nestjs/common";
import * as request from 'supertest';

export class GameTestManager {
    constructor(
        protected readonly app: INestApplication,
    ) {}

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
            questions: expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(String),
                    body: expect.any(String),
                }),
            ]),
            status: 'PendingSecondPlayer',
            pairCreatedDate: expect.any(String),
            startGameDate: null,
            finishGameDate: null,
        });
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
    }
}