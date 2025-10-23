import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): object {
    return {
      status: 'ok',
      message: 'NOSBAAN Property Management API is running',
      timestamp: new Date().toISOString(),
    };
  }
}

