import {bundle} from '@remotion/bundler'
import {selectComposition} from '@remotion/renderer'
import {CompositionMetadata} from '@remotion-mp4/core'
import {logger} from '@remotion-mp4/core'

export interface SelectionOptions {
  bundlePath: string
  compositionId: string
  inputProps?: Record<string, unknown>
}

export interface SelectionResult {
  composition: CompositionMetadata
  component: any
}

export async function selectCompositionWrapper(
  options: SelectionOptions
): Promise<SelectionResult> {
  const {bundlePath, compositionId, inputProps = {}} = options

  logger.info(`Selecting composition: ${compositionId}`)

  try {
    const composition = await selectComposition({
      compositionId,
      inputProps,
      bundledComposition: bundlePath
    })

    if (!composition) {
      throw new Error(`Composition "${compositionId}" not found`)
    }

    logger.info(
      `Composition found: ${compositionId} (${composition.width}x${composition.height}, ${composition.fps}fps, ${composition.durationInFrames} frames)`
    )

    const metadata: CompositionMetadata = {
      id: compositionId,
      width: composition.width,
      height: composition.height,
      fps: composition.fps,
      durationInFrames: composition.durationInFrames,
      durationInSeconds: composition.durationInFrames / composition.fps
    }

    return {
      composition: metadata,
      component: composition.component
    }
  } catch (error) {
    logger.error(`Failed to select composition: ${error}`)
    throw new Error(
      `Composition selection failed: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

export async function listCompositions(
  bundlePath: string,
  inputProps?: Record<string, unknown>
): Promise<CompositionMetadata[]> {
  logger.info('Listing available compositions...')

  try {
    const compositions = await bundle({
      entryPoint: bundlePath
    })

    if (!compositions) {
      throw new Error('No compositions found')
    }

    const metadata: CompositionMetadata[] = Object.entries(compositions).map(
      ([id, comp]) => ({
        id,
        width: comp.width,
        height: comp.height,
        fps: comp.fps,
        durationInFrames: comp.durationInFrames,
        durationInSeconds: comp.durationInFrames / comp.fps
      })
    )

    logger.info(`Found ${metadata.length} composition(s)`)

    return metadata
  } catch (error) {
    logger.error(`Failed to list compositions: ${error}`)
    throw new Error(
      `Failed to list compositions: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}
