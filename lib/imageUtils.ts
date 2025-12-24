// Helper function to get image path with fallback for SVG/PNG
export function getImagePath(basePath: string, extension?: 'svg' | 'png'): string {
  if (extension) {
    return `${basePath}.${extension}`
  }
  // Try SVG first, then PNG
  return `${basePath}.svg`
}

// Helper to get asset path for different asset types
export function getAssetPath(type: 'house' | 'character' | 'frame', name: string): string {
  const basePath = `/assets/${type}s/${name}`
  // Default to SVG, will fallback in component if needed
  return `${basePath}.svg`
}

