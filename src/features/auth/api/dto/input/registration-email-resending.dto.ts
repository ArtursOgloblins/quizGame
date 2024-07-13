import { IsNotEmpty } from 'class-validator';
import { TrimDecorator } from '../../../../../infrastructure/decorators/trim.decorator';
import { IsEmailValidForCodeResending } from '../../../../../infrastructure/decorators/auth.is-email-valid.decorator';

export class RegistrationEmailResendingDTO {
  @TrimDecorator()
  @IsNotEmpty()
  @IsEmailValidForCodeResending()
  email: string;
}
