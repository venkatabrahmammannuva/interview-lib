import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: "postgres://tech_dev_user:PgVXnN9i2SV1rlUT5wQV2o94Z9pnsb05@dpg-cpjtfon109ks73es2d50-a.oregon-postgres.render.com/tech_dev",
        },
      },
    });
  }
}
