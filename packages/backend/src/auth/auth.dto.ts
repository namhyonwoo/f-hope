import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsString()
  display_name: string;

  @IsString()
  date_of_birth: string; // Assuming YYYY-MM-DD format
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class SocialSignupDto {
  @IsString()
  socialSignupToken: string;

  @IsString()
  display_name: string;

  @IsString()
  date_of_birth: string; // Assuming YYYY-MM-DD format
}
