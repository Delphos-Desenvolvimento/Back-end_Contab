import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAboutDto } from './dto/update-about.dto';
import { CreateStatisticDto } from './dto/create-statistic.dto';
import { UpdateStatisticDto } from './dto/update-statistic.dto';
import { CreateSolutionDto } from './dto/create-solution.dto';
import { UpdateSolutionDto } from './dto/update-solution.dto';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  // About Section
  async getAboutSection() {
    try {
      let about = await this.prisma.aboutSection.findFirst();
      if (!about) {
        about = await this.prisma.aboutSection.create({
          data: {
            overline: 'Sobre Nós',
            title: 'A Contab é líder em tecnologia para gestão pública',
            subtitle:
              'Somos a evolução da gestão pública, com soluções inovadoras para arrecadar mais, atender melhor e acelerar a transformação digital com um sistema de gestão pública em nuvem.',
          },
        });
      }
      return about;
    } catch (e: unknown) {
      const err = e as { code?: string };
      if (err && err.code === 'P1001') {
        const now = new Date().toISOString();
        return {
          id: 0,
          overline: 'Sobre Nós',
          title: 'A Contab é líder em tecnologia para gestão pública',
          subtitle:
            'Somos a evolução da gestão pública, com soluções inovadoras para arrecadar mais, atender melhor e acelerar a transformação digital com um sistema de gestão pública em nuvem.',
          solutionsOverline: 'Nossas Soluções',
          solutionsTitle:
            'Transforme sua gestão com nossas soluções inteligentes',
          solutionsSubtitle:
            'Oferecemos um ecossistema completo de soluções em nuvem para modernizar e otimizar todos os processos da gestão pública.',
          createdAt: now,
          updatedAt: now,
        } as unknown as { id: number };
      }
      throw e;
    }
  }

  async updateAboutSection(data: UpdateAboutDto) {
    const existing = await this.getAboutSection();

    return this.prisma.aboutSection.update({
      where: { id: existing.id },
      data,
    });
  }

  // Statistics
  async getAllStatistics() {
    try {
      return this.prisma.statistic.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      });
    } catch (e: unknown) {
      const err = e as { code?: string };
      if (err && err.code === 'P1001') return [];
      throw e;
    }
  }

  async getAllStatisticsAdmin() {
    try {
      return this.prisma.statistic.findMany({
        orderBy: { order: 'asc' },
      });
    } catch (e: unknown) {
      const err = e as { code?: string };
      if (err && err.code === 'P1001') return [];
      throw e;
    }
  }

  async getStatisticById(id: number) {
    const statistic = await this.prisma.statistic.findUnique({
      where: { id },
    });

    if (!statistic) {
      throw new NotFoundException(`Statistic with ID ${id} not found`);
    }

    return statistic;
  }

  async createStatistic(data: CreateStatisticDto) {
    // Obter o próximo order
    const maxOrder = await this.prisma.statistic.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    return this.prisma.statistic.create({
      data: {
        ...data,
        order: data.order ?? (maxOrder?.order ?? 0) + 1,
      },
    });
  }

  async updateStatistic(id: number, data: UpdateStatisticDto) {
    await this.getStatisticById(id); // Verifica se existe

    return this.prisma.statistic.update({
      where: { id },
      data,
    });
  }

  async deleteStatistic(id: number) {
    await this.getStatisticById(id); // Verifica se existe

    return this.prisma.statistic.delete({
      where: { id },
    });
  }

  async reorderStatistics(items: Array<{ id: number; order: number }>) {
    const updates = items.map((item) =>
      this.prisma.statistic.update({
        where: { id: item.id },
        data: { order: item.order },
      }),
    );

    await this.prisma.$transaction(updates);
    return { success: true };
  }

  // Solutions
  async getAllSolutions() {
    try {
      return this.prisma.solution.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      });
    } catch (e: unknown) {
      const err = e as { code?: string };
      if (err && err.code === 'P1001') return [];
      throw e;
    }
  }

  async getAllSolutionsAdmin() {
    try {
      return this.prisma.solution.findMany({
        orderBy: { order: 'asc' },
      });
    } catch (e: unknown) {
      const err = e as { code?: string };
      if (err && err.code === 'P1001') return [];
      throw e;
    }
  }

  async getSolutionById(id: number) {
    const solution = await this.prisma.solution.findUnique({
      where: { id },
    });

    if (!solution) {
      throw new NotFoundException(`Solution with ID ${id} not found`);
    }

    return solution;
  }

  async createSolution(data: CreateSolutionDto) {
    // Obter o próximo order
    const maxOrder = await this.prisma.solution.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    return this.prisma.solution.create({
      data: {
        ...data,
        order: data.order ?? (maxOrder?.order ?? 0) + 1,
      },
    });
  }

  async updateSolution(id: number, data: UpdateSolutionDto) {
    await this.getSolutionById(id); // Verifica se existe

    return this.prisma.solution.update({
      where: { id },
      data,
    });
  }

  async deleteSolution(id: number) {
    await this.getSolutionById(id); // Verifica se existe

    return this.prisma.solution.delete({
      where: { id },
    });
  }

  async reorderSolutions(items: Array<{ id: number; order: number }>) {
    const updates = items.map((item) =>
      this.prisma.solution.update({
        where: { id: item.id },
        data: { order: item.order },
      }),
    );

    await this.prisma.$transaction(updates);
    return { success: true };
  }
}
