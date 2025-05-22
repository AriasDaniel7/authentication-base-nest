import {
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

export class HandleErrorException {
  static handleError(error: any, logger: Logger) {
    if (error instanceof QueryFailedError) {
      if (error.driverError.code === '23505') {
        throw new ConflictException(error.driverError.detail);
      }
    }

    logger.error(error);
    throw new InternalServerErrorException(`Verify the server logs`);
  }
}
