import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import {UsersQueryRepository} from "../../../users/infrastructure/users.query-repostory";


export class LogoutUserCommand {
  constructor(
    public readonly req: any,
    public readonly res: Response,
  ) {}
}

@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCase implements ICommandHandler<LogoutUserCommand> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private jwtService: JwtService,
  ) {}

  async execute(command: LogoutUserCommand) {
    const { req, res } = command;
    const refreshToken = req.cookies.refreshToken;

    const decodedRefreshToken = await this.jwtService.decode(refreshToken);

    const { exp, deviceId, userId } = decodedRefreshToken;
    const expiringAt = exp;
    console.log('decodedRefreshToken', decodedRefreshToken);

    const validationResult =
      await this.usersQueryRepository.validateRefreshToken(
        expiringAt,
        deviceId,
        userId,
      );

    if (!validationResult) {
      throw new UnauthorizedException();
    }

    const removedLoginDataFromBd = await this.usersRepository.logoutUser(
      expiringAt,
      deviceId,
      userId,
    );

    if (!removedLoginDataFromBd) {
      throw new UnauthorizedException();
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
    });

    return res.json({ message: 'User logged out.' });
  }
}
