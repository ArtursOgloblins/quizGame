export class UserRegisteredEvent {
  constructor(
    public readonly confirmationCode: string,
    public readonly email: string,
  ) {}
}
