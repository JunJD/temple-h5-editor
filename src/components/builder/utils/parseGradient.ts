interface ColorStop {
  color: string
  position?: string
}

interface GradientResult {
  type: string
  direction?: string
  colorStops: ColorStop[]
}

export function parseGradient(value: string): GradientResult {
  const defaultResult = {
    type: 'linear',
    direction: '90deg',
    colorStops: [{ color: 'black' }, { color: 'white' }]
  }

  try {
    const matches = value.match(/(\w+)-gradient\((.*)\)/)
    if (!matches) return defaultResult

    const [, type, content] = matches
    const parts = content.split(/,(?![^(]*\))/)
    const firstPart = parts[0].trim()
    
    let direction = firstPart
    let colorStops = parts.slice(1)
    
    // 如果第一部分是颜色，说明没有方向
    if (firstPart.includes('#') || firstPart.includes('rgb') || firstPart.includes('hsl')) {
      direction = '90deg'
      colorStops = parts
    }

    return {
      type,
      direction,
      colorStops: colorStops.map(stop => {
        const [color, position] = stop.trim().split(/\s+/)
        return { color, position }
      })
    }
  } catch (err) {
    return defaultResult
  }
} 