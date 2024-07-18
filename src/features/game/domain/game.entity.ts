import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Player} from "./player.entity";
import {GameQuestions} from "./game-questions.entity";

@Entity()
export class Game {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ type: 'varchar' })
    public status: string;

    @ManyToOne(() => Player)
    public playerOne: Player;

    @ManyToOne(() => Player)
    public playerTwo: Player;

    @OneToMany(() => GameQuestions, (questions) => questions.game)
    public gameQuestions: GameQuestions[];

    @Column({ type: 'date' })
    public pairCreatedDate: Date;

    @Column({ type: 'date', nullable: true })
    public startGameDate: Date;

    @Column({ type: 'date', nullable: true })
    public finishGameDate: Date;
}