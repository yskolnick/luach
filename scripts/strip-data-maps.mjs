// The city data files are generated tables; their source maps are megabytes and useless.
// Remove the maps and the comments that point to them, after tsup has run.
import { readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';

for (const file of ['dist/places/full-data.js', 'dist/places-full.cjs', 'dist/places/cities-data.js']) {
  if (!existsSync(file)) continue;
  const text = readFileSync(file, 'utf8').replace(/\n\/\/# sourceMappingURL=\S+\s*$/, '\n');
  writeFileSync(file, text);
  rmSync(`${file}.map`, { force: true });
}
