import {ArrayNotEmpty, IsArray, IsIn, IsInt, IsOptional, IsString, Matches, Min} from "class-validator";
import {Transform} from "class-transformer";

export class UsersTopQueryParamsDTO {
    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    @Matches(/^[a-zA-Z0-9]+ (asc|desc)$/, { each: true })
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    sort: string[];

    @IsOptional()
    @IsInt()
    @Min(1)
    @Transform(({ value }) => Number(value) || 1, { toClassOnly: true })
    pageNumber: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Transform(({ value }) => Number(value) || 10, { toClassOnly: true })
    pageSize: number;
}