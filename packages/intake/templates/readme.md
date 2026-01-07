# ${PACKAGE_NAME}

${IS_3D ? 'A 3D animation' : 'A 2D animation'} using ${IS_3D ? '@remotion/three' : 'Remotion primitives'}.

## Usage

### Render with Default Props

\`\`\`bash
npm run render -- --comp ${PACKAGE_NAME} --out out/${PACKAGE_NAME.toLowerCase()}.mp4${IS_3D ? ' --gl swangle' : ''}
\`\`\`

### Render with Custom Props

Create a props file:
\`\`\`bash
echo '${IS_3D ? '{"color":"#ff0000","rotationSpeed":2}' : '{"text":"Custom Text","color":"#ff0000","fontSize":80"}' > props.json
\`\`\`

Render with props:
\`\`\`bash
npm run render -- --comp ${PACKAGE_NAME} --out out/${PACKAGE_NAME.toLowerCase()}.mp4 --props props.json${IS_3D ? ' --gl swangle' : ''}
\`\`\`

### Preview in Studio

\`\`\`bash
npm run dev
\`\`\`

## Props

${IS_3D ? '- \`color\` (hex): Box color (default: #00ff00)
- \`rotationSpeed\` (number): Rotation speed 1-3 (default: 1)' : '- \`text\` (string): Text to display (default: "Hello World")
- \`color\` (hex): Text color (default: #ffffff)
- \`fontSize\` (number): Font size 1-200 (default: 60)'}

## Technical Details

- Resolution: 1920x1080
- FPS: 30
- Duration: 90 frames (3 seconds)
- Frame range: 0-89

${IS_3D ? `### WebGL Context
- **Local dev**: \`--gl angle\` (macOS/Windows)
- **CI/Linux**: \`--gl swangle\` (recommended)
- **Fallback**: \`--gl swiftshader\` (slowest)
- **Critical**: Always specify \`--gl\` flag for 3D renders` : '### Notes
- Uses absolute positioning
- Smooth animations with \`interpolate()\`
- Props validated with Zod schema
- Follows external composition contract

## Development

### Validate
\`\`\`bash
npm run intake:validate
\`\`\`

### Import
\`\`\`bash
npm run intake:import -- --source ${PACKAGE_NAME}
\`\`\`

## Author

AI-generated or manually created.
