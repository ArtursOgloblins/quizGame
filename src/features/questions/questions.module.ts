import {Questions} from "./domain/qustions.entity";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Module} from "@nestjs/common";
import {CqrsModule} from "@nestjs/cqrs";
import {QuestionsController} from "./api/questions.controller";
import {QuestionsRepository} from "./infrastructure/questions.reposetory";
import {QuestionsQueryRepository} from "./infrastructure/questions.query-repository";
import {CreateQuestionUseCase} from "./application/usecases/add-question.usecase";
import {DeleteQuestionUseCase} from "./application/usecases/delete-question.usecase";
import {PublishQuestionUseCase} from "./application/usecases/publish-question.usecase.dto";
import {UpdateQuestionUseCase} from "./application/usecases/update-question.usecase";
import {FindBlogsQuery} from "./infrastructure/queries/get-all-questions.query";

@Module({
    imports: [
        CqrsModule,
        TypeOrmModule.forFeature([Questions]),
    ],
    controllers: [ QuestionsController],
    providers: [
        QuestionsRepository,
        QuestionsQueryRepository,
        CreateQuestionUseCase,
        DeleteQuestionUseCase,
        PublishQuestionUseCase,
        UpdateQuestionUseCase,
        FindBlogsQuery
    ],
    exports: [QuestionsRepository, QuestionsQueryRepository, TypeOrmModule],
})
export class QuestionsModule {}