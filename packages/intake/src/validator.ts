import {readFile, readdir, stat} from 'fs/promises'
import {join} from 'path'
import {logger} from '@remotion-mp4/core'
import {validateCompositionId} from '@remotion-mp4/core'

export interface ValidationOptions {
  source?: string
}

export interface ValidationResult {
  name: string
  valid: boolean
  errors: string[]
  warnings: string[]
}

export async function validate(options: ValidationOptions = {}): Promise<ValidationResult[]> {
  logger.info('Validating external animations...')

  const inputDir = 'input'

  try {
    await stat(inputDir)
  } catch {
    logger.error('Input directory does not exist: input/')
    return []
  }

  const entries = await readdir(inputDir)
  const packages = entries.filter(
    (entry) => !entry.startsWith('.') && entry !== '.gitkeep'
  )

  logger.info(`Found ${packages.length} external animation(s)`)

  const results: ValidationResult[] = []

  for (const pkg of packages) {
    const pkgPath = join(inputDir, pkg)
    const result = await validatePackage(pkgPath)
    results.push(result)
  }

  const validCount = results.filter((r) => r.valid).length
  const invalidCount = results.filter((r) => !r.valid).length

  logger.info(`Validation complete: ${validCount} valid, ${invalidCount} invalid`)

  return results
}

async function validatePackage(pkgPath: string): Promise<ValidationResult> {
  const name = pkgPath.split(/[/\\\\]/).pop() || pkgPath
  const errors: string[] = []
  const warnings: string[] = []

  logger.info(`Validating: ${name}`)

  try {
    await stat(pkgPath)
  } catch {
    errors.push(`Package directory does not exist`)
    return {name, valid: false, errors, warnings}
  }

  const srcDir = join(pkgPath, 'src')

  try {
    await stat(srcDir)
  } catch {
    errors.push('src/ directory missing')
    return {name, valid: false, errors, warnings}
  }

  const compositionFile = join(srcDir, 'Composition.tsx')
  const propsFile = join(srcDir, 'props.ts')
  const registerFile = join(srcDir, 'register.ts')
  const packageJsonFile = join(pkgPath, 'package.json')

  const requiredFiles = [compositionFile, propsFile, registerFile]

  for (const file of requiredFiles) {
    try {
      await stat(file)
    } catch {
      errors.push(`Required file missing: ${file}`)
    }
  }

  if (errors.length > 0) {
    return {name, valid: false, errors, warnings}
  }

  const packageJson = packageJsonFileExists ? await readPackageJson(packageJsonFile) : null

  if (packageJson && packageJson.dependencies) {
    const deps = Object.keys(packageJson.dependencies)
    const suspiciousDeps = deps.filter((dep) =>
      dep.includes('eval') ||
      dep.includes('exec') ||
      dep.includes('script')
    )

    if (suspiciousDeps.length > 0) {
      warnings.push(`Suspicious dependencies: ${suspiciousDeps.join(', ')}`)
    }
  }

  const registerCode = await readFile(registerFile, 'utf-8')

  if (!registerCode.includes('registerExternalCompositions')) {
    errors.push('registerExternalCompositions() function not exported')
  }

  const compositionCode = await readFile(compositionFile, 'utf-8')

  const guardrailViolations = await checkGuardrails(compositionCode)

  errors.push(...guardrailViolations.errors)
  warnings.push(...guardrailViolations.warnings)

  if (errors.length === 0) {
    logger.info(`✓ ${name} is valid`)
  } else {
    logger.error(`✗ ${name} has ${errors.length} error(s)`)
  }

  if (warnings.length > 0) {
    logger.warn(`! ${name} has ${warnings.length} warning(s)`)
  }

  return {
    name,
    valid: errors.length === 0,
    errors,
    warnings
  }
}

async function readPackageJson(path: string): Promise<any | null> {
  try {
    const content = await readFile(path, 'utf-8')
    return JSON.parse(content)
  } catch {
    return null
  }
}

async function checkGuardrails(code: string): Promise<{
  errors: string[]
  warnings: string[]
}> {
  const errors: string[] = []
  const warnings: string[] = []

  const lines = code.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNumber = i + 1

    if (line.includes('Math.random()')) {
      errors.push(
        `Line ${lineNumber}: Math.random() found - use seededRandom via props`
      )
    }

    if (
      line.includes('fetch(') &&
      !line.includes('delayRender') &&
      !line.includes('continueRender')
    ) {
      errors.push(
        `Line ${lineNumber}: fetch() found without delayRender/continueRender`
      )
    }

    if (line.match(/\b(window|document)\b/)) {
      if (
        !line.includes('typeof window !== ') &&
        !line.includes('typeof document !== ')
      ) {
        errors.push(
          `Line ${lineNumber}: window/document used without typeof guard`
        )
      }
    }

    if (line.includes('fs.') || line.includes('fs.readFileSync')) {
      if (!line.includes("typeof window !== 'undefined'")) {
        errors.push(
          `Line ${lineNumber}: fs operations detected (only allowed with guard)`
        )
      }
    }

    if (line.includes('eval(') || line.includes('new Function(')) {
      errors.push(`Line ${lineNumber}: eval() or Function() detected`)
    }
  }

  return {errors, warnings}
}

function packageJsonFileExists(file: string): boolean {
  try {
    require.resolve(file)
    return true
  } catch {
    return false
  }
}
