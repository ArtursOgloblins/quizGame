import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {QuestionsQueryParamsDTO} from "../../api/dto/input/questions-query-params.dto";
import {QuestionsQueryRepository} from "../questions.query-repository";
import {PaginatedQuestionsResponseDto} from "../../api/dto/uotput/paginated-questions-response.dto";


export class GetAllQuestions {
    constructor(public readonly params: QuestionsQueryParamsDTO) {}
}

@QueryHandler(GetAllQuestions)
export class FindBlogsQuery implements IQueryHandler<GetAllQuestions> {
    constructor(private questionsQueryRepository: QuestionsQueryRepository) {}

    async execute(query: GetAllQuestions): Promise<PaginatedQuestionsResponseDto> {
        const { params } = query;

        return await this.questionsQueryRepository.getAllQuestions(params);
    }
}