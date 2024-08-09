import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';


@ValidatorConstraint({ async: false })
@Injectable()
export class IsBooleanStrictConstraint implements ValidatorConstraintInterface {
    async validate(value: any)  {
        console.log('Validating value:', typeof value);
        console.log('Validating value:', value);
        return typeof value === 'boolean';
    }

    defaultMessage(args: ValidationArguments): string {
        return 'Value must be a boolean';
    }
}

export function IsBooleanStrict(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsBooleanStrictConstraint,
        });
    };
}