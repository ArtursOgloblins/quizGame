import {NewQuestionDto} from "../../api/dto/input/new-question.dto";
import {INestApplication} from "@nestjs/common";
import * as request from "supertest";
import {UserQueryParamsDTO} from "../../../users/api/dto/input/user-queryParams.dto";
import {QuestionsQueryParamsDTO} from "../../api/dto/input/questions-query-params.dto";
import {QuestionsQueryRepository} from "../../infrastructure/questions.query-repository";
import {PublishQuestionDTO} from "../../api/dto/input/publish-question.dto";


interface Credentials {
    login: string;
    password: string;
}

export class QuestionsTestManager {

    constructor(
        protected readonly app: INestApplication,
    ) {}

    CREDENTIALS: Credentials = {
        login: 'admin',
        password: 'qwerty',
    };

    SAMPLE_QUESTIONS: NewQuestionDto[] = [
        {
            body: "Question 1: What is the capital of France? This question tests your knowledge of European capitals.",
            correctAnswers: ["paris"]
        },
        {
            body: "Question 2: What is 2 + 2? This is a basic arithmetic question to check your math skills.",
            correctAnswers: ["4", "four"]
        },
        {
            body: "Question 3: What color is the sky on a clear day? Think about a typical sunny day.",
            correctAnswers: ["blue"]
        },
        {
            body: "Question 4: How many continents are there? Hint: There are more than five.",
            correctAnswers: ["7", "seven"]
        },
        {
            body: "Question 5: What is the boiling point of water? Provide the answer in degrees Celsius.",
            correctAnswers: ["100", "hundred", "one hundred"]
        },
        {
            body: "Question 6: What is the largest planet in our solar system? It's not Earth.",
            correctAnswers: ["jupiter"]
        },
        {
            body: "Question 7: Who wrote 'Romeo and Juliet'? This famous playwright lived in the 16th century.",
            correctAnswers: ["shakespeare"]
        },
        {
            body: "Question 8: What is the speed of light? Please answer in meters per second.",
            correctAnswers: ["299792458"]
        },
        {
            body: "Question 9: Who is known as the father of computers? He designed the first mechanical computer.",
            correctAnswers: ["babbage"]
        },
        {
            body: "Question 10: What is the main ingredient in bread? It's a common kitchen ingredient.",
            correctAnswers: ["flour"]
        }
    ];

    UPDATE_QUESTION_DATA: NewQuestionDto =
        {
            body: "Updated question: What is 3 + 3? This is a basic arithmetic question to check your math skills.",
            correctAnswers: ["6", "six"]
        }

    QUESTIONS_QUERY_PARAMS: QuestionsQueryParamsDTO = {
        sortBy: 'createdAt',
        sortDirection: 'desc',
        pageNumber: 1,
        pageSize: 10,
        bodySearchTerm: '',
        publishedStatus: ''
    };

    PUBLISH_STATUS: PublishQuestionDTO = {
        published: true
    }

    async addQuestion(questions: NewQuestionDto) {
        const response = await request(this.app.getHttpServer())
            .post('/sa/quiz/questions/')
            .auth(this.CREDENTIALS.login, this.CREDENTIALS.password)
            .send(questions);

        if (response.status !== 201) {
            console.error(response.body);
        }
        expect(response.status).toBe(201);

        return response.body.id;
    }

    async addMultipleQuestions(questions: NewQuestionDto[]) {
        const addQuestions = questions.map(question => this.addQuestion(question))
        await Promise.all(addQuestions)
    }

    async getAllQuestions(queryParams: QuestionsQueryParamsDTO) {
        const response = await request(this.app.getHttpServer())
            .get('/sa/quiz/questions/')
            .query(queryParams)
            .auth(this.CREDENTIALS.login, this.CREDENTIALS.password);

        expect(response.status).toBe(200);

        expect(response.body).toHaveProperty('pagesCount')
        expect(response.body).toHaveProperty('page');
        expect(response.body).toHaveProperty('pageSize');
        expect(response.body).toHaveProperty('totalCount');
        expect(response.body).toHaveProperty('items');
        expect(Array.isArray(response.body.items)).toBe(true);

        return response;
    }

    async publishQuestion(questionId: string, publishStatus: PublishQuestionDTO) {
        const response = await request(this.app.getHttpServer())
            .put(`/sa/quiz/questions/${questionId}/publish`)
            .auth(this.CREDENTIALS.login, this.CREDENTIALS.password)
            .send(publishStatus)

        if (response.status !== 204) {
            console.error(response.body);
        }
        expect(response.status).toBe(204);

        return response;
    }

    async publishAllQuestions(questionsIds: [], publishStatus: PublishQuestionDTO) {
        const addQuestions = questionsIds.map(questionId => this.publishQuestion(questionId, publishStatus))
        await Promise.all(addQuestions)
    }

    async updateQuestion(questionId: string, updatedQuestionData: NewQuestionDto) {
        const response = await request(this.app.getHttpServer())
            .put(`/sa/quiz/questions/${questionId}`)
            .auth(this.CREDENTIALS.login, this.CREDENTIALS.password)
            .send(updatedQuestionData)

        if (response.status !== 204) {
            console.error(response.body);
        }

        expect(response.status).toBe(204)
    }

    async deleteQuestion(questionId: string) {
        const response = await request(this.app.getHttpServer())
            .delete(`/sa/quiz/questions/${questionId}`)
            .auth(this.CREDENTIALS.login, this.CREDENTIALS.password)

        if (response.status !== 204) {
            console.error(response.body);
        }

        expect(response.status).toBe(204)
    }
}