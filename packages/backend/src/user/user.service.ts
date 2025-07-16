import { Injectable, NotFoundException } from '@nestjs/common'; // Import NotFoundException
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Auth } from '../entities/auth.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Auth)
    private authsRepository: Repository<Auth>,
  ) {}

  async createUser(userData: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(userData);
    return this.usersRepository.save(newUser);
  }

  async findUserById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    const auth = await this.authsRepository.findOne({ where: { email }, relations: ['user'] });
    return auth ? auth.user : undefined;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, userData);
    const updatedUser = await this.findUserById(id);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found after update.`);
    }
    return updatedUser;
  }
}
