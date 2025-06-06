import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class GoogleAuthGuard
  extends AuthGuard('google')
  implements CanActivate
{
  async canActivate(context: ExecutionContext) {
    const activate = (await super.canActivate(context)) as boolean;
    const request: Request = context.switchToHttp().getRequest();

    await super.logIn(request);
    return activate;
  }
}
