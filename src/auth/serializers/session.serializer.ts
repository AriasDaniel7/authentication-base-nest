import { JwtPayload } from '@auth/interfaces/jwt-payload.interface';
import { User } from '@database/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UserService } from '@user/user.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly userService: UserService) {
    super();
  }

  serializeUser(user: User, done: Function) {
    done(null, user.id);
  }
  async deserializeUser(payload: JwtPayload, done: Function) {
    try {
      const user = await this.userService.findOne(payload.id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
}
