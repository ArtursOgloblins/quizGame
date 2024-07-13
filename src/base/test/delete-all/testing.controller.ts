import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { TestingRepository } from './testing.repository';

@Controller('testing/all-data')
export class TestingController {
  constructor(protected testingRepository: TestingRepository) {}

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllData() {
    return this.testingRepository.deleteAllData();
  }
}
