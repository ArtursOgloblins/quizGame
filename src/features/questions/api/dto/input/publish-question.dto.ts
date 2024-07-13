import {IsBoolean} from "class-validator";

export class PublishQuestionDTO {
    @IsBoolean()
    published: boolean
}