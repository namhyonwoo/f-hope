import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity'; // Import User entity
import { AttendanceRecord } from './attendance-record.entity';
import { Class } from './class.entity';
import { MissionCompletion } from './mission-completion.entity';
import { Talent } from './talent.entity';

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

  @Column({ type: 'uuid', nullable: true })
  class_id?: string; // Foreign key to Class entity

  @ManyToOne(() => User, user => user.students)
  @JoinColumn({ name: 'user_id' })
  user: User; // Relationship with User entity

  @ManyToOne(() => Class, class_ => class_.students)
  @JoinColumn({ name: 'class_id' })
  class?: Class; // Relationship with Class entity

  @OneToMany(() => AttendanceRecord, attendanceRecord => attendanceRecord.student)
  attendanceRecords: AttendanceRecord[];

  @OneToMany(() => MissionCompletion, missionCompletion => missionCompletion.student)
  missionCompletions: MissionCompletion[];

  @OneToMany(() => Talent, talent => talent.student)
  talents: Talent[];

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
