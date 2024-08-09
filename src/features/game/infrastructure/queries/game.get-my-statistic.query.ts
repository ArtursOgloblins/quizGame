import {AccessTokenPayloadDTO} from "../../../auth/api/dto/input/access-token-params.dto";
import {IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {GameQueryRepository} from "../game.query-repository";
import {GameStatus} from "../../api/output/game-response.dto";

export class GetUserStatistic {
    constructor(public user: AccessTokenPayloadDTO,
    ) {}
}

@QueryHandler(GetUserStatistic)
export class GetUserStatisticQuery implements IQueryHandler<GetUserStatistic> {
    constructor(private gameQueryRepository: GameQueryRepository) {
    }

    async execute(query: GetUserStatistic): Promise<UserStatistic> {
        const {user} = query;
        const userId = user.userId
        const finishedStatus = GameStatus.Finished
        return await this.gameQueryRepository.getMyStatistic(userId, finishedStatus);
    }
}