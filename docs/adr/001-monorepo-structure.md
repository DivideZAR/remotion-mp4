# ADR-001: Monorepo Structure

## Status
Accepted

## Context
We need to build a modular Remotion rendering workflow with multiple packages:
- Core types and utilities
- Renderer implementation
- 2D and 3D animations
- External code intake
- Asset management

Each package should be independently testable and deployable.

## Decision
Use npm workspaces to implement a monorepo structure.

### Repository Layout
```
Remotion_mp4/
├── packages/
│   ├── core/                 # Shared types, interfaces, utilities
│   ├── renderer/             # SSR rendering + CLI
│   ├── animations-2d/        # 2D compositions
│   ├── animations-3d/        # 3D compositions
│   ├── animations-external/    # Processed external code
│   ├── intake/                # Validation + scaffolding
│   └── assets/                # Asset management
└── apps/
    └── studio/                # Remotion Studio app
```

### Advantages
1. **Single Version Control**: All packages in one repo, easy versioning
2. **Shared Dependencies**: npm workspaces deduplicates common dependencies
3. **Atomic Commits**: Changes across packages can be committed together
4. **Simplified CI/CD**: Single pipeline for all packages
5. **Local Development**: Can run packages locally without publishing

### Implementation
- Root `package.json` defines workspaces: `["packages/*", "apps/*"]`
- Each package has its own `package.json` with dependencies
- Use exact versions for Remotion packages for stability
- Use `npm run --workspace=<name>` to run commands in specific workspaces

## Consequences
### Positive
- Easy to develop and test all packages together
- Clear module boundaries
- Simplified dependency management

### Negative
- Larger repository
- Need to be careful with circular dependencies

## Alternatives Considered
1. **Multi-repo**: Too complex for small team, hard to coordinate changes
2. **Single package**: Not modular enough, can't test independently
3. **pnpm workspaces**: Good option, but npm is more widely used

## Related Decisions
- ADR-002: External Composition Contract
- ADR-003: SSR Rendering Strategy
