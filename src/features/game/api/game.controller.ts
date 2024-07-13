import {CommandBus, QueryBus} from "@nestjs/cqrs";
import {Body, Controller, HttpCode, HttpStatus, Post, UseGuards} from "@nestjs/common";
import {AuthGuard} from "@nestjs/passport";
import {AccessTokenPayloadDTO} from "../../auth/api/dto/input/access-token-params.dto";
import {GetUser} from "../../../infrastructure/decorators/get-user.decorator";
import {GameResponseDTO} from "./output/game-response.dto";
import {ConnectToTheGameCommand} from "../application/usecases/connect-to-the-game.usecase";

@Controller('pair-game-quiz/pairs')
    export class GameController {
        constructor(
            private commandBus: CommandBus,
            private queryBus: QueryBus
        ) {}

        @UseGuards(AuthGuard('jwt'))
        @Post()
        @HttpCode(HttpStatus.OK)
        async addQuestion(@GetUser() user: AccessTokenPayloadDTO): Promise<GameResponseDTO> {
            return this.commandBus.execute(new ConnectToTheGameCommand(user))
        }
    }
