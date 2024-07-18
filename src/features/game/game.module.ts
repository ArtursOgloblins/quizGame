import {  Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import {UsersModule} from "../users/users.module";
import {GameController} from "./api/game.controller";
import {GameRepository} from "./infrastructure/game.repository";
import {GameQueryRepository} from "./infrastructure/game.query-repository";
import {Answers} from "./domain/answers.entity";
import {Game} from "./domain/game.entity";
import {GameQuestions} from "./domain/game-questions.entity";
import {Player} from "./domain/player.entity";
import {Questions} from "../questions/domain/qustions.entity";
import {ConnectToTheGameUseCase} from "./application/usecases/connect-to-the-game.usecase";
import {QuestionsQueryRepository} from "../questions/infrastructure/questions.query-repository";

@Module({
    imports: [
        CqrsModule,
        UsersModule,
        TypeOrmModule.forFeature([Answers, Game, GameQuestions, Player, Questions])
    ],
    controllers: [GameController],
    providers: [
        GameRepository,
        GameQueryRepository,
        QuestionsQueryRepository,
        ConnectToTheGameUseCase
    ],
    exports: [GameRepository, GameQueryRepository, TypeOrmModule],
})
export class GameModule {}