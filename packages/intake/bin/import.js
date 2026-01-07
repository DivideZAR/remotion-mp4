#!/usr/bin/env node
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { importPackage, importAll } from '../src/importer.js'
import { logger } from '@remotion-mp4/core'
import { exit } from 'process'

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .option('source', {
      alias: 's',
      type: 'string',
      description: 'Source animation name in input/ (required)',
    })
    .option('target', {
      alias: 't',
      type: 'string',
      description: 'Target directory (default: packages/animations-external)',
    })
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Verbose output',
    })
    .help()
    .alias('help', 'h')
    .version()
    .parseAsync()

  const { source, target, verbose } = argv

  try {
    await importPackage({
      source,
      targetDir: target,
      verbose,
    })

    logger.info(`Import successful: ${source}`)
    exit(0)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error(`Import failed: ${errorMessage}`)
    exit(1)
  }
}

main()
