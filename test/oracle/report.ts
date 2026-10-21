// Oracle tests write summaries to reports/; scripts/accuracy-report.mjs turns them into docs/accuracy.md.
import { mkdirSync, writeFileSync } from 'node:fs';

export function writeReport(name: string, data: unknown): void {
  mkdirSync('reports', { recursive: true });
  writeFileSync(`reports/${name}.json`, JSON.stringify(data, null, 1));
}
