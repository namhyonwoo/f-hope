import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request, Get, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, SocialSignupDto } from './auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config'; // Import ConfigService

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private configService: ConfigService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Request() req) {
    // Initiates the Google OAuth2 login flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Request() req, @Res() res: Response) {
    const result = await this.authService.validateOAuthLogin(req.user);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    if (result.accessToken) {
      // User exists or linked, redirect with access token
      return res.redirect(`${frontendUrl}/dashboard?token=${result.accessToken}`);
    } else if (result.socialSignupToken) {
      // New user, redirect to social signup page with social signup token
      return res.redirect(`${frontendUrl}/social-signup?token=${result.socialSignupToken}`);
    }
  }

  @Post('social-signup')
  @HttpCode(HttpStatus.CREATED)
  async socialSignup(@Body() socialSignupDto: SocialSignupDto) {
    return this.authService.socialSignup(
      socialSignupDto.socialSignupToken,
      socialSignupDto.display_name,
      socialSignupDto.date_of_birth,
    );
  }
}
