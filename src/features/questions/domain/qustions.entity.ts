import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";

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


    @UpdateDateColumn({ name: 'updatedAt', nullable: true})
    public updatedAt: Date | null;

    @DeleteDateColumn()
    deletedAt: Date | null;
}