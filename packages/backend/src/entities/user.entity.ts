import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Student } from './student.entity';
import { AttendanceRecord } from './attendance-record.entity';
import { Auth } from './auth.entity'; // Import Auth entity
import { Class } from './class.entity';

@Entity('users') // This table will store user profile information
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  display_name: string;

  @Column({ type: 'text', nullable: true })
  email: string; // 추가된 email 필드

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  @Column({ type: 'text', nullable: true })
  avatar_url: string;

  @Column({ type: 'text', default: 'teacher' })
  role: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToMany(() => Auth, auth => auth.user)
  auths: Auth[]; // One user can have multiple authentication methods

  @OneToMany(() => Student, student => student.user)
  students: Student[];

  @OneToMany(() => AttendanceRecord, attendanceRecord => attendanceRecord.user)
  attendanceRecords: AttendanceRecord[];

  @OneToMany(() => Class, class_ => class_.user)
  classes: Class[];
}