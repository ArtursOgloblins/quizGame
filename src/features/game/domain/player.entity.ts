import {Column, Entity, Index, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {Game} from "./game.entity";
import {Answers} from "./answers.entity";
import {Users} from "../../users/domain/users.entity";

@Entity()
export class Player {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ type: 'varchar' })
    public status: string;

    @Column({type: 'int'})
    public score: number

    @ManyToOne(() => Users, (user) => user.player)
    public user: Users

    @OneToOne(() => Game)
    public game: Game;

    @OneToMany(() => Answers, (answers) => answers.player, { cascade: true })
    public answers: Answers[]
}