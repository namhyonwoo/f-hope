import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassController } from './class.controller';
import { ClassService } from './class.service';
import { Class } from '../entities/class.entity';
import { Student } from '../entities/student.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Class, Student])],
  controllers: [ClassController],
  providers: [ClassService],
  exports: [ClassService],
})
export class ClassModule {} 