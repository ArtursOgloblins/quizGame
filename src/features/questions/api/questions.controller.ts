import {CommandBus, QueryBus} from "@nestjs/cqrs";
import {
    Body,
    Controller,
    Delete, Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Put, Query,
    UseGuards
} from "@nestjs/common";
import {BasicAuthGuard} from "../../../infrastructure/guards/basic-auth.guard";
import {CreateQuestionCommand} from "../application/usecases/add-question.usecase";
import {NewQuestionDto} from "./dto/input/new-question.dto";
import {QuestionResponseDto} from "./dto/uotput/question-response.dto";
import {DeleteQuestionCommand} from "../application/usecases/delete-question.usecase";
import {PublishQuestionDTO} from "./dto/input/publish-question.dto";
import {PublishQuestionCommand} from "../application/usecases/publish-question.usecase.dto";
import {UpdateQuestionCommand} from "../application/usecases/update-question.usecase";
import {QuestionsQueryParamsDTO} from "./dto/input/questions-query-params.dto";
import {PaginatedQuestionsResponseDto} from "./dto/uotput/paginated-questions-response.dto";
import {GetAllQuestions} from "../infrastructure/queries/get-all-questions.query";

@Controller('sa/quiz/questions/')
export class QuestionsController {
    constructor(
        private commandBus: CommandBus,
        private queryBus: QueryBus
    ) {}

    @UseGuards(BasicAuthGuard)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async addQuestion(@Body() newQuestionData: NewQuestionDto): Promise<QuestionResponseDto> {
        return this.commandBus.execute(new CreateQuestionCommand({...newQuestionData}))
    }

    @UseGuards(BasicAuthGuard)
    @Put(':questionId/publish')
    @HttpCode(HttpStatus.NO_CONTENT)
    async publishQuestion(
        @Param('questionId', ParseIntPipe) questionId: number,
        @Body() publishQuestion: PublishQuestionDTO) {
        return this.commandBus.execute(new PublishQuestionCommand(questionId, publishQuestion))
    }

    @UseGuards(BasicAuthGuard)
    @Put(':questionId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async updateQuestion(
        @Param('questionId', ParseIntPipe) questionId: number,
        @Body() updatedQuestionData: NewQuestionDto ) {
        return this.commandBus.execute(new UpdateQuestionCommand(questionId, {...updatedQuestionData}))
    }

    @UseGuards(BasicAuthGuard)
    @Get()
    @HttpCode(HttpStatus.OK)
    getAllQuestions(
        @Query() queryParams: QuestionsQueryParamsDTO,
    ): Promise<PaginatedQuestionsResponseDto> {
        return this.queryBus.execute(new GetAllQuestions(queryParams));
    }

    @UseGuards(BasicAuthGuard)
    @Delete(':questionId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteQuestionById(
        @Param('questionId', ParseIntPipe) questionId: number
    ): Promise<void> {
        return this.commandBus.execute(new DeleteQuestionCommand(questionId))
    }
}