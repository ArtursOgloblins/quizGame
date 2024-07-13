import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import {UsersQueryRepository} from "../../features/users/infrastructure/users.query-repostory";

export function IsEmailExist(
  property?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsUserEmailExistConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'IsEmailExist', async: true })
@Injectable()
export class IsUserEmailExistConstraint
  implements ValidatorConstraintInterface
{
  constructor(protected usersQueryRepository: UsersQueryRepository) {}

  async validate(email: string, _args: ValidationArguments) {
    const user = await this.usersQueryRepository.getUserByEmail(email);
    return !user;
  }

  defaultMessage(_args: ValidationArguments) {
    return 'This email is already exist';
  }
}
