import {readFile, readdir, mkdir, cp, writeFile, stat} from 'fs/promises'
import {join, dirname} from 'path'
import {logger} from '@remotion-mp4/core'
import {validate} from './validator'
import {validateCompositionId} from '@remotion-mp4/core'

const ROOT_FILE = 'apps/studio/src/Root.tsx'

export interface ImportOptions {
  source: string
  targetDir?: string
}

export async function importPackage(options: ImportOptions): Promise<void> {
  const {source, targetDir = 'packages/animations-external'} = options

  logger.info(`Importing: ${source}`)

  const sourcePath = join('input', source)
  const targetPath = join(targetDir, source)

  try {
    await stat(sourcePath)
  } catch {
    logger.error(`Source package does not exist: ${source}`)
    throw new Error(`Source package not found: ${source}`)
  }

  try {
    await stat(targetPath)
    logger.warn(`Target directory exists, will overwrite: ${targetPath}`)
  } catch {
    await mkdir(targetPath, {recursive: true})
  }

  const srcDir = join(sourcePath, 'src')
  const targetSrcDir = join(targetPath, 'src')

  await mkdir(targetSrcDir, {recursive: true})

  const entries = await readdir(srcDir)

  for (const entry of entries) {
    const sourceFile = join(srcDir, entry)
    const targetFile = join(targetSrcDir, entry)

    await cp(sourceFile, targetFile)
    logger.debug(`Copied: ${entry}`)
  }

  const packageJsonSource = join(sourcePath, 'package.json')

  try {
    await stat(packageJsonSource)
    const packageJsonTarget = join(targetPath, 'package.json')
    await cp(packageJsonSource, packageJsonTarget)
    logger.debug('Copied: package.json')
  } catch {
    const readmeSource = join(sourcePath, 'README.md')
    try {
      await stat(readmeSource)
    } catch {
      logger.warn('No README.md to copy')
    }
  }

  const registerFile = join(targetSrcDir, 'register.ts')

  try {
    const registerCode = await readFile(registerFile, 'utf-8')

    if (!registerCode.includes('registerExternalCompositions')) {
      logger.warn('registerExternalCompositions() not found in register.ts')
    }

    const matches = registerCode.match(
      /export function registerExternalCompositions\(\)/g
    )

    if (matches && matches[1]) {
      const registerFunctionName = matches[1]
      logger.info(`Register function name: ${registerFunctionName}`)
    }
  } catch (error) {
    logger.error(`Could not check register.ts: ${error}`)
  }

  await updateRootRegister(source)

  logger.info(`Import complete: ${targetPath}`)
  logger.info('Run: npm run dev to see imported composition in Studio')
}

export async function importAll(targetDir?: string): Promise<void> {
  const results = await validate({})

  const validResults = results.filter((r) => r.valid)

  if (validResults.length === 0) {
    logger.info('No valid packages to import')
    return
  }

  logger.info(`Importing ${validResults.length} valid package(s)...`)

  const errors: string[] = []

  for (const result of validResults) {
    try {
      await importPackage({source: result.name, targetDir})
      logger.info(`✓ Imported: ${result.name}`)
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : String(error)
      logger.error(`✗ Failed to import ${result.name}: ${errorMsg}`)
      errors.push(`${result.name}: ${errorMsg}`)
    }
  }

  if (errors.length > 0) {
    logger.error(`${errors.length} import(s) failed`)
    throw new Error(`Import failed for: ${errors.join(', ')}`)
  }

  logger.info('All imports complete')
}

async function updateRootRegister(packageName: string): Promise<void> {
  try {
    let rootContent = await readFile(ROOT_FILE, 'utf-8')

    const compositionName = capitalize(packageName)

    if (rootContent.includes(compositionName)) {
      logger.info(`Composition ${compositionName} already registered in Root.tsx`)
      return
    }

    const registerImport = `import {${compositionName}} from '@remotion-mp4/external-${packageName.toLowerCase()}'`
    const compositionImport = `import {${compositionName}} from '../src/register'`

    const importStatement = `// External: ${registerImport}\n    ${registerImport}`

    const lastCompositionIndex = rootContent.lastIndexOf('</Composition>')

    if (lastCompositionIndex === -1) {
      logger.warn('Could not find last </Composition> tag')
      return
    }

    const insertPosition = lastCompositionIndex + 1

    rootContent =
      rootContent.slice(0, insertPosition) +
      importStatement +
      rootContent.slice(insertPosition)

    await writeFile(ROOT_FILE, rootContent)

    logger.info(`Registered ${compositionName} in Root.tsx`)
  } catch (error) {
    logger.error(`Failed to update Root.tsx: ${error}`)
    throw error
  }
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
