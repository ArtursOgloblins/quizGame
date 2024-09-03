import { Users } from './domain/users.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersConfirmation } from './domain/users-confirmation.entity';
import { SendRegistrationConfirmationCodeByEmail } from './application/events/handlers/user-registered.event-handler';
import { RegisterUserUseCase } from './application/usecases/register-user.usecase';
import { UsersRepository } from './infrastructure/users.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { EmailAdapter } from '../../base/email/email.adapter';
import { EmailService } from '../../base/email/email.service';
import { UserController } from './api/users.controller';
import { FindUsersQuery } from './infrastructure/queries/users.get-all.query';
import { DeleteUserByIdUseCase } from './application/usecases/delete-user.usecase';
import { RefreshToken } from '../auth/domain/auth.refresh-token.entity';
import {PasswordRecovery} from "../auth/domain/auth.passwrd.recovery.entity";
import {UsersQueryRepository} from "./infrastructure/users.query-repostory";

@Module({
    imports: [
        CqrsModule,
        TypeOrmModule.forFeature([
            Users,
            UsersConfirmation,
            PasswordRecovery,
            RefreshToken,
        ]),
    ],
    controllers: [UserController],
    providers: [
        EmailAdapter,
        EmailService,
        UsersRepository,
        UsersQueryRepository,
        RegisterUserUseCase,
        DeleteUserByIdUseCase,
        FindUsersQuery,
        SendRegistrationConfirmationCodeByEmail
    ],
    exports: [UsersRepository, UsersQueryRepository, TypeOrmModule],
})
export class UsersModule {}
