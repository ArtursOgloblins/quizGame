import {
    BadRequestException,
    INestApplication,
    ValidationPipe,
} from '@nestjs/common';
import { useContainer } from 'class-validator';
import { AppModule } from '../app.module';

import cookieParser from 'cookie-parser';
import {HttpExceptionFilter} from "../infrastructure/exception-filters/http.exception-filter";
import {LoggerMiddleware} from "../infrastructure/middlewares/logger.middleware";

export const applyAppSettings = (app: INestApplication) => {
    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    app.enableCors();

    setAppExceptionsFilters(app);

    app.use(cookieParser());

    setAppPipes(app);

    app.use(new LoggerMiddleware().use);
};

const setAppPipes = (app: INestApplication) => {
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
            stopAtFirstError: true,
            exceptionFactory: (errors) => {
                const responseErrors: { message: string; field: string }[] = [];
                errors.forEach((e) => {
                    if (e.constraints && typeof e.constraints === 'object') {
                        const constraintsKeys = Object.keys(e.constraints!);
                        constraintsKeys.forEach((cKey) => {
                            responseErrors.push({
                                message: e.constraints![cKey],
                                field: e.property,
                            });
                        });
                    }
                });
                throw new BadRequestException(responseErrors);
            },
        }),
    );
};

const setAppExceptionsFilters = (app: INestApplication) => {
    app.useGlobalFilters(new HttpExceptionFilter());
};