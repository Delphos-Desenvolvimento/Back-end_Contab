import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface AdminUser {
  id: number;
  user: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginResponse {
  access_token: string;
  user: Omit<AdminUser, 'password'>;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly saltRounds = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<AdminUser | null> {
    this.logger.log(`Validating user: ${email}`);

    try {
      if (!email) {
        throw new Error('Email is required');
      }

      // Find user with case-insensitive email search
      const user = await this.prisma.admin.findFirst({
        where: {
          user: email.toLowerCase(),
        },
        select: {
          id: true,
          user: true,
          password: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        this.logger.warn(`User not found: ${email}`);
        return null;
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        this.logger.warn(`Invalid password for user: ${email}`);
        return null;
      }

      // Return user data without password
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = user;
      return result as AdminUser;
    } catch (error) {
      this.logger.error(`Error validating user: ${error.message}`, error.stack);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto;

    try {
      const user = await this.validateUser(email, password);

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = {
        sub: user.id,
        email: user.user,
        role: user.role,
      };

      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          user: user.user,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      };
    } catch (error) {
      this.logger.error(`Login error: ${error.message}`, error.stack);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  async createUser(email: string, password: string, role: string = 'USER') {
    try {
      // Validate required fields
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Sanitize and validate email
      const sanitizedEmail = email?.toString()?.trim()?.toLowerCase();
      if (!sanitizedEmail) {
        throw new Error('Email is required');
      }

      // Check if user already exists (case-insensitive)
      const existingUser = await this.prisma.admin.findFirst({
        where: {
          user: sanitizedEmail,
        },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, this.saltRounds);

      // Sanitize and validate role
      const sanitizedRole = (role || 'USER').toString().toUpperCase();
      if (!['ADMIN', 'USER'].includes(sanitizedRole)) {
        throw new Error('Invalid role. Must be either ADMIN or USER');
      }

      // Create new user with the correct fields
      const newUser = await this.prisma.admin.create({
        data: {
          user: sanitizedEmail,
          password: hashedPassword,
          role: sanitizedRole,
        },
        select: {
          id: true,
          user: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      this.logger.log(`Created new user: ${sanitizedEmail}`);
      return newUser;
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getAllUsers() {
    try {
      const allUsers = await this.prisma.admin.findMany({
        select: {
          id: true,
          user: true,
          role: true,
        },
      });
      return allUsers;
    } catch (error) {
      this.logger.error(`Error fetching users: ${error.message}`, error.stack);
      throw error;
    }
  }
}
