# @intake - External Code Intake Agent

## Role
Implement validation, scaffolding, and import process for AI-generated animation code.

## Responsibilities
- Create scaffolding command for new external animations
- Create validation command for existing animations
- Create import commands (single and batch)
- Implement guardrails to block unsafe patterns
- Document external composition contract
- Create prompt template for other AIs

## Folder Structure
User-facing `input/` directory:
```
input/
├── my-first-animation/
│   ├── Composition.tsx
│   ├── props.ts
│   ├── register.ts
│   ├── package.json (optional)
│   └── README.md
└── .gitkeep
```

Processed code in `packages/animations-external/`

## CLI Commands
- `intake:validate` - Validate all animations in input/
- `intake:validate -- --source <name>` - Validate specific animation
- `intake:import -- --source <name>` - Import single animation
- `intake:import-all` - Import all validated animations
- `intake:new -- --name <pkg> --kind 2d|3d` - Scaffold new template
- `intake:list` - List available animations in input/

## Validation Checks
1. TypeScript compilation (`tsc --noEmit`)
2. ESLint checks
3. registerExternalCompositions() export exists
4. Guardrails check:
   - No Math.random() (require seededRandom via props)
   - No fetch() without delayRender/continueRender
   - No window/document at module scope (use typeof check)
   - No fs operations
   - No eval() or Function()

## Guardrails Rationale
- **Deterministic rendering**: Math.random() produces different frames each render
- **Async safety**: Fetch must use Remotion's delayRender/continueRender
- **SSR compatibility**: window/document not available in Node SSR
- **Security**: fs, eval, Function() allow code injection
- **Performance**: Large dependencies slow down bundling

## External Composition Contract
Every external package must export:
```typescript
import {z} from 'zod'

// Props schema
export const PropsSchema = z.object({
  // Define props here
})

// Component
export const Composition: React.FC<Props> = (props) => {
  // Component implementation
}

// Registration function
export function registerExternalCompositions() {
  return [{
    id: 'CompositionName',
    component: Composition,
    defaultProps: {},
    propsSchema: PropsSchema,
    width: 1920,
    height: 1080,
    fps: 30,
    durationInFrames: 90
  }]
}
```

## Scaffolding Templates
Generate template files with:
- Composition.tsx - Basic component structure
- props.ts - Zod schema + defaultProps
- register.ts - Registration function
- package.json - Minimal dependencies
- README.md - Usage instructions

## Deliverables
- `packages/intake/src/scaffold.ts` - Scaffold command
- `packages/intake/src/validator.ts` - Validation logic
- `packages/intake/src/importer.ts` - Import logic
- `packages/intake/src/guardrails.ts` - Guardrail checks
- `packages/intake/bin/validate.js` - Validate CLI
- `packages/intake/bin/import.js` - Import CLI
- `packages/intake/bin/import-all.js` - Batch import
- `packages/intake/bin/new.js` - Scaffold CLI
- `packages/intake/bin/list.js` - List CLI
- Template files in `packages/intake/templates/`
- `prompts/animation-codegen.md` - Prompt for other AIs
- `docs/ai-intake.md` - Contract documentation
- Tests for all commands

## Workflow
1. Create scaffolding command with templates
2. Create validation command
3. Create import commands
4. Implement guardrails detection
5. Create prompt template for external AIs
6. Write documentation
7. Write tests
8. Test full workflow: scaffold → validate → import → render

## Success Criteria
- Can scaffold new external animation
- Validation catches common errors
- Guardrails detect disallowed patterns
- Import command copies to packages/animations-external/
- Batch import processes all valid animations
- Prompt template produces valid code
- All tests pass
- Documentation clear and comprehensive

## Dependencies
- zod
- @remotion/core
- yargs (for CLI)
- typescript
- eslint
