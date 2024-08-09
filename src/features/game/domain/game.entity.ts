import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Player} from "./player.entity";
import {GameQuestions} from "./game-questions.entity";

@Entity()
export class Game {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ type: 'varchar' })
    public status: string;

    @ManyToOne(() => Player, (player) => player.game)
    public playerOne: Player;

    @ManyToOne(() => Player, (player) => player.game)
    public playerTwo: Player;

    @OneToMany(() => GameQuestions, (questions) => questions.game)
    public gameQuestions: GameQuestions[];

    @Column({ type: 'timestamp with time zone' })
    public pairCreatedDate: Date;

    @Column({ type: 'timestamp with time zone', nullable: true })
    public startGameDate: Date;

    @Column({ type: 'timestamp with time zone', nullable: true })
    public finishGameDate: Date;
}