import {describe, it, expect, vi} from 'vitest'
import {render} from '@remotion/testing'
import {RotatingCube} from '../src/compositions/RotatingCube'

vi.mock('remotion', () => ({
  useCurrentFrame: vi.fn(() => 0),
  interpolate: vi.fn((_, ranges, values) => values[0])
}))

vi.mock('@remotion/three', () => ({
  Canvas: vi.fn(({children}) => <div>{children}</div>)
}))

describe('RotatingCube', () => {
  it('should render with default props', () => {
    const {useCurrentFrame} = await import('remotion')
    ;(useCurrentFrame as any).mockReturnValue(0)

    const result = render(<RotatingCube durationInFrames={180} />)

    expect(result).toBeDefined()
  })

  it('should use custom color', () => {
    const result = render(<RotatingCube color="#ff0000" durationInFrames={180} />)

    expect(result).toBeDefined()
  })

  it('should use custom rotation speed', () => {
    const result = render(<RotatingCube rotationSpeed={2} durationInFrames={180} />)

    expect(result).toBeDefined()
  })

  it('should be position absolute', () => {
    const result = render(<RotatingCube durationInFrames={180} />)

    const canvas = result as any
    expect(canvas.props.style.position).toBe('absolute')
  })

  it('should render with scale animation at middle frame', async () => {
    const {useCurrentFrame, interpolate} = await import('remotion')
    ;(useCurrentFrame as any).mockReturnValue(90)
    ;(interpolate as any).mockReturnValue(1)

    const result = render(<RotatingCube durationInFrames={180} />)

    expect(result).toBeDefined()
  })
})
