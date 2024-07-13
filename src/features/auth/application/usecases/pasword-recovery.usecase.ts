import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { randomUUID } from 'crypto';
import { EmailService } from '../../../../base/email/email.service';
import { NotFoundException } from '@nestjs/common';
import {UsersQueryRepository} from "../../../users/infrastructure/users.query-repostory";

export class UserPasswordRecoveryCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(UserPasswordRecoveryCommand)
export class UserPasswordRecoveryUseCase
  implements ICommandHandler<UserPasswordRecoveryCommand>
{
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private readonly usersRepository: UsersRepository,
    private emailService: EmailService,
  ) {}

  async execute(command: UserPasswordRecoveryCommand) {
    const { email } = command;

    const user = await this.usersQueryRepository.getUserByEmail(email);
    console.log('userForRecoveryData', user);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordRecoveryData =
      await this.usersQueryRepository.getUserDataForPasswordRecovery(user.id);
    console.log('passwordRecoveryData', passwordRecoveryData);

    const passwordRecoveryInputData = {
      userId: user.id,
      confirmationCode: randomUUID(),
      expirationDate: new Date(),
    };

    if (!passwordRecoveryData) {
      await this.usersRepository.registerPasswordRecovery(
        passwordRecoveryInputData,
      );
    } else {
      await this.usersRepository.updatePasswordRecovery(
        passwordRecoveryInputData,
      );
    }

    await this.emailService.sendPasswordRecoveryCode(
      passwordRecoveryInputData.confirmationCode,
      email,
    );

    return { confirmationCode: passwordRecoveryInputData.confirmationCode };
  }
}
