import {describe, it, expect, vi} from 'vitest'
import {render} from '@remotion/testing'
import {SimpleText} from '../src/compositions/SimpleText'

vi.mock('remotion', () => ({
  useCurrentFrame: vi.fn(() => 0),
  interpolate: vi.fn((_, ranges, values) => values[0])
}))

describe('SimpleText', () => {
  it('should render with default props', () => {
    const result = render(<SimpleText durationInFrames={90} />)

    expect(result).toBeDefined()
    expect(result.textContent).toBe('Hello Remotion')
  })

  it('should use custom text prop', () => {
    const {useCurrentFrame} = await import('remotion')
    ;(useCurrentFrame as any).mockReturnValue(45)

    const result = render(
      <SimpleText text="Custom Text" durationInFrames={90} />
    )

    expect(result.textContent).toBe('Custom Text')
  })

  it('should apply custom color', () => {
    const result = render(
      <SimpleText color="#00ff00" durationInFrames={90} />
    )

    const element = result as any
    expect(element.props.style.color).toBe('#00ff00')
  })

  it('should apply custom fontSize', () => {
    const result = render(
      <SimpleText fontSize={100} durationInFrames={90} />
    )

    const element = result as any
    expect(element.props.style.fontSize).toBe('100px')
  })

  it('should be position absolute', () => {
    const {useCurrentFrame} = await import('remotion')
    ;(useCurrentFrame as any).mockReturnValue(45)

    const result = render(<SimpleText durationInFrames={90} />)

    const element = result as any
    expect(element.props.style.position).toBe('absolute')
  })
})
