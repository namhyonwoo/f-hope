import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from '../entities/class.entity';
import { Student } from '../entities/student.entity';
import { CreateClassDto, UpdateClassDto, AssignStudentToClassDto } from './class.dto';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {}

  async createClass(userId: string, createClassDto: CreateClassDto): Promise<Class> {
    const newClass = this.classRepository.create({
      ...createClassDto,
      user_id: userId,
    });
    return this.classRepository.save(newClass);
  }

  async findAllClasses(userId: string): Promise<Class[]> {
    return this.classRepository.find({
      where: { user_id: userId },
      relations: ['students'],
      order: { created_at: 'DESC' },
    });
  }

  async findOneClass(userId: string, classId: string): Promise<Class> {
    const class_ = await this.classRepository.findOne({
      where: { id: classId, user_id: userId },
      relations: ['students'],
    });

    if (!class_) {
      throw new NotFoundException('반을 찾을 수 없습니다.');
    }

    return class_;
  }

  async updateClass(userId: string, classId: string, updateClassDto: UpdateClassDto): Promise<Class> {
    const class_ = await this.findOneClass(userId, classId);
    
    Object.assign(class_, updateClassDto);
    return this.classRepository.save(class_);
  }

  async deleteClass(userId: string, classId: string): Promise<void> {
    const class_ = await this.findOneClass(userId, classId);
    
    // 반에 속한 학생들의 class_id를 null로 설정
    await this.studentRepository.update(
      { class_id: classId },
      { class_id: undefined }
    );

    await this.classRepository.remove(class_);
  }

  async assignStudentToClass(userId: string, assignDto: AssignStudentToClassDto): Promise<Student> {
    // 학생이 해당 선생님의 것인지 확인
    const student = await this.studentRepository.findOne({
      where: { id: assignDto.studentId, user_id: userId },
    });

    if (!student) {
      throw new NotFoundException('학생을 찾을 수 없습니다.');
    }

    // 반이 해당 선생님의 것인지 확인
    const class_ = await this.classRepository.findOne({
      where: { id: assignDto.classId, user_id: userId },
    });

    if (!class_) {
      throw new NotFoundException('반을 찾을 수 없습니다.');
    }

    student.class_id = assignDto.classId;
    return this.studentRepository.save(student);
  }

  async removeStudentFromClass(userId: string, studentId: string): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId, user_id: userId },
    });

    if (!student) {
      throw new NotFoundException('학생을 찾을 수 없습니다.');
    }

    student.class_id = undefined;
    return this.studentRepository.save(student);
  }

  async getClassWithStudents(userId: string, classId: string): Promise<Class> {
    const class_ = await this.classRepository.findOne({
      where: { id: classId, user_id: userId },
      relations: ['students'],
      order: { students: { name: 'ASC' } },
    });

    if (!class_) {
      throw new NotFoundException('반을 찾을 수 없습니다.');
    }

    return class_;
  }
} 