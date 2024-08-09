import {TrimDecorator} from "../../../../../infrastructure/decorators/trim.decorator";
import {ArrayNotEmpty, IsArray, IsString, Length} from "class-validator";

export class NewQuestionDto {
    @TrimDecorator()
    @IsString()
    @Length(10, 500)
    body: string

    @IsArray()
    @ArrayNotEmpty({message: 'Correct answers should not be empty'})
    @IsString({each: true, message: 'Each correct answer must be a string'})
    correctAnswers: string[]
}