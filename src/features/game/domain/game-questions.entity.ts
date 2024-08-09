import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Game} from "./game.entity";
import {Questions} from "../../questions/domain/qustions.entity";
import {Answers} from "./answers.entity";

@Entity()
export class GameQuestions {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne (() => Game, (game) => game.gameQuestions)
    public game: Game

    @ManyToOne(() => Questions, { eager: true })
    public question: Questions

    @Column()
    public questionIndex: number;

    @OneToMany(() => Answers, (answers) => answers.gameQuestion)
    public answers: Answers[];

    public checkAnswer(answerBody: string): boolean {
        return this.question.correctAnswers.includes(answerBody);
    }
}