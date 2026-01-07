#!/usr/bin/env node
import yargs from 'yargs'
import {hideBin} from 'yargs/helpers'
import {renderToMp4, validateRenderOptions} from './renderer'
import {clearCache} from './bundler'
import {RenderOptions, getDefaultWebGLMode} from '@remotion-mp4/core'
import {readFile} from 'fs/promises'
import {exit} from 'process'

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .option('comp', {
      alias: 'c',
      type: 'string',
      description: 'Composition ID to render (required)',
      demandOption: true
    })
    .option('out', {
      alias: 'o',
      type: 'string',
      description: 'Output MP4 path (required)',
      demandOption: true
    })
    .option('props', {
      alias: 'p',
      type: 'string',
      description: 'JSON file with composition props'
    })
    .option('gl', {
      type: 'string',
      choices: ['angle', 'swangle', 'swiftshader', 'egl'],
      description: 'WebGL mode (default: angle/swangle based on OS)'
    })
    .option('codec', {
      type: 'string',
      choices: ['h264', 'vp8', 'vp9', 'prores'],
      description: 'Video codec (default: h264)'
    })
    .option('max-duration', {
      type: 'number',
      description: 'Maximum video length in seconds (default: 60)'
    })
    .option('concurrency', {
      type: 'number',
      description: 'Number of concurrent renders (default: 1)'
    })
    .option('timeout', {
      type: 'number',
      description: 'Render timeout in milliseconds (default: 120000)'
    })
    .option('clear-cache', {
      type: 'boolean',
      description: 'Clear bundle cache'
    })
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Verbose logging'
    })
    .help()
    .alias('help', 'h')
    .version()
    .parseAsync()

  const {
    comp: compositionId,
    out: outputPath,
    props: propsPath,
    gl: glMode,
    codec = 'h264',
    maxDuration,
    concurrency,
    timeout,
    clearCache: shouldClearCache,
    verbose
  } = argv as any

  try {
    if (shouldClearCache) {
      await clearCache()
      return
    }

    const inputProps = propsPath
      ? JSON.parse(await readFile(propsPath, 'utf-8'))
      : {}

    const options: RenderOptions = {
      compositionId,
      inputProps,
      outputPath,
      codec,
      chromiumOptions: {
        gl: glMode || getDefaultWebGLMode(),
        headless: true,
        ignoreDefaultArgs: false
      },
      concurrency,
      timeoutInMilliseconds: timeout,
      maxDurationSeconds: maxDuration || 60
    }

    await validateRenderOptions(options)

    const result = await renderToMp4(options)

    if (!result.success) {
      console.error(`\nRender failed: ${result.error}`)
      exit(1)
    }

    console.log(`\nRender successful!`)
    console.log(`  Output: ${result.outputPath}`)
    console.log(`  Duration: ${result.duration?.toFixed(2)}s`)
    console.log(`  Size: ${((result.sizeBytes || 0) / 1024 / 1024).toFixed(2)} MB`)
    console.log(`  Codec: ${result.codec}`)
    console.log(`  Time: ${((result.renderTimeMs || 0) / 1000).toFixed(2)}s`)

    exit(0)
  } catch (error) {
    console.error(`\nError: ${error instanceof Error ? error.message : String(error)}`)
    exit(2)
  }
}

main()
