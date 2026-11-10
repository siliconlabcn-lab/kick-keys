import test from 'node:test';
import assert from 'node:assert/strict';
import { createBackup, parseBackup, mergeProgress } from '../lib/progress-backup.ts';
import type { Progress, RecordItem } from '../lib/player-progress.ts';

const record: RecordItem = { id: 'letter-a', title: '认识 A 键', accuracy: 100, correct: 10, mistakes: 0, seconds: 12, cpm: 50, date: '2026-11-10T12:00:00.000Z', points: 20 };
const progress: Progress = { completed: ['letter-a'], records: [record], points: 20 };
test('export/import round trip preserves the child progress', () => assert.deepEqual(parseBackup(createBackup(progress)), progress));
test('merging the same backup twice cannot duplicate rewards or records', () => {
  const first = mergeProgress({ completed: [], records: [], points: 0 }, progress);
  assert.deepEqual(mergeProgress(first, progress), first);
});
test('older backup retains current progress, best lifetime stars and newer records', () => {
  const current: Progress = { completed: ['letter-b'], records: [{ ...record, id: 'letter-b', date: '2026-11-11T12:00:00.000Z' }], points: 80 };
  const result = mergeProgress(current, progress);
  assert.equal(result.points, 80);
  assert.deepEqual(result.completed, ['letter-b', 'letter-a']);
  assert.equal(result.records[0].id, 'letter-b');
  assert.equal(result.records.length, 2);
});
test('rejects incompatible, parent, malformed and future backups', () => {
  const valid = JSON.parse(createBackup(progress));
  for (const value of [{ ...valid, version: 2 }, { ...valid, profile: 'parent' }, { ...valid, progress: { ...progress, points: -1 } }, { ...valid, progress: { ...progress, records: [{ ...record, accuracy: 101 }] } }, { ...valid, progress: { ...progress, records: [{ ...record, date: 'invalid' }] } }]) {
    assert.throws(() => parseBackup(JSON.stringify(value)));
  }
  assert.throws(() => parseBackup('invalid json'));
  assert.throws(() => parseBackup(' '.repeat(1_000_001)));
});
