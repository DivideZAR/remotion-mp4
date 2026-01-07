# ADR-002: External Composition Contract

## Status
Accepted

## Context
We need to support AI-generated React animation code that can be imported, validated, and rendered reliably.

The system must:
1. Accept external animation code from AI systems
2. Validate the code before importing
3. Enforce guardrails for safety and determinism
4. Integrate external compositions into the rendering pipeline

## Decision
Define a strict **External Composition Contract** that all external code must follow.

### Contract Requirements

Every external animation package must:

1. **Export a registration function**:
```typescript
export function registerExternalCompositions(): ExternalComposition[]
```

2. **Register each composition with metadata**:
```typescript
interface ExternalComposition {
  id: string                    // Unique composition ID
  component: React.FC<any>       // React component
  defaultProps: Record<string, unknown>  // Default props
  propsSchema: z.ZodSchema       // Zod validation schema
  width: number                  // Resolution width
  height: number                 // Resolution height
  fps: number                   // Frames per second
  durationInFrames: number        // Total frames
}
```

3. **Structure files in a standard layout**:
```
input/my-animation/
├── Composition.tsx             # Main component
├── props.ts                    # Props schema + defaults
├── register.ts                 # Registration function
├── package.json               # Dependencies (optional)
└── README.md                 # Documentation
```

### Guardrails

External code is validated for:

1. **Deterministic Rendering**:
   - No `Math.random()` at render-time
   - Use seeded random via inputProps if needed

2. **SSR Compatibility**:
   - No `window` or `document` at module scope
   - Use `typeof window !== 'undefined'` checks

3. **Async Safety**:
   - No `fetch()` without `delayRender/continueRender`
   - Use Remotion's async patterns

4. **Security**:
   - No `eval()` or `Function()`
   - No `fs` operations from animation code

5. **Performance**:
   - Avoid huge dependencies
   - Prefer lightweight libraries

### Intake Workflow

1. **Scaffold**: `npm run intake:new -- --name <pkg> --kind 2d|3d`
2. **Place Code**: Drop files in `input/<pkg>/`
3. **Validate**: `npm run intake:validate`
4. **Import**: `npm run intake:import -- --source <pkg>`
5. **Render**: `npm run render -- --comp <CompId> --out out/video.mp4`

## Advantages

1. **Type Safety**: All compositions typed and validated
2. **Standardization**: Clear contract for AI systems
3. **Guardrails**: Enforces safety and determinism
4. **Modularity**: External compositions self-contained
5. **Validation**: Catches errors before rendering

## Consequences

### Positive
- AI-generated code is safer and more reliable
- Clear contract for external contributors
- Validation catches common mistakes
- Guardrails prevent dangerous patterns

### Negative
- More boilerplate for external code
- Must follow strict conventions
- Some flexibility reduced for safety

## Alternatives Considered

1. **Loose Contract**: Too risky, allows unsafe code
2. **Runtime-only Validation**: Too late, could cause failures
3. **Code Sandboxing**: Overkill for this use case, complex to implement

## Related Decisions

- ADR-001: Monorepo Structure
- ADR-003: SSR Rendering Strategy
