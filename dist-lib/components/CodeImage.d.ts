import { default as React } from 'react';
import { ColorMode, DensityPreset } from '../types';
export interface CodeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fontSize?: number;
    colorMode?: ColorMode;
    densityPreset?: DensityPreset;
    customDensity?: string;
    brightness?: number;
    contrast?: number;
    saturation?: number;
    pdhThreshold?: number;
    imageClassName?: string;
    canvasClassName?: string;
    asciiOpacity?: number;
    imageOpacity?: number;
    hoverFontSize?: number;
    hoverSaturation?: number;
    rounded?: boolean;
}
export declare const CodeImage: React.ForwardRefExoticComponent<CodeImageProps & React.RefAttributes<HTMLImageElement>>;
