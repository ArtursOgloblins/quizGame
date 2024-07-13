import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { TrimDecorator } from '../../../../../infrastructure/decorators/trim.decorator';
import { IsLoginExist } from '../../../../../infrastructure/decorators/users.is-login-exists.decorator';
import { IsEmailExist } from '../../../../../infrastructure/decorators/users.is-email-exists.decorator';

export class RegisterUserDTO {
    @TrimDecorator()
    @IsString()
    @Length(3, 10)
    @Matches(/^[a-zA-Z0-9_-]*$/)
    @IsLoginExist()
    login: string;

    @TrimDecorator()
    @IsString()
    @Length(6, 20)
    password: string;

    @IsEmail()
    @IsEmailExist()
    email: string;
}
