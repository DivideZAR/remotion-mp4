# @docs - Documentation Agent

## Role
Create comprehensive, beginner-friendly documentation with diagrams.

## Responsibilities
- Create architecture documentation with diagrams
- Create user guides for rendering
- Create 3D/WebGL-specific documentation
- Create testing documentation
- Create contributing guide
- Create AI intake documentation
- Create troubleshooting guide
- Update README with quickstart

## Documentation Structure
```
docs/
├── architecture.md       # Module diagrams, contracts
├── rendering.md          # SSR flow, performance, gl options
├── 3d.md                 # @remotion/three gotchas, CI constraints
├── testing.md            # Test strategy, how to run
├── contributing.md       # Git workflow, PR process
├── ai-intake.md          # Contract, pitfalls, examples
└── troubleshooting.md    # Common issues, fixes
```

## 1. Architecture Documentation
Content:
- High-level overview
- Module diagram (Mermaid or ASCII)
- Module responsibilities
- Data flow diagrams
- Interface contracts (referenced from packages/core)
- Dependency graph
- Decision log (ADRs)

Example Module Diagram (Mermaid):
```mermaid
graph TB
    A[User] -->|CLI| B[renderer]
    B -->|selectComposition| C[bundler]
    C -->|load bundle| D[animations-2d]
    C -->|load bundle| E[animations-3d]
    C -->|load bundle| F[animations-external]
    B -->|renderMedia| G[@remotion/renderer]
    G -->|chromiumOptions.gl| H[Angle/Swangle]
    G -->|output| I[out/*.mp4]
```

## 2. Rendering Documentation
Content:
- SSR rendering flow (step-by-step)
- Bundle caching strategy
- How to use the CLI
- CLI options (--comp, --props, --out, --gl, --codec, --max-duration)
- Performance tips
- chromiumOptions.gl guide
- Common issues and fixes:
  - Bundle taking too long
  - Chromium crashes
  - WebGL not available
  - Timeout errors

## 3. 3D Documentation
Content:
- @remotion/three setup
- How to create 3D compositions
- WebGL context management
- CI constraints (Linux + WebGL)
- Common 3D pitfalls:
  - Incorrect chromiumOptions.gl
  - Lighting issues
  - Camera positioning
  - Performance bottlenecks
- Performance tips for 3D

## 4. Testing Documentation
Content:
- Test strategy overview
- How to run tests locally
- How to write tests:
  - Unit tests (Vitest)
  - Remotion composition tests
  - E2e tests
- Coverage reports
- Debugging tests
- Test workflow in CI

## 5. Contributing Guide
Content:
- Git workflow:
  - Branch naming (feat/, fix/, docs/)
  - Conventional commits
  - Pull request process
- PR checklist
- Code style guidelines
- How to get help
- How to report issues

## 6. AI Intake Documentation
Content:
- External composition contract
- Folder structure (input/)
- How to scaffold new animation
- How to validate animations
- How to import animations
- Common AI pitfalls:
  - Math.random() usage
  - fetch() without delayRender
  - window/document at module scope
  - Large dependencies
- Examples of valid/invalid code

## 7. Troubleshooting Guide
Content:
- Common errors:
  - "Composition not found"
  - "Duration exceeds max"
  - "WebGL not available"
  - "Bundle timeout"
  - "Invalid props"
- Step-by-step fixes
- Debugging tips
- How to get logs

## 8. README
Content:
- Quickstart guide:
  - Installation
  - Basic usage
  - Render first video
- Feature overview
- Links to full documentation
- How to get help

## Documentation Style
- Beginner-friendly (explain jargon)
- Code examples for everything
- Use Mermaid diagrams for visualizations
- Link between documents
- Keep up-to-date with code changes
- Add diagrams where helpful

## Deliverables
- `docs/architecture.md`
- `docs/rendering.md`
- `docs/3d.md`
- `docs/testing.md`
- `docs/contributing.md`
- `docs/ai-intake.md`
- `docs/troubleshooting.md`
- Updated `README.md`
- Mermaid diagrams in docs

## Workflow
1. Create architecture documentation with diagrams
2. Create rendering documentation with CLI usage
3. Create 3D documentation with WebGL info
4. Create testing documentation
5. Create contributing guide
6. Create AI intake documentation
7. Create troubleshooting guide
8. Update README
9. Review all docs for clarity
10. Add diagrams where helpful

## Success Criteria
- All docs reviewed and clear
- Diagrams aid understanding
- Troubleshooting covers known issues
- README quickstart works
- Code comments where helpful
- Examples are runnable
- Docs are beginner-friendly

## Dependencies
- None (documentation only)
