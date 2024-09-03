export class UserStatisticResponseDTO {
    sumScore: number
    avgScores: number
    gamesCount: number
    winsCount: number
    lossesCount: number
    drawsCount: number

    constructor(stats: UserStatistic) {
        this.sumScore = stats.sumScore
        this.avgScores = stats.avgScores
        this.gamesCount = stats.gamesCount
        this.winsCount = stats.winsCount
        this.lossesCount = stats.lossesCount
        this.drawsCount = stats.drawsCount
    }
}