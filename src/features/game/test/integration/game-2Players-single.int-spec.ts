import {Test, TestingModule} from "@nestjs/testing";
import {AppModule} from "../../../../app.module";
import {applyAppSettings} from "../../../../settings/applay-app-settings";
import * as request from "supertest";
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

describe('game twoPlayers single int', () => {
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
        await questionsTestManager.publishAllQuestions(questionIds, publishStatus)
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

    it('UserTwo getting game by id where 1st player is registered only', async () => {
        const {userTwoToken, currentGameId} = expect.getState()
        await gameTestManager.getGameByIdWithOnePlayer( userTwoToken, currentGameId);
    });

    it('userOne answers when game is not active | question: index 0, incorrect', async () => {
        const {userOneToken} = expect.getState()
        const answer = gameTestManager.WRONG_ANSWER
        await gameTestManager.giveAnswerInNotActiveGame(userOneToken, answer);
    });

    it('Get users active game: Pending Status', async () => {
        const {userOneToken} = expect.getState()
        await gameTestManager.getActivePendingGame( userOneToken);
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


    it('Player tries to join to existing game', async () => {
        const {userOneToken} = expect.getState()
        await gameTestManager.connectPlayerToTheGameTwice(
            userOneToken
        );
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

    it('1 userOne question 1: Correct', async () => {
        const {userOneToken, gameQuestions} = expect.getState()
        const answer: AnswerDto = await gameTestManager.getCorrectAnswer(gameQuestions, 0)
        await gameTestManager.giveCorrectAnswer(userOneToken, answer);
    });

    it('2 userOne question 2: incorrect', async () => {
        const {userOneToken} = expect.getState()
        const answer = gameTestManager.WRONG_ANSWER
        await gameTestManager.giveAnswer(userOneToken, answer);
    });

    it('3 userTwo question 1: Correct', async () => {
        const {userTwoToken, gameQuestions} = expect.getState()
        const answer: AnswerDto = await gameTestManager.getCorrectAnswer(gameQuestions, 0)
        await gameTestManager.giveCorrectAnswer(userTwoToken, answer);
    });

    it('4 userTwo, question 2: incorrect', async () => {
        const {userTwoToken} = expect.getState()
        const answer = gameTestManager.WRONG_ANSWER
        await gameTestManager.giveAnswer(userTwoToken, answer);
    });

    it('5 userTwo, question 2: incorrect', async () => {
        const {userTwoToken} = expect.getState()
        const answer = gameTestManager.WRONG_ANSWER
        await gameTestManager.giveAnswer(userTwoToken, answer);
    });

    it('6 userTwo, question 4: incorrect', async () => {
        const {userTwoToken} = expect.getState()
        const answer = gameTestManager.WRONG_ANSWER
        await gameTestManager.giveAnswer(userTwoToken, answer);
    });

    it('7 userTwo, question 5: incorrect', async () => {
        const {userTwoToken} = expect.getState()
        const answer = gameTestManager.WRONG_ANSWER
        await gameTestManager.giveAnswer(userTwoToken, answer);
    });

    it('8 userOne question 3: Correct', async () => {
        const {userOneToken, gameQuestions} = expect.getState()
        const answer: AnswerDto = await gameTestManager.getCorrectAnswer(gameQuestions, 2)
        await gameTestManager.giveCorrectAnswer(userOneToken, answer);
    });

    it('UserOne: Get users active game', async () => {
        const {userOneToken} = expect.getState()
        await gameTestManager.getActiveGameWithNoResults(userOneToken);
    });

    it('UserTwo: Get users active game', async () => {
        const {userTwoToken} = expect.getState()
        await gameTestManager.getActiveGameWithNoResults(userTwoToken);
    });

    it('9 userOne question 4: incorrect', async () => {
        const {userOneToken} = expect.getState()
        const answer = gameTestManager.WRONG_ANSWER
        await gameTestManager.giveAnswer(userOneToken, answer);
    });

    it('10 userOne question 5: incorrect', async () => {
        const {userOneToken} = expect.getState()
        const answer = gameTestManager.WRONG_ANSWER
        await gameTestManager.giveAnswer(userOneToken, answer);
    });


    it('userOne tries to answer on more than 5 questions', async () => {
        const {userOneToken} = expect.getState()
        const answer = gameTestManager.WRONG_ANSWER
        await gameTestManager.giveAnswerMoreThenFiveTimes(userOneToken, answer);
    });

    it('Player tries to join to get finished game', async () => {
        const {userTwoToken} = expect.getState()
        await gameTestManager.getFinishedGamAsCurrent( userTwoToken);
    });

    it('Get game by id FINISHED', async () => {
        const {userTwoToken, currentGameId} = expect.getState()
        await gameTestManager.getFinishedGameById( userTwoToken, currentGameId);
    });
})