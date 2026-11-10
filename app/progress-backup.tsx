'use client';
import { useRef, useState } from 'react';
import { Download, Upload, Save } from 'lucide-react';
import { EMPTY, progressKey, readProgress, saveProgress } from '../lib/player-progress';
import type { Progress } from '../lib/player-progress';
import { createBackup, parseBackup, mergeProgress } from '../lib/progress-backup';

export default function ProgressBackup({ progress, onImported }: { progress: Progress; onImported: (progress: Progress) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Progress | null>(null);
  const [message, setMessage] = useState('');
  function download() {
    const url = URL.createObjectURL(new Blob([createBackup(readProgress('child') || progress)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url; a.download = `kick-keys-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    setMessage('存档已准备下载。换网址或换电脑时，带上这份文件就好。');
  }
  async function choose(file?: File) {
    setPending(null); setMessage('');
    if (!file) return;
    try {
      if (file.size > 1_000_000) throw new Error('这份文件太大了，请选择游戏导出的 JSON 存档。');
      setPending(parseBackup(await file.text()));
    } catch (error) { setMessage(error instanceof Error ? error.message : '读取失败，请重试。'); }
  }
  function restore() {
    if (!pending) return;
    const current = readProgress('child') || EMPTY;
    const next = mergeProgress(current, pending);
    try {
      localStorage.setItem(`${progressKey('child')}:before-import`, createBackup(current));
      if (!saveProgress('child', next)) throw new Error();
      onImported(next); setPending(null); setMessage('存档导入成功！课程、星星和练习记录已经带过来啦。');
    } catch { setMessage('浏览器没有成功保存，请先保留存档文件，检查存储空间后重试。'); }
  }
  return <section className="progress-backup" aria-label="存档小背包">
    <div className="backup-heading"><Save size={24}/><div><h2>存档小背包</h2><p>把努力装进背包，换网址、换电脑也能接着练。</p></div></div>
    <p>从旧网址搬过来：先在旧主场的「成长记录」里导出存档，再到这里导入。同一浏览器、同一网址更新游戏会保留进度。</p>
    <div className="backup-actions"><button className="secondary" onClick={download}><Download size={16}/>导出存档</button><button className="secondary" onClick={() => input.current?.click()}><Upload size={16}/>导入存档</button></div>
    <input ref={input} type="file" accept=".json,application/json" aria-label="选择小球员存档" hidden onChange={e => { void choose(e.target.files?.[0]); e.target.value = ''; }}/>
    {pending && <div className="backup-preview"><strong>找到 {pending.completed.length} 节课程 · {pending.points} 颗星星 · {pending.records.length} 次记录</strong><p>合并已完成课程和练习记录，星星保留较高数量。重复导入不会重复加星。</p><div className="backup-actions"><button className="primary" onClick={restore}>合并这份存档</button><button className="secondary" onClick={() => setPending(null)}>取消</button></div></div>}
    <p className="backup-status" role="status">{message}</p>
  </section>;
}
