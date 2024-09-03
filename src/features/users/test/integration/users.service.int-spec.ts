import {Test, TestingModule} from "@nestjs/testing";
import {AppModule} from "../../../../app.module";
import {RegisterUserCommand} from "../../application/usecases/register-user.usecase";
import {applyAppSettings} from "../../../../settings/applay-app-settings";
import request from "supertest";
import {UsersQueryRepository} from "../../infrastructure/users.query-repostory";
import {AuthTestManager} from "../managers/authTestManager";
import {INestApplication} from "@nestjs/common";
import {RegisterUserCommandMock} from "../mock/register-user.usecase.mock";
import {UsersSaTestManager} from "../managers/usersSaTestManager";
import {DataSource} from "typeorm";
import {getDataSourceOptions} from "../../../../../typeorm.config";
import {UserQueryParamsDTO} from "../../api/dto/input/user-queryParams.dto";

describe('users int', () => {
    let app: INestApplication;
    let usersSaManager: UsersSaTestManager;
    let authTestManager: AuthTestManager;
    let usersQueryRepository: UsersQueryRepository;
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
    });

    afterAll(async () => {
        await dataSource.destroy();
        await app.close();
    });

    it('Super Admin registering user', async () => {
        const response = await usersSaManager.registerUser(
            usersSaManager.USER_INPUT_DATA,
        );
        expect.setState({
            userId: response.body.id,
        });
    });

    it('Get all users', async () => {
        const queryParams: UserQueryParamsDTO = usersSaManager.QUERYPARAMS;
        const response = await usersSaManager.getAllUsers(queryParams);
        expect(response.status).toBe(200);
    });

    it('Delete user by id', async () => {
        const { userId } = expect.getState();
        await usersSaManager.deleteUserById(userId);
    });

    it('register new users', async () => {
        await authTestManager.registerUser(authTestManager.USER_ONE_INPUT_DATA);
        await authTestManager.registerUser(authTestManager.USER_TWO_INPUT_DATA);

        const userOne = await usersQueryRepository.findByLoginOrEmail(
            authTestManager.USER_ONE_INPUT_DATA.email,
        );

        expect.setState({
            userOneData: userOne,
        });
    });

    it('resend confirmation code for user one', async () => {
        const { userOneData } = expect.getState();
        await authTestManager.resendConfirmationCode(userOneData.email);

        const userOne = await usersQueryRepository.findByLoginOrEmail(
            authTestManager.USER_ONE_INPUT_DATA.email,
        );

        const userTwo = await usersQueryRepository.findByLoginOrEmail(
            authTestManager.USER_TWO_INPUT_DATA.email,
        );

        expect.setState({
            userOneData: userOne,
            userTwoData: userTwo,
        });
    });

    it('confirm users', async () => {
        const { userOneData, userTwoData } = expect.getState();
        await authTestManager.confirmRegistration(
            userOneData.confirmation.confirmationCode,
        );
        await authTestManager.confirmRegistration(
            userTwoData.confirmation.confirmationCode,
        );
    });

    it('Password-recovery for userOne', async () => {
        const { userOneData } = expect.getState();
        const recoveryData = await authTestManager.sendPasswordRecoveryRequest(
            userOneData.email,
        );
        expect.setState({
            passwordRecoveryCode: recoveryData,
        });
    });

    it('Change password for userOne', async () => {
        const { passwordRecoveryCode } = expect.getState();
        const newPassword = 'newPassword';
        await authTestManager.changeUserPassword(passwordRecoveryCode, newPassword);
    });

    it('login users', async () => {
        const tokenOne = await authTestManager.loginUser({
            ...authTestManager.USER_ONE_CREDENTIALS,
            password: 'newPassword',
        });
        const tokenTwo = await authTestManager.loginUser(
            authTestManager.USER_TWO_CREDENTIALS,
        );
        console.log('tokenOne', tokenOne);

        expect.setState({
            userOneToken: tokenOne,
            userTwoToken: tokenTwo,
        });
    });

    it('Get info about user one', async () => {
        const { userOneToken } = expect.getState();
        await authTestManager.getCurrentUserInfo(userOneToken);
    });
})