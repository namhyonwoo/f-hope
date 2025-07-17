import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Auth } from '../entities/auth.entity';
import { RegisterDto, LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Auth)
    private authsRepository: Repository<Auth>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ accessToken: string }> {
    const existingAuth = await this.authsRepository.findOne({ where: { email: registerDto.email, provider: 'email' } });
    if (existingAuth) {
      throw new BadRequestException('User with this email already exists');
    }

    const newUser = this.usersRepository.create({
      display_name: registerDto.display_name,
      role: 'teacher',
    });
    const user = await this.usersRepository.save(newUser);

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const newAuth = this.authsRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      provider: 'email',
      user: user, // Link to the newly created user
    });
    await this.authsRepository.save(newAuth);

    const payload = { email: newAuth.email, sub: user.id }; // Use user.id for sub
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const auth = await this.authsRepository.findOne({ where: { email: loginDto.email, provider: 'email' }, relations: ['user'] });
    if (!auth || !auth.user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!auth.password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(loginDto.password, auth.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: auth.email, sub: auth.user.id }; // Use auth.user.id for sub
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async validateUser(payload: any): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { id: payload.sub } });
    if (!user) {
      return null;
    }
    return { userId: user.id, email: payload.email, display_name: user.display_name };
  }

  async validateOAuthLogin(profile: any): Promise<{ accessToken?: string; socialSignupToken?: string }> {
    const { email, id: socialId, displayName } = profile;

    // 1. Check if an Auth entry with this socialId and provider 'google' already exists
    let auth = await this.authsRepository.findOne({
      where: { social_id: socialId, provider: 'google' },
      relations: ['user'],
    });

    if (auth) {
      // User already exists via Google, issue JWT
      const payload = { email: auth.email, sub: auth.user.id };
      return { accessToken: this.jwtService.sign(payload) };
    }

    // 2. Check if an Auth entry with this email and provider 'email' exists (for linking)
    auth = await this.authsRepository.findOne({
      where: { email, provider: 'email' },
      relations: ['user'],
    });

    if (auth) {
      // User exists with email, link Google account
      auth.social_id = socialId;
      auth.provider = 'google';
      await this.authsRepository.save(auth);
      const payload = { email: auth.email, sub: auth.user.id };
      return { accessToken: this.jwtService.sign(payload) };
    }

    // 3. New user, generate social signup token
    const socialSignupPayload = { email, socialId, displayName };
    return { socialSignupToken: this.jwtService.sign(socialSignupPayload, { expiresIn: '1h' }) };
  }

  async socialSignup(socialSignupToken: string, display_name: string, date_of_birth: string): Promise<{ accessToken: string }> {
    try {
      console.log('socialSignup: received socialSignupToken', socialSignupToken);
      const decoded = this.jwtService.verify(socialSignupToken);
      console.log('socialSignup: decoded token', decoded);
      const { email, socialId, displayName } = decoded;

      let user = await this.usersRepository.findOne({ where: { display_name: display_name } }); // Check if user with display name exists
      if (user) {
        throw new BadRequestException('User with this display name already exists.');
      }

      // Create new user
      const newUser = this.usersRepository.create({
        display_name,
        date_of_birth: new Date(date_of_birth),
        role: 'teacher',
      });
      user = await this.usersRepository.save(newUser);

      // Create auth entry for Google
      const newAuth = this.authsRepository.create({
        email,
        password: null, // No password for OAuth users
        provider: 'google',
        social_id: socialId,
        user: user,
      });
      console.log('socialSignup: newAuth object before saving', newAuth);
      await this.authsRepository.save(newAuth);

      const payload = { email, sub: user.id };
      return { accessToken: this.jwtService.sign(payload) };
    } catch (error) {
      console.error('socialSignup: token verification failed', error);
      throw new UnauthorizedException('Invalid or expired social signup token.');
    }
  }
}