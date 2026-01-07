# Rendering Documentation

This document explains the rendering pipeline, SSR (Server-Side Rendering) strategy, performance considerations, and WebGL modes.

## Overview

The rendering system uses Remotion's SSR capabilities to render React animations to MP4 files in a headless Chromium environment.

## Rendering Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                        Rendering Pipeline                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. CLI Input                                                   │
│     └─ parse arguments (comp, out, props, gl, codec)           │
│                           ↓                                      │
│  2. Bundle Composition                                          │
│     └─ create browser bundle with webpack/bundler               │
│                           ↓                                      │
│  3. Select Composition                                          │
│     └─ load bundle, find composition by ID                      │
│                           ↓                                      │
│  4. Validate Options                                            │
│     └─ check duration, props, codec compatibility               │
│                           ↓                                      │
│  5. SSR Render                                                  │
│     ├─ launch headless Chromium                                 │
│     ├─ load bundle                                              │
│     ├─ render each frame                                        │
│     └─ encode to video                                          │
│                           ↓                                      │
│  6. Output                                                      │
│     └─ save MP4 file, return metadata                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Server-Side Rendering (SSR)

### How SSR Works

1. **Bundle Creation**: Webpack bundles React code into browser-compatible JS
2. **Chromium Launch**: Headless browser runs the bundle
3. **Frame Rendering**: Each frame rendered via React DOM
4. **Frame Capture**: Puppeteer captures canvas/SVG output
5. **Video Encoding**: Frames encoded to MP4 with specified codec

### SSR Requirements

- **Node.js 18+**: For native fetch and async handling
- **Headless Chromium**: For frame rendering (installed with Remotion)
- **Sufficient Memory**: Each render process uses ~500MB-2GB RAM
- **CPU Cores**: Parallel encoding benefits from multiple cores

## WebGL Modes

### Available Modes

| Mode          | Description                   | Use Case       |
| ------------- | ----------------------------- | -------------- |
| `angle`       | DirectX via ANGLE (Windows)   | 3D on Windows  |
| `swangle`     | Software ANGLE                | Fallback 3D    |
| `swiftshader` | SwiftShader software renderer | CPU-based 3D   |
| `egl`         | Native EGL (Linux)            | 3D on Linux    |
| `angle9`      | DirectX 9 (legacy Windows)    | Legacy systems |

### Choosing a Mode

```bash
# Default (auto-selects based on platform)
npm run render -- --comp My3DAnim --out out.mp4

# Software rendering (works everywhere, slower)
npm run render -- --comp My3DAnim --out out.mp4 --gl swangle

# Hardware acceleration (faster, platform-dependent)
npm run render -- --comp My3DAnim --out out.mp4 --gl angle

# Maximum compatibility
npm run render -- --comp My3DAnim --out out.mp4 --gl swiftshader
```

### 3D Animation Requirements

3D animations using `@remotion/three` require WebGL:

```bash
# Without --gl flag: ERROR "WebGL not available"
npm run render -- --comp RotatingCube --out out.mp4
# ❌ Error: WebGL not available

# With --gl flag: SUCCESS
npm run render -- --comp RotatingCube --out out.mp4 --gl swangle
# ✅ Works on all platforms
```

## Video Codecs

### Available Codecs

| Codec    | Format | Quality  | File Size | Compatibility   |
| -------- | ------ | -------- | --------- | --------------- |
| `h264`   | MP4    | High     | Medium    | Universal       |
| `vp8`    | WebM   | Good     | Small     | Web only        |
| `vp9`    | WebM   | Higher   | Small     | Modern browsers |
| `prores` | MOV    | Lossless | Large     | Professional    |

### Codec Selection

```bash
# H.264 - Best compatibility
npm run render -- --comp MyAnim --out out.mp4 --codec h264

# VP9 - Better compression for web
npm run render -- --comp MyAnim --out out.webm --codec vp9

# ProRes - Professional quality (large files)
npm run render -- --comp MyAnim --out out.mov --codec prores
```

### Codec Recommendations

- **Web distribution**: `h264` or `vp9`
- **Archive/backup**: `prores`
- **Quick previews**: `vp8`
- **Social media**: `h264` (most compatible)

## Performance Optimization

### Memory Management

```typescript
// Reduce memory by limiting并发渲染
const options = {
  chromiumOptions: {
    headless: true,
    // Limit memory
  },
}

// Clear bundle cache between renders
import { clearCache } from '@remotion-mp4/renderer'

clearCache() // Release memory from previous renders
```

