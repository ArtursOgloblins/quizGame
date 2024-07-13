import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwt from 'jsonwebtoken';
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
        const authorizationHeader = req.headers.authorization;
        console.log('Authorization Header:', authorizationHeader);
        const decodedToken = jwt.decode(authorizationHeader.split(' ')[1], {
            complete: true,
        });
        console.log(decodedToken);
        return {
            userEmail: payload.userEmail,
            username: payload.username,
            userId: payload.userId,
        };
    }
}
