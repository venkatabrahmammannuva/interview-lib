import { AuthGuard } from '@nestjs/passport';

export class UserJwtGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }
}
