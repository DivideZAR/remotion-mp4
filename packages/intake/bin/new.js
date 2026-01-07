#!/usr/bin/env node
import yargs from 'yargs'
import {hideBin} from 'yargs/helpers'
import {scaffold} from '../src/scaffold'
import {exit} from 'process'

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .option('name', {
      alias: 'n',
      type: 'string',
      description: 'Package name (required)',
      demandOption: true
    })
    .option('kind', {
      alias: 'k',
      type: 'string',
      description: 'Composition type (required): 2d or 3d',
      choices: ['2d', '3d'],
      demandOption: true
    })
    .help()
    .alias('help', 'h')
    .version()
    .parseAsync()

  const {name, kind} = argv as any

  try {
    await scaffold({name, kind})
    console.log(`\nScaffolding complete!`)
    console.log(`Created: input/${name}`)
    console.log(`\nNext steps:`)
    console.log(`  1. Edit input/${name}/src/Composition.tsx`)
    console.log(`  2. Validate: npm run intake:validate`)
    console.log(`  3. Import: npm run intake:import -- --source ${name}`)
    exit(0)
  } catch (error) {
    console.error(`\nError: ${error instanceof Error ? error.message : String(error)}`)
    exit(1)
  }
}

main()
