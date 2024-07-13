import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { RegisterUserDTO } from '../../api/dto/input/register-user.dto';
import { ConfirmationCodeDto } from '../../../auth/api/dto/input/confirmation-code.dto';
import {UsersQueryRepository} from "../../infrastructure/users.query-repostory";

export class AuthTestManager {
  constructor(
    protected readonly app: INestApplication,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  USER_ONE_INPUT_DATA: RegisterUserDTO = {
    login: 'JohnDoe',
    password: 'password123',
    email: 'john@doe.com',
  };

  USER_TWO_INPUT_DATA: RegisterUserDTO = {
    login: 'JaneDoe',
    password: 'password123',
    email: 'jane@doe.com',
  };

  USER_ONE_CREDENTIALS = {
    loginOrEmail: 'JohnDoe',
    password: 'password123',
  };

  USER_TWO_CREDENTIALS = {
    loginOrEmail: 'JaneDoe',
    password: 'password123',
  };

  async registerUser(createModel: RegisterUserDTO) {
    const response = await request(this.app.getHttpServer())
      .post('/auth/registration')
      .send(createModel);

    if (response.status !== 204) {
      console.error(response.body);
    }
    expect(response.status).toBe(204);
    return response;
  }

  async confirmRegistration(confirmationCode: ConfirmationCodeDto) {
    const response = await request(this.app.getHttpServer())
      .post(`/auth/registration-confirmation`)
      .send({ code: confirmationCode });
    if (response.status !== 204) {
      console.error(response.body);
    }
    expect(response.status).toBe(204);
    return response;
  }

  async resendConfirmationCode(userEmail: string) {
    const response = await request(this.app.getHttpServer())
      .post(`/auth/registration-email-resending`)
      .send({ email: userEmail });
    if (response.status !== 204) {
      console.error(response.body);
    }
    expect(response.status).toBe(204);
    return response;
  }

  async sendPasswordRecoveryRequest(userEmail: string) {
    console.log('userEmail', userEmail);
    const response = await request(this.app.getHttpServer())
      .post(`/auth/password-recovery`)
      .send({ email: userEmail });
    if (response.status !== 204) {
      console.error(response.body);
    }
    const recoveryCode = await this.getPasswordRecoveryData(userEmail);
    expect(response.status).toBe(204);
    return recoveryCode.confirmationCode;
  }

  async getPasswordRecoveryData(userEmail: string) {
    const user = await this.usersQueryRepository.getUserByEmail(userEmail);
    return await this.usersQueryRepository.getUserDataForPasswordRecovery(
      user.id,
    );
  }

  async changeUserPassword(code: string, newPass: string) {
    const response = await request(this.app.getHttpServer())
      .post(`/auth/new-password`)
      .send({ recoveryCode: code, newPassword: newPass });
    if (response.status !== 204) {
      console.error(response.body);
    }
    expect(response.status).toBe(204);
  }

  async loginUser(credentials: any) {
    const response = await request(this.app.getHttpServer())
      .post(`/auth/login`)
      .send(credentials);
    if (response.status !== 200) {
      console.error(response.body);
    }
    expect(response.status).toBe(200);
    return response.body.accessToken;
  }

  async getCurrentUserInfo(jwt: string) {
    const response = await request(this.app.getHttpServer())
      .get(`/auth/me`)
      .set('Authorization', `Bearer ${jwt}`);
    if (response.status !== 200) {
      console.error(response.body);
    }
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('email', expect.any(String));
    expect(response.body).toHaveProperty('login', expect.any(String));
    expect(response.body).toHaveProperty('userId', expect.any(String));
  }
}
