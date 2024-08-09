import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import configuration, { ConfigurationType } from './settings/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IsUserEmailExistConstraint } from './infrastructure/decorators/users.is-email-exists.decorator';
import { IsUserLoginExistConstraint } from './infrastructure/decorators/users.is-login-exists.decorator';
import { EmailAdapter } from './base/email/email.adapter';
import { EmailService } from './base/email/email.service';
import { IsValidConfirmationCodeConstraint } from './infrastructure/decorators/auth.user-code-validation.decorator';
import { IsValidEmailForCodeResendingConstraint } from './infrastructure/decorators/auth.is-email-valid.decorator';
import { TestingController } from "./base/test/delete-all/testing.controller";
import { UsersModule } from "./features/users/users.module";
import { AuthModule } from "./features/auth/auth.module";
import { TestingRepository } from "./base/test/delete-all/testing.repository";
import { QuestionsModule } from "./features/questions/questions.module";
import { GameModule } from "./features/game/game.module";
import { LoggerMiddleware } from "./infrastructure/middlewares/logger.middleware";
import {IsBooleanStrictConstraint} from "./infrastructure/decorators/is-boolean-strict.decorator";

const featureModules = [
  UsersModule,
  AuthModule,
  QuestionsModule,
  GameModule
];

const constraints = [
  IsUserEmailExistConstraint,
  IsUserLoginExistConstraint,
  IsValidConfirmationCodeConstraint,
  IsValidEmailForCodeResendingConstraint,
  IsBooleanStrictConstraint
];

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService<ConfigurationType, true>) => {
        return configService.get('database', {
          infer: true,
        });
      },
      inject: [ConfigService],
    }),
    ...featureModules,
  ],
  controllers: [AppController, TestingController],
  providers: [
    AppService,
    EmailAdapter,
    EmailService,
    TestingRepository,
    ...constraints,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
        .apply(LoggerMiddleware)
        .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}