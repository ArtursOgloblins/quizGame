import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
            passReqToCallback: true,
        });
    }

    async validate(req: Request, payload: any) {
        const user = {
            userEmail: payload.userEmail,
            username: payload.username,
            userId: payload.userId,
        };

        console.log('Payload in JwtStrategy:', payload);
        console.log('User object in JwtStrategy:', user);

        req.user = user;

        return user;
    }
}