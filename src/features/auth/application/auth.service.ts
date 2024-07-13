import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {UsersQueryRepository} from "../../users/infrastructure/users.query-repostory";


@Injectable()
export class AuthService {
    constructor(private usersQueryRepository: UsersQueryRepository) {}

    async validateUser(loginOrEmail: string, pass: string): Promise<any> {
        console.log('validateUser called with:', loginOrEmail);
        const user =
            await this.usersQueryRepository.findByLoginOrEmail(loginOrEmail);
        if (!user) {
            return null;
        }

        const { id, password, confirmation, login, email } = user;
        const isPasswordValid = await bcrypt.compare(pass, password);
        console.log('Password is valid:', isPasswordValid);

        if (id && isPasswordValid) {
            if (confirmation.isConfirmed) {
                return { id, login, email };
            }
        }
        return null;
    }
}
