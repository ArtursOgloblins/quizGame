import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UserResponseDTO } from '../../api/dto/output/user-response.dto';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { add } from 'date-fns';
import { UsersRepository } from '../../infrastructure/users.repository';
import { NotFoundException } from '@nestjs/common';
import {UsersQueryRepository} from "../../infrastructure/users.query-repostory";
import {UserRegisteredEvent} from "../events/user-registered.event";

interface RegisterUserInputData {
  login: string;
  email: string;
  password: string;
  path: string;
}

export class RegisterUserCommand {
  constructor(public inputData: RegisterUserInputData) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase
  implements ICommandHandler<RegisterUserCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private usersQueryRepository: UsersQueryRepository,
    private eventBus: EventBus,
  ) {}

  async execute(command: RegisterUserCommand): Promise<UserResponseDTO> {
    const newUserInputData = await this.prepareUserData(command.inputData);

    await this.usersRepository.registerUser(newUserInputData);

    const newUser = await this.usersQueryRepository.getUserByEmail(
      newUserInputData.email,
    );

    if (!newUser) {
      throw new NotFoundException('User registration failed');
    }

    this.eventBus.publish(
      //TODO: Check why email is not sent
      new UserRegisteredEvent(
        newUserInputData.confirmationCode,
        newUserInputData.email,
      ),
    );
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
