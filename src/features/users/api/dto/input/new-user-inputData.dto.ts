export interface NewUserInputData {
    email: string;
    login: string;
    passwordHash: string;
    isConfirmed: boolean;
    confirmationCode: string;
    expirationDate: Date;
}
