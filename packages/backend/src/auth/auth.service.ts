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

  // For Google OAuth, you would typically have a separate strategy and a callback
  // This is a placeholder for future integration
  async validateOAuthLogin(email: string, display_name: string): Promise<{ accessToken: string }> {
    let auth = await this.authsRepository.findOne({ where: { email, provider: 'google' }, relations: ['user'] });
    let user: User;

    if (!auth) {
      // Create user if not exists
      const newUser = this.usersRepository.create({
        display_name,
        role: 'teacher',
      });
      user = await this.usersRepository.save(newUser);

      // Create auth entry for Google
      auth = this.authsRepository.create({
        email,
        password: null, // No password for OAuth users
        provider: 'google',
        user: user,
      });
      await this.authsRepository.save(auth);
    } else {
      user = auth.user;
    }

    const payload = { email: auth.email, sub: user.id };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}