export class RefreshTokenInputDto {
  expiringAt: Date;
  deviceId: string;
  deviceName: string;
  userId: number;
  ip: string;
}
