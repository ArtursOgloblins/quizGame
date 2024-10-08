import {Game} from "../../domain/game.entity";

export enum GameStatus {
    PendingSecondPlayer = "PendingSecondPlayer",
    Active = "Active",
    Finished  = "Finished"
}

export enum AnswerStatus {
    Correct = "Correct",
    Incorrect = "Incorrect"
}

export class QuestionsDTO {
    id: string;
    body: string;
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
    secondPlayerProgress: PlayerProgress | null;
    questions: QuestionsDTO[] | null
    status: GameStatus
    pairCreatedDate: string
    startGameDate: string | null;
    finishGameDate: string | null;

    constructor(game: Game) {
        this.id = game.id.toString()
        this.firstPlayerProgress = {
            answers: game.playerOne.answers.length > 0 ? game.playerOne.answers.map(answer => {
                return {
                    addedAt: new Date(answer.createdAt).toISOString(),
                    answerStatus: answer.status as AnswerStatus,
                    questionId: answer.question.id.toString()
                };
            }) : [],
            player: {
                id: game.playerOne.user.id.toString(),
                login: game.playerOne.user.login
            },
            score: game.playerOne.score
        }
        this.secondPlayerProgress = game.playerTwo ? {
            answers: game.playerTwo.answers.length > 0 ? game.playerTwo.answers.map(answer => {
                return {
                    addedAt: new Date(answer.createdAt).toISOString(),
                    answerStatus: answer.status as AnswerStatus,
                    questionId: answer.question.id.toString()
                };
            }) : [],
            player: {
                id: game.playerTwo.user.id.toString(),
                login: game.playerTwo.user.login
            },
            score: game.playerTwo.score
        } : null;
        if (game.status === GameStatus.PendingSecondPlayer) {
            this.questions = null
        } else {
            this.questions = game.gameQuestions ? game.gameQuestions.map(gq => ({
                id: gq.question.id.toString(),
                body: gq.question.body
            })) : [];
        }
        this.status = game.status as GameStatus
        this.pairCreatedDate = new Date(game.pairCreatedDate).toISOString();
        this.startGameDate = game.startGameDate ? new Date(game.startGameDate).toISOString() : null;
        this.finishGameDate = game.finishGameDate ? new Date(game.finishGameDate).toISOString() : null;
    }
}