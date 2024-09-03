import {TopPlayers} from "../../interfaces/usersTopGames.interface";

 export class Player {
    id: string
    login: string
}

export class TopPlayerResponse {
    sumScore: number
    avgScores: number
    gamesCount: number
    winsCount: number
    lossesCount: number
    drawsCount: number
    player: Player
    constructor(player: TopPlayers) {
        this.sumScore = player.sumScore
        this.avgScores = player.avgScores
        this.gamesCount = player.gamesCount
        this.winsCount = player.winsCount
        this.lossesCount = player.lossesCount
        this.drawsCount = player.drawsCount
        this.player = {
            id: player.userId.toString(),
            login: player.login
        }
    }
}


export class PaginatedUsersTopResponseDTO {
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    items: TopPlayerResponse[]
}