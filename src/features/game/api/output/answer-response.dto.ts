import {AnswerStatus} from "./game-response.dto";
import {Answers} from "../../domain/answers.entity";

export class AnswerResponseDto {
    id: string
    questionId: string
    answerStatus: AnswerStatus
    addedAt: string

    constructor(answer: Answers) {
        this.id = answer.id.toString()
        this.questionId = answer.gameQuestion.question.id.toString()
        this.answerStatus = answer.status as AnswerStatus
        this.addedAt = answer.createdAt.toISOString()
    }
}