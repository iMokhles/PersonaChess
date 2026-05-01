import { build } from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const outdir = path.resolve('tests/.compiled');
const outfile = path.join(outdir, 'personachess.test.mjs');

await fs.mkdir(outdir, { recursive: true });

await build({
  entryPoints: [path.resolve('tests/personachess.test.ts')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  sourcemap: 'inline',
  outfile,
  packages: 'external',
});

const result = spawnSync(process.execPath, ['--test', outfile], {
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
