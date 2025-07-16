import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StudentService } from './student.service';
import { CreateStudentDto, UpdateStudentDto } from './student.dto';

@UseGuards(JwtAuthGuard)
@Controller('students')
export class StudentController {
  constructor(private studentService: StudentService) {}

  @Post()
  async create(@Request() req, @Body() createStudentDto: CreateStudentDto) {
    return this.studentService.createStudent(req.user.userId, createStudentDto);
  }

  @Get()
  async findAll(@Request() req) {
    const students = await this.studentService.findAllStudents(req.user.userId);
    return students.map(student => {
      if (student.photo) {
         student.photo = this.studentService.getPublicUrlForPhoto(student.photo);
      }
      return student;
    });
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const student = await this.studentService.findOneStudent(req.user.userId, id);
    if (student.photo) {
      student.photo = this.studentService.getPublicUrlForPhoto(student.photo);
    }
    return student;
  }

  @Put(':id')
  async update(@Request() req, @Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    const updatedStudent = await this.studentService.updateStudent(req.user.userId, id, updateStudentDto);
    if (updatedStudent.photo) {
      updatedStudent.photo = this.studentService.getPublicUrlForPhoto(updatedStudent.photo);
    }
    return updatedStudent;
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    await this.studentService.deleteStudent(req.user.userId, id);
    return { message: 'Student deleted successfully' };
  }

  @Post(':id/photo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(@Request() req, @Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    const photoUrl = await this.studentService.uploadStudentPhoto(req.user.userId, id, file);
    return { photoUrl };
  }
}