### Duration Limits

```bash
# Set maximum render duration (prevents infinite renders)
npm run render -- --comp MyAnim --out out.mp4 --max-duration 30

# Render won't exceed 30 seconds (900 frames at 30fps)
```

### Frame Skipping for Previews

```bash
# Render every 10th frame for quick preview
# Then interpolate in post-production
npm run render -- --comp MyAnim --out out_preview.mp4 --every-nth-frame 10
```

### Parallel Rendering

For multiple renders:

```bash
# Terminal 1
npm run render -- --comp Anim1 --out out1.mp4

# Terminal 2
npm run render -- --comp Anim2 --out out2.mp4

# Each uses separate Chromium process
```

## Props and Dynamic Content

### Passing Props via CLI

```bash
# Single prop
npm run render -- --comp Greeting --out out.mp4 --props '{"text":"Hello"}'

# Multiple props
npm run render -- --comp Banner --out out.mp4 --props '{
  "title": "Welcome",
  "subtitle": "To Our Site",
  "background": "#ff0000"
}'
```

### Props File

Create `props.json`:

```json
{
  "text": "Custom Text",
  "color": "#3498db",
  "fontSize": 72,
  "duration": 5.0
}
```

Then:

```bash
npm run render -- --comp MyAnim --out out.mp4 --props props.json
```

### Dynamic Props in Code

```tsx
interface MyAnimationProps {
  text: string
  color: string
  duration: number
}

export const MyAnimation: React.FC<MyAnimationProps> = ({ text, color, duration }) => {
  const frame = useCurrentFrame()
  const fps = 30
  const progress = Math.min(frame / (duration * fps), 1)

  return (
    <div
      style={{
        color,
        opacity: progress,
        transform: `translateY(${progress * 100}px)`,
      }}
    >
      {text}
    </div>
  )
}
```

## Troubleshooting

### Common Rendering Issues

#### Issue: "Composition not found"

**Cause**: Composition ID doesn't match registered name.

**Solution**:

```bash
# List available compositions
npm run render -- --list

# Use correct ID
npm run render -- --comp CorrectId --out out.mp4
```

#### Issue: "Render timeout"

**Cause**: Animation too long or infinite loop.

**Solution**:

```bash
# Add max duration
npm run render -- --comp MyAnim --out out.mp4 --max-duration 10
```

#### Issue: "Memory exhausted"

**Cause**: Large composition or too many assets.

**Solution**:

```bash
# Reduce resolution
# Use simpler compositions
# Clear cache first
npm run render -- --comp MyAnim --out out.mp4
```

#### Issue: "WebGL not available"

**Cause**: Rendering 3D animation without WebGL mode.

**Solution**:

```bash
npm run render -- --comp RotatingCube --out out.mp4 --gl swangle
```

### Performance Benchmarks

| Composition  | Duration | Resolution | Time   | Memory |
| ------------ | -------- | ---------- | ------ | ------ |
| SimpleText   | 5s       | 1080p      | ~30s   | ~500MB |
| RotatingCube | 10s      | 1080p      | ~2min  | ~1GB   |
| ComplexScene | 30s      | 4K         | ~15min | ~2GB   |

### Render Metadata

After rendering, metadata is returned:

```typescript
interface RenderResult {
  outputPath: string
  sizeInBytes: number
  durationInSeconds: number
  codec: VideoCodec
  resolution: { width: number; height: number }
  fps: number
}
```

## Advanced Usage

### Custom Chromium Options

```bash
# Disable web security (CORS workarounds)
npm run render -- --comp MyAnim --out out.mp4 \
  --disable-web-security

# Use specific browser binary
npm run render -- --comp MyAnim --out out.mp4 \
  --browser-executable-path /path/to/chrome
```

### Environment Variables

```bash
# Increase Chromium heap
export CHROMIUM_FLAGS="--no-sandbox --disable-dev-shm-usage"

# Disable GPU (software rendering)
export DISABLE_GPU=1
```

### Bundle Customization

The bundler supports custom webpack config:

```typescript
import { bundleComposition } from '@remotion-mp4/renderer'

const result = await bundleComposition('MyComposition', {
  webpackOverride: (config) => {
    // Add custom loaders
    config.module.rules.push({
      test: /\.custom$/,
      use: 'custom-loader',
    })
    return config
  },
})
```
