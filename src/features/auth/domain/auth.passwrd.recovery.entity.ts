import {
    Column,
    Entity,
    Index,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from '../../users/domain/users.entity';

@Entity()
export class PasswordRecovery {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ type: 'varchar' })
    @Index()
    public confirmationCode: string;

    @Column({ default: true })
    public isValid: boolean;

    @Column()
    public expirationDate: Date;

    @OneToOne(() => Users, (user) => user.passwordRecovery)
    @JoinColumn()
    public user: Users;
}
