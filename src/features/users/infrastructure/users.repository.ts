import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../domain/users.entity';
import { DataSource, Repository } from 'typeorm';
import { NewUserInputData } from '../api/dto/input/new-user-inputData.dto';
import { UsersConfirmation } from '../domain/users-confirmation.entity';
import {PasswordRecovery} from "../../auth/domain/auth.passwrd.recovery.entity";
import {RefreshToken} from "../../auth/domain/auth.refresh-token.entity";
import {passwordRecoveryInputData} from "../../auth/api/dto/input/password-recovery-params.dto";
import {UpdateRefreshTokenInputData} from "../../auth/api/dto/input/update-refresh-token.dto";
import {RefreshTokenInputDto} from "../../auth/api/dto/input/refresh-token-params.dto";


@Injectable()
export class UsersRepository {
    public constructor(
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,
        @InjectRepository(UsersConfirmation)
        private readonly usersConfirmationRepository: Repository<UsersConfirmation>,
        @InjectRepository(PasswordRecovery)
        private readonly passwordRecoveryRepository: Repository<PasswordRecovery>,
        @InjectRepository(RefreshToken)
        private readonly refreshToken: Repository<RefreshToken>,
        private readonly dataSource: DataSource,
    ) {}

    public async registerUser(inputData: NewUserInputData) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const {
                login,
                email,
                passwordHash,
                confirmationCode,
                expirationDate,
                isConfirmed,
            } = inputData;

            const newUser = this.usersRepository.create({
                login,
                email,
                password: passwordHash,
            });
            const savedUser = await queryRunner.manager.save(newUser);

            const newConfirmation = this.usersConfirmationRepository.create({
                user: savedUser,
                confirmationCode,
                expirationDate,
                isConfirmed,
            });
            await queryRunner.manager.save(newConfirmation);
            await queryRunner.commitTransaction();
            return { success: true };
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    public async deleteUserById(userId: number): Promise<void> {
        try {
            await this.usersRepository.update(userId, { isDeleted: true });
        } catch (error) {
            console.log('Error in deleteUserById', error);
        }
    }

    public async updateUserConfirmationStatus(userId: number) {
        try {
            return await this.usersConfirmationRepository
                .createQueryBuilder('uc')
                .update()
                .set({ isConfirmed: true })
                .where('userId = :userId', { userId })
                .execute();
        } catch (error) {
            console.log('Error in updateUserConfirmationStatus', error);
            throw error;
        }
    }

    public async updateUserConfirmationCode(
        userId: number,
        confirmationCode: string,
    ) {
        return await this.usersConfirmationRepository
            .createQueryBuilder('uc')
            .update()
            .set({ confirmationCode: confirmationCode })
            .where('userId = :userId', { userId })
            .execute();
    }

    public async registerPasswordRecovery(inputData: passwordRecoveryInputData) {
        try {
            const { userId, confirmationCode, expirationDate } = inputData;
            const user = await this.usersRepository.findOne({
                where: { id: userId },
            });
            await this.passwordRecoveryRepository
                .createQueryBuilder()
                .insert()
                .into('PasswordRecovery')
                .values([
                    {
                        user: user,
                        confirmationCode: confirmationCode,
                        expirationDate: expirationDate,
                    },
                ])
                .execute();
        } catch (error) {
            console.log('Error in registerPasswordRecovery', error);
            throw error;
        }
    }

    public async updatePasswordRecovery(inputData: passwordRecoveryInputData) {
        try {
            const { userId, confirmationCode, expirationDate } = inputData;
            await this.passwordRecoveryRepository
                .createQueryBuilder('pr')
                .update()
                .set({
                    confirmationCode: confirmationCode,
                    expirationDate: expirationDate,
                    isValid: true,
                })
                .where('userId = :userId', { userId })
                .execute();
        } catch (error) {
            console.log('Error in registerPasswordRecovery', error);
            throw error;
        }
    }

    public async updateUserPassword(userId: number, passwordHash: string) {
        try {
            await this.usersRepository
                .createQueryBuilder('u')
                .update()
                .set({ password: passwordHash })
                .where('id = :userId', { userId })
                .execute();
        } catch (error) {
            console.log('Error in updateUserPassword', error);
            throw error;
        }
    }

    public async resetPasswordRecoveryDetails(recoveryCode: string) {
        try {
            return this.passwordRecoveryRepository
                .createQueryBuilder('pr')
                .update()
                .set({ isValid: false })
                .where('confirmationCode = :recoveryCode', { recoveryCode });
        } catch (error) {
            console.log('Error in resetPasswordRecoveryDetails', error);
            throw error;
        }
    }

    public async registerRefreshToken(inputData: RefreshTokenInputDto) {
        try {
            const { expiringAt, deviceId, deviceName, userId, ip } = inputData;
            const user = await this.usersRepository.findOne({
                where: { id: userId },
            });
            return this.refreshToken
                .createQueryBuilder()
                .insert()
                .into('RefreshToken')
                .values([
                    {
                        user: user,
                        deviceName: deviceName,
                        ip: ip,
                        deviceId: deviceId,
                        expiringAt: expiringAt,
                    },
                ])
                .execute();
        } catch (error) {
            console.log('Error in registerRefreshToken', error);
            throw error;
        }
    }

    public async updateRefreshTokenData(inputData: UpdateRefreshTokenInputData) {
        try {
            const { deviceId, userId, createdDate, expiringAt } = inputData;
            return this.refreshToken
                .createQueryBuilder('rt')
                .update()
                .set({ createdAt: createdDate, expiringAt: expiringAt })
                .where('userId = :userId', { userId })
                .andWhere('deviceId = :deviceId', { deviceId })
                .execute();
        } catch (error) {
            console.log('Error in refreshToken', error);
            throw error;
        }
    }

    public async logoutUser(
        expiringAt: number,
        deviceId: string,
        userId: string,
    ) {
        try {
            return this.refreshToken
                .createQueryBuilder()
                .delete()
                .from('refresh_token')
                .where('userId = :userId', { userId })
                .andWhere('deviceId = :deviceId', { deviceId })
                .andWhere('expiringAt = :expiringAt', { expiringAt })
                .execute();
        } catch (error) {
            console.log('Error in refreshToken', error);
            throw error;
        }
    }
}
