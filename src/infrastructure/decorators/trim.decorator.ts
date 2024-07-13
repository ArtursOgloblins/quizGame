import { Transform, TransformFnParams } from 'class-transformer';

export const TrimDecorator = () =>
  Transform(({ value }: TransformFnParams) => value?.trim());
