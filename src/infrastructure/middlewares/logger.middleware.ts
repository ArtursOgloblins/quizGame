// src/middleware/logger.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

// https://docs.nestjs.com/middleware
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        console.log('Base URL:', req.baseUrl);
        console.log('Request user in LoggerMiddleware:', req.user);
        next();
    }
}