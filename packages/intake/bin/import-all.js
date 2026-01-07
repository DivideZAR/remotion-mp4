#!/usr/bin/env node
import yargs from 'yargs'
import {hideBin} from 'yargs/helpers'
import {importAll} from '../src/importer'
import {logger} from '@remotion-mp4/core'
import {exit} from 'process'

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Verbose output'
    })
    .help()
    .alias('help', 'h')
    .version()
    .parseAsync()

  const {verbose} = argv as any

  try {
    logger.info('Importing all validated animations...')

    await importAll({verbose})

    console.log('\nImport complete!')
    console.log('Run: npm run dev to see imported compositions in Studio')
    exit(0)
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error)
    logger.error(`Import failed: ${errorMessage}`)
    console.error(`\nError: ${errorMessage}`)
    exit(1)
  }
}

main()
