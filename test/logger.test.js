import assert from 'node:assert/strict'
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import { createLogger, logger } from '../src/index.js'

test('writeFile creates a missing directory using a Windows path', async () => {
  const root = await mkdtemp(join(tmpdir(), 'logger-js-'))
  const file = join(root, 'logs', 'app.log')

  try {
    createLogger({ file, rotate: false })
    await logger.writeFile(file, ['test log'])

    assert.equal(await readFile(file, 'utf8'), 'test log\n')
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('writeFile retains the configured number of rotated files', async () => {
  const root = await mkdtemp(join(tmpdir(), 'logger-js-'))
  const file = join(root, 'app.log')

  try {
    await Promise.all([
      writeFile(join(root, 'app-2026-01-01.log'), ''),
      writeFile(join(root, 'app-2026-01-02.log'), ''),
      writeFile(join(root, 'app-2026-01-03.log'), ''),
    ])
    createLogger({ file, maxFiles: 2 })
    await logger.writeFile(file, ['test log'])

    const files = await readdir(root)
    assert.equal(files.length, 2)
    assert.equal(files.includes('app-2026-01-01.log'), false)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
