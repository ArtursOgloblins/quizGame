import {Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {Player} from "./player.entity";
import {GameQuestions} from "./game-questions.entity";

@Entity()
export class Game {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ type: 'varchar' })
    public status: string;

    @OneToOne(() => Player)
    @JoinColumn()
    public playerOne: Player;

    @OneToOne(() => Player)
    @JoinColumn()
    public playerTwo: Player;

    @OneToMany(() => GameQuestions, (questions) => questions.game)
    public gameQuestions: GameQuestions[]

    @Column({type: Date})
    public pairCreatedDate: Date

    @Column({type: Date})
    public startGameDate: Date

    @Column({type: Date})
    public finishGameDate: Date
}