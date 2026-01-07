#!/usr/bin/env node
import yargs from 'yargs'
import {hideBin} from 'yargs/helpers'
import {readdir} from 'fs/promises'
import {join} from 'path'
import {logger} from '@remotion-mp4/core'
import {exit} from 'process'

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .help()
    .alias('help', 'h')
    .version()
    .parseAsync()

  try {
    const inputDir = 'input'

    const entries = await readdir(inputDir)
    const packages = entries.filter(
      (entry) => !entry.startsWith('.') && entry !== '.gitkeep'
    )

    if (packages.length === 0) {
      console.log('\nNo external animations found in input/')
      console.log('To scaffold a new animation: npm run intake:new -- --name <name> --kind 2d|3d')
      exit(0)
    }

    console.log(`\nFound ${packages.length} external animation(s):`)
    console.log()

    for (const pkg of packages) {
      console.log(`  - ${pkg}`)
    }

    console.log('\nTo validate: npm run intake:validate')
    console.log('To import all: npm run intake:import-all')
    console.log('To import single: npm run intake:import -- --source <name>')
    exit(0)
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error)
    logger.error(`List failed: ${errorMessage}`)
    console.error(`\nError: ${errorMessage}`)
    exit(1)
  }
}

main()
