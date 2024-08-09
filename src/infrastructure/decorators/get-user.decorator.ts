import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        console.log('Request in GetUser:', request);
        console.log('Request user in GetUser:', request.user);
        return request.user;
    },
);
