import assert from 'node:assert/strict'
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import { createLogger, logger } from '../src/index.js'

for (const entry of ['../src/index.js', '../dist/logger.esm.js']) {
  test(`${entry} preserves backslashes and JSON escapes in console and file output`, async (t) => {
    const { createLogger, logger } = await import(entry)
    const root = await mkdtemp(join(tmpdir(), 'logger-js-'))
    const file = join(root, 'app.log')
    const windowsPath = String.raw`C:\tmp\logs\app.log`
    const payload = {
      path: windowsPath,
      message: 'quoted "value"\nnext line\tend',
      backslash: '\\',
      sqlDurationMs: 12.5,
      nested: { json: JSON.stringify({ query: 'SELECT "name"\nFROM users' }) },
    }
    const serialized = JSON.stringify(payload)
    const error = new Error(windowsPath)
    error.stack = `Error: ${windowsPath}\n    at ${windowsPath}:1:1`
    const errorText = error.message + '\nstack:' + error.stack
    const writes = []
    const writeFile = logger.writeFile.bind(logger)

    try {
      createLogger({ file, rotate: false, displayConsole: true })
      const output = t.mock.method(logger.console, 'log', () => {})
      t.mock.method(logger, 'writeFile', (...args) => {
        const pending = writeFile(...args)
        writes.push(pending)
        return pending
      })

      logger.info('test', windowsPath, payload, serialized, error)
      await Promise.all(writes)

      const values = output.mock.calls[0].arguments.slice(4)
      assert.deepEqual(values, [windowsPath, serialized, serialized, errorText])
      assert.deepEqual(JSON.parse(values[1]), payload)
      const content = await readFile(file, 'utf8')
      assert.ok(content.endsWith(`${values.join(' ')}\n`))
    } finally {
      t.mock.restoreAll()
      await rm(root, { recursive: true, force: true })
    }
  })
}

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
