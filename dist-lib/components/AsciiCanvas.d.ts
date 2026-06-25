import { default as React } from 'react';
import { AsciiSettings } from '../types';
interface AsciiCanvasProps {
    videoElement: HTMLVideoElement | null;
    videoSrc?: string;
    settings: AsciiSettings;
    className?: string;
    onDimensionsUpdate?: (width: number, height: number) => void;
}
export declare const AsciiCanvas: React.FC<AsciiCanvasProps>;
export {};
