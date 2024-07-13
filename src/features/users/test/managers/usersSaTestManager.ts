import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import {RegisterUserDTO} from "../../api/dto/input/register-user.dto";
import {UserQueryParamsDTO} from "../../api/dto/input/user-queryParams.dto";

interface Credentials {
  login: string;
  password: string;
}

export class UsersSaTestManager {
  constructor(protected readonly app: INestApplication) {}
  USER_INPUT_DATA: RegisterUserDTO = {
    login: 'user1',
    password: 'password1',
    email: 'user1@mail.com',
  };

  CREDENTIALS: Credentials = {
    login: 'admin',
    password: 'qwerty',
  };

  QUERYPARAMS: UserQueryParamsDTO = {
    sortBy: 'createdAt',
    sortDirection: 'desc',
    pageNumber: 1,
    pageSize: 10,
    searchLoginTerm: '',
    searchEmailTerm: '',
  };

  async registerUser(createModel: RegisterUserDTO) {
    const response = await request(this.app.getHttpServer())
      .post('/sa/users')
      .auth(this.CREDENTIALS.login, this.CREDENTIALS.password)
      .send(createModel);

    if (response.status !== 201) {
      console.error(response.body);
    }
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id', expect.any(String));
    expect(response.body).toHaveProperty('login', createModel.login);
    expect(response.body).toHaveProperty('email', createModel.email);
    expect(response.body).toHaveProperty('createdAt');

    return response;
  }

  async getAllUsers(queryParams: UserQueryParamsDTO) {
    const response = await request(this.app.getHttpServer())
      .get('/sa/users')
      .query(queryParams)
      .auth(this.CREDENTIALS.login, this.CREDENTIALS.password);

    expect(response.status).toBe(200);
    return response;
  }

  async deleteUserById(userId: string) {
    const response = await request(this.app.getHttpServer())
      .delete(`/sa/users/${userId}`)
      .auth(this.CREDENTIALS.login, this.CREDENTIALS.password);
    expect(response.status).toBe(204);
    return response;
  }
}
