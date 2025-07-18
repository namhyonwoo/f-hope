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
    console.log('AuthService: register attempt for email:', registerDto.email);
    
    const existingAuth = await this.authsRepository.findOne({ where: { identifier: registerDto.email, provider: 'email' } });
    console.log('AuthService: existing auth check:', existingAuth ? 'found' : 'not found');
    
    if (existingAuth) {
      throw new BadRequestException('User with this email already exists');
    }

    const newUser = this.usersRepository.create({
      display_name: registerDto.display_name,
      date_of_birth: new Date(registerDto.date_of_birth), // Save date of birth
      role: 'teacher',
    });
    const user = await this.usersRepository.save(newUser);
    console.log('AuthService: user created with ID:', user.id);

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const newAuth = this.authsRepository.create({
      identifier: registerDto.email,
      credential: hashedPassword,
      provider: 'email',
      user: user, // Link to the newly created user
    });
    await this.authsRepository.save(newAuth);
    console.log('AuthService: auth record created for user:', user.id);

    const payload = { email: newAuth.identifier, sub: user.id }; // Use identifier for email in payload
    console.log('AuthService: creating JWT payload for registration:', payload);
    
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    console.log('AuthService: login attempt for email:', loginDto.email);
    
    const auth = await this.authsRepository.findOne({ where: { identifier: loginDto.email, provider: 'email' }, relations: ['user'] });
    console.log('AuthService: found auth record:', auth ? 'yes' : 'no');
    
    if (!auth || !auth.user) {
      console.log('AuthService: no auth record or user found');
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!auth.credential) {
      console.log('AuthService: no credential found');
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const isPasswordValid = await bcrypt.compare(loginDto.password, auth.credential);
    console.log('AuthService: password validation result:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('AuthService: invalid password');
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: auth.identifier, sub: auth.user.id }; // Use identifier for email in payload
    console.log('AuthService: creating JWT payload:', payload);
    
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async validateUser(payload: any): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { id: payload.sub } });
    if (!user) {
      return null;
    }
    return { 
      id: user.id, 
      email: payload.email, 
      display_name: user.display_name,
      role: user.role 
    };
  }

  async validateOAuthLogin(profile: any): Promise<{ accessToken?: string; socialSignupToken?: string }> {
    const { email, id: socialId, displayName } = profile;

    // 1. Check if an Auth entry with this socialId and provider 'google' already exists
    let auth = await this.authsRepository.findOne({
      where: { identifier: socialId, provider: 'google' },
      relations: ['user'],
    });

    if (auth) {
      // User already exists via Google, issue JWT
      const payload = { email: auth.identifier, sub: auth.user.id };
      return { accessToken: this.jwtService.sign(payload) };
    }

    // 2. Check if an Auth entry with this email and provider 'email' exists (for linking)
    auth = await this.authsRepository.findOne({
      where: { identifier: email, provider: 'email' },
      relations: ['user'],
    });

    if (auth) {
      // User exists with email, link Google account
      auth.identifier = socialId;
      auth.provider = 'google';
      auth.credential = null; // Social logins don't have a password
      await this.authsRepository.save(auth);
      const payload = { email: auth.identifier, sub: auth.user.id };
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
        identifier: socialId, // Use socialId as identifier for social logins
        credential: null, // No password for OAuth users
        provider: 'google',
        user: user,
      });
      console.log('socialSignup: newAuth object before saving', newAuth);
      await this.authsRepository.save(newAuth);

      const payload = { email: email, sub: user.id }; // Use original email for payload
      return { accessToken: this.jwtService.sign(payload) };
    } catch (error) {
      console.error('socialSignup: token verification failed', error);
      throw new UnauthorizedException('Invalid or expired social signup token.');
    }
  }
}
