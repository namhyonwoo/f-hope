import { Injectable, BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileUploadService {
  private readonly uploadPath = join(__dirname, '..', '..', 'uploads');

  constructor() {
    if (!existsSync(this.uploadPath)) {
      mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File, subfolder: string = ''): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }

    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const destinationPath = join(this.uploadPath, subfolder);

    if (!existsSync(destinationPath)) {
      mkdirSync(destinationPath, { recursive: true });
    }

    const filePath = join(destinationPath, fileName);

    try {
      writeFileSync(filePath, file.buffer);
      // Return a path relative to the 'uploads' directory for storage in DB
      return join(subfolder, fileName).replace(/\\/g, '/'); // Normalize path for URL
    } catch (error) {
      console.error('File upload failed:', error);
      throw new BadRequestException('File upload failed.');
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    const fullPath = join(this.uploadPath, filePath);
    if (existsSync(fullPath)) {
      try {
        unlinkSync(fullPath);
      } catch (error) {
        console.error('File deletion failed:', error);
        throw new BadRequestException('File deletion failed.');
      }
    }
  }

  getPublicUrl(filePath: string): string {
    // In a real application, this would be your domain + /uploads/filePath
    // For development, we'll assume files are served from /uploads
    return `/uploads/${filePath}`;
  }
}
