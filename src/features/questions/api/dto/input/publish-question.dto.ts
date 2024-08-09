import {IsBoolean, IsNotEmpty} from "class-validator";

export class PublishQuestionDTO {
    @IsNotEmpty()
    @IsBoolean()
    published: any;
}