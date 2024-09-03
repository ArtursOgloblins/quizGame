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

describe('game 2Players manyGames int', () => {
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

    it('Players join and starting 1st game', async () => {
        const {userOneToken, userTwoToken} = expect.getState()
        const game = await gameTestManager.connectPlayerToTheGame(userOneToken);
        await gameTestManager.connectSecondPlayerToTheGame(userTwoToken);
        const gameId = game.id;
        const questions = await gameTestManager.getGameQuestions(gameId)
        expect.setState({
            currentGameId: gameId,
            gameQuestions: questions
        });
    });


    it('1st player answer', async () => {
        const {userOneToken, userTwoToken, gameQuestions} = expect.getState()
        const wrongAnswer = gameTestManager.WRONG_ANSWER
        let correctAnswer: AnswerDto | '' = ''

        const correctAnswerIndexTwo = await gameTestManager.getCorrectAnswer(gameQuestions, 2)
        const correctAnswerIndexThree = await gameTestManager.getCorrectAnswer(gameQuestions, 3)
        const correctAnswerIndexFour = await gameTestManager.getCorrectAnswer(gameQuestions, 4)

        await gameTestManager.giveAnswer(userOneToken, wrongAnswer);
        await gameTestManager.giveAnswer(userOneToken, wrongAnswer);
        await gameTestManager.giveCorrectAnswer(userOneToken, correctAnswerIndexTwo);
        await gameTestManager.giveCorrectAnswer(userOneToken, correctAnswerIndexThree);
        await gameTestManager.giveCorrectAnswer(userOneToken, correctAnswerIndexFour);
    });

    it('2nd player answer', async () => {
        const {userOneToken, userTwoToken, gameQuestions} = expect.getState()
        const wrongAnswer = gameTestManager.WRONG_ANSWER
        let correctAnswer: AnswerDto | '' = ''

        const correctAnswerIndexTwo = await gameTestManager.getCorrectAnswer(gameQuestions, 2)
        const correctAnswerIndexThree = await gameTestManager.getCorrectAnswer(gameQuestions, 3)

        await gameTestManager.giveAnswer(userTwoToken, wrongAnswer);
        await gameTestManager.giveAnswer(userTwoToken, wrongAnswer);
        await gameTestManager.giveCorrectAnswer(userTwoToken, correctAnswerIndexTwo);
        await gameTestManager.giveCorrectAnswer(userTwoToken, correctAnswerIndexThree);
        await gameTestManager.giveAnswer(userTwoToken, wrongAnswer);
    });


    ///** SECOND GAME **///

    it('Players join and starting 1st game', async () => {
        const {userOneToken, userTwoToken} = expect.getState()
        const game = await gameTestManager.connectPlayerToTheGame(userOneToken);
        await gameTestManager.connectSecondPlayerToTheGame(userTwoToken);
        const gameId = game.id;
        const questions = await gameTestManager.getGameQuestions(gameId)
        expect.setState({
            currentGameId: gameId,
            gameQuestions: questions
        });
    });


    it('1st player answer', async () => {
        const {userOneToken, userTwoToken, gameQuestions} = expect.getState()
        const wrongAnswer = gameTestManager.WRONG_ANSWER
        let correctAnswer: AnswerDto | '' = ''

        const correctAnswerIndexTwo = await gameTestManager.getCorrectAnswer(gameQuestions, 2)
        const correctAnswerIndexThree = await gameTestManager.getCorrectAnswer(gameQuestions, 3)
        const correctAnswerIndexFour = await gameTestManager.getCorrectAnswer(gameQuestions, 4)

        await gameTestManager.giveAnswer(userOneToken, wrongAnswer);
        await gameTestManager.giveAnswer(userOneToken, wrongAnswer);
        await gameTestManager.giveCorrectAnswer(userOneToken, correctAnswerIndexTwo);
        await gameTestManager.giveCorrectAnswer(userOneToken, correctAnswerIndexThree);
        await gameTestManager.giveCorrectAnswer(userOneToken, correctAnswerIndexFour);
    });

    it('2nd player answer', async () => {
        const {userOneToken, userTwoToken, gameQuestions} = expect.getState()
        const wrongAnswer = gameTestManager.WRONG_ANSWER
        let correctAnswer: AnswerDto | '' = ''

        const correctAnswerIndexTwo = await gameTestManager.getCorrectAnswer(gameQuestions, 2)
        const correctAnswerIndexThree = await gameTestManager.getCorrectAnswer(gameQuestions, 3)

        await gameTestManager.giveAnswer(userTwoToken, wrongAnswer);
        await gameTestManager.giveAnswer(userTwoToken, wrongAnswer);
        await gameTestManager.giveCorrectAnswer(userTwoToken, correctAnswerIndexTwo);
        await gameTestManager.giveCorrectAnswer(userTwoToken, correctAnswerIndexThree);
        await gameTestManager.giveAnswer(userTwoToken, wrongAnswer);
    });

    // Third game //

    it('Players join and starting 1st game', async () => {
        const {userOneToken, userTwoToken} = expect.getState()
        const game = await gameTestManager.connectPlayerToTheGame(userOneToken);
        await gameTestManager.connectSecondPlayerToTheGame(userTwoToken);
        const gameId = game.id;
        const questions = await gameTestManager.getGameQuestions(gameId)
        expect.setState({
            currentGameId: gameId,
            gameQuestions: questions
        });
    });


    it('1st player answer', async () => {
        const {userOneToken, userTwoToken, gameQuestions} = expect.getState()
        const wrongAnswer = gameTestManager.WRONG_ANSWER
        let correctAnswer: AnswerDto | '' = ''

        const correctAnswerIndexTwo = await gameTestManager.getCorrectAnswer(gameQuestions, 2)
        const correctAnswerIndexThree = await gameTestManager.getCorrectAnswer(gameQuestions, 3)
        const correctAnswerIndexFour = await gameTestManager.getCorrectAnswer(gameQuestions, 4)

        await gameTestManager.giveAnswer(userOneToken, wrongAnswer);
        await gameTestManager.giveAnswer(userOneToken, wrongAnswer);
        await gameTestManager.giveCorrectAnswer(userOneToken, correctAnswerIndexTwo);
        await gameTestManager.giveCorrectAnswer(userOneToken, correctAnswerIndexThree);
        await gameTestManager.giveCorrectAnswer(userOneToken, correctAnswerIndexFour);
    });

    it('2nd player answer', async () => {
        const {userOneToken, userTwoToken, gameQuestions} = expect.getState()
        const wrongAnswer = gameTestManager.WRONG_ANSWER
        let correctAnswer: AnswerDto | '' = ''

        const correctAnswerIndexTwo = await gameTestManager.getCorrectAnswer(gameQuestions, 2)
        const correctAnswerIndexThree = await gameTestManager.getCorrectAnswer(gameQuestions, 3)

        await gameTestManager.giveAnswer(userTwoToken, wrongAnswer);
        await gameTestManager.giveAnswer(userTwoToken, wrongAnswer);
        await gameTestManager.giveCorrectAnswer(userTwoToken, correctAnswerIndexTwo);
        await gameTestManager.giveCorrectAnswer(userTwoToken, correctAnswerIndexThree);
        await gameTestManager.giveAnswer(userTwoToken, wrongAnswer);
    });

    // 4th Game //

    it('Players join and starting 1st game', async () => {
        const {userOneToken, userTwoToken} = expect.getState()
        const game = await gameTestManager.connectPlayerToTheGame(userOneToken);
        await gameTestManager.connectSecondPlayerToTheGame(userTwoToken);
        const gameId = game.id;
        const questions = await gameTestManager.getGameQuestions(gameId)
        expect.setState({
            currentGameId: gameId,
            gameQuestions: questions
        });
    });


    it('1st player answer', async () => {
        const {userOneToken, userTwoToken, gameQuestions} = expect.getState()
        const wrongAnswer = gameTestManager.WRONG_ANSWER
        let correctAnswer: AnswerDto | '' = ''

        const correctAnswerIndexTwo = await gameTestManager.getCorrectAnswer(gameQuestions, 2)
        const correctAnswerIndexThree = await gameTestManager.getCorrectAnswer(gameQuestions, 3)
        const correctAnswerIndexFour = await gameTestManager.getCorrectAnswer(gameQuestions, 4)

        await gameTestManager.giveAnswer(userOneToken, wrongAnswer);
        await gameTestManager.giveAnswer(userOneToken, wrongAnswer);
        await gameTestManager.giveCorrectAnswer(userOneToken, correctAnswerIndexTwo);
    });

    it('2nd player answer', async () => {
        const {userOneToken, userTwoToken, gameQuestions} = expect.getState()
        const wrongAnswer = gameTestManager.WRONG_ANSWER
        let correctAnswer: AnswerDto | '' = ''

        const correctAnswerIndexTwo = await gameTestManager.getCorrectAnswer(gameQuestions, 2)
        const correctAnswerIndexThree = await gameTestManager.getCorrectAnswer(gameQuestions, 3)

        await gameTestManager.giveAnswer(userTwoToken, wrongAnswer);
        await gameTestManager.giveAnswer(userTwoToken, wrongAnswer);
        await gameTestManager.giveCorrectAnswer(userTwoToken, correctAnswerIndexTwo);
    });

    it('1st Player get all games', async () => {
        const {userOneToken} = expect.getState()
        await gameTestManager.getAllUsersGames(userOneToken)
    })
})