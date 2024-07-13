import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailAdapter {
    private transporter: nodemailer.Transporter;
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'a29021343@gmail.com',
                pass: 'zbuncfnvvtuawjcq',
            },
        });
    }
    async sendMail(
        email: string,
        subject: string,
        message: string,
    ): Promise<void> {
        await this.transporter.sendMail({
            from: `springJack`,
            to: email,
            subject: subject,
            html: message,
        });
    }
}
