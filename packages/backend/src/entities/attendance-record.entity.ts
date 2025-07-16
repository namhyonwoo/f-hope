import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Student } from './student.entity';
import { User } from './user.entity'; // Import User entity

@Entity('attendance_records')
@Unique(['student_id', 'attendance_date']) // Composite unique constraint
export class AttendanceRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  student_id: string;

  @ManyToOne(() => Student, student => student.attendanceRecords)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ type: 'uuid' })
  user_id: string; // Foreign key to User entity

  @ManyToOne(() => User, user => user.attendanceRecords)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  attendance_date: Date;

  @Column({ type: 'boolean', default: false })
  is_present: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
