import {Game} from "../../domain/game.entity";
import {GameQuestions} from "../../domain/game-questions.entity";

enum GameStatus {
    PendingSecondPlayer = "PendingSecondPlayer",
    Active = "Active",
    Finished  = "Finished "
}

enum AnswerStatus {
    Correct = "Correct",
    Incorrect = "Incorrect"
}

class Questions {
    id: string
    body: string
}

class Player {
    id: string
    login: string
}

class Answers {
    questionId: string
    answerStatus: AnswerStatus
    addedAt: string
}

class PlayerProgress {
    answers: Answers[]
    player: Player
    score: number
}

export class GameResponseDTO {
    id: string
    firstPlayerProgress: PlayerProgress
    secondPlayerProgress: PlayerProgress
    questions: GameQuestions[]
    status: GameStatus
    pairCreatedDate: string
    startGameDate: string
    finishGameDate: string

    constructor(game: Game) {
        this.id = game.id.toString()
        this.firstPlayerProgress = {
            answers: game.playerOne.answers.map( answer => ({
                questionId: answer.question.id.toString(),
                answerStatus: answer.status as AnswerStatus,
                addedAt: answer.createdAt.toISOString()
            })),
            player: {
                id: game.playerOne.id.toString(),
                login: game.playerOne.user.login
            },
            score: game.playerOne.score
        }
        this.secondPlayerProgress = {
            answers: game.playerTwo.answers.map( answer => ({
                questionId: answer.question.id.toString(),
                answerStatus: answer.status as AnswerStatus,
                addedAt: answer.createdAt.toISOString()
            })),
            player: {
                id: game.playerTwo.id.toString(),
                login: game.playerTwo.user.login
            },
            score: game.playerTwo.score
        }
        this.questions = game.gameQuestions
        this.status = game.status as GameStatus
        this.pairCreatedDate = game.pairCreatedDate.toISOString()
        this.startGameDate = game.startGameDate.toISOString()
        this.finishGameDate = game.finishGameDate.toISOString()
    }
}