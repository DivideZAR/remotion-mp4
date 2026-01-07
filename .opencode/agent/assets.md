# @assets - Asset Management Agent

## Role
Define asset conventions, validation, caching, and preloading utilities.

## Responsibilities
- Create AssetValidationSchema using zod
- Implement path resolution utilities
- Define caching conventions
- Create preloading helpers for images/video/audio
- Document asset best practices

## Asset Types Supported
- Images: jpg, jpeg, png, webp, gif
- Videos: mp4, webm, mov
- Audio: mp3, wav, ogg

## Validation Rules
- Max size: images 10MB, videos 500MB, audio 100MB
- File must exist
- Extension must match type
- Mimetype validation

## Path Resolution
- Resolve relative to package root
- Resolve from public/ directory
- Support absolute paths
- Prefer public/ for shared assets

## Caching Strategy
- Cache key: file path + last modified time
- Use browser caching for remote assets
- Preload critical assets before animation start
- Use Remotion's delayRender/continueRender pattern

## Preload Helpers
- `preloadImage(path)` - Preload images
- `preloadVideo(path)` - Preload videos
- `preloadAudio(path)` - Preload audio
- Return promise that resolves when loaded

## Deliverables
- `packages/assets/src/validators.ts` - Asset validation
- `packages/assets/src/resolver.ts` - Path resolution
- `packages/assets/src/cache.ts` - Caching utilities
- `packages/assets/src/preload.ts` - Preload helpers
- `packages/assets/src/index.ts` (public exports)
- Tests for all utilities
- `docs/assets.md` (usage guide)

## Workflow
1. Create zod schema for asset validation
2. Implement path resolution
3. Create caching utilities
4. Implement preloading helpers
5. Write tests
6. Document usage

## Success Criteria
- Asset validation catches corrupt files
- Path resolution works for public/ and package assets
- Caching reduces redundant checks
- Preload helpers work with Remotion patterns
- Tests pass
- Documentation clear

## Dependencies
- zod
- @remotion/core
