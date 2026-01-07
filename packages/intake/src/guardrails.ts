import {readFile} from 'fs/promises'
import {logger} from '@remotion-mp4/core'

export interface GuardrailCheck {
  errors: string[]
  warnings: string[]
}

export interface GuardrailViolation {
  line: number
  code: string
  severity: 'error' | 'warning'
  message: string
}

export const GUARDRAILS = {
  NO_MATH_RANDOM: {
    pattern: /Math\.random\(\)/g,
    message: 'Math.random() produces non-deterministic output - use seededRandom via props',
    severity: 'error' as const,
    code: 'NO_MATH_RANDOM'
  },
  FETCH_WITHOUT_ASYNC: {
    pattern: /fetch\([^)]*\)/g,
    message:
      'fetch() must use Remotion delayRender/continueRender for SSR compatibility',
    severity: 'error' as const,
    code: 'FETCH_WITHOUT_ASYNC'
  },
  WINDOW_DOCUMENT_WITHOUT_GUARD: {
    pattern: /\b(window|document)\b/g,
    message:
      'window/document must have typeof guard for SSR compatibility',
    severity: 'error' as const,
    code: 'WINDOW_DOCUMENT_WITHOUT_GUARD'
  },
  FS_OPERATIONS: {
    pattern: /\bfs\.\w+\(/g,
    message: 'fs operations only allowed with typeof guard',
    severity: 'warning' as const,
    code: 'FS_OPERATIONS'
  },
  EVAL_OR_FUNCTION: {
    pattern: /(?:eval\s*\(|new\s+Function\s*\()/g,
    message: 'eval() or Function() allows arbitrary code execution',
    severity: 'error' as const,
    code: 'EVAL_OR_FUNCTION'
  },
  PROCESS_ENV: {
    pattern: /process\.env/g,
    message: 'process.env can cause SSR issues',
    severity: 'warning' as const,
    code: 'PROCESS_ENV'
  }
}

export async function checkGuardrails(
  filePath: string,
  code: string
): Promise<GuardrailCheck> {
  logger.debug(`Checking guardrails: ${filePath}`)

  const errors: string[] = []
  const warnings: string[] = []

  const lines = code.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNumber = i + 1

    for (const [guardrailName, guardrail] of Object.entries(GUARDRAILS)) {
      if (guardrail.pattern.test(line)) {
        const violation: GuardrailViolation = {
          line: lineNumber,
          code: guardrail.code,
          severity: guardrail.severity,
          message: guardrail.message
        }

        if (guardrail.severity === 'error') {
          errors.push(`Line ${lineNumber}: ${guardrail.message}`)
        } else {
          warnings.push(`Line ${lineNumber}: ${guardrail.message}`)
        }

        logger.debug(
          `Violation detected: ${guardrail.code} at line ${lineNumber}`
        )
      }
    }
  }

  if (errors.length > 0 || warnings.length > 0) {
    logger.info(
      `Guardrail check: ${errors.length} error(s), ${warnings.length} warning(s)`
    )
  } else {
    logger.info('No guardrail violations found')
  }

  return {errors, warnings}
}

export function getAllGuardrails(): {
  name: string
  pattern: RegExp
  message: string
  severity: 'error' | 'warning'
  code: string
}[] {
  return Object.entries(GUARDRAILS).map(([name, guardrail]) => ({
    ...guardrail,
    name
  }))
}

export function explainGuardrail(code: string): string {
  const guardrail = GUARDRAILS[code.toUpperCase() as keyof typeof GUARDRAILS]

  if (!guardrail) {
    return `Unknown guardrail: ${code}`
  }

  return `
**${code}**: ${guardrail.message}

**Severity**: ${guardrail.severity.toUpperCase()}

**Pattern**: ${guardrail.pattern.toString()}

**Explanation**:
${getGuardrailExplanation(code)}

**Fix**:
${getGuardrailFix(code)}
  `
}

function getGuardrailExplanation(code: string): string {
  const explanations: Record<string, string> = {
    NO_MATH_RANDOM:
      'Random numbers will cause different output on each render, breaking reproducibility. Seeded random numbers passed via props ensure the same output for the same inputs.',
    FETCH_WITHOUT_ASYNC:
      'Network requests during rendering can cause issues. Remotion provides delayRender/continueRender to handle async operations safely in SSR context.',
    WINDOW_DOCUMENT_WITHOUT_GUARD:
      'window and document objects do not exist in Node.js SSR environment. Always check typeof before using these globals.',
    FS_OPERATIONS:
      'File system operations are not allowed in browser/SSR rendering. Use only with typeof guards when absolutely necessary.',
    EVAL_OR_FUNCTION:
      'eval() and Function() allow arbitrary code execution, which is a security risk. Use dynamic imports or configuration instead.',
    PROCESS_ENV:
      'Environment variables can cause different behavior between dev and production. Prefer explicit configuration.'
  }

  return explanations[code] || 'No explanation available.'
}

function getGuardrailFix(code: string): string {
  const fixes: Record<string, string> = {
    NO_MATH_RANDOM:
      'Replace Math.random() with a seeded random generator: ```typescript\nimport {z} from \'zod\'\n\nconst seededRandom = (seed: number) => {\n  let value = seed\n  return () => {\n    value = (value * 9301 + 49297) % 233280\n    return value / 233280\n  }\n}\n\nconst PropsSchema = z.object({\n  seed: z.number().default(42)\n})\n\n// Usage:\nconst random = seededRandom(props.seed)()\n```',
    FETCH_WITHOUT_ASYNC:
      'Wrap fetch with Remotion async helpers: ```typescript\nimport {delayRender, continueRender} from \'remotion\'\n\nconst fetchData = async (url: string) => {\n  const handle = delayRender()\n  \n  try {\n    const response = await fetch(url)\n    const data = await response.json()\n    continueRender(handle)\n    return data\n  } catch (error) {\n    continueRender(handle)\n    throw error\n  }\n}\n```',
    WINDOW_DOCUMENT_WITHOUT_GUARD:
      'Add typeof guard: ```typescript\nif (typeof window !== \'undefined\') {\n  // Use window here\n}\nif (typeof document !== \'undefined\') {\n  // Use document here\n}\n```',
    FS_OPERATIONS:
      'Add typeof guard: ```typescript\nif (typeof window !== \'undefined\') {\n  // Can use fs operations here\n}\n```',
    EVAL_OR_FUNCTION:
      'Use dynamic imports or configuration instead',
    PROCESS_ENV:
      'Use explicit configuration values instead of process.env'
  }

  return fixes[code] || 'No fix available.'
}

export async function scanDirectory(
  dirPath: string
): Promise<{files: string; violations: GuardrailViolation[]}> {
  const {readdir} = await import('fs/promises')

  const entries = await readdir(dirPath)
  const tsFiles = entries.filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'))

  const allViolations: GuardrailViolation[] = []

  for (const file of tsFiles) {
    const filePath = join(dirPath, file)
    const code = await readFile(filePath, 'utf-8')
    const check = await checkGuardrails(filePath, code)

    for (const msg of check.errors) {
      const match = msg.match(/Line (\d+): /)
      if (match) {
        const lineNumber = parseInt(match[1])
        allViolations.push({
          line: lineNumber,
          code: check.errors[0].split(': ')[1].trim(),
          severity: 'error' as const,
          message: msg.replace(/Line \d+: /, '')
        })
      }
    }
  }

  return {files: tsFiles, violations: allViolations}
}
