import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Game} from "../domain/game.entity";

Injectable()
export class GameQueryRepository {
    constructor(
        @InjectRepository(Game)
        private readonly gameQueryRepository: Repository<Game>
    ) {}
}
