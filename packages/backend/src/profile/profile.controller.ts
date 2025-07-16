import { Controller, Get, Put, Body, UseGuards, Request, UseInterceptors, UploadedFile, Post } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './profile.dto';

@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get()
  async getProfile(@Request() req) {
    const user = await this.profileService.getProfile(req.user.userId);
    // Return public URL for avatar
    if (user.avatar_url) {
      user.avatar_url = this.profileService.getPublicUrlForAvatar(user.avatar_url);
    }
    return user;
  }

  @Put()
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    const updatedUser = await this.profileService.updateProfile(req.user.userId, updateProfileDto);
    // Return public URL for avatar
    if (updatedUser.avatar_url) {
      updatedUser.avatar_url = this.profileService.getPublicUrlForAvatar(updatedUser.avatar_url);
    }
    return updatedUser;
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    const avatarUrl = await this.profileService.uploadAvatar(req.user.userId, file);
    return { avatarUrl };
  }
}
