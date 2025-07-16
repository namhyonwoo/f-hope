import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { FileUploadService } from '../file-upload/file-upload.service';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private fileUploadService: FileUploadService,
  ) {}

  async getProfile(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(userId: string, updateData: Partial<User>): Promise<User> {
    await this.usersRepository.update(userId, updateData);
    return this.getProfile(userId);
  }

  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<string> {
    const user = await this.getProfile(userId);

    // Delete old avatar if exists
    if (user.avatar_url) {
      await this.fileUploadService.deleteFile(user.avatar_url);
    }

    const avatarPath = await this.fileUploadService.uploadFile(file, 'avatars');
    await this.usersRepository.update(userId, { avatar_url: avatarPath });

    return this.fileUploadService.getPublicUrl(avatarPath);
  }

  getPublicUrlForAvatar(path: string): string {
    return this.fileUploadService.getPublicUrl(path);
  }
}