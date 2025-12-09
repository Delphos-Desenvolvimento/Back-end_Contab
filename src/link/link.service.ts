import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { Link } from '@prisma/client';

@Injectable()
export class LinkService {
  constructor(private prisma: PrismaService) {}

  async create(createLinkDto: CreateLinkDto): Promise<Link> {
    return await this.prisma.link.create({
      data: createLinkDto,
    });
  }

  async findAll(): Promise<Link[]> {
    return await this.prisma.link.findMany({
      orderBy: {
        order: 'asc',
      },
    });
  }

  async findAllActive(): Promise<Link[]> {
    return await this.prisma.link.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        order: 'asc',
      },
    });
  }

  async findOne(id: number): Promise<Link> {
    const link = await this.prisma.link.findUnique({
      where: { id },
    });
    if (!link) {
      throw new NotFoundException(`Link com ID ${id} não encontrado`);
    }
    return link;
  }

  async update(id: number, updateLinkDto: UpdateLinkDto): Promise<Link> {
    await this.findOne(id); // Verifica se existe
    return await this.prisma.link.update({
      where: { id },
      data: updateLinkDto,
    });
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // Verifica se existe
    await this.prisma.link.delete({
      where: { id },
    });
  }

  async updateOrder(updates: { id: number; order: number }[]): Promise<void> {
    await this.prisma.$transaction(
      updates.map((update) =>
        this.prisma.link.update({
          where: { id: update.id },
          data: { order: update.order },
        }),
      ),
    );
  }
}
