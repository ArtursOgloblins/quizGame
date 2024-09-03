import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Game} from "./game.entity";
import {Answers} from "./answers.entity";
import {Users} from "../../users/domain/users.entity";

export enum PlayerGameResult {
    Win = "win",
    Lose = "lose",
    Draw  = "draw"
}

@Entity()
export class Player {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ type: 'varchar' })
    public status: string;

    @Column({ type: 'int', default: 0 })
    public score: number;

    @Column({type: 'varchar', nullable: true})
    public gameResult: PlayerGameResult

    @ManyToOne(() => Users, (user) => user.player)
    public user: Users;

    @ManyToOne(() => Game, (game) => [game.playerOne, game.playerTwo], { onDelete: 'CASCADE' })
    public game: Game;

    @OneToMany(() => Answers, (answers) => answers.player, { cascade: true })
    public answers: Answers[];
}