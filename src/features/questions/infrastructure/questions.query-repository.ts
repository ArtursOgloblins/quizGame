import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Questions} from "../domain/qustions.entity";
import {FindOperator, ILike, Repository} from "typeorm";
import {QuestionsQueryParamsDTO} from "../api/dto/input/questions-query-params.dto";
import {PaginatedQuestionsResponseDto} from "../api/dto/uotput/paginated-questions-response.dto";
import {QuestionResponseDto} from "../api/dto/uotput/question-response.dto";
import {gameRandomQuestions} from "../../game/api/output/game-random-question.dto";

interface WhereConditions {
    body?: FindOperator<string>;
    published?: boolean;
}

@Injectable()
export class QuestionsQueryRepository {
    constructor(
        @InjectRepository(Questions)
        private readonly questionsQueryRepository: Repository<Questions>
    ) {}


    public async getAllQuestions(
        params: QuestionsQueryParamsDTO,
    ): Promise<PaginatedQuestionsResponseDto> | null {
        try {
            const sortBy = params.sortBy || 'createdAt';
            const sortDirection = params.sortDirection || 'desc';
            const pageNumber = params.pageNumber || 1;
            const pageSize = params.pageSize || 10;
            const bodySearchTerm = params.bodySearchTerm || '';
            const publishedStatus = params.publishedStatus !== undefined ? Boolean(params.publishedStatus) : null;
            const validSortColumns = {
                createdAt: 'createdAt',
            };

            const validSortDirections = ['asc', 'desc'];
            const skipAmount = (pageNumber - 1) * pageSize;

            const sortByColumn = validSortColumns[sortBy] || 'createdAt';
            const sortOrder = validSortDirections.includes(sortDirection)
                ? sortDirection
                : 'desc';

            const whereConditions: WhereConditions = {};

            if (bodySearchTerm) {
                whereConditions.body = ILike(`%${bodySearchTerm}%`);
            }

            if (publishedStatus !== null) {
                whereConditions.published = publishedStatus;
            }

            const [questions, totalCount] = await this.questionsQueryRepository.findAndCount({
                where: whereConditions,
                order: { [sortByColumn]: sortOrder.toUpperCase() as 'ASC' | 'DESC' },
                take: pageSize,
                skip: skipAmount,
            });

            const mappedQuestions = questions.map((question) => new QuestionResponseDto(question));

            return {
                pagesCount: Math.ceil(totalCount / pageSize),
                page: +pageNumber,
                pageSize: +pageSize,
                totalCount: totalCount,
                items: mappedQuestions,
            };
        } catch (error) {
            console.log('Error in findBlogs', error);
            return null;
        }
    }

    public async findQuestionById(questionId: number): Promise<Questions> {
        try {
            const question = await this.questionsQueryRepository.findOne({ where: { id: questionId } })
            if (!question) {
                return null
            }
            return question
        } catch (error) {
            console.log('Error in findQuestionById', error);
            throw error;
        }
    }

    public async getRandomQuestions(questionsNumber: number): Promise<gameRandomQuestions[]> {
        try {
            const res = await this.questionsQueryRepository
                .createQueryBuilder('q')
                .orderBy("RANDOM()")
                .limit(questionsNumber)
                .getMany()

            return res.map(question => ({
                id: question.id,
                body: question.body
            }))

        } catch (error) {
            console.log('Error in getRandomQuestions', error);
            throw error;
        }
    }
}