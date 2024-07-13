import {
  isEmail,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import {UsersQueryRepository} from "../../features/users/infrastructure/users.query-repostory";


export function IsEmailValidForCodeResending(
  property?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsValidEmailForCodeResendingConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'IsEmailValidForCodeResending', async: true })
@Injectable()
export class IsValidEmailForCodeResendingConstraint
  implements ValidatorConstraintInterface
{
  constructor(protected usersQueryRepository: UsersQueryRepository) {}

  async validate(email: string, _args: ValidationArguments) {
    if (!isEmail(email)) {
      _args.constraints[0] = 'Email must be in email format';
      return false;
    }
    const user = await this.usersQueryRepository.getUserByEmail(email);
    if (!user) {
      _args.constraints[0] = 'User does not exist with this email';
      return false;
    } else if (user.confirmation.isConfirmed) {
      _args.constraints[0] = 'Email is already confirmed';
      return false;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return args.constraints[0];
  }
}
