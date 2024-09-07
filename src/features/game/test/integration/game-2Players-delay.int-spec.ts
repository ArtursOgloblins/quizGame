import {Test, TestingModule} from "@nestjs/testing";
import {AppModule} from "../../../../app.module";
import {applyAppSettings} from "../../../../settings/applay-app-settings";
import request from "supertest";
import {INestApplication} from "@nestjs/common";
import {DataSource} from "typeorm";
import {getDataSourceOptions} from "../../../../../typeorm.config";
import {UsersSaTestManager} from "../../../users/test/managers/usersSaTestManager";
import {AuthTestManager} from "../../../users/test/managers/authTestManager";
import {UsersQueryRepository} from "../../../users/infrastructure/users.query-repostory";
import {RegisterUserCommand} from "../../../users/application/usecases/register-user.usecase";
import {RegisterUserCommandMock} from "../../../users/test/mock/register-user.usecase.mock";
import {QuestionsTestManager} from "../../../questions/test/managers/questionsTestmanager";
import {GameTestManager} from "../managers/gameTestManager";
import {GameQueryRepository} from "../../infrastructure/game.query-repository";
import {AnswerDto} from "../../api/input/answer.dto";
import {GameStatus} from "../../api/output/game-response.dto";

describe('game twoPlayers with delay', () => {
    let app: INestApplication;
    let usersSaManager: UsersSaTestManager;
    let authTestManager: AuthTestManager;
    let usersQueryRepository: UsersQueryRepository;
    let gameQueryRepository: GameQueryRepository;
    let questionsTestManager: QuestionsTestManager;
    let gameTestManager: GameTestManager;
    let dataSource: DataSource;

    beforeAll(async () => {

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(RegisterUserCommand)
            .useClass(RegisterUserCommandMock)
            .compile();

        app = moduleFixture.createNestApplication();
        applyAppSettings(app);
        await app.init();
        console.log('HTTP Server:', app.getHttpServer());

        const dataSourceOptions = getDataSourceOptions();
        dataSource = new DataSource(dataSourceOptions);
        await dataSource.initialize();
        await dataSource.runMigrations();

        await request(app.getHttpServer()).delete(`/testing/all-data`);

        usersQueryRepository = moduleFixture.get<UsersQueryRepository>(UsersQueryRepository);
        gameQueryRepository = moduleFixture.get<GameQueryRepository>(GameQueryRepository);
        usersSaManager = new UsersSaTestManager(app);
        authTestManager = new AuthTestManager(app, usersQueryRepository);
        questionsTestManager = new QuestionsTestManager(app)
        gameTestManager = new GameTestManager(app, gameQueryRepository)
    });

    afterAll(async () => {
        await dataSource.destroy();
        await app.close();
    });

    it('add and publish 10 questions', async () => {
        const queryParams = questionsTestManager.QUESTIONS_QUERY_PARAMS
        await questionsTestManager.addMultipleQuestions(questionsTestManager.SAMPLE_QUESTIONS);
        const response = await questionsTestManager.getAllQuestions(queryParams)
        const questionIds: [] = response.body.items.map(i => i.id)
        const publishStatus = questionsTestManager.PUBLISH_STATUS
        await questionsTestManager.publishAllQuestions(questionIds)
    });

    it('register and login new players', async () => {
        await authTestManager.registerUser(authTestManager.USER_ONE_INPUT_DATA);
        await authTestManager.registerUser(authTestManager.USER_TWO_INPUT_DATA);
        const userOne = await usersQueryRepository.findByLoginOrEmail(
            authTestManager.USER_ONE_INPUT_DATA.email,
        );
        const userTwo = await usersQueryRepository.findByLoginOrEmail(
            authTestManager.USER_TWO_INPUT_DATA.email,
        );

        await authTestManager.confirmRegistration(
            userOne.confirmation.confirmationCode
        );
        await authTestManager.confirmRegistration(
            userTwo.confirmation.confirmationCode
        );
        const tokenOne = await authTestManager.loginUser(
            authTestManager.USER_ONE_CREDENTIALS,
        );
        const tokenTwo = await authTestManager.loginUser(
            authTestManager.USER_TWO_CREDENTIALS,
        );
        expect.setState({
            userOneToken: tokenOne,
            userTwoToken: tokenTwo,
        });
    });

    it('1st Player starts game', async () => {
        const {userOneToken} = expect.getState()
        const game = await gameTestManager.connectPlayerToTheGame(
            userOneToken
        );

        const gameId = game.id;
        expect.setState({
            currentGameId: gameId
        });
    });

    it('2nd Player joins game', async () => {
        const {userTwoToken} = expect.getState()
        const game = await gameTestManager.connectSecondPlayerToTheGame(
            userTwoToken
        );
        const gameId = game.id;
        expect.setState({
            currentGameId: gameId,
        });
    });


    it('Get game by id', async () => {
        const {userTwoToken, currentGameId} = expect.getState()
        const game = await gameTestManager.getGameById( userTwoToken, currentGameId);
        const questions = await gameTestManager.getGameQuestions(currentGameId)
        expect.setState({
            currentGame: game,
            gameQuestions: questions
        });
    });

    it('userOne question 1: Correct', async () => {
        const {userOneToken, gameQuestions} = expect.getState()
        const answer: AnswerDto = await gameTestManager.getCorrectAnswer(gameQuestions, 0)
        await gameTestManager.giveCorrectAnswer(userOneToken, answer);
    });

    it('userOne question 2: Correct', async () => {
        const {userOneToken, gameQuestions} = expect.getState()
        const answer: AnswerDto = await gameTestManager.getCorrectAnswer(gameQuestions, 1)
        await gameTestManager.giveCorrectAnswer(userOneToken, answer);
    });

    it('userOne question 3: Correct', async () => {
        const {userOneToken, gameQuestions} = expect.getState()
        const answer: AnswerDto = await gameTestManager.getCorrectAnswer(gameQuestions, 2)
        await gameTestManager.giveCorrectAnswer(userOneToken, answer);
    });


    it('userOne question 4: Correct', async () => {
        const {userOneToken, gameQuestions} = expect.getState()
        const answer: AnswerDto = await gameTestManager.getCorrectAnswer(gameQuestions, 3)
        await gameTestManager.giveCorrectAnswer(userOneToken, answer);
    });

    it('userOne question 5: Correct', async () => {
        const {userOneToken, gameQuestions} = expect.getState()
        const answer: AnswerDto = await gameTestManager.getCorrectAnswer(gameQuestions, 4)
        await gameTestManager.giveCorrectAnswer(userOneToken, answer);
        await new Promise(resolve => setTimeout(resolve, 20000));
    }, 25000);

    // async function waitForGameToFinish(currentGameId, userToken) {
    //     let gameStatus;
    //     const maxAttempts = 10;
    //     let attempts = 0;
    //
    //     do {
    //         const response = await request(app.getHttpServer())
    //             .get(`/pair-game-quiz/pairs/${currentGameId}`)
    //             .set('Authorization', `Bearer ${userToken}`);
    //
    //         gameStatus = response.body.status;
    //
    //         if (gameStatus === GameStatus.Finished) {
    //             return response.body;
    //         }
    //
    //         attempts += 1;
    //         await new Promise(resolve => setTimeout(resolve, 1000)); // Ждем 1 секунду перед следующей попыткой
    //     } while (gameStatus !== GameStatus.Finished && attempts < maxAttempts);
    //
    //     throw new Error('Game did not finish in the expected time.');
    // }
    //
    it('Get game by id FINISHED WITH DELAY', async () => {
        const {userOneToken, currentGameId} = expect.getState();

        const response = await request(app.getHttpServer())
                    .get(`/pair-game-quiz/pairs/${currentGameId}`)
                    .set('Authorization', `Bearer ${userOneToken}`);

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
                score: 6,
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
                score: 0,
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
    }, 30000);
})