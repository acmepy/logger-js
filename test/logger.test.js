import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
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
