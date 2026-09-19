import { readdir, rm } from 'node:fs/promises';

// Only remove build output owned by immediate workspace packages and apps.
for (const group of ['packages', 'apps']) {
  const directory = new URL(`../${group}/`, import.meta.url);
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      await rm(new URL(`${entry.name}/dist/`, directory), { recursive: true, force: true });
    }
  }
}
