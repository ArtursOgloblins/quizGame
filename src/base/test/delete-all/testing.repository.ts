import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '../../../features/users/domain/users.entity';
import { UsersConfirmation } from '../../../features/users/domain/users-confirmation.entity';
import { RefreshToken } from '../../../features/auth/domain/auth.refresh-token.entity';
import { PasswordRecovery } from '../../../features/auth/domain/auth.passwrd.recovery.entity';

@Injectable()
export class TestingRepository {
  constructor(
      @InjectRepository(UsersConfirmation)
      private readonly usersConfirmationRepository: Repository<UsersConfirmation>,
      @InjectRepository(PasswordRecovery)
      private readonly authPasswordRecoveryRepository: Repository<PasswordRecovery>,
      @InjectRepository(RefreshToken)
      private readonly authRefreshTokenRepository: Repository<RefreshToken>,
      @InjectRepository(Users)
      private readonly usersRepository: Repository<Users>,
  ) {}

  async deleteAllData() {
    const queryRunner = this.usersRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Сначала удаляем данные из таблиц, ссылающихся на `game_questions`
      await queryRunner.query('DELETE FROM answers');

      // Затем удаляем данные из таблицы `game_questions`
      await queryRunner.query('DELETE FROM game_questions');

      // Удаляем данные из остальных таблиц
      await queryRunner.query('DELETE FROM game');
      await queryRunner.query('DELETE FROM player');
      await queryRunner.query('DELETE FROM questions');
      await queryRunner.query('DELETE FROM users_confirmation');
      await queryRunner.query('DELETE FROM password_recovery');
      await queryRunner.query('DELETE FROM refresh_token');
      await queryRunner.query('DELETE FROM users');

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}