import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../entities/user.entity'; // Import User entity
import { Auth } from '../entities/auth.entity'; // Import Auth entity
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Auth]), // Register User and Auth entities
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' }, // Token expiration time
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  providers: [AuthService, JwtStrategy, GoogleStrategy], // UserService is no longer directly provided here
  controllers: [AuthController],
  exports: [AuthService], // Export AuthService
})
export class AuthModule {}