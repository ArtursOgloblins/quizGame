import {GameResponseDTO} from "./game-response.dto";

export class PaginatedGamesResponseDto {
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    items: GameResponseDTO[]
}