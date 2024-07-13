import {QuestionsRepository} from "../../infrastructure/questions.reposetory";
import {QuestionsQueryRepository} from "../../infrastructure/questions.query-repository";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {NotFoundException} from "@nestjs/common";
import {NewQuestionDto} from "../../api/dto/input/new-question.dto";

export class UpdateQuestionCommand {
    constructor(
        public questionId: number,
        public updatedQuestionData: NewQuestionDto
    ) {}
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCase
    implements ICommandHandler<UpdateQuestionCommand>
{
    constructor(
        private questionsRepository: QuestionsRepository,
        private questionQueryRepository: QuestionsQueryRepository
    ) {}

    async execute(command: UpdateQuestionCommand): Promise<void> {
        const { questionId, updatedQuestionData } = command;
        const question = await this.questionQueryRepository.findQuestionById(questionId)
        if (!question) {
            throw new NotFoundException('Question not found')
        }

        await this.questionsRepository.updateQuestion(questionId, updatedQuestionData)
    }
}