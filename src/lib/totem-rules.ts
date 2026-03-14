// 文件路径：src/lib/totem-rules.ts

export type ElementType = '金' | '木' | '水' | '火' | '土' | '风' | '雷' | '云';

export interface TotemResult {
  score: number;
  rank: 'R' | 'SR' | 'SSR' | 'SP';
  logs: string[];
}

const BASE_SCORE = 10;

const INTERACTION_MATRIX: Record<ElementType, Partial<Record<ElementType, number>>> = {
  '金': { '水': 5,  '火': -5, '木': -3, '雷': 8 },
  '木': { '火': 5,  '金': -5, '土': -3, '水': 3 },
  '水': { '木': 5,  '土': -5, '火': -5, '云': 3 },
  '火': { '土': 5,  '水': -5, '金': -3, '风': 8 },
  '土': { '金': 5,  '木': -5, '水': -3, '云': -2 },
  '风': { '火': 8,  '云': 5,  '土': -3 },
  '雷': { '金': 8,  '木': -5, '火': 5 },
  '云': { '风': 5,  '雷': 8,  '水': 5 },
};

const HIDDEN_COMBOS = [
  { elements: ['风', '雷', '云'], name: '天劫降临', bonus: 50 },
  { elements: ['水', '火', '风'], name: '水深火热', bonus: 30 },
  { elements: ['金', '木', '水', '火', '土'], name: '五行大衍', bonus: 100 }
];

export function calculateTotemScore(selectedElements: ElementType[]): TotemResult {
  if (selectedElements.length === 0) return { score: 0, rank: 'R', logs: ['未注入任何图腾元素'] };

  let totalScore = selectedElements.length * BASE_SCORE;
  const logs: string[] = [`注入 ${selectedElements.length} 个基础元素，获得 ${totalScore} 分`];
  
  // 1. 计算两两反应
  for (let i = 0; i < selectedElements.length; i++) {
    for (let j = i + 1; j < selectedElements.length; j++) {
      const e1 = selectedElements[i];
      const e2 = selectedElements[j];
      
      const interaction = (INTERACTION_MATRIX[e1]?.[e2] || 0) + (INTERACTION_MATRIX[e2]?.[e1] || 0);
      
      if (interaction > 0) {
        totalScore += interaction;
        logs.push(`✅ 【相生】${e1} 与 ${e2} 产生共鸣: +${interaction}分`);
      } else if (interaction < 0) {
        totalScore += interaction;
        logs.push(`❌ 【相克】${e1} 与 ${e2} 产生冲突: ${interaction}分`);
      }
    }
  }

  // 2. 计算隐藏羁绊
  for (const combo of HIDDEN_COMBOS) {
    const hasCombo = combo.elements.every(e => selectedElements.includes(e as ElementType));
    if (hasCombo) {
      totalScore += combo.bonus;
      logs.push(`✨ 【隐藏羁绊触发】${combo.name}: +${combo.bonus}分！`);
    }
  }

  // 3. 评级判定
  let rank: TotemResult['rank'] = 'R';
  if (totalScore >= 120) rank = 'SP';
  else if (totalScore >= 80) rank = 'SSR';
  else if (totalScore >= 40) rank = 'SR';

  return { score: totalScore, rank, logs };
}
