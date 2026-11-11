import type { Progress, RecordItem } from './player-progress';

export const BACKUP_FORMAT = 'kick-keys-progress';
export const BACKUP_VERSION = 1;
const numericFields = ['accuracy', 'correct', 'mistakes', 'seconds', 'cpm', 'points'] as const;

export function createBackup(progress: Progress): string {
  return JSON.stringify({ format: BACKUP_FORMAT, version: BACKUP_VERSION, profile: 'child', exportedAt: new Date().toISOString(), progress }, null, 2);
}

export function parseBackup(text: string): Progress {
  if (text.length > 1_000_000) throw new Error('这份文件太大了，请选择游戏导出的 JSON 存档。');
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('没有读懂这份存档，请选择游戏导出的 JSON 文件。'); }
  if (data?.format !== BACKUP_FORMAT || data.version !== BACKUP_VERSION || data.profile !== 'child') {
    throw new Error('这不是受支持的小球员存档，当前进度没有改变。');
  }
  const p = data.progress;
  if (!p || !Array.isArray(p.records) || p.records.length > 1000 || !Array.isArray(p.completed) || p.completed.length > 1000 || !Number.isFinite(p.points) || p.points < 0 || !p.completed.every((id: unknown) => typeof id === 'string' && id.length <= 100)) {
    throw new Error('存档内容不完整，当前进度没有改变。');
  }
  const records: RecordItem[] = p.records.map((r: RecordItem) => {
    if (!r || typeof r.id !== 'string' || typeof r.title !== 'string' || typeof r.date !== 'string' || !Number.isFinite(Date.parse(r.date)) || !numericFields.every(k => typeof r[k] === 'number' && Number.isFinite(r[k]) && r[k] >= 0) || r.accuracy > 100) {
      throw new Error('存档中的练习记录有误，当前进度没有改变。');
    }
    return { id: r.id, title: r.title, date: r.date, accuracy: r.accuracy, correct: r.correct, mistakes: r.mistakes, seconds: r.seconds, cpm: r.cpm, points: r.points };
  });
  return { records, completed: [...new Set<string>(p.completed)], points: p.points, ...(Array.isArray(p.players)?{players:[...new Set<string>(p.players.filter((x:unknown)=>typeof x==='string'))]}:{}), ...(Array.isArray(p.achievements)?{achievements:p.achievements.filter((x:unknown)=>typeof x==='string')}:{}) };
}

// A duplicate import never awards stars again. Keep the higher lifetime total,
// union completed lessons, and retain the newest 100 distinct practice records.
export function mergeProgress(current: Progress, imported: Progress): Progress {
  const records = new Map<string, RecordItem>();
  for (const r of [...current.records, ...imported.records]) {
    const key = JSON.stringify([r.id, r.date, r.accuracy, r.correct, r.mistakes, r.seconds, r.cpm, r.points]);
    if (!records.has(key)) records.set(key, r);
  }
  return {
    records: [...records.values()].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, 100),
    completed: [...new Set([...current.completed, ...imported.completed])],
    points: Math.max(current.points, imported.points),
    players: [...new Set([...(current.players||[]),...(imported.players||[])])],
    achievements:[...new Set([...(current.achievements||[]),...(imported.achievements||[])])].filter(a=>{
      if(!a.startsWith('gift:'))return true;
      const id=a.slice(5);
      return ![current,imported].some(p=>p.players?.includes(id)&&!p.achievements?.includes(a));
    }),
  };
}
