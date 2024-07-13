import { IsEmail, IsNotEmpty } from 'class-validator';
import { TrimDecorator } from '../../../../../infrastructure/decorators/trim.decorator';

export class PasswordRecoveryEmailDTO {
  @TrimDecorator()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
