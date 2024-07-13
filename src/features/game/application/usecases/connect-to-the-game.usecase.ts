import {AccessTokenPayloadDTO} from "../../../auth/api/dto/input/access-token-params.dto";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {GameResponseDTO} from "../../api/output/game-response.dto";
import {GameRepository} from "../../infrastructure/game.repository";
import {GameQueryRepository} from "../../infrastructure/game.query-repository";

export class ConnectToTheGameCommand {
    constructor(public user: AccessTokenPayloadDTO) {}
}

@CommandHandler(ConnectToTheGameCommand)
export class ConnectToTheGameUseCase implements ICommandHandler<ConnectToTheGameCommand> {
    constructor(private gameRepository: GameRepository,
                private gameQueryRepository: GameQueryRepository) {
    }

    async execute (command: ConnectToTheGameCommand): Promise<GameResponseDTO> {
        return
    }
}