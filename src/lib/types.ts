export type ColorMode = 'rgb' | 'green' | 'amber' | 'mono' | 'cyberpunk';

export type DensityPreset = 'standard' | 'blocks' | 'binary' | 'matrix' | 'detailed' | 'math' | 'braille' | 'stars' | 'cards' | 'alphanumeric';

export interface AsciiSettings {
  fontSize: number;
  colorMode: ColorMode;
  densityPreset: DensityPreset;
  customDensity: string;
  brightness: number;
  contrast: number;
  saturation: number;
  enableDeltaRendering: boolean;
  pdhThreshold: number;
  asciiOpacity: number;
  videoOpacity: number;
}

export type VideoSourceType = 'synthetic' | 'file';

export interface VideoSource {
  type: VideoSourceType;
  name: string;
  url: string | null;
  file: File | null;
}
