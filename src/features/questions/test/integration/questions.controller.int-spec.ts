import {Test, TestingModule} from "@nestjs/testing";
import {AppModule} from "../../../../app.module";
import {applyAppSettings} from "../../../../settings/applay-app-settings";
import request from "supertest";
import {INestApplication} from "@nestjs/common";
import {DataSource} from "typeorm";
import {getDataSourceOptions} from "../../../../../typeorm.config";
import {UsersSaTestManager} from "../../../users/test/managers/usersSaTestManager";
import {AuthTestManager} from "../../../users/test/managers/authTestManager";
import {RegisterUserCommand} from "../../../users/application/usecases/register-user.usecase";
import {RegisterUserCommandMock} from "../../../users/test/mock/register-user.usecase.mock";
import {QuestionsTestManager} from "../managers/questionsTestmanager";


describe('questions  int', () => {
    let app: INestApplication;
    let usersSaManager: UsersSaTestManager;
    let authTestManager: AuthTestManager;
    let questionsTestManager: QuestionsTestManager;
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

        questionsTestManager = new QuestionsTestManager(app);
    });

    afterAll(async () => {
        await dataSource.destroy();
        await app.close();
    });

    it('add 10 questions', async () => {
        await questionsTestManager.addMultipleQuestions(questionsTestManager.SAMPLE_QUESTIONS);
    });

    it('get all questions', async () => {
        const queryParams = questionsTestManager.QUESTIONS_QUERY_PARAMS
        const response = await questionsTestManager.getAllQuestions(queryParams)
        const questionIds: [] = response.body.items.map(i => i.id)
        expect.setState({
            questionIds: questionIds
        });
    });

    it('publish questions', async () => {
        const {questionIds} = expect.getState()
        const publishStatus = questionsTestManager.PUBLISH_STATUS
        await questionsTestManager.publishAllQuestions(questionIds)
    });

    it('update 1 question', async () => {
        const {questionIds} = expect.getState()
        const questionId = questionIds[0];
        const updateQuestionData = questionsTestManager.UPDATE_QUESTION_DATA
        await questionsTestManager.updateQuestion(questionId, updateQuestionData)
    });

    it('delete 1 question', async () => {
        const {questionIds} = expect.getState()
        const questionId = questionIds[1];
        await questionsTestManager.deleteQuestion(questionId)
    });

})