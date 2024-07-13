import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RegisterUserDTO } from './dto/input/register-user.dto';
import { UserResponseDTO } from './dto/output/user-response.dto';
import { BasicAuthGuard } from '../../../infrastructure/guards/basic-auth.guard';
import { RegisterUserCommand } from '../application/usecases/register-user.usecase';
import { PaginatedUserResponseDTO } from './dto/output/paginated-users-response.dto';
import { FindUsers } from '../infrastructure/queries/users.get-all.query';
import { DeleteUseByIdCommand } from '../application/usecases/delete-user.usecase';
import {UsersQueryRepository} from "../infrastructure/users.query-repostory";
import {UserQueryParamsDTO} from "./dto/input/user-queryParams.dto";

@UseGuards(BasicAuthGuard)
@Controller('sa/users')
export class UserController {
    constructor(
        private commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        protected usersQueryRepository: UsersQueryRepository,
    ) {}

    @Get()
    async getUsers(
        @Query() queryParams: UserQueryParamsDTO,
    ): Promise<PaginatedUserResponseDTO> {
        console.log('queryParams', queryParams);
        return this.queryBus.execute(new FindUsers(queryParams));
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async registerUser(
        @Body() registerUserDto: RegisterUserDTO,
        @Req() request: Request,
    ): Promise<UserResponseDTO> {
        const { login, email, password } = registerUserDto;
        const path = request.path;
        const registerUserInputData = {
            login,
            email,
            password,
            path,
        };
        return this.commandBus.execute(
            new RegisterUserCommand(registerUserInputData),
        );
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteUserById(@Param('id', ParseIntPipe) userId: number) {
        return this.commandBus.execute<DeleteUseByIdCommand, void>(
            new DeleteUseByIdCommand(userId),
        );
    }
}
