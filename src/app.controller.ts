import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  public healthCheck(): object {
    return { status: 'ok' };
  }

  public getHello(): string {
    return this.appService.getHello();
  }
}
