import { AuthService } from '@auth/auth.service';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    const googleClientId = configService.get<string>('GOOGLE_CLIENT_ID');
    const googleClientSecret = configService.get<string>(
      'GOOGLE_CLIENT_SECRET',
    );

    if (!googleClientId || !googleClientSecret) {
      throw new InternalServerErrorException(
        'Google client ID or secret is not defined in the environment variables',
      );
    }

    super({
      clientID: googleClientId,
      clientSecret: googleClientSecret,
      callbackURL: 'http://localhost:3000/api/auth/google/redirect',
      scope: ['email', 'profile'],
      state: true,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const { emails } = profile;
    if (!emails || emails.length === 0) {
      Logger.error('No email found in Google profile', 'GoogleStrategy');
      throw new BadRequestException('No email found in Google profile');
    }

    const email = emails[0].value;

    const user = await this.authService.validateOrCreateUserFromGoogle(email);

    return user ?? null;
  }
}
