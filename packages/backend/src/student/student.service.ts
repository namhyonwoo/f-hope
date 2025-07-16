import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../entities/student.entity';
import { CreateStudentDto, UpdateStudentDto } from './student.dto';
import { FileUploadService } from '../file-upload/file-upload.service';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    private fileUploadService: FileUploadService,
  ) {}

  async createStudent(userId: string, createStudentDto: CreateStudentDto): Promise<Student> {
    const newStudent = this.studentsRepository.create({ ...createStudentDto, user_id: userId });
    return this.studentsRepository.save(newStudent);
  }

  async findAllStudents(userId: string): Promise<Student[]> {
    return this.studentsRepository.find({ where: { user_id: userId }, order: { name: 'ASC' } });
  }

  async findOneStudent(userId: string, id: string): Promise<Student> {
    const student = await this.studentsRepository.findOne({ where: { id, user_id: userId } });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    return student;
  }

  async updateStudent(userId: string, id: string, updateStudentDto: UpdateStudentDto): Promise<Student> {
    const student = await this.findOneStudent(userId, id); // Ensure student belongs to user
    await this.studentsRepository.update(id, updateStudentDto);
    return this.findOneStudent(userId, id);
  }

  async deleteStudent(userId: string, id: string): Promise<void> {
    const student = await this.findOneStudent(userId, id); // Ensure student belongs to user
    
    // Delete student photo if exists
    if (student.photo) {
      await this.fileUploadService.deleteFile(student.photo);
    }

    await this.studentsRepository.delete(id);
  }

  async uploadStudentPhoto(userId: string, studentId: string, file: Express.Multer.File): Promise<string> {
    const student = await this.findOneStudent(userId, studentId);

    // Delete old photo if exists
    if (student.photo) {
      await this.fileUploadService.deleteFile(student.photo);
    }

    const photoPath = await this.fileUploadService.uploadFile(file, `students/${studentId}`);
    await this.studentsRepository.update(studentId, { photo: photoPath });

    return this.fileUploadService.getPublicUrl(photoPath);
  }

  getPublicUrlForPhoto(path: string): string {
    return this.fileUploadService.getPublicUrl(path);
  }
}
