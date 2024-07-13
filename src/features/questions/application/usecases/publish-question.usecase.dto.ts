import {QuestionsRepository} from "../../infrastructure/questions.reposetory";
import {QuestionsQueryRepository} from "../../infrastructure/questions.query-repository";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {NotFoundException} from "@nestjs/common";
import {PublishQuestionDTO} from "../../api/dto/input/publish-question.dto";

export class PublishQuestionCommand {
    constructor(
        public questionId: number,
        public published: PublishQuestionDTO
    ) {}
}

@CommandHandler(PublishQuestionCommand)
export class PublishQuestionUseCase
    implements ICommandHandler<PublishQuestionCommand>
{
    constructor(
        private questionsRepository: QuestionsRepository,
        private questionQueryRepository: QuestionsQueryRepository
    ) {}

    async execute(command: PublishQuestionCommand): Promise<void> {
        const { questionId, published } = command;
        const question = await this.questionQueryRepository.findQuestionById(questionId)
        if (!question) {
            throw new NotFoundException('Question not found')
        }

        await this.questionsRepository.publishQuestion(questionId, published)
    }
}
