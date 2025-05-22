import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from '@database/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { HandleErrorException } from '@utils/hooks/handle-error-exception';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      await this.userRepository.save(user);

      delete user.password;

      return user;
    } catch (error) {
      HandleErrorException.handleError(error, this.logger);
    }
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) throw new NotFoundException(`User with id '${id}' not found`);

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (!updateUserDto) throw new BadRequestException(`Invalid data`);

    const user = await this.findOne(id);

    const { password, ...userData } = updateUserDto;

    Object.assign(user, userData);

    if (password) {
      user.password = bcrypt.hashSync(password, 10);
    }

    try {
      await this.userRepository.save(user);
      delete user.password;

      return user;
    } catch (error) {
      HandleErrorException.handleError(error, this.logger);
    }
  }

  async remove(id: string) {
    const user = await this.findOne(id);

    await this.userRepository.remove(user);

    return { message: `User with id '${id}' deleted` };
  }
}
