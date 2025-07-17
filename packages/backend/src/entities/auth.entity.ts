import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from './user.entity'; // Import User entity

@Entity('auths') // This table will store authentication details
@Unique(['social_id', 'provider']) // Ensure unique email per provider
export class Auth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  email: string;

  @Column({ type: 'text', nullable: true }) // Nullable for social logins
  password: string | null; // Hashed password

  @Column({ type: 'text', default: 'email' })
  provider: string; // e.g., 'email', 'google'

  @Column({ type: 'text', nullable: true }) // Store social ID (e.g., Google ID)
  social_id: string | null;

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
