import { Mission } from '../entities/mission.entity';

export const defaultMissions: Partial<Mission>[] = [
  {
    name: '성경책 가져오기',
    description: '성경책을 가져왔는지 확인합니다.',
    config: {
      type: 'yes_no',
    },
    talent_reward: 1,
    is_active: true,
    sort_order: 1,
  },
  {
    name: '성경읽기',
    description: '성경을 읽은 횟수를 기록합니다.',
    config: {
      type: 'count',
      unit: '회',
      max_value: 10,
      default_value: 1,
    },
    talent_reward: 1,
    is_active: true,
    sort_order: 2,
  },
  {
    name: '전도하기',
    description: '전도한 사람 수를 기록합니다.',
    config: {
      type: 'number',
      unit: '명',
      max_value: 50,
      default_value: 1,
    },
    talent_reward: 5,
    is_active: true,
    sort_order: 3,
  },
  {
    name: '찬양대 참여',
    description: '찬양대에 참여했는지 확인합니다.',
    config: {
      type: 'yes_no',
    },
    talent_reward: 1,
    is_active: true,
    sort_order: 4,
  },
]; 