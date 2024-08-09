import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Questions} from "../domain/qustions.entity";
import {Repository} from "typeorm";
import {NewQuestionInputDataDto} from "../api/dto/input/new-question-inputData.dto";
import {PublishQuestionDTO} from "../api/dto/input/publish-question.dto";
import {NewQuestionDto} from "../api/dto/input/new-question.dto";

@Injectable()
export class QuestionsRepository {
    constructor(
        @InjectRepository(Questions)
        private readonly questionsRepository: Repository<Questions>
    ) {}

    public async addQuestion(inputData: NewQuestionInputDataDto): Promise<Questions> {
        try {
            const question = this.questionsRepository.create(inputData)
            question.updatedAt = null;
            return await this.questionsRepository.save(question)
        } catch (error) {
            console.log('Error in addQuestion', error);
            throw error;
        }
    }

    public async publishQuestion(questionId: number, published: PublishQuestionDTO) {
        try {
            await this.questionsRepository
                .createQueryBuilder()
                .update(Questions)
                .set({
                    published: published.published,
                })
                .where('id = :questionId', { questionId })
                .execute();
        } catch (error) {
            console.log('Error in publishQuestion', error);
            throw error;
        }
    }

    public async updateQuestion(questionId: number, questionData: NewQuestionDto ) {
        try {
            await this.questionsRepository
                .createQueryBuilder()
                .update(Questions)
                .set({
                    body: questionData.body,
                    correctAnswers: questionData.correctAnswers
                })
                .where('id = :questionId', { questionId })
                .execute();
        } catch (error) {
            console.log('Error in publishQuestion', error);
            throw error;
        }
    }


    public async deleteQuestion(questionId: number) {
        try{
            return await this.questionsRepository
                .createQueryBuilder()
                .softDelete()
                .where('id = :questionId', { questionId })
                .execute();
        } catch (error) {
            console.log('Error in deleteQuestion', error);
            throw error;
        }
    }
}