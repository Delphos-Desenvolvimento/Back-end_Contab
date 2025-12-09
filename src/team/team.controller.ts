import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { TeamService } from './team.service';
import { UpdateTeamDto } from './dto/update-team.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuditService } from '../audit/audit.service';

@Controller('team')
export class TeamController {
  constructor(
    private readonly teamService: TeamService,
    private readonly auditService: AuditService,
  ) {}

  // Rota pública - retorna apenas se publicado
  @Get()
  getTeamPage() {
    return this.teamService.getTeamPage();
  }

  // Rota admin - retorna independente de publicação
  @Get('admin')
  @UseGuards(JwtAuthGuard)
  getTeamPageAdmin() {
    return this.teamService.getTeamPageAdmin();
  }

  // Atualizar página
  @Put()
  @UseGuards(JwtAuthGuard)
  updateTeamPage(
    @Body() updateTeamDto: UpdateTeamDto,
    @Req() req: ExpressRequest,
  ) {
    const userId = (req as ExpressRequest & { user?: { userId?: number } }).user
      ?.userId;
    const path = req.url;
    return this.teamService.updateTeamPage(updateTeamDto).then(async (page) => {
      await this.auditService.log({ type: 'team_update', userId, path });
      return page;
    });
  }
}
