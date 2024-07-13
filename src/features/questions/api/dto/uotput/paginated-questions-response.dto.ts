import {QuestionResponseDto} from "./question-response.dto";

export class PaginatedQuestionsResponseDto {
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    items: QuestionResponseDto[];
}