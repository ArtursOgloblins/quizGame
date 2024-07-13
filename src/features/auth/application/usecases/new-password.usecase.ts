import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {UsersQueryRepository} from "../../../users/infrastructure/users.query-repostory";

export class UpdatePasswordCommand {
  constructor(
    public readonly newPassword: string,
    public readonly recoveryCode: string,
  ) {}
}

@CommandHandler(UpdatePasswordCommand)
export class UpdatePasswordUseCase
  implements ICommandHandler<UpdatePasswordCommand>
{
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: UpdatePasswordCommand) {
    const { newPassword, recoveryCode } = command;

    const passwordRecoveryDetails =
      await this.usersQueryRepository.getPasswordRecoveryDetails(recoveryCode);
    console.log('passwordRecoveryDetails', passwordRecoveryDetails);

    if (!passwordRecoveryDetails) {
      throw new BadRequestException(`RecoveryCode is incorrect`);
    }

    const {
      user: { id },
      expirationDate,
      isValid,
    } = passwordRecoveryDetails;
    const isExpired = new Date(expirationDate) > new Date();
    if (!isValid || isExpired) {
      throw new BadRequestException(`RecoveryCode is not valid or expired`);
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await this.usersRepository.updateUserPassword(id, newPasswordHash);
    await this.usersRepository.resetPasswordRecoveryDetails(recoveryCode);
  }
}
