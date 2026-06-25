import { default as React } from 'react';
import { ColorMode, DensityPreset } from '../types';
export interface CodeVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
    fontSize?: number;
    colorMode?: ColorMode;
    densityPreset?: DensityPreset;
    customDensity?: string;
    brightness?: number;
    contrast?: number;
    saturation?: number;
    pdhThreshold?: number;
    videoClassName?: string;
    canvasClassName?: string;
    asciiOpacity?: number;
    videoOpacity?: number;
    customControls?: boolean;
}
export declare const CodeVideo: React.ForwardRefExoticComponent<CodeVideoProps & React.RefAttributes<HTMLVideoElement>>;
