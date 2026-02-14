import { MistakeRecord } from '@/hooks/useUserProgress';
// export关键字说明其他文件可以引用到这个文件的这部分代码
// 错题有三种类型，练习模式有两种
export type MistakeQuestionKind = 'all' | 'choice' | 'situation';
export type PracticeMode = 'review' | 'sprint';


export interface MistakeFilterOptions {
  kind?: MistakeQuestionKind;
  topicId?: string;
  minWrongCount?: number;
}
// 对外提供函数，判断传入的topicId是不是situation
export function isSituationTopic(topicId: string): boolean {
  return topicId === 'situation';
}

// 对外提供函数，获取问题所属的主题（如果是情景题会返回情景），会从 类型MistakeQuestionKind 中提除掉 all
export function getQuestionKind(topicId: string): Exclude<MistakeQuestionKind, 'all'> {
  return isSituationTopic(topicId) ? 'situation' : 'choice';
}

// 
/* 
  对外提供函数，功能：获取可用的选择题主题
  输入：【错误记录】对象数组records，输出：字符串数组
  函数处理：
    1. 定义常变量topics，赋值为 records的所有topicId组成的数组（.map((record) => record.topicId) 中符合以下条件的记录：
      a. topicId不是situation的
    2. 返回前先对筛选过的topicId进行去重（利用Set的特性，new Set(topicId))，然后转成数组（Array.from())返回
*/
export function getAvailableChoiceTopics(records: MistakeRecord[]): string[] {
  const topics = records
    .map((record) => record.topicId)
    .filter((topicId) => !isSituationTopic(topicId));

  return Array.from(new Set(topics));
}

/**
 * 功能是过滤错题， 对外提供
 * @param records 错题列表
 * @param options 错题过滤选项
 * @returns MistakeRecord[] 错题列表
 */
export function filterMistakes(records: MistakeRecord[], options: MistakeFilterOptions): MistakeRecord[] {
  // 定义常变量options，赋值为下列集合：类型 - 全部；主题 - 全部；最小错题次数 - 1
  const {
    kind = 'all',
    topicId = 'all',
    minWrongCount = 1,
  } = options;
  // 进行如下filter处理
  // 如果传入的数组中的记录符合错题次数小于最小错题次数，返回false
  // 如果当前类型不是全部、
  return records.filter((record) => {
    if (record.count < minWrongCount) {
      return false;
    }
    // 定义常变量：recordKind，获取当前记录的类型（排除了all）
    const recordKind = getQuestionKind(record.topicId);
    // 如果定义的类型不是全部且 当前记录的kind和options.kind不一致，返回false
    if (kind !== 'all' && recordKind !== kind) {
      return false;
    }
    // 如果options.topicId 不是全部 且 当前记录的topicId和options.topicId不一致，返回false
    if (topicId !== 'all' && record.topicId !== topicId) {
      return false;
    }
    // 否则返回true，即通过筛选保留下来
    return true;
  });
}

/**
 * 内部函数，不对外提供
 * 返回传入参数类型的数组
 * @param items 
 * @param randomFn 
 * @returns 
 */
function shuffleArray<T>(items: T[], randomFn: () => number): T[] {
  // 浅拷贝，只拷贝第一层（把传入的数组换皮成copied）
  const copied = [...items];
  // Fisher-Yates洗牌算法
  // 从最后一个元素开始，随机交换数组元素值 —— 通过randomFn实现伪随机，floor确保数组下标不越界
  for (let i = copied.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    // 交换函数值
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }
  return copied;
}

// 构建复习队列，入参【错题记录数组】、【随机函数】，返回随机重排序后的【错题记录数组】
function buildReviewQueue(records: MistakeRecord[], randomFn: () => number): MistakeRecord[] {
  return shuffleArray([...records], randomFn);
}

// 构建冲刺队列，入参【错题记录数组】、【随机函数】，返回重排序后的【错题记录数组】，排序参照错题权重
function buildSprintQueue(records: MistakeRecord[], randomFn: () => number): MistakeRecord[] {
  //常变量错题权重
  const weighted: MistakeRecord[] = [];
  //遍历传入的错题记录数组
  for (const record of records) {
    // 常变量weight 取当前错题的错题次数，并将值限制在[1, 5]之间
    const weight = Math.min(5, Math.max(1, record.count));
    // 往加权错题数组中添加对应错题次数的题目数
    for (let i = 0; i < weight; i++) {
      weighted.push(record);
    }
  }
  // 返回重新排序的错题数组
  return shuffleArray(weighted, randomFn);
}

// 对外提供函数
// 传入错题数组、练习模式、随机函数
// 返回构建好的错题数组
export function buildPracticeQueue(
  records: MistakeRecord[],
  mode: PracticeMode,
  randomFn: () => number = Math.random
): MistakeRecord[] {
  // 冲刺模式，构建冲刺对列
  if (mode === 'sprint') {
    return buildSprintQueue(records, randomFn);
  }
  // 否则，构建复习队列
  return buildReviewQueue(records, randomFn);
}
