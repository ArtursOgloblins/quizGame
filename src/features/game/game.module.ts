import {  Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import {UsersModule} from "../users/users.module";
import {GameController, UsersGameController} from "./api/game.controller";
import {GameRepository} from "./infrastructure/game.repository";
import {GameQueryRepository} from "./infrastructure/game.query-repository";
import {Answers} from "./domain/answers.entity";
import {Game} from "./domain/game.entity";
import {GameQuestions} from "./domain/game-questions.entity";
import {Player} from "./domain/player.entity";
import {Questions} from "../questions/domain/qustions.entity";
import {ConnectToTheGameUseCase} from "./application/usecases/connect-to-the-game.usecase";
import {QuestionsQueryRepository} from "../questions/infrastructure/questions.query-repository";
import {GetGameByIdQuery} from "./infrastructure/queries/game.get-by-id.query";
import {GetCurrentGameQuery} from "./infrastructure/queries/game.get-user-active-game.query";
import {AnswerQuestionUseCase} from "./application/usecases/answer-question.usecase";
import {GetAllUserGamesQuery} from "./infrastructure/queries/game.get-all-my-games.query";
import {GetUserStatisticQuery} from "./infrastructure/queries/game.get-my-statistic.query";
import {GetUsersTopQuery} from "./infrastructure/queries/game.get-users-top.query";
import {ScheduleModule} from "@nestjs/schedule";
import {GameFinisherUseCase} from "./application/usecases/game-finisher.usecase";

@Module({
    imports: [
        CqrsModule,
        UsersModule,
        TypeOrmModule.forFeature([Answers, Game, GameQuestions, Player, Questions]),
        ScheduleModule.forRoot(),
    ],
    controllers: [GameController, UsersGameController],
    providers: [
        GameRepository,
        GameQueryRepository,
        QuestionsQueryRepository,
        AnswerQuestionUseCase,
        ConnectToTheGameUseCase,
        GameFinisherUseCase,
        GetCurrentGameQuery,
        GetGameByIdQuery,
        GetAllUserGamesQuery,
        GetUserStatisticQuery,
        GetUsersTopQuery
    ],
    exports: [GameRepository, GameQueryRepository, TypeOrmModule],
})
export class GameModule {}