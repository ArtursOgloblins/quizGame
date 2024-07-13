import { TrimDecorator } from '../../../../../infrastructure/decorators/trim.decorator';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class NewPasswordDataDTO {
  @TrimDecorator()
  @IsNotEmpty()
  @IsString()
  @Length(6, 20)
  newPassword: string;

  @IsNotEmpty()
  @IsString()
  @Length(1)
  recoveryCode: string;
}
