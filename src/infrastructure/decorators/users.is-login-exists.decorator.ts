import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import {UsersQueryRepository} from "../../features/users/infrastructure/users.query-repostory";


export function IsLoginExist(
  property?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsUserLoginExistConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'IsLoginExist', async: true })
@Injectable()
export class IsUserLoginExistConstraint
  implements ValidatorConstraintInterface
{
  constructor(protected usersQueryRepository: UsersQueryRepository) {}

  async validate(login: string, _args: ValidationArguments) {
    const user = await this.usersQueryRepository.getUserByLogin(login);
    return !user;
  }

  defaultMessage(_args: ValidationArguments) {
    return 'This login is already exist';
  }
}
