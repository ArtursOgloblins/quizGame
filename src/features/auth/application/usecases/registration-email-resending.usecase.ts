import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { randomUUID } from 'crypto';
import { UserRegistrationCodeUpdatedEvent } from '../events/registration-code-updated.event';
import {UsersQueryRepository} from "../../../users/infrastructure/users.query-repostory";

export class UserRegistrationEmailResendingCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(UserRegistrationEmailResendingCommand)
export class RegistrationEmailResendingUseCase
  implements ICommandHandler<UserRegistrationEmailResendingCommand>
{
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private readonly usersRepository: UsersRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UserRegistrationEmailResendingCommand) {
    const { email } = command;
    const user = await this.usersQueryRepository.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userId = user.id;
    const newCode = randomUUID();

    await this.usersRepository.updateUserConfirmationCode(userId, newCode);

    this.eventBus.publish(new UserRegistrationCodeUpdatedEvent(newCode, email));
  }
}
