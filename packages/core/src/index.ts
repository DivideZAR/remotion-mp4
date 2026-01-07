export {
  ExternalComposition,
  ExternalCompositionPackage,
  CompositionMetadata,
  PropsSchema,
  ExternalCompositionSchema,
  CompositionMetadataSchema,
  calculateDurationInSeconds
} from './types/composition'

export {
  VideoCodec,
  WebGLMode,
  ChromiumOptions,
  RenderOptions,
  RenderResult,
  BundleOptions,
  RenderOptionsSchema,
  DefaultRenderOptions,
  getDefaultWebGLMode
} from './types/render'

export {
  Asset,
  AssetType,
  AssetFormat,
  AssetValidationResult,
  AssetSizeLimits,
  ImageFormats,
  VideoFormats,
  AudioFormats,
  getAssetTypeFromExtension,
  getMimeType,
  validateAssetSize,
  AssetSchema
} from './types/asset'

export {
  Logger,
  LogLevel,
  createLogger,
  logger
} from './utils/logger'

export {
  ValidationError,
  validateData,
  isValidCompositionId,
  validateCompositionId,
  isValidFilePath,
  validateFilePath,
  isPositiveInteger,
  validatePositiveInteger,
  isInRange,
  validateRange,
  validateFPS,
  validateCodec,
  validateWebGLMode,
  sanitizeString
} from './utils/validators'
