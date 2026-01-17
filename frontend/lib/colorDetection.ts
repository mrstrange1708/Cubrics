import { CubeColor } from '@/components/solver/ColorPicker';

/**
 * Converts RGB to HSV color space
 */
export function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    let s = max === 0 ? 0 : delta / max;
    let v = max;

    if (delta !== 0) {
        if (max === r) {
            h = ((g - b) / delta) % 6;
        } else if (max === g) {
            h = (b - r) / delta + 2;
        } else {
            h = (r - g) / delta + 4;
        }
        h *= 60;
        if (h < 0) h += 360;
    }

    return [h, s * 100, v * 100];
}

/**
 * Reference HSV values for each cube color
 * These are the "ideal" center values used for distance calculation
 */
export interface ColorReference {
    h: number;  // Hue (0-360)
    s: number;  // Saturation (0-100)
    v: number;  // Value (0-100)
}

export type ColorReferences = Record<CubeColor, ColorReference>;

/**
 * Default reference colors (typical cube colors under good lighting)
 */
export const DEFAULT_COLOR_REFERENCES: ColorReferences = {
    white: { h: 0, s: 5, v: 95 },
    yellow: { h: 50, s: 85, v: 95 },
    orange: { h: 25, s: 90, v: 90 },
    red: { h: 5, s: 85, v: 70 },
    green: { h: 120, s: 70, v: 60 },
    blue: { h: 220, s: 75, v: 55 },
};

// Legacy type for backward compatibility
export const DEFAULT_COLOR_RANGES = {
    white: { h: [0, 360], s: [0, 25], v: [75, 100] },
    yellow: { h: [35, 70], s: [40, 100], v: [70, 100] },
    red: { h: [340, 360], s: [50, 100], v: [35, 100], h2: [0, 15] },
    orange: { h: [15, 40], s: [60, 100], v: [60, 100] },
    blue: { h: [190, 260], s: [40, 100], v: [25, 100] },
    green: { h: [75, 160], s: [35, 100], v: [25, 100] },
};

/**
 * Calculate hue distance accounting for circular nature (0-360 wraps)
 */
function hueDistance(h1: number, h2: number): number {
    const diff = Math.abs(h1 - h2);
    return Math.min(diff, 360 - diff);
}

/**
 * Calculate weighted distance between two HSV colors
 * Hue is weighted more heavily for chromatic colors
 */
function colorDistance(
    h1: number, s1: number, v1: number,
    h2: number, s2: number, v2: number
): number {
    // For low saturation (white/grey), hue is irrelevant
    const satFactor = Math.min(s1, s2) / 100;

    // Weighted distance components
    const hueDist = hueDistance(h1, h2) * satFactor * 2;  // Hue matters more for saturated colors
    const satDist = Math.abs(s1 - s2) * 0.5;
    const valDist = Math.abs(v1 - v2) * 0.3;

    return Math.sqrt(hueDist * hueDist + satDist * satDist + valDist * valDist);
}

/**
 * Classifies an HSV color to the nearest cube color using distance-based matching
 */
export function classifyColor(
    h: number,
    s: number,
    v: number,
    references: ColorReferences = DEFAULT_COLOR_REFERENCES
): CubeColor {
    // Special case: very low saturation = white
    if (s < 20 && v > 70) {
        return 'white';
    }

    // Find the closest reference color by distance
    let closestColor: CubeColor = 'white';
    let minDistance = Infinity;

    for (const [colorName, ref] of Object.entries(references) as [CubeColor, ColorReference][]) {
        const dist = colorDistance(h, s, v, ref.h, ref.s, ref.v);

        if (dist < minDistance) {
            minDistance = dist;
            closestColor = colorName;
        }
    }

    return closestColor;
}

/**
 * Samples colors from a video frame at 9 grid positions
 */
export function sampleColorsFromCanvas(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    gridSize: number = 3,
    sampleRadius: number = 10,
    colorReferences: ColorReferences = DEFAULT_COLOR_REFERENCES
): CubeColor[] {
    const width = canvas.width;
    const height = canvas.height;

    // Calculate grid cell size
    const cellWidth = width / gridSize;
    const cellHeight = height / gridSize;

    const colors: CubeColor[] = [];

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            // Center of each grid cell
            const centerX = Math.floor(cellWidth * (col + 0.5));
            const centerY = Math.floor(cellHeight * (row + 0.5));

            // Sample a small region around center and average
            const imageData = ctx.getImageData(
                centerX - sampleRadius,
                centerY - sampleRadius,
                sampleRadius * 2,
                sampleRadius * 2
            );

            let totalR = 0, totalG = 0, totalB = 0;
            const pixelCount = imageData.data.length / 4;

            for (let i = 0; i < imageData.data.length; i += 4) {
                totalR += imageData.data[i];
                totalG += imageData.data[i + 1];
                totalB += imageData.data[i + 2];
            }

            const avgR = totalR / pixelCount;
            const avgG = totalG / pixelCount;
            const avgB = totalB / pixelCount;

            const [h, s, v] = rgbToHsv(avgR, avgG, avgB);
            const color = classifyColor(h, s, v, colorReferences);
            colors.push(color);
        }
    }

    return colors;
}

/**
 * Draws a 3x3 alignment grid overlay on a canvas
 */
export function drawGridOverlay(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    gridSize: number = 3,
    color: string = 'rgba(255, 255, 255, 0.5)'
) {
    const cellWidth = width / gridSize;
    const cellHeight = height / gridSize;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    // Vertical lines
    for (let i = 1; i < gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellWidth, 0);
        ctx.lineTo(i * cellWidth, height);
        ctx.stroke();
    }

    // Horizontal lines
    for (let i = 1; i < gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * cellHeight);
        ctx.lineTo(width, i * cellHeight);
        ctx.stroke();
    }

    // Draw circles at sample points
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const centerX = cellWidth * (col + 0.5);
            const centerY = cellHeight * (row + 0.5);

            ctx.beginPath();
            ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.stroke();
        }
    }
}
