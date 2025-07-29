import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { AttendanceRecord } from './entities/attendance-record.entity';
import { User } from './entities/user.entity';
import { Auth } from './entities/auth.entity';
import { Class } from './entities/class.entity';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from './auth/auth.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { ProfileModule } from './profile/profile.module';
import { StudentModule } from './student/student.module';
import { AttendanceModule } from './attendance/attendance.module';
import { ClassModule } from './class/class.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.FLOCKS_DB_HOST,
      port: parseInt(process.env.FLOCKS_DB_PORT || '5432', 10),
      username: process.env.FLOCKS_DB_USER,
      password: process.env.FLOCKS_DB_PASSWORD,
      database: process.env.FLOCKS_DB_NAME,
      entities: [User, Auth, Student, AttendanceRecord, Class], // Updated entities list
      synchronize: true,
    }),
    MulterModule.register({
      dest: './uploads',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'frontend', 'dist'),
    }),
    AuthModule,
    FileUploadModule,
    ProfileModule,
    StudentModule,
    AttendanceModule,
    ClassModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}