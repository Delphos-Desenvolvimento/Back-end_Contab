import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(
    @Body() userData: { email: string; password: string; role?: string },
  ) {
    try {
      const { email, password, role } = userData;
      const user = await this.authService.createUser(email, password, role);
      return {
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.user, // user.user contains the email
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new UnauthorizedException(error.message);
      }
      throw new UnauthorizedException('Registration failed');
    }
  }
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: { user?: unknown }) {
    return req.user ?? null;
  }
}
