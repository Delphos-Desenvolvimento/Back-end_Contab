import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UnauthorizedException,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuditService } from '../audit/audit.service';

@Controller('admin/users')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly auditService: AuditService,
  ) {}

  @Post()
  async create(@Body() body: { user: string; password: string }) {
    console.log('Received user creation request:', { user: body.user });
    try {
      const user = await this.adminService.create(body);
      await this.auditService.log({
        type: 'admin_create',
        path: '/admin/users',
      });
      return { message: 'User created successfully', user };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new UnauthorizedException(error.message);
      }
      throw new UnauthorizedException('User creation failed');
    }
  }

  @Get()
  async findAll() {
    try {
      const users = await this.adminService.findAll();
      return { users };
    } catch {
      throw new UnauthorizedException('Not authorized to view users');
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const user = await this.adminService.findOne(id);
      return { user };
    } catch {
      throw new UnauthorizedException('Not authorized to view user');
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: ExpressRequest) {
    const auth = (
      req as unknown as { user?: { userId?: number; email?: string } }
    ).user;
    const id = auth?.userId;
    if (typeof id !== 'number') {
      throw new UnauthorizedException('Invalid user');
    }
    const user = await this.adminService.findOne(id);
    return { user };
  }

  @Post('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(
    @Req() req: ExpressRequest,
    @Body()
    body: { user?: string; password?: string; role?: string; name?: string },
  ) {
    const auth = (
      req as unknown as { user?: { userId?: number; email?: string } }
    ).user;
    const id = auth?.userId;
    if (typeof id !== 'number') {
      throw new UnauthorizedException('Invalid user');
    }
    const updated = await this.adminService.update(id, body);
    await this.auditService.log({
      type: 'admin_update_me',
      userId: id,
      path: '/admin/users/me',
    });
    return { user: updated };
  }
}
