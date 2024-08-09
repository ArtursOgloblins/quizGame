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

describe('game multiPlayers int', () => {
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

    it('register and login 2 new players', async () => {
        await authTestManager.registerUser(authTestManager.USER_ONE_INPUT_DATA);
        await authTestManager.registerUser(authTestManager.USER_TWO_INPUT_DATA);
        const users = [
            await usersQueryRepository.findByLoginOrEmail(authTestManager.USER_ONE_INPUT_DATA.email),
            await usersQueryRepository.findByLoginOrEmail(authTestManager.USER_TWO_INPUT_DATA.email),
        ];
        for (const user of users) {
            await authTestManager.confirmRegistration(user.confirmation.confirmationCode);
        }
        const tokens = [
            await authTestManager.loginUser(authTestManager.USER_ONE_CREDENTIALS),
            await authTestManager.loginUser(authTestManager.USER_TWO_CREDENTIALS),
        ];
        expect.setState({
            userOneToken: tokens[0],
            userTwoToken: tokens[1],
        });
    });

    it('register and login 3th and 4th new players', async () => {
        await authTestManager.registerUser(authTestManager.USER_THREE_INPUT_DATA);
        await authTestManager.registerUser(authTestManager.USER_FOUR_INPUT_DATA);
        const users = [
            await usersQueryRepository.findByLoginOrEmail(authTestManager.USER_THREE_INPUT_DATA.email),
            await usersQueryRepository.findByLoginOrEmail(authTestManager.USER_FOUR_INPUT_DATA.email),
        ];
        for (const user of users) {
            await authTestManager.confirmRegistration(user.confirmation.confirmationCode);
        }
        const tokens = [
            await authTestManager.loginUser(authTestManager.USER_THREE_CREDENTIALS),
            await authTestManager.loginUser(authTestManager.USER_FOUR_CREDENTIALS),
        ];
        expect.setState({
            userThreeToken: tokens[0],
            userFourToken: tokens[1],
        });
    });

    it('register and login 5th and 6th new players', async () => {
        await authTestManager.registerUser(authTestManager.USER_FIVE_INPUT_DATA);
        await authTestManager.registerUser(authTestManager.USER_SIX_INPUT_DATA);
        const users = [
            await usersQueryRepository.findByLoginOrEmail(authTestManager.USER_FIVE_INPUT_DATA.email),
            await usersQueryRepository.findByLoginOrEmail(authTestManager.USER_SIX_INPUT_DATA.email),
        ];
        for (const user of users) {
            await authTestManager.confirmRegistration(user.confirmation.confirmationCode);
        }
        const tokens = [
            await authTestManager.loginUser(authTestManager.USER_FIVE_CREDENTIALS),
            await authTestManager.loginUser(authTestManager.USER_SIX_CREDENTIALS),
        ];
        expect.setState({
            userFiveToken: tokens[0],
            userSixToken: tokens[1],
        });
    });

    it('1st Game: 1st Player starts game', async () => {
        const {userOneToken} = expect.getState()
        await gameTestManager.connectPlayerToTheGame(userOneToken);

    });

    it('1st Game: 1st user Getting current game', async () => {
        const {userOneToken} = expect.getState()
        await gameTestManager.getActivePendingGame(userOneToken);
    });

    it('1st Game: 2nd Player joins game', async () => {
        const {userTwoToken} = expect.getState()
        const game = await gameTestManager.connectSecondPlayerToTheGame(userTwoToken);
        const firstGameId = game.id
        const firstGameQuestions = await gameTestManager.getGameQuestions(firstGameId)
        expect.setState({
            firstGameId: firstGameId,
            firstGameQuestions: firstGameQuestions
        });
    });

    it('1st Game: Get active game by 1st user', async () => {
        const {userOneToken, firstGameId} = expect.getState()
        await gameTestManager.getActiveGameWithId(userOneToken, firstGameId);
    });
    it('1st Game: Get active game by 2nd user', async () => {
        const {userTwoToken} = expect.getState()
        await gameTestManager.getActiveGameWithNoResults(userTwoToken);
    });

    it('1st Game: 1 userOne question 1: Correct', async () => {
        const {userOneToken, firstGameQuestions} = expect.getState()
        const answer: AnswerDto = await gameTestManager.getCorrectAnswer(firstGameQuestions, 0)
        await gameTestManager.giveCorrectAnswer(userOneToken, answer);
    });

    it('1st Game: 2 userTwo question 2: incorrect', async () => {
        const {userTwoToken} = expect.getState()
        const answer = gameTestManager.WRONG_ANSWER
        await gameTestManager.giveAnswer(userTwoToken, answer);
    });

    it('1st Game: 3 userTwo question 1: Correct', async () => {
        const {userTwoToken, firstGameQuestions} = expect.getState()
        const answer: AnswerDto = await gameTestManager.getCorrectAnswer(firstGameQuestions, 1)
        await gameTestManager.giveCorrectAnswer(userTwoToken, answer);
    });

    it('1st Game: Get active game by 1st user', async () => {
        const {userOneToken, firstGameId} = expect.getState()
        await gameTestManager.getActiveGameWithId(userOneToken, firstGameId);
    });
    it('1st Game: Get active game by 2nd user', async () => {
        const {userTwoToken} = expect.getState()
        await gameTestManager.getActiveGameWithNoResults(userTwoToken);
    });

    it('2nd Game: 3rd Player starts game', async () => {
        const {userThreeToken} = expect.getState()
        await gameTestManager.connectPlayerToTheGame(
            userThreeToken
        );
    });

    it('2nd Game: 4th Player joins game of 3rd player', async () => {
        const {userFourToken} = expect.getState()
        const game = await gameTestManager.connectSecondPlayerToTheGame(
            userFourToken
        );
        const secondGameId = game.id;
        const secondGameQuestions = await gameTestManager.getGameQuestions(secondGameId)
        expect.setState({
            gameTwoId: secondGameId,
            secondGameQuestions: secondGameQuestions
        });
    });

    it('2nd Game: 1 userThree question 1: Correct', async () => {
        const {userThreeToken, secondGameQuestions} = expect.getState()
        const answer: AnswerDto = await gameTestManager.getCorrectAnswer(secondGameQuestions, 0)
        await gameTestManager.giveCorrectAnswer(userThreeToken, answer);
    });

    it('2nd Game: 2 userFour question 2: incorrect', async () => {
        const {userFourToken} = expect.getState()
        const answer = gameTestManager.WRONG_ANSWER
        await gameTestManager.giveAnswer(userFourToken, answer);
    });

    it('2nd Game: 3 userFour question 1: Correct', async () => {
        const {userFourToken, secondGameQuestions} = expect.getState()
        const answer: AnswerDto = await gameTestManager.getCorrectAnswer(secondGameQuestions, 1)
        await gameTestManager.giveCorrectAnswer(userFourToken, answer);
    });

    it('2nd Game: Get active game by 3rd user', async () => {
        const {userThreeToken, gameTwoId} = expect.getState()
        await gameTestManager.getActiveGameWithId(userThreeToken, gameTwoId);
    });
    it('2nd Game: Get active game by 4th user', async () => {
        const {userFourToken} = expect.getState()
        await gameTestManager.getActiveGameWithNoResults(userFourToken);
    });

    it('2nd Game: Get active game by 3rd user', async () => {
        const {userThreeToken, gameTwoId} = expect.getState()
        await gameTestManager.getActiveGameWithId(userThreeToken, gameTwoId);
    });
    it('2nd Game: Get active game by 4th user', async () => {
        const {userFourToken} = expect.getState()
        await gameTestManager.getActiveGameWithNoResults(userFourToken);
    });

    it('1st Game: 4 userOne question 1: Correct', async () => {
        const {userOneToken, firstGameQuestions} = expect.getState()
        const answer: AnswerDto = await gameTestManager.getCorrectAnswer(firstGameQuestions, 1)
        await gameTestManager.giveCorrectAnswer(userOneToken, answer);
    });

    it('1st Game: 5 userOne question 2: Correct', async () => {
        const {userOneToken, firstGameQuestions} = expect.getState()
        const answer: AnswerDto = await gameTestManager.getCorrectAnswer(firstGameQuestions, 2)
        await gameTestManager.giveCorrectAnswer(userOneToken, answer);
    });

    it('1st Game: 6 userTwo question 1: Correct', async () => {
        const {userTwoToken, firstGameQuestions} = expect.getState()
        const answer: AnswerDto = await gameTestManager.getCorrectAnswer(firstGameQuestions, 2)
        await gameTestManager.giveCorrectAnswer(userTwoToken, answer);
    });

    it('1st Game: 7 userTwo question 2: Correct', async () => {
        const {userTwoToken, firstGameQuestions} = expect.getState()
        const answer: AnswerDto = await gameTestManager.getCorrectAnswer(firstGameQuestions, 3)
        await gameTestManager.giveCorrectAnswer(userTwoToken, answer);
    });

    it('1st Game: 8 userOne, question 3: incorrect', async () => {
        const {userOneToken} = expect.getState()
        const answer = gameTestManager.WRONG_ANSWER
        await gameTestManager.giveAnswer(userOneToken, answer);
    });

    it('1st Game: 9 userOne question 4: Correct', async () => {
        const {userOneToken, firstGameQuestions} = expect.getState()
        const answer: AnswerDto = await gameTestManager.getCorrectAnswer(firstGameQuestions, 4)
        await gameTestManager.giveCorrectAnswer(userOneToken, answer);
    });

    it('1st Game: Get active game by 1st user', async () => {
        const {userOneToken, firstGameId} = expect.getState()
        await gameTestManager.getActiveGameWithId(userOneToken, firstGameId);
    });
    it('1st Game: Get active game by 2nd user', async () => {
        const {userTwoToken} = expect.getState()
        await gameTestManager.getActiveGameWithNoResults(userTwoToken);
    });

    it('1st Game: 10 userTwo question 3: Correct', async () => {
        const {userTwoToken, firstGameQuestions} = expect.getState()
        const answer: AnswerDto = await gameTestManager.getCorrectAnswer(firstGameQuestions, 4)
        await gameTestManager.giveCorrectAnswer(userTwoToken, answer);
    });


    // it('3rd Player tries to answer not in his active game', async () => {
    //     const {userThreeToken} = expect.getState()
    //     const answer = gameTestManager.WRONG_ANSWER
    //     await gameTestManager.giveAnswerInOtherActiveGame(userThreeToken, answer);
    // });
    //
    // it('3rd Player starts game', async () => {
    //     const {userThreeToken} = expect.getState()
    //     await gameTestManager.connectPlayerToTheGame(
    //         userThreeToken
    //     );
    // });
    //
    // it('4th Player joins game of 3rd player', async () => {
    //     const {userFourToken} = expect.getState()
    //     const game = await gameTestManager.connectSecondPlayerToTheGame(
    //         userFourToken
    //     );
    //     const secondGameId = game.id;
    //     const secondGameQuestions = await gameTestManager.getGameQuestions(secondGameId)
    //     expect.setState({
    //         gameTwoId: secondGameId,
    //         secondGameQuestions: secondGameQuestions
    //     });
    // });
    //
    // it('2nd user get other game by id', async () => {
    //     const {userTwoToken, gameTwoId} = expect.getState()
    //     await gameTestManager.getOtherGameById( userTwoToken, gameTwoId);
    // });
    //
    // it('Get active game by 3rd user', async () => {
    //     const {userThreeToken} = expect.getState()
    //     await gameTestManager.getActiveGameWithNoResults( userThreeToken);
    // });
    // it('Get active game by 4th user', async () => {
    //     const {userFourToken} = expect.getState()
    //     await gameTestManager.getActiveGameWithNoResults( userFourToken);
    // });
    //
    //
    // it('2nd Game: 3rd User Answer 1st Question: Correct', async () => {
    //     const {userThreeToken, secondGameQuestions} = expect.getState()
    //     const correctAnswer = await gameTestManager.getCorrectAnswer(secondGameQuestions, 0)
    //     await gameTestManager.giveCorrectAnswer(userThreeToken, correctAnswer);
    // });
    //
    // it('2nd Game: 4th User Answer 1st Question: Incorrect', async () => {
    //     const {userFourToken} = expect.getState()
    //     const wrongAnswer = gameTestManager.WRONG_ANSWER
    //     await gameTestManager.giveAnswer(userFourToken, wrongAnswer);
    // });
    //
    // it('2nd Game: 4th User Answer 2nd Question', async () => {
    //     const {userFourToken, secondGameQuestions} = expect.getState()
    //     const correctAnswer = await gameTestManager.getCorrectAnswer(secondGameQuestions, 1)
    //     await gameTestManager.giveCorrectAnswer(userFourToken, correctAnswer);
    // });
    //
    // it('2nd Game: 1st Getting current game', async () => {
    //     const {userThreeToken, gameTwoId} = expect.getState()
    //     const ag = await gameTestManager.getActiveGameWithId(userThreeToken, gameTwoId);
    //     expect.setState({
    //         activeGame: ag
    //     })
    // });
    // it('2nd Game: 2nd Getting current game', async () => {
    //     const {userFourToken, gameTwoId} = expect.getState()
    //     await gameTestManager.getActiveGameWithId(userFourToken, gameTwoId);
    // });
})