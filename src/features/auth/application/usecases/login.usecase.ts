import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../../../settings/configuration';
import { RefreshTokenInputDto } from '../../api/dto/input/refresh-token-params.dto';
import { randomUUID } from 'crypto';

export class LoginUserCommand {
  constructor(
    public readonly req: any,
    public readonly res: Response,
  ) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    private configService: ConfigService<ConfigurationType, true>,
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  private get jwtSettings() {
    return this.configService.get('jwtSettings', { infer: true });
  }

  async execute(command: LoginUserCommand) {
    const { req, res } = command;
    const { id, email, login } = req.user;
    console.log(req.user);
    const { ip } = req;
    const deviceName = req.headers['user-agent']
      ? req.headers['user-agent']
      : 'unknown device';
    const deviceId = randomUUID();

    const accessTokenPayload = {
      userId: id,
      username: login,
      userEmail: email,
    };

    const refreshTokenPayload = {
      userId: id,
      username: login,
      userEmail: email,
      deviceId: deviceId,
    };

    const accessToken = this.jwtService.sign(accessTokenPayload, {
      secret: this.jwtSettings.jwtSecret,
      expiresIn: this.jwtSettings.accessTokenExpirationTime,
    });

    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: this.jwtSettings.jwtRefreshSecret,
      expiresIn: this.jwtSettings.refreshTokenExpirationTime,
    });

    const decoded = this.jwtService.decode(refreshToken);
    const expiringAt = decoded.exp;

    const refreshTokenModel: RefreshTokenInputDto = {
      expiringAt: expiringAt,
      deviceId: deviceId,
      deviceName: deviceName,
      userId: id,
      ip: ip,
    };

    await this.usersRepository.registerRefreshToken(refreshTokenModel);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      path: '/',
      maxAge: this.jwtSettings.refreshTokenCookieMaxAge,
      secure: true,
    });

    res.json({ accessToken });
  }
}
