import { Users } from '../../../domain/users.entity';

export class UserResponseDTO {
  public id: string;
  public login: string;
  public email: string;
  public createdAt: Date;

  public constructor(user: Users) {
    this.id = user.id.toString();
    this.login = user.login;
    this.email = user.email;
    this.createdAt = user.createdAt;
  }
}
