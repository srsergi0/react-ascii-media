import { default as React } from 'react';
import { AsciiSettings } from '../types';
interface AsciiImageCanvasProps {
    imageElement: HTMLImageElement | null;
    settings: AsciiSettings;
    className?: string;
    onDimensionsUpdate?: (width: number, height: number) => void;
    triggerRender?: number;
}
export declare const AsciiImageCanvas: React.FC<AsciiImageCanvasProps>;
export {};
