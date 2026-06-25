import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { AsciiImageCanvas } from './AsciiImageCanvas';
import { ColorMode, DensityPreset, AsciiSettings } from '../types';

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
}

export const CodeImage = forwardRef<HTMLImageElement, CodeImageProps>(({
  fontSize = 7,
  colorMode = 'rgb',
  densityPreset = 'standard',
  customDensity = '',
  brightness = 1.15,
  contrast = 1.1,
  saturation = 1.25,
  pdhThreshold = 18,
  className = '',
  imageClassName = '',
  canvasClassName = '',
  asciiOpacity = 1.0,
  imageOpacity = 0.0,
  hoverFontSize = 2,
  hoverSaturation = 1.0,
  src,
  alt = '',
  crossOrigin = "anonymous",
  style,
  onLoad,
  ...restImageProps
}, ref) => {
  const localImageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useImperativeHandle(ref, () => localImageRef.current as HTMLImageElement);

  const [hovered, setHovered] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(16 / 9);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [triggerRender, setTriggerRender] = useState(0);

  const effectiveFontSize = hovered ? hoverFontSize : fontSize;
  const effectiveSaturation = hovered ? hoverSaturation : saturation;

  const settings: AsciiSettings = {
    fontSize: effectiveFontSize,
    colorMode: colorMode as ColorMode,
    densityPreset: densityPreset as DensityPreset,
    customDensity,
    brightness,
    contrast,
    saturation: effectiveSaturation,
    enableDeltaRendering: false,
    pdhThreshold,
    asciiOpacity,
    videoOpacity: imageOpacity,
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      setAspectRatio(img.naturalWidth / img.naturalHeight);
    }
    setImageLoaded(true);
    setTriggerRender(prev => prev + 1);
    if (onLoad) {
      onLoad(e);
    }
  };

  useEffect(() => {
    const img = localImageRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setAspectRatio(img.naturalWidth / img.naturalHeight);
      setImageLoaded(true);
      setTriggerRender(prev => prev + 1);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative rounded-xl overflow-hidden bg-[#050505] border border-white/10 group select-none transition-all duration-300 flex items-center justify-center ${className}`}
      style={{
        aspectRatio: `${aspectRatio}`,
        width: '100%',
        ...style
      }}
    >
      <img
        ref={localImageRef}
        src={src}
        alt={alt}
        crossOrigin={crossOrigin}
        onLoad={handleImageLoad}
        style={{ opacity: imageOpacity }}
        className={`absolute inset-0 w-full h-full object-cover select-none bg-black transition-opacity duration-300 pointer-events-none ${imageClassName}`}
        {...restImageProps}
      />

      {imageLoaded && (
        <div
          className={`absolute inset-0 w-full h-full pointer-events-none select-none transition-opacity duration-300 ${canvasClassName}`}
          style={{ opacity: asciiOpacity }}
        >
          <AsciiImageCanvas
            imageElement={localImageRef.current}
            settings={settings}
            triggerRender={triggerRender}
          />
        </div>
      )}
    </div>
  );
});

CodeImage.displayName = 'CodeImage';
