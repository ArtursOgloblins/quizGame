export interface passwordRecoveryInputData {
  userId: number;
  confirmationCode: string;
  expirationDate: Date;
}
