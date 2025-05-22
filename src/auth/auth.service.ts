import { User } from '@database/entities/user.entity';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { HandleErrorException } from '@utils/hooks/handle-error-exception';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!bcrypt.compareSync(password, user.password!)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    delete user.password;

    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  async validateOrCreateUserFromGoogle(email: string) {
    try {
      let user = await this.userRepository.findOneBy({ email });

      if (!user) {
        const randomPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = bcrypt.hashSync(randomPassword, 10);

        user = this.userRepository.create({
          email,
          password: hashedPassword,
        });

        await this.userRepository.save(user);
      }

      return user;
    } catch (error) {
      HandleErrorException.handleError(error, this.logger);
    }
  }

  async googleLogin(user: User) {
    if (!user) {
      throw new UnauthorizedException('Google authentication failed');
    }

    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }
}
