import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../settings/configuration';
import { EmailAdapter } from './email.adapter';

@Injectable()
export class EmailService {
    constructor(
        private configService: ConfigService<ConfigurationType, true>,
        private emailAdapter: EmailAdapter,
    ) {}

    private get apiSettings() {
        return this.configService.get('apiSettings', { infer: true });
    }

    async sendRegistrationConfirmationEmail(
        code: string,
        email: string,
    ): Promise<void> {
        const subject = 'Confirm Your Email';
        const message = `
      <h1>Welcome to NestApp</h1>
      <p>Please confirm your email by clicking the link below:</p>
      <a href="${this.apiSettings.LOCAL_HOST}/auth/confirm?code=${code}">Confirm Email</a>
    `;

        await this.emailAdapter.sendMail(email, subject, message);
    }

    async sendPasswordRecoveryCode(code: string, email: string) {
        const subject = `Password recovery`;
        const message = `
            <h1>Password recovery</h1>
            <p>To finish password recovery please follow the link below:
              <a href='${this.apiSettings.LOCAL_HOST}/password-recovery?recoveryCode=${code}'>recovery password</a>
            </p>`;

        await this.emailAdapter.sendMail(email, subject, message);
    }
}
