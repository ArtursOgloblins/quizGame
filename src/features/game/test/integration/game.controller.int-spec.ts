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

describe('game int', () => {
    let app: INestApplication;
    let usersSaManager: UsersSaTestManager;
    let authTestManager: AuthTestManager;
    let usersQueryRepository: UsersQueryRepository;
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

        usersQueryRepository =
            moduleFixture.get<UsersQueryRepository>(UsersQueryRepository);
        usersSaManager = new UsersSaTestManager(app);
        authTestManager = new AuthTestManager(app, usersQueryRepository);
        questionsTestManager = new QuestionsTestManager(app)
        gameTestManager = new GameTestManager(app)
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
        await gameTestManager.connectPlayerToTheGame(
            userOneToken
        );
    });


    it('2nd Player joins game', async () => {
        const {userTwoToken} = expect.getState()
        await gameTestManager.connectSecondPlayerToTheGame(
            userTwoToken
        );
    });

    // it('Player already have existing game and joins another game', async () => {
    //     const {userOneToken} = expect.getState()
    //     await gameTestManager.connectPlayerToTheGame(
    //         userOneToken
    //     );
    // });
})