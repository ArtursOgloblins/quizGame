import {Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Player} from "./player.entity";
import {Questions} from "../../questions/domain/qustions.entity";

@Entity()
export class Answers {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({type: 'varchar'})
    public body: string;

    @Column({type: 'varchar'})
    public status: string

    @ManyToOne(() => Player, (player) => player.answers)
    @Index()
    public player: Player

    @ManyToOne(() => Questions)
    public question: Questions

    @CreateDateColumn({ name: 'createdAt' })
    public createdAt: Date;
}
