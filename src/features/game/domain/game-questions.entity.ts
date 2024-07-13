import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Game} from "./game.entity";
import {Questions} from "../../questions/domain/qustions.entity";

@Entity()
export class GameQuestions {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne (() => Game, (game) => game.gameQuestions)
    public game: Game

    @ManyToOne(() => Questions)
    public question: Questions

    @Column()
    public questionIndex: number;
}