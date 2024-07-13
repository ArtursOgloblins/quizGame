import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { add } from 'date-fns';
import { NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../../../src/features/users/infrastructure/users.repository';
import { UsersQueryRepository } from '../../../src/features/users/infrastructure/users.query-repository';
import { UserResponseDTO } from '../../../src/features/users/api/dto/output/user-response.dto';

interface RegisterUserInputData {
  login: string;
  email: string;
  password: string;
  path: string;
}

export class RegisterUserCommandMock {
  constructor(public inputData: RegisterUserInputData) {}
}

@CommandHandler(RegisterUserCommandMock)
export class RegisterUserUseCase
  implements ICommandHandler<RegisterUserCommandMock>
{
  constructor(
    private usersRepository: UsersRepository,
    private usersQueryRepository: UsersQueryRepository,
    private eventBus: EventBus,
  ) {}

  async execute(command: RegisterUserCommandMock): Promise<UserResponseDTO> {
    const newUserInputData = await this.prepareUserData(command.inputData);

    await this.usersRepository.registerUser(newUserInputData);

    const newUser = await this.usersQueryRepository.getUserByEmail(
      newUserInputData.email,
    );

    if (!newUser) {
      throw new NotFoundException('User registration failed');
    }
    return new UserResponseDTO(newUser);
  }

  private async prepareUserData(inputData: RegisterUserInputData) {
    const { login, email, password, path } = inputData;
    const passwordHash = await bcrypt.hash(password, 10);
    const isConfirmed = path === '/sa/users';
    const confirmationCode = randomUUID();

    return {
      email,
      login,
      passwordHash,
      isConfirmed,
      confirmationCode,
      expirationDate: add(new Date(), { hours: 1, minutes: 3 }),
    };
  }
}
