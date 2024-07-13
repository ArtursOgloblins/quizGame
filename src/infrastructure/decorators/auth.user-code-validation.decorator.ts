import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import {UsersQueryRepository} from "../../features/users/infrastructure/users.query-repostory";

export function IsValidCode(
  property?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsValidConfirmationCodeConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'IsValidCode', async: true })
@Injectable()
export class IsValidConfirmationCodeConstraint
  implements ValidatorConstraintInterface
{
  constructor(protected usersQueryRepository: UsersQueryRepository) {}

  async validate(code: string, args: ValidationArguments) {
    const result = await this.usersQueryRepository.validateCode(code);
    return !!result;
  }

  defaultMessage(_args: ValidationArguments) {
    return 'Incorrect code or expired or already confirmed';
  }
}
