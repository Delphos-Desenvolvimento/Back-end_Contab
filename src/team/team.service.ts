import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamService {
    constructor(private prisma: PrismaService) { }

    // Obter página da equipe (público - apenas se publicado)
    async getTeamPage() {
        let page = await this.prisma.teamPage.findFirst({
            where: { isPublished: true },
        });

        // Se não existir, criar com valores padrão
        if (!page) {
            page = await this.prisma.teamPage.create({
                data: {
                    title: 'Nossa Equipe',
                    content: '<p>Conteúdo da página da equipe.</p>',
                    isPublished: false,
                },
            });
        }

        return page;
    }

    // Obter página da equipe para admin (independente de publicação)
    async getTeamPageAdmin() {
        let page = await this.prisma.teamPage.findFirst();

        // Se não existir, criar com valores padrão
        if (!page) {
            page = await this.prisma.teamPage.create({
                data: {
                    title: 'Nossa Equipe',
                    content: '<p>Conteúdo da página da equipe.</p>',
                    isPublished: false,
                },
            });
        }

        return page;
    }

    // Atualizar página da equipe
    async updateTeamPage(updateTeamDto: UpdateTeamDto) {
        // Buscar a primeira (e única) página
        let page = await this.prisma.teamPage.findFirst();

        // Se não existir, criar
        if (!page) {
            page = await this.prisma.teamPage.create({
                data: {
                    title: updateTeamDto.title || 'Nossa Equipe',
                    content: updateTeamDto.content || '<p>Conteúdo da página da equipe.</p>',
                    isPublished: updateTeamDto.isPublished ?? false,
                },
            });
        } else {
            // Atualizar
            page = await this.prisma.teamPage.update({
                where: { id: page.id },
                data: updateTeamDto,
            });
        }

        return page;
    }
}
