import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { UsersConfirmation } from './users-confirmation.entity';
import { RefreshToken } from '../../auth/domain/auth.refresh-token.entity';
import {PasswordRecovery} from "../../auth/domain/auth.passwrd.recovery.entity";
import {Player} from "../../game/domain/player.entity";

@Entity()
export class Users {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ type: 'varchar' })
    public login: string;

    @Column({ type: 'varchar' })
    public email: string;

    @Column({ type: 'varchar' })
    public password: string;

    @Column({ default: false })
    public isDeleted: boolean;

    @CreateDateColumn({ name: 'createdAt' })
    public createdAt: Date;

    @OneToOne(() => UsersConfirmation, (confirmation) => confirmation.user)
    public confirmation: UsersConfirmation;

    @OneToOne(() => PasswordRecovery, (passwordRecovery) => passwordRecovery.user)
    public passwordRecovery: PasswordRecovery;

    @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
    public refreshToken: RefreshToken[];

    @OneToMany(() => Player, (player) => player.user,  { cascade: true })
    public player: Player[]
}
