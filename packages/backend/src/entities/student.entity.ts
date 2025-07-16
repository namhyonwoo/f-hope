import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity'; // Import User entity
import { AttendanceRecord } from './attendance-record.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'date', nullable: true })
  birthday: Date;

  @Column({ type: 'text', nullable: true })
  photo: string;

  @Column({ type: 'text', nullable: true })
  parent_contact: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'uuid' })
  user_id: string; // Foreign key to User entity

  @ManyToOne(() => User, user => user.students)
  @JoinColumn({ name: 'user_id' })
  user: User; // Relationship with User entity

  @OneToMany(() => AttendanceRecord, attendanceRecord => attendanceRecord.student)
  attendanceRecords: AttendanceRecord[];

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
