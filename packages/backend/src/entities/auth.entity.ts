import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from './user.entity'; // Import User entity

@Entity('auths') // This table will store authentication details
@Unique(['identifier', 'provider']) // Ensure unique identifier per provider
export class Auth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' }) // email for 'email' provider, social_id for 'google' etc.
  identifier: string;

  @Column({ type: 'text', nullable: true }) // Hashed password for 'email' provider, null for others
  credential: string | null;

  @Column({ type: 'text' }) // e.g., 'email', 'google'
  provider: string;

  @Column({ type: 'uuid' })
  user_id: string; // Foreign key to User entity

  @ManyToOne(() => User, user => user.auths)
  @JoinColumn({ name: 'user_id' })
  user: User; // Relationship with User entity

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
