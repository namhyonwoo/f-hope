import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('missions')
export class Mission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string; // 미션 이름 (예: "성경책 가져오기", "성경읽기", "전도하기", "찬양대 참여")

  @Column({ type: 'text', nullable: true })
  description: string; // 미션 설명

  @Column({ type: 'jsonb' })
  config: {
    type: 'yes_no' | 'count' | 'number'; // 미션 타입: yes_no(예/아니오), count(횟수), number(숫자)
    unit?: string; // 단위 (예: "회", "명")
    max_value?: number; // 최대값 (선택사항)
    default_value?: number; // 기본값
  };

  @Column({ type: 'int' })
  talent_reward: number; // 달란트 보상

  @Column({ type: 'boolean', default: true })
  is_active: boolean; // 활성화 여부

  @Column({ type: 'int', default: 0 })
  sort_order: number; // 정렬 순서

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
} 