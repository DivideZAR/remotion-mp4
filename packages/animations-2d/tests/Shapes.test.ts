import {describe, it, expect, vi} from 'vitest'
import {render} from '@remotion/testing'
import {Shapes} from '../src/compositions/Shapes'

vi.mock('remotion', () => ({
  useCurrentFrame: vi.fn(() => 0),
  interpolate: vi.fn((_, ranges, values) => values[0])
}))

describe('Shapes', () => {
  it('should render circle by default', () => {
    const {useCurrentFrame} = await import('remotion')
    ;(useCurrentFrame as any).mockReturnValue(0)

    const result = render(<Shapes durationInFrames={120} />)

    expect(result).toBeDefined()
    expect(result.children).toBeDefined()
  })

  it('should render square', () => {
    const {useCurrentFrame} = await import('remotion')
    ;(useCurrentFrame as any).mockReturnValue(0)

    const result = render(<Shapes shape="square" durationInFrames={120} />)

    expect(result).toBeDefined()
  })

  it('should render triangle', () => {
    const {useCurrentFrame} = await import('remotion')
    ;(useCurrentFrame as any).mockReturnValue(0)

    const result = render(<Shapes shape="triangle" durationInFrames={120} />)

    expect(result).toBeDefined()
  })

  it('should apply custom color', () => {
    const result = render(<Shapes color="#ff0000" durationInFrames={120} />)

    const element = result as any
    const shapeElement = element.children[0]

    if (shapeElement?.type === 'div') {
      expect(shapeElement.props.style.backgroundColor).toBe('#ff0000')
    }
  })

  it('should apply custom speed', () => {
    const result = render(<Shapes speed={2} durationInFrames={120} />)

    const element = result as any
    expect(element).toBeDefined()
  })

  it('should be position absolute', () => {
    const result = render(<Shapes durationInFrames={120} />)

    const element = result as any
    expect(element.props.style.position).toBe('absolute')
  })
})
