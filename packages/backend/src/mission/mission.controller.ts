import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MissionService } from './mission.service';
import { 
  CreateMissionDto, 
  UpdateMissionDto, 
  CreateMissionCompletionDto, 
  UpdateMissionCompletionDto,
  BulkMissionCompletionDto 
} from './mission.dto';

@UseGuards(JwtAuthGuard)
@Controller('missions')
export class MissionController {
  constructor(private missionService: MissionService) {}

  // 미션 CRUD
  @Post()
  async createMission(@Request() req, @Body() createMissionDto: CreateMissionDto) {
    return this.missionService.createMission(req.user.userId, createMissionDto);
  }

  @Get()
  async getAllMissions() {
    return this.missionService.findAllMissions();
  }

  @Get(':id')
  async getMission(@Param('id') id: string) {
    return this.missionService.findOneMission(id);
  }

  @Put(':id')
  async updateMission(@Request() req, @Param('id') id: string, @Body() updateMissionDto: UpdateMissionDto) {
    return this.missionService.updateMission(id, updateMissionDto);
  }

  @Delete(':id')
  async deleteMission(@Param('id') id: string) {
    await this.missionService.deleteMission(id);
    return { message: '미션이 삭제되었습니다.' };
  }

  // 미션 수행 관리
  @Post('completions')
  async createMissionCompletion(@Request() req, @Body() createMissionCompletionDto: CreateMissionCompletionDto) {
    return this.missionService.createMissionCompletion(req.user.userId, createMissionCompletionDto);
  }

  @Put('completions/:id')
  async updateMissionCompletion(@Request() req, @Param('id') id: string, @Body() updateMissionCompletionDto: UpdateMissionCompletionDto) {
    return this.missionService.updateMissionCompletion(req.user.userId, id, updateMissionCompletionDto);
  }

  @Post('completions/bulk')
  async bulkCreateMissionCompletions(@Request() req, @Body() bulkDto: BulkMissionCompletionDto) {
    return this.missionService.bulkCreateMissionCompletions(req.user.userId, bulkDto);
  }

  @Get('students/:studentId/completions')
  async getStudentMissionCompletions(
    @Request() req, 
    @Param('studentId') studentId: string, 
    @Query('date') date: string
  ) {
    return this.missionService.getStudentMissionCompletions(req.user.userId, studentId, date);
  }

  @Get('students/:studentId/talents')
  async getStudentTalents(@Request() req, @Param('studentId') studentId: string) {
    return this.missionService.getStudentTalents(req.user.userId, studentId);
  }
} 