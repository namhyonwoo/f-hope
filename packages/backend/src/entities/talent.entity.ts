import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from './student.entity';

@Entity('talents')
export class Talent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  student_id: string; // Foreign key to Student entity

  @Column({ type: 'int', default: 0 })
  total_talents: number; // 총 달란트

  @Column({ type: 'int', default: 0 })
  earned_talents: number; // 획득한 달란트

  @Column({ type: 'int', default: 0 })
  spent_talents: number; // 사용한 달란트

  @Column({ type: 'jsonb', nullable: true })
  history: {
    date: string;
    type: 'earned' | 'spent';
    amount: number;
    source?: string; // 달란트 획득/사용 원인
    mission_id?: string; // 미션 관련인 경우
  }[]; // 달란트 변동 이력

  @Column({ type: 'uuid' })
  user_id: string; // Foreign key to User entity (teacher who manages this)

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  talent_date: Date; // 달란트 생성일자

  @ManyToOne(() => Student, student => student.talents)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
} 