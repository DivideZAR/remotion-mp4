#!/usr/bin/env node
import yargs from 'yargs'
import {hideBin} from 'yargs/helpers'
import {validate} from '../src/validator'
import {logger} from '@remotion-mp4/core'
import {exit} from 'process'

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .option('source', {
      alias: 's',
      type: 'string',
      description: 'Validate specific animation (optional, validates all if not provided)'
    })
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Verbose output'
    })
    .help()
    .alias('help', 'h')
    .version()
    .parseAsync()

  const {source, verbose} = argv as any

  try {
    const results = await validate({source, verbose})

    if (verbose) {
      console.log(JSON.stringify(results, null, 2))
    } else {
      console.log('Validation Results:')
      console.log(`  Total: ${results.length}`)

      const validCount = results.filter((r) => r.valid).length
      const invalidCount = results.length - validCount

      console.log(`  Valid: ${validCount}`)
      console.log(`  Invalid: ${invalidCount}`)
      console.log()

      for (const result of results) {
        if (!result.valid) {
          console.log(`  ✗ ${result.name}`)
          if (result.errors.length > 0) {
            result.errors.forEach((error) => console.log(`    - ${error}`))
          }
        } else {
          console.log(`  ✓ ${result.name}`)
        }
      }
    }

    const hasErrors = results.some((r) => !r.valid)

    exit(hasErrors ? 2 : 0)
  } catch (error) {
    logger.error(`Validation failed: ${error}`)
    exit(2)
  }
}

main()
