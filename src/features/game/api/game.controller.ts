import {CommandBus, QueryBus} from "@nestjs/cqrs";
import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post, Query,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import {AuthGuard} from "@nestjs/passport";
import {AccessTokenPayloadDTO} from "../../auth/api/dto/input/access-token-params.dto";
import {GetUser} from "../../../infrastructure/decorators/get-user.decorator";
import {GameResponseDTO} from "./output/game-response.dto";
import {ConnectToTheGameCommand} from "../application/usecases/connect-to-the-game.usecase";
import {GetGameById} from "../infrastructure/queries/game.get-by-id.query";
import {GetCurrentGame} from "../infrastructure/queries/game.get-user-active-game.query";
import {LoggerMiddleware} from "../../../infrastructure/middlewares/logger.middleware";
import {AnswerResponseDto} from "./output/answer-response.dto";
import {AnswerDto} from "./input/answer.dto";
import {AnswerQuestionCommand} from "../application/usecases/answer-question.usecase";
import {GetAllUserGames} from "../infrastructure/queries/game.get-all-my-games.query";
import {GamesQueryParamsDTO} from "./input/games-query-params.dto";
import {PaginatedGamesResponseDto} from "./output/paginated-games-response.dto";
import {UserStatisticResponseDTO} from "./output/user-statistic-response.dto";
import {GetUserStatistic} from "../infrastructure/queries/game.get-my-statistic.query";
import {PaginatedUsersTopResponseDTO} from "./output/user-top-response.dto";
import {GetUsersTop} from "../infrastructure/queries/game.get-users-top.query";
import {UsersTopQueryParamsDTO} from "./input/users-top-query-params.dto";

@Controller('pair-game-quiz/pairs')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(LoggerMiddleware)

    export class GameController {
        constructor(
            private commandBus: CommandBus,
            private queryBus: QueryBus
        ) {}

        @Post('connection')
        @HttpCode(HttpStatus.OK)
        async addPlayer(@GetUser() user: AccessTokenPayloadDTO): Promise<GameResponseDTO> {
            return this.commandBus.execute(new ConnectToTheGameCommand(user))
        }

        @Post('my-current/answers')
        @HttpCode(HttpStatus.OK)
        async answerQuestion(
            @Body()answer: AnswerDto,
            @GetUser() user: AccessTokenPayloadDTO): Promise<AnswerResponseDto> {
            return this.commandBus.execute(new AnswerQuestionCommand(user, answer))
        }

        @Get('my-current')
        @HttpCode(HttpStatus.OK)
        async getCurrentGame(@GetUser() user: AccessTokenPayloadDTO): Promise<GameResponseDTO> {
            return this.queryBus.execute(new GetCurrentGame(user));
        }

        @Get('my')
        @HttpCode(HttpStatus.OK)
        async getMyStatistic(
            @GetUser() user: AccessTokenPayloadDTO,
            @Query() queryParams: GamesQueryParamsDTO,
        ): Promise<PaginatedGamesResponseDto> {
            return this.queryBus.execute(new GetAllUserGames(user, queryParams))
        }


    @Get(':gameId')
        @HttpCode(HttpStatus.OK)
        async getGameById(
            @GetUser() user: AccessTokenPayloadDTO,
            @Param('gameId', ParseIntPipe) gameId: number): Promise<GameResponseDTO> {
            return this.queryBus.execute(new GetGameById(gameId, user));
        }
    }

    @Controller('pair-game-quiz/users')
    @UseInterceptors(LoggerMiddleware)
    export class UsersGameController {
        constructor(
            private readonly queryBus: QueryBus,
        ) {}

        @Get('my-statistic')
        @UseGuards(AuthGuard('jwt'))
        @HttpCode(HttpStatus.OK)
        async getMyStatisticFromPairs(
            @GetUser() user: AccessTokenPayloadDTO,
        ): Promise<UserStatisticResponseDTO> {
            return this.queryBus.execute(new GetUserStatistic(user));
        }

        @Get('top')
        @HttpCode(HttpStatus.OK)
        async getUsersTop(
            @Query() queryParams: UsersTopQueryParamsDTO,
        ): Promise<PaginatedUsersTopResponseDTO> {
            return this.queryBus.execute(new GetUsersTop(queryParams));
        }
    }
