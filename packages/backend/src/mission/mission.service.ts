import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mission } from '../entities/mission.entity';
import { MissionCompletion } from '../entities/mission-completion.entity';
import { Talent } from '../entities/talent.entity';
import { Student } from '../entities/student.entity';
import { 
  CreateMissionDto, 
  UpdateMissionDto, 
  CreateMissionCompletionDto, 
  UpdateMissionCompletionDto,
  BulkMissionCompletionDto 
} from './mission.dto';
import { defaultMissions } from './mission.seed';

@Injectable()
export class MissionService {
  constructor(
    @InjectRepository(Mission)
    private missionRepository: Repository<Mission>,
    @InjectRepository(MissionCompletion)
    private missionCompletionRepository: Repository<MissionCompletion>,
    @InjectRepository(Talent)
    private talentRepository: Repository<Talent>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {}

  // 미션 CRUD
  async createMission(userId: string, createMissionDto: CreateMissionDto): Promise<Mission> {
    const newMission = this.missionRepository.create({
      ...createMissionDto,
    });
    return this.missionRepository.save(newMission);
  }

  async findAllMissions(): Promise<Mission[]> {
    const missions = await this.missionRepository.find({
      where: { is_active: true },
      order: { sort_order: 'ASC', created_at: 'ASC' },
    });

    // 미션이 없으면 기본 미션들을 생성
    if (missions.length === 0) {
      await this.seedDefaultMissions();
      return this.missionRepository.find({
        where: { is_active: true },
        order: { sort_order: 'ASC', created_at: 'ASC' },
      });
    }

    return missions;
  }

  private async seedDefaultMissions(): Promise<void> {
    for (const missionData of defaultMissions) {
      const existingMission = await this.missionRepository.findOne({
        where: { name: missionData.name },
      });

      if (!existingMission) {
        const newMission = this.missionRepository.create(missionData);
        await this.missionRepository.save(newMission);
      }
    }
  }

  async findOneMission(id: string): Promise<Mission> {
    const mission = await this.missionRepository.findOne({ where: { id } });
    if (!mission) {
      throw new NotFoundException('미션을 찾을 수 없습니다.');
    }
    return mission;
  }

  async updateMission(id: string, updateMissionDto: UpdateMissionDto): Promise<Mission> {
    const mission = await this.findOneMission(id);
    Object.assign(mission, updateMissionDto);
    return this.missionRepository.save(mission);
  }

  async deleteMission(id: string): Promise<void> {
    const mission = await this.findOneMission(id);
    await this.missionRepository.remove(mission);
  }

  // 미션 수행 관리
  async createMissionCompletion(userId: string, createMissionCompletionDto: CreateMissionCompletionDto): Promise<MissionCompletion> {
    // 학생이 해당 교사의 것인지 확인
    const student = await this.studentRepository.findOne({
      where: { id: createMissionCompletionDto.student_id, user_id: userId },
    });
    if (!student) {
      throw new NotFoundException('학생을 찾을 수 없습니다.');
    }

    // 미션 확인
    const mission = await this.findOneMission(createMissionCompletionDto.mission_id);

    // 이미 같은 날짜에 같은 미션을 수행했는지 확인
    const existingCompletion = await this.missionCompletionRepository.findOne({
      where: {
        student_id: createMissionCompletionDto.student_id,
        mission_id: createMissionCompletionDto.mission_id,
        completion_date: new Date(createMissionCompletionDto.completion_date),
      },
    });

    if (existingCompletion) {
      throw new BadRequestException('이미 같은 날짜에 해당 미션을 수행했습니다.');
    }

    // 달란트 계산
    let talentEarned = 0;
    if (createMissionCompletionDto.result.completed) {
      if (mission.config.type === 'yes_no') {
        talentEarned = mission.talent_reward;
      } else if (mission.config.type === 'count' || mission.config.type === 'number') {
        const value = createMissionCompletionDto.result.value as number;
        if (value && value > 0) {
          talentEarned = mission.talent_reward;
        }
      }
    }

    const newCompletion = this.missionCompletionRepository.create({
      ...createMissionCompletionDto,
      completion_date: new Date(createMissionCompletionDto.completion_date),
      talent_earned: talentEarned,
      user_id: userId,
    });

    const savedCompletion = await this.missionCompletionRepository.save(newCompletion);

    // 달란트 업데이트
    await this.updateStudentTalents(createMissionCompletionDto.student_id, talentEarned, mission.id);

    return savedCompletion;
  }

  async updateMissionCompletion(userId: string, id: string, updateMissionCompletionDto: UpdateMissionCompletionDto): Promise<MissionCompletion> {
    const completion = await this.missionCompletionRepository.findOne({
      where: { id, user_id: userId },
      relations: ['mission'],
    });

    if (!completion) {
      throw new NotFoundException('미션 수행 기록을 찾을 수 없습니다.');
    }

    // 달란트 재계산
    let talentEarned = 0;
    if (updateMissionCompletionDto.result?.completed) {
      if (completion.mission.config.type === 'yes_no') {
        talentEarned = completion.mission.talent_reward;
      } else if (completion.mission.config.type === 'count' || completion.mission.config.type === 'number') {
        const value = updateMissionCompletionDto.result.value as number;
        if (value && value > 0) {
          talentEarned = completion.mission.talent_reward;
        }
      }
    }

    // 기존 달란트 차감 후 새로운 달란트 추가
    const talentDifference = talentEarned - completion.talent_earned;
    if (talentDifference !== 0) {
      await this.updateStudentTalents(completion.student_id, talentDifference, completion.mission_id);
    }

    Object.assign(completion, {
      ...updateMissionCompletionDto,
      talent_earned: talentEarned,
    });

    return this.missionCompletionRepository.save(completion);
  }

  async bulkCreateMissionCompletions(userId: string, bulkDto: BulkMissionCompletionDto): Promise<MissionCompletion[]> {
    // 학생이 해당 교사의 것인지 확인
    const student = await this.studentRepository.findOne({
      where: { id: bulkDto.student_id, user_id: userId },
    });
    if (!student) {
      throw new NotFoundException('학생을 찾을 수 없습니다.');
    }

    const completions: MissionCompletion[] = [];
    let totalTalentsEarned = 0;

    for (const missionItem of bulkDto.missions) {
      const mission = await this.findOneMission(missionItem.mission_id);

      // 이미 같은 날짜에 같은 미션을 수행했는지 확인
      const existingCompletion = await this.missionCompletionRepository.findOne({
        where: {
          student_id: bulkDto.student_id,
          mission_id: missionItem.mission_id,
          completion_date: new Date(bulkDto.completion_date),
        },
      });

      if (existingCompletion) {
        // 기존 기록 업데이트
        let talentEarned = 0;
        if (missionItem.result.completed) {
          if (mission.config.type === 'yes_no') {
            talentEarned = mission.talent_reward;
          } else if (mission.config.type === 'count' || mission.config.type === 'number') {
            const value = missionItem.result.value as number;
            if (value && value > 0) {
              talentEarned = mission.talent_reward;
            }
          }
        }

        const talentDifference = talentEarned - existingCompletion.talent_earned;
        totalTalentsEarned += talentDifference;

        Object.assign(existingCompletion, {
          result: missionItem.result,
          talent_earned: talentEarned,
        });

        completions.push(await this.missionCompletionRepository.save(existingCompletion));
      } else {
        // 새 기록 생성
        let talentEarned = 0;
        if (missionItem.result.completed) {
          if (mission.config.type === 'yes_no') {
            talentEarned = mission.talent_reward;
          } else if (mission.config.type === 'count' || mission.config.type === 'number') {
            const value = missionItem.result.value as number;
            if (value && value > 0) {
              talentEarned = mission.talent_reward;
            }
          }
        }

        totalTalentsEarned += talentEarned;

        const newCompletion = this.missionCompletionRepository.create({
          student_id: bulkDto.student_id,
          mission_id: missionItem.mission_id,
          completion_date: new Date(bulkDto.completion_date),
          result: missionItem.result,
          talent_earned: talentEarned,
          user_id: userId,
        });

        completions.push(await this.missionCompletionRepository.save(newCompletion));
      }
    }

    // 총 달란트 업데이트
    if (totalTalentsEarned !== 0) {
      await this.updateStudentTalents(bulkDto.student_id, totalTalentsEarned, undefined);
    }

    return completions;
  }

  async getStudentMissionCompletions(userId: string, studentId: string, date: string): Promise<any[]> {
    // 학생이 해당 교사의 것인지 확인
    const student = await this.studentRepository.findOne({
      where: { id: studentId, user_id: userId },
    });
    if (!student) {
      throw new NotFoundException('학생을 찾을 수 없습니다.');
    }

    const completions = await this.missionCompletionRepository.find({
      where: {
        student_id: studentId,
        completion_date: new Date(date),
      },
      relations: ['mission'],
      order: { created_at: 'ASC' },
    });

    // 모든 활성 미션 가져오기
    const allMissions = await this.findAllMissions();

    // 미션별로 완료 상태 매핑
    const missionStatus = allMissions.map(mission => {
      const completion = completions.find(c => c.mission_id === mission.id);
      return {
        mission,
        completion,
        isCompleted: completion?.result?.completed || false,
        talentEarned: completion?.talent_earned || 0,
      };
    });

    return missionStatus;
  }

  async getStudentTalents(userId: string, studentId: string): Promise<Talent> {
    // 학생이 해당 교사의 것인지 확인
    const student = await this.studentRepository.findOne({
      where: { id: studentId, user_id: userId },
    });
    if (!student) {
      throw new NotFoundException('학생을 찾을 수 없습니다.');
    }

    let talent = await this.talentRepository.findOne({
      where: { student_id: studentId },
    });

    if (!talent) {
      // 달란트 기록이 없으면 생성
      talent = this.talentRepository.create({
        student_id: studentId,
        total_talents: 0,
        earned_talents: 0,
        spent_talents: 0,
        history: [],
        user_id: userId,
      });
      talent = await this.talentRepository.save(talent);
    }

    return talent;
  }

  private async updateStudentTalents(studentId: string, talentChange: number, missionId?: string): Promise<void> {
    let talent = await this.talentRepository.findOne({
      where: { student_id: studentId },
    });

    if (!talent) {
      // 학생 정보에서 user_id 가져오기
      const student = await this.studentRepository.findOne({
        where: { id: studentId },
      });
      
      talent = this.talentRepository.create({
        student_id: studentId,
        total_talents: 0,
        earned_talents: 0,
        spent_talents: 0,
        history: [],
        user_id: student?.user_id || '',
      });
    }

    if (talentChange > 0) {
      talent.earned_talents += talentChange;
      talent.total_talents += talentChange;
    } else if (talentChange < 0) {
      talent.spent_talents += Math.abs(talentChange);
      talent.total_talents += talentChange; // 음수이므로 차감
    }

    // 히스토리 업데이트
    if (!talent.history) {
      talent.history = [];
    }

    talent.history.push({
      date: new Date().toISOString().split('T')[0],
      type: talentChange > 0 ? 'earned' : 'spent',
      amount: Math.abs(talentChange),
      source: missionId ? '미션 수행' : '기타',
      mission_id: missionId,
    });

    await this.talentRepository.save(talent);
  }
} 