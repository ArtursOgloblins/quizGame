import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthService } from './application/auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { EmailAdapter } from '../../base/email/email.adapter';
import { EmailService } from '../../base/email/email.service';
import { UserRegistrationConfirmationUseCase } from './application/usecases/registration-confirmation.usecase';
import { UserPasswordRecoveryUseCase } from './application/usecases/pasword-recovery.usecase';
import { UpdatePasswordUseCase } from './application/usecases/new-password.usecase';
import { LoginUserUseCase } from './application/usecases/login.usecase';
import { CreateRefreshTokenUseCase } from './application/usecases/create-refresh-token.usecase';
import { LogoutUserUseCase } from './application/usecases/logout-user';
import { RegistrationEmailResendingUseCase } from './application/usecases/registration-email-resending.usecase';
import {AuthController} from "./api/auth.controller";
import {RegisterUserUseCase} from "../users/application/usecases/register-user.usecase";
import {
    SendUpdatedRegistrationCodeByEmail
} from "./application/events/handlers/registration-code-updated.event-handler";

@Module({
    imports: [
        CqrsModule,
        UsersModule,
        //LikesModule,
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '60s' },
        }),
        ThrottlerModule.forRoot([
            {
                ttl: 10000,
                limit: 5,
            },
        ]),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        LocalStrategy,
        JwtStrategy,
        EmailAdapter,
        EmailService,
        RegisterUserUseCase,
        UserRegistrationConfirmationUseCase,
        SendUpdatedRegistrationCodeByEmail,
        RegistrationEmailResendingUseCase,
        UserPasswordRecoveryUseCase,
        UpdatePasswordUseCase,
        LoginUserUseCase,
        CreateRefreshTokenUseCase,
        LogoutUserUseCase,
    ],
    exports: [AuthService],
})
export class AuthModule {}
