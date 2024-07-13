import {NewQuestionDto} from "../../api/dto/input/new-question.dto";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {QuestionsRepository} from "../../infrastructure/questions.reposetory";
import {QuestionResponseDto} from "../../api/dto/uotput/question-response.dto";
import {NewQuestionInputDataDto} from "../../api/dto/input/new-question-inputData.dto";

export class CreateQuestionCommand {
    constructor(public inputData: NewQuestionDto)  {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase implements ICommandHandler<CreateQuestionCommand> {
    constructor(private questionsRepository: QuestionsRepository) {
    }

    async execute(command: CreateQuestionCommand): Promise<QuestionResponseDto> {
        const published = false

        const newQuestionModel: NewQuestionInputDataDto = {
            ...command.inputData,
            published,
        }
        const savedQuestion = await this.questionsRepository.addQuestion(newQuestionModel)

        return new QuestionResponseDto(savedQuestion)
    }
}