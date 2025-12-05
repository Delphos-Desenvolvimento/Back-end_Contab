import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { TeamService } from './team.service';
import { UpdateTeamDto } from './dto/update-team.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('team')
export class TeamController {
    constructor(private readonly teamService: TeamService) { }

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
    updateTeamPage(@Body() updateTeamDto: UpdateTeamDto) {
        return this.teamService.updateTeamPage(updateTeamDto);
    }
}
