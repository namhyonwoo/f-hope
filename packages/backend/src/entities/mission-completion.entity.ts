import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from './student.entity';
import { Mission } from './mission.entity';

@Entity('mission_completions')
export class MissionCompletion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  student_id: string; // Foreign key to Student entity

  @Column({ type: 'uuid' })
  mission_id: string; // Foreign key to Mission entity

  @Column({ type: 'date' })
  completion_date: Date; // 미션 수행 날짜

  @Column({ type: 'jsonb' })
  result: {
    completed: boolean; // 미션 수행 여부
    value?: number | boolean; // 수행 결과값 (숫자 또는 boolean)
    notes?: string; // 추가 메모
  };

  @Column({ type: 'int', default: 0 })
  talent_earned: number; // 획득한 달란트

  @Column({ type: 'uuid' })
  user_id: string; // Foreign key to User entity (teacher who recorded this)

  @ManyToOne(() => Student, student => student.missionCompletions)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Mission)
  @JoinColumn({ name: 'mission_id' })
  mission: Mission;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
} 