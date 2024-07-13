import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from '../../users/domain/users.entity';

@Entity()
export class RefreshToken {
    @PrimaryGeneratedColumn()
    public id: string;

    @Column({ type: 'varchar' })
    public deviceName: string;

    @Column()
    @Column({ type: 'varchar' })
    @Index()
    public ip: string;

    @Column({ type: 'varchar' })
    @Index()
    public deviceId: string;

    @CreateDateColumn({ name: 'createdAt' })
    public createdAt: Date;

    @Column({ type: 'bigint' })
    public expiringAt: number;

    @ManyToOne(() => Users, (user) => user.refreshToken)
    @Index()
    public user: Users;
}
