import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePartnerDto, UpdatePartnerDto } from './DTO/partner.dto';

@Injectable()
export class PartnersService {
    constructor(private prisma: PrismaService) { }

    async create(createPartnerDto: CreatePartnerDto) {
        return this.prisma.partner.create({
            data: {
                name: createPartnerDto.name,
                logoBase64: createPartnerDto.logoBase64,
                displayOrder: createPartnerDto.displayOrder ?? 0,
                active: createPartnerDto.active ?? true,
            },
            select: {
                id: true,
                name: true,
                logoBase64: true,
                displayOrder: true,
                active: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async findAll(activeOnly: boolean = false) {
        return this.prisma.partner.findMany({
            where: activeOnly ? { active: true } : undefined,
            orderBy: [
                { displayOrder: 'asc' },
                { createdAt: 'desc' },
            ],
            select: {
                id: true,
                name: true,
                logoBase64: true,
                displayOrder: true,
                active: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async findOne(id: number) {
        const partner = await this.prisma.partner.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                logoBase64: true,
                displayOrder: true,
                active: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!partner) {
            throw new NotFoundException(`Partner with ID ${id} not found`);
        }

        return partner;
    }

    async update(id: number, updatePartnerDto: UpdatePartnerDto) {
        // Check if partner exists
        await this.findOne(id);

        return this.prisma.partner.update({
            where: { id },
            data: {
                ...(updatePartnerDto.name !== undefined && { name: updatePartnerDto.name }),
                ...(updatePartnerDto.logoBase64 !== undefined && { logoBase64: updatePartnerDto.logoBase64 }),
                ...(updatePartnerDto.displayOrder !== undefined && { displayOrder: updatePartnerDto.displayOrder }),
                ...(updatePartnerDto.active !== undefined && { active: updatePartnerDto.active }),
            },
            select: {
                id: true,
                name: true,
                logoBase64: true,
                displayOrder: true,
                active: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async remove(id: number) {
        // Check if partner exists
        await this.findOne(id);

        return this.prisma.partner.delete({
            where: { id },
        });
    }
}
