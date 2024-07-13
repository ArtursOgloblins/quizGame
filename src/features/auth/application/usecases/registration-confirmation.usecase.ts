import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import {UsersQueryRepository} from "../../../users/infrastructure/users.query-repostory";


export class UserRegistrationConfirmationCommand {
  constructor(public readonly code: string) {}
}

@CommandHandler(UserRegistrationConfirmationCommand)
export class UserRegistrationConfirmationUseCase
  implements ICommandHandler<UserRegistrationConfirmationCommand>
{
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: UserRegistrationConfirmationCommand) {
    const { code } = command;
    const user =
      await this.usersQueryRepository.getUserByConfirmationCode(code);
    if (!user) {
      throw new NotFoundException('User was not found');
    }

    const userId = user.id;

    return this.usersRepository.updateUserConfirmationStatus(userId);
  }
}
