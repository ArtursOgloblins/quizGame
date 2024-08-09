import {TrimDecorator} from "../../../../infrastructure/decorators/trim.decorator";
import {IsNotEmpty, IsString} from "class-validator";

export class AnswerDto {
    @TrimDecorator()
    @IsString()
    @IsNotEmpty()
    answer: string
}