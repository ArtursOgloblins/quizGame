import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CommandBus } from '@nestjs/cqrs';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import {RegisterUserDTO} from "../../users/api/dto/input/register-user.dto";
import {UserResponseDTO} from "../../users/api/dto/output/user-response.dto";
import {RegisterUserCommand} from "../../users/application/usecases/register-user.usecase";
import {ConfirmationCodeDto} from "./dto/input/confirmation-code.dto";
import {RegistrationEmailResendingDTO} from "./dto/input/registration-email-resending.dto";
import {PasswordRecoveryEmailDTO} from "./dto/input/password-recovery-email.dto";
import {NewPasswordDataDTO} from "./dto/input/new-password.dto";
import {RefreshTokenGuard} from "../../../infrastructure/guards/refresh-token.guard";
import {AuthGuard} from "@nestjs/passport";
import {LogoutUserCommand} from "../application/usecases/logout-user";
import {AccessTokenPayloadDTO} from "./dto/input/access-token-params.dto";
import {GetUser} from "../../../infrastructure/decorators/get-user.decorator";
import {CurrentUserDto} from "./dto/output/current-user.dto";
import {LoginUserCommand} from "../application/usecases/login.usecase";
import {CreateRefreshTokenCommand} from "../application/usecases/create-refresh-token.usecase";
import {UpdatePasswordCommand} from "../application/usecases/new-password.usecase";
import {UserPasswordRecoveryCommand} from "../application/usecases/pasword-recovery.usecase";
import {UserRegistrationEmailResendingCommand} from "../application/usecases/registration-email-resending.usecase";
import {UserRegistrationConfirmationCommand} from "../application/usecases/registration-confirmation.usecase";
import {RateLimitSettings} from "../../../base/types/types";


const rateLimit: RateLimitSettings = {
    limit: 10,
    ttl: 10000,
};

@Controller('auth')
export class AuthController {
    constructor(private readonly commandBus: CommandBus) {}

    @Post('registration')
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: rateLimit })
    @HttpCode(HttpStatus.NO_CONTENT)
    async registerUser(
        @Body() registerUserDto: RegisterUserDTO,
        @Req() request: Request,
    ): Promise<UserResponseDTO> {
        const { login, email, password } = registerUserDto;
        const path = request.path;
        const registerUserInputData = {
            login,
            email,
            password,
            path,
        };
        return this.commandBus.execute(
            new RegisterUserCommand(registerUserInputData),
        );
    }

    @Post('registration-confirmation')
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: rateLimit })
    @HttpCode(HttpStatus.NO_CONTENT)
    async confirmRegistration(@Body() confirmationCode: ConfirmationCodeDto) {
        const { code } = confirmationCode;
        return this.commandBus.execute(
            new UserRegistrationConfirmationCommand(code),
        );
    }

    @Post('registration-email-resending')
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: rateLimit })
    @HttpCode(HttpStatus.NO_CONTENT)
    async resendConfirmationCode(
        @Body() userEmail: RegistrationEmailResendingDTO,
    ) {
        const { email } = userEmail;
        return this.commandBus.execute(
            new UserRegistrationEmailResendingCommand(email),
        );
    }

    @Post('password-recovery')
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: rateLimit })
    @HttpCode(HttpStatus.NO_CONTENT)
    async passwordRecovery(@Body() userEmail: PasswordRecoveryEmailDTO) {
        const { email } = userEmail;
        return this.commandBus.execute(new UserPasswordRecoveryCommand(email));
    }

    @Post('new-password')
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: rateLimit })
    @HttpCode(HttpStatus.NO_CONTENT)
    async updatePassword(@Body() newPasswordData: NewPasswordDataDTO) {
        const { newPassword, recoveryCode } = newPasswordData;
        return this.commandBus.execute(
            new UpdatePasswordCommand(newPassword, recoveryCode),
        );
    }

    @UseGuards(RefreshTokenGuard)
    @Post('refresh-token')
    @HttpCode(HttpStatus.OK)
    async createRefreshToken(@Req() req: Request, @Res() res) {
        return this.commandBus.execute(new CreateRefreshTokenCommand(req, res));
    }

    @UseGuards(ThrottlerGuard, AuthGuard('local'))
    @Post('login')
    @Throttle({ default: rateLimit })
    @HttpCode(HttpStatus.OK)
    async login(@Req() req: Request, @Res() res: Response) {
        await this.commandBus.execute(new LoginUserCommand(req, res));
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    @HttpCode(HttpStatus.OK)
    async getCurrentUser(@GetUser() user: AccessTokenPayloadDTO) {
        const currentUser: CurrentUserDto = {
            email: user.userEmail,
            login: user.username,
            userId: user.userId.toString(),
        };
        return currentUser;
    }

    @UseGuards(RefreshTokenGuard)
    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    async logoutUser(@Req() req: Request, @Res() res) {
        return await this.commandBus.execute(new LogoutUserCommand(req, res));
    }
}
