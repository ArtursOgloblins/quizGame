import { IsNotEmpty, IsString } from 'class-validator';
import { TrimDecorator } from '../../../../../infrastructure/decorators/trim.decorator';
import { IsValidCode } from '../../../../../infrastructure/decorators/auth.user-code-validation.decorator';

export class ConfirmationCodeDto {
  @TrimDecorator()
  @IsNotEmpty()
  @IsString()
  @IsValidCode()
  code: string;
}
