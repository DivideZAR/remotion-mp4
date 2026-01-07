import {renderMedia, OnStartData} from '@remotion/renderer'
import {RenderOptions, RenderResult} from '@remotion-mp4/core'
import {bundleComposition} from './bundler'
import {selectCompositionWrapper} from './selector'
import {logger} from '@remotion-mp4/core'
import {stat} from 'fs/promises'

export async function renderToMp4(options: RenderOptions): Promise<RenderResult> {
  const {
    compositionId,
    inputProps = {},
    outputPath,
    codec = 'h264',
    chromiumOptions = {},
    concurrency = 1,
    timeoutInMilliseconds = 120000,
    maxDurationSeconds = 60
  } = options

  const startTime = Date.now()

  logger.info(`Starting render: ${compositionId} -> ${outputPath}`)

  try {
    const bundleResult = await bundleComposition({
      compositionId,
      inputProps
    })

    const selection = await selectCompositionWrapper({
      bundlePath: bundleResult.bundlePath,
      compositionId,
      inputProps
    })

    const {composition} = selection

    logger.info(`Composition duration: ${composition.durationInSeconds.toFixed(2)}s`)

    if (maxDurationSeconds && composition.durationInSeconds > maxDurationSeconds) {
      throw new Error(
        `Video duration (${composition.durationInSeconds.toFixed(2)}s) exceeds max duration (${maxDurationSeconds}s). ` +
        `Reduce frames (${composition.duration.durationInFrames}), increase FPS (${composition.fps}), or increase --max-duration.`
      )
    }

    logger.info('Starting media render...')

    const renderProgress = (progress: {
      renderedFrames: number
      encodedFrames: number
      renderedDurationInMilliseconds: number
      encodedDurationInMilliseconds: number
      stitchStage: 'encoding' | 'stitching' | 'muxing'
    }) => {
      const renderedSeconds = progress.renderedDurationInMilliseconds / 1000
      logger.debug(
        `Render progress: ${progress.renderedFrames}/${composition.durationInFrames} frames (${renderedSeconds.toFixed(2)}s)`
      )
    }

    await renderMedia({
      composition,
      serveUrl: bundleResult.bundlePath,
      codec,
      outputLocation: outputPath,
      inputProps,
      chromiumOptions,
      concurrency,
      timeoutInMilliseconds,
      onProgress: renderProgress,
      // Disable browser ui for headless rendering
      browserExecutable: undefined,
      // Default chromium options
      envVariables: {},
      // Override remotion config
      overwrite: true
    })

    const endTime = Date.now()
    const renderTimeMs = endTime - startTime

    const stats = await stat(outputPath)

    logger.info(`Render completed successfully in ${(renderTimeMs / 1000).toFixed(2)}s`)
    logger.info(`Output: ${outputPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`)

    return {
      success: true,
      outputPath,
      duration: composition.durationInSeconds,
      sizeBytes: stats.size,
      codec,
      renderTimeMs
    }
  } catch (error) {
    const endTime = Date.now()
    const renderTimeMs = endTime - startTime

    const errorMessage = error instanceof Error ? error.message : String(error)

    logger.error(`Render failed: ${errorMessage}`)

    return {
      success: false,
      error: errorMessage,
      renderTimeMs
    }
  }
}

export async function validateRenderOptions(
  options: RenderOptions
): Promise<void> {
  const {compositionId, outputPath} = options

  if (!compositionId || compositionId.length === 0) {
    throw new Error('Composition ID is required (--comp flag)')
  }

  if (!outputPath || outputPath.length === 0) {
    throw new Error('Output path is required (--out flag)')
  }

  if (!outputPath.toLowerCase().endsWith('.mp4')) {
    throw new Error('Output path must end with .mp4')
  }
}

export async function renderCompositions(
  compositions: {id: string; outputPath: string}[],
  options: Partial<RenderOptions>
): Promise<RenderResult[]> {
  const results: RenderResult[] = []

  logger.info(`Rendering ${compositions.length} composition(s)...`)

  for (const comp of compositions) {
    const result = await renderToMp4({
      compositionId: comp.id,
      outputPath: comp.outputPath,
      ...options
    })

    results.push(result)

    if (!result.success) {
      logger.error(`Failed to render ${comp.id}: ${result.error}`)
    }
  }

  return results
}
