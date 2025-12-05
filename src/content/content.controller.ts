import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Patch,
    Body,
    Param,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { UpdateAboutDto } from './dto/update-about.dto';
import { CreateStatisticDto } from './dto/create-statistic.dto';
import { UpdateStatisticDto } from './dto/update-statistic.dto';
import { CreateSolutionDto } from './dto/create-solution.dto';
import { UpdateSolutionDto } from './dto/update-solution.dto';
import { ReorderDto } from './dto/reorder.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('content')
export class ContentController {
    constructor(private readonly contentService: ContentService) { }

    // About Section - Public
    @Get('about')
    getAboutSection() {
        return this.contentService.getAboutSection();
    }

    // About Section - Admin
    @Put('about')
    @UseGuards(JwtAuthGuard)
    updateAboutSection(@Body() updateAboutDto: UpdateAboutDto) {
        return this.contentService.updateAboutSection(updateAboutDto);
    }

    // Statistics - Public
    @Get('statistics')
    getAllStatistics() {
        return this.contentService.getAllStatistics();
    }

    // Statistics - Admin
    @Get('statistics/admin')
    @UseGuards(JwtAuthGuard)
    getAllStatisticsAdmin() {
        return this.contentService.getAllStatisticsAdmin();
    }

    @Get('statistics/:id')
    @UseGuards(JwtAuthGuard)
    getStatisticById(@Param('id', ParseIntPipe) id: number) {
        return this.contentService.getStatisticById(id);
    }

    @Post('statistics')
    @UseGuards(JwtAuthGuard)
    createStatistic(@Body() createStatisticDto: CreateStatisticDto) {
        return this.contentService.createStatistic(createStatisticDto);
    }

    @Put('statistics/:id')
    @UseGuards(JwtAuthGuard)
    updateStatistic(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateStatisticDto: UpdateStatisticDto,
    ) {
        return this.contentService.updateStatistic(id, updateStatisticDto);
    }

    @Delete('statistics/:id')
    @UseGuards(JwtAuthGuard)
    deleteStatistic(@Param('id', ParseIntPipe) id: number) {
        return this.contentService.deleteStatistic(id);
    }

    @Patch('statistics/reorder')
    @UseGuards(JwtAuthGuard)
    reorderStatistics(@Body() reorderDto: ReorderDto) {
        return this.contentService.reorderStatistics(reorderDto.items);
    }

    // Solutions - Public
    @Get('solutions')
    getAllSolutions() {
        return this.contentService.getAllSolutions();
    }

    // Solutions - Admin
    @Get('solutions/admin')
    @UseGuards(JwtAuthGuard)
    getAllSolutionsAdmin() {
        return this.contentService.getAllSolutionsAdmin();
    }

    @Get('solutions/:id')
    @UseGuards(JwtAuthGuard)
    getSolutionById(@Param('id', ParseIntPipe) id: number) {
        return this.contentService.getSolutionById(id);
    }

    @Post('solutions')
    @UseGuards(JwtAuthGuard)
    createSolution(@Body() createSolutionDto: CreateSolutionDto) {
        return this.contentService.createSolution(createSolutionDto);
    }

    @Put('solutions/:id')
    @UseGuards(JwtAuthGuard)
    updateSolution(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateSolutionDto: UpdateSolutionDto,
    ) {
        return this.contentService.updateSolution(id, updateSolutionDto);
    }

    @Delete('solutions/:id')
    @UseGuards(JwtAuthGuard)
    deleteSolution(@Param('id', ParseIntPipe) id: number) {
        return this.contentService.deleteSolution(id);
    }

    @Patch('solutions/reorder')
    @UseGuards(JwtAuthGuard)
    reorderSolutions(@Body() reorderDto: ReorderDto) {
        return this.contentService.reorderSolutions(reorderDto.items);
    }
}
