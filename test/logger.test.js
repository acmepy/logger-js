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


test('weekly rotation groups ISO weeks across year boundaries and retains files', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'logger-js-'))
  const file = join(root, 'app.log')
  t.mock.timers.enable({ apis: ['Date'], now: new Date(2020, 11, 28, 12).getTime() })

  try {
    createLogger({ file, rotate: 'weekly', maxFiles: 2 })
    await logger.writeFile(file, ['monday'])
    t.mock.timers.setTime(new Date(2021, 0, 3, 12).getTime())
    await logger.writeFile(file, ['sunday'])
    assert.equal(await readFile(join(root, 'app-2020-53.log'), 'utf8'), 'monday\nsunday\n')
    assert.deepEqual(await readdir(root), ['app-2020-53.log'])

    t.mock.timers.setTime(new Date(2021, 0, 4, 12).getTime())
    await logger.writeFile(file, ['next monday'])
    assert.equal(await readFile(join(root, 'app-2021-01.log'), 'utf8'), 'next monday\n')

    t.mock.timers.setTime(new Date(2021, 0, 11, 12).getTime())
    await logger.writeFile(file, ['second week'])
    assert.deepEqual((await readdir(root)).sort(), ['app-2021-01.log', 'app-2021-02.log'])

    t.mock.timers.setTime(new Date(2024, 11, 30, 12).getTime())
    await logger.writeFile(file, ['next ISO year'])
    assert.equal(await readFile(join(root, 'app-2025-01.log'), 'utf8'), 'next ISO year\n')
  } finally {
    t.mock.timers.reset()
    await rm(root, { recursive: true, force: true })
  }
})
