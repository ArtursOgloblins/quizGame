import {Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Player} from "./player.entity";
import {Questions} from "../../questions/domain/qustions.entity";
import {GameQuestions} from "./game-questions.entity";
import {AnswerStatus} from "../api/output/game-response.dto";

@Entity()
export class Answers {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({type: 'varchar'})
    public body: string;

    @Column({type: 'varchar'})
    public status: AnswerStatus

    @ManyToOne(() => Player, (player) => player.answers)
    @Index()
    public player: Player

    @ManyToOne(() => Questions)
    public question: Questions

    @ManyToOne(() => GameQuestions)
    public gameQuestion: GameQuestions;

    @CreateDateColumn({ name: 'createdAt' })
    public createdAt: Date;
}
