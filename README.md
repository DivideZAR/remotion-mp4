# Remotion MP4 Renderer

Production-grade modular workflow for converting React animations (2D and 3D) into MP4 files using Remotion + Node.js, with support for AI-generated animation code.

## Features

- **2D & 3D Animations**: CSS/SVG/Canvas and React Three Fiber via @remotion/three
- **AI Code Intake**: Dedicated workflow for importing AI-generated React animation code
- **Modular Architecture**: Each module independently testable with clear contracts
- **Max Duration Control**: Configurable video length limits per project run
- **Local Development**: Optimized for local development with fast feedback loops
- **Comprehensive Testing**: Unit, integration, and e2e tests with 80%+ coverage
- **Type Safety**: Full TypeScript implementation with strict mode

## Quickstart

### Installation

```bash
# Clone repository
git clone <repo-url>
cd Remotion_mp4

# Install dependencies
npm install
```

### Basic Usage

```bash
# Start Remotion Studio (dev mode)
npm run dev

# Render a built-in 2D animation
npm run render -- --comp SimpleText --out out/text.mp4

# Render a built-in 3D animation
npm run render -- --comp RotatingCube --out out/cube.mp4 --gl swangle
```

### External (AI-Generated) Animations

```bash
# 1. Place your animation code in input/my-animation/
# 2. Validate
npm run intake:validate

# 3. Import
npm run intake:import -- --source my-animation

# 4. Render with max duration
npm run render -- --comp MyAnimation --out out/my-anim.mp4 --max-duration 30
```

## CLI Options

- `--comp <name>` - Composition ID to render (required)
- `--out <path>` - Output MP4 path (required)
- `--props <path>` - JSON file with composition props (optional)
- `--gl <angle|swangle|swiftshader|egl>` - WebGL mode (default: angle/swangle)
- `--codec <h264|vp8|vp9|prores>` - Video codec (default: h264)
- `--max-duration <seconds>` - Maximum video length (default: 60)

## Documentation

- [Architecture](docs/architecture.md) - Module diagrams and contracts
- [Rendering](docs/rendering.md) - SSR flow and performance
- [3D Animations](docs/3d.md) - @remotion/three gotchas
- [Testing](docs/testing.md) - Test strategy
- [Contributing](docs/contributing.md) - Git workflow and PR process
- [AI Intake](docs/ai-intake.md) - External code contract
- [Troubleshooting](docs/troubleshooting.md) - Common issues

## Development

```bash
# Lint
npm run lint

# Typecheck
npm run typecheck

# Run tests
npm test

# Test coverage
npm run test:coverage
```

## Project Structure

```
Remotion_mp4/
├── input/                    # Upload AI-generated code here
├── apps/studio/              # Remotion Studio app
├── packages/
│   ├── core/                 # Shared types and utilities
│   ├── renderer/             # SSR rendering + CLI
│   ├── animations-2d/        # 2D compositions
│   ├── animations-3d/        # 3D compositions
│   ├── animations-external/  # Processed external code
│   ├── intake/               # Validation + scaffolding
│   └── assets/               # Asset management
├── docs/                     # Documentation
├── prompts/                  # AI codegen prompts
└── STATUS.md                 # Progress tracking
```

## License

MIT
