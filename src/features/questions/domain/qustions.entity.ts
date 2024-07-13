import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity, Index, ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {GameQuestions} from "../../game/domain/game-questions.entity";

@Entity()
export class Questions {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ type: 'varchar' })
    public body: string;

    @Column("text", { array: true })
    correctAnswers: string[]

    @Column({type: "boolean"})
    published: boolean

    @CreateDateColumn({ name: 'createdAt' })
    public createdAt: Date;


    @UpdateDateColumn({ name: 'updatedAt' })
    public updatedAt: Date | null;

    @DeleteDateColumn()
    deletedAt: Date | null;
}