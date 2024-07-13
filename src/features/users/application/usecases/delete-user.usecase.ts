import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { NotFoundException } from '@nestjs/common';
import {UsersQueryRepository} from "../../infrastructure/users.query-repostory";

export class DeleteUseByIdCommand {
  constructor(public readonly userId: number) {}
}

@CommandHandler(DeleteUseByIdCommand)
export class DeleteUserByIdUseCase
  implements ICommandHandler<DeleteUseByIdCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(command: DeleteUseByIdCommand): Promise<void> {
    const { userId } = command;
    const user = await this.usersQueryRepository.getUserById(userId);
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    await this.usersRepository.deleteUserById(userId);
  }
}
