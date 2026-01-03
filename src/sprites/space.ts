/**
 * Space Aspect Sprite Configuration
 *
 * This file defines the sprite behavior for the Space aspect.
 *
 * SPACE IMAGES:
 * - 'Derse': The dark moon
 * - 'Prospit': The golden moon
 * - 'Skaia': The battlefield
 * - 'Earth': The home planet
 * - 'LOXAY1' through 'LOXAY9': Land of X and Y (9 different lands)
 * - 'NaN': Black circle (default, no image)
 *
 * CONFIGURATION:
 * Use createSpaceConfig(imageName) to set which image to display
 *
 * EXAMPLES:
 *
 * 1. Show Derse:
 *    space: createSpaceConfig('Derse')
 *
 * 2. Show Earth:
 *    space: createSpaceConfig('Earth')
 *
 * 3. Show a specific land:
 *    space: createSpaceConfig('LOXAY3')
 *
 * 4. Show black circle (default):
 *    space: spaceSprite
 *    // or
 *    space: createSpaceConfig('NaN')
 */

// Map of image names to their file paths
const spaceImagePaths: Record<string, string> = {
  'Derse': '/images/space/derse.svg',
  'Prospit': '/images/space/prospit.svg',
  'Skaia': '/images/space/skaia.svg',
  'Earth': '/images/space/earth.svg',
  'LOXAY1': '/images/space/loxay1.svg',
  'LOXAY2': '/images/space/loxay2.svg',
  'LOXAY3': '/images/space/loxay3.svg',
  'LOXAY4': '/images/space/loxay4.svg',
  'LOXAY5': '/images/space/loxay5.svg',
  'LOXAY6': '/images/space/loxay6.svg',
  'LOXAY7': '/images/space/loxay7.svg',
  'LOXAY8': '/images/space/loxay8.svg',
  'LOXAY9': '/images/space/loxay9.svg',
  'NaN': '/images/space/nan.svg'
};

export type SpaceImageName = keyof typeof spaceImagePaths;

/**
 * Helper function to load SVG content from file path
 */
async function loadSVG(path: string): Promise<string> {
  try {
    const response = await fetch(path);
    return await response.text();
  } catch (error) {
    console.error(`Failed to load SVG from ${path}:`, error);
    return `<svg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'>
      <circle cx='36' cy='36' r='32' fill='%23000000'/>
    </svg>`;
  }
}

/**
 * Default space sprite (black circle)
 * This is a synchronous fallback - use createSpaceConfig for actual images
 */
export const spaceSprite = {
  type: 'static',
  svg: `<svg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'>
  <circle cx='36' cy='36' r='32' fill='%23000000'/>
</svg>`
};

/**
 * Helper function to create space configuration with specific image
 * Returns a config object with the image path
 */
export function createSpaceConfig(imageName: SpaceImageName) {
  const path = spaceImagePaths[imageName] || spaceImagePaths['NaN'];
  return {
    type: 'static',
    svg: `<svg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'>
    <image href='${path}' x='0' y='0' width='72' height='72'/>
  </svg>`
  };
}
