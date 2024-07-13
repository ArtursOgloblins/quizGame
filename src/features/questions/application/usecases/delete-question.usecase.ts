import {QuestionsRepository} from "../../infrastructure/questions.reposetory";
import {QuestionsQueryRepository} from "../../infrastructure/questions.query-repository";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {NotFoundException} from "@nestjs/common";

export class DeleteQuestionCommand {
    constructor(
        public questionId: number,
    ) {}
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUseCase
    implements ICommandHandler<DeleteQuestionCommand>
{
    constructor(
private questionsRepository: QuestionsRepository,
private questionQueryRepository: QuestionsQueryRepository
    ) {}

    async execute(command: DeleteQuestionCommand): Promise<void> {
        const { questionId } = command;
        const question = await this.questionQueryRepository.findQuestionById(questionId)
        if (!question) {
            throw new NotFoundException('Question not found')
        }

        await this.questionsRepository.deleteQuestion(questionId)
    }
}
