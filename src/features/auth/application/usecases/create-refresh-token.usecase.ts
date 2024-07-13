import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { ConfigurationType } from '../../../../settings/configuration';
import { UpdateRefreshTokenInputData } from '../../api/dto/input/update-refresh-token.dto';
import {UsersQueryRepository} from "../../../users/infrastructure/users.query-repostory";

export class CreateRefreshTokenCommand {
  constructor(
    public readonly req: any,
    public readonly res: Response,
  ) {}
}

@CommandHandler(CreateRefreshTokenCommand)
export class CreateRefreshTokenUseCase
  implements ICommandHandler<CreateRefreshTokenCommand>
{
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private configService: ConfigService<ConfigurationType, true>,
  ) {}

  private get jwtSettings() {
    return this.configService.get('jwtSettings', { infer: true });
  }

  async execute(command: CreateRefreshTokenCommand) {
    const { req, res } = command;
    const oldRefreshToken = req.cookies.refreshToken;

    const decodedRefreshToken = this.jwtService.decode(oldRefreshToken);
    console.log('decodedRefreshToken', decodedRefreshToken);

    const { exp, username, userEmail, deviceId, userId } = decodedRefreshToken;
    const expiresAt = exp;

    const validationResult =
      await this.usersQueryRepository.validateRefreshToken(
        expiresAt,
        deviceId,
        userId,
      );
    console.log('validationResult', validationResult);
    if (!validationResult) {
      throw new UnauthorizedException();
    }

    const newAccessTokenPayload = {
      userId: userId,
      username: username,
      userEmail: userEmail,
    };

    const newRefreshTokenPayload = {
      userId: userId,
      username: username,
      userEmail: userEmail,
      deviceId: deviceId,
    };

    const accessToken = this.jwtService.sign(newAccessTokenPayload, {
      secret: this.jwtSettings.jwtSecret,
      expiresIn: this.jwtSettings.accessTokenExpirationTime,
    });

    const newRefreshToken = this.jwtService.sign(newRefreshTokenPayload, {
      secret: this.jwtSettings.jwtRefreshSecret,
      expiresIn: this.jwtSettings.refreshTokenExpirationTime,
    });

    const decoded = this.jwtService.decode(newRefreshToken);
    const createdDate = new Date(decoded.iat * 1000);
    const expiringAt = decoded.exp;

    const updateRefreshTokenInputData: UpdateRefreshTokenInputData = {
      createdDate,
      expiringAt,
      deviceId,
      userId,
    };

    console.log('updateRefreshTokenInputData', updateRefreshTokenInputData);

    await this.usersRepository.updateRefreshTokenData(
      updateRefreshTokenInputData,
    );

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      path: '/',
      maxAge: this.jwtSettings.refreshTokenCookieMaxAge,
      secure: true,
    });

    res.json({ accessToken });
  }
}
