import {Questions} from "../../../domain/qustions.entity";

export class QuestionResponseDto {
    id: string
    body: string
    correctAnswers: string[]
    published: boolean
    createdAt: string
    updatedAt: string

    constructor(question: Questions) {
        this.id = question.id.toString()
        this.body = question.body;
        this.correctAnswers = question.correctAnswers
        this.published = question.published
        this.createdAt = question.createdAt.toISOString()
        this.updatedAt = question.updatedAt.toISOString()
    }
}