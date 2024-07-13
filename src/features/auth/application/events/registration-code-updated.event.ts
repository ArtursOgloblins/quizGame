export class UserRegistrationCodeUpdatedEvent {
    constructor(
        public readonly newCode: string,
        public readonly email: string,
    ) {}
}
