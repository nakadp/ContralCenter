// Adapted from ElectricBorder reference code

export function hexToRgba(hex: string, alpha: number = 1): string {
    if (!hex) return `rgba(0,0,0,${alpha})`;
    let h = hex.replace('#', '');
    if (h.length === 3) {
        h = h
            .split('')
            .map(c => c + c)
            .join('');
    }
    const int = parseInt(h, 16);
    const r = (int >> 16) & 255;
    const g = (int >> 8) & 255;
    const b = int & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const random = (x: number): number => {
    return (Math.sin(x * 12.9898) * 43758.5453) % 1;
};

export const noise2D = (x: number, y: number): number => {
    const i = Math.floor(x);
    const j = Math.floor(y);
    const fx = x - i;
    const fy = y - j;

    const a = random(i + j * 57);
    const b = random(i + 1 + j * 57);
    const c = random(i + (j + 1) * 57);
    const d = random(i + 1 + (j + 1) * 57);

    const ux = fx * fx * (3.0 - 2.0 * fx);
    const uy = fy * fy * (3.0 - 2.0 * fy);

    return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
};

export const octavedNoise = (
    x: number,
    octaves: number,
    lacunarity: number,
    gain: number,
    baseAmplitude: number,
    baseFrequency: number,
    time: number,
    seed: number,
    baseFlatness: number
): number => {
    let y = 0;
    let amplitude = baseAmplitude;
    let frequency = baseFrequency;

    for (let i = 0; i < octaves; i++) {
        let octaveAmplitude = amplitude;
        if (i === 0) {
            octaveAmplitude *= baseFlatness;
        }
        y += octaveAmplitude * noise2D(frequency * x + seed * 100, time * frequency * 0.3);
        frequency *= lacunarity;
        amplitude *= gain;
    }

    return y;
};
