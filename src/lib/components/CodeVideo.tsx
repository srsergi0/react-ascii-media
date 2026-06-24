import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { AsciiCanvas } from './AsciiCanvas';
import { ColorMode, DensityPreset, AsciiSettings } from '../types';

const PlayIcon = ({ className = "w-4 h-4", fill = "none" }: { className?: string; fill?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="6 3 20 12 6 21 6 3" />
  </svg>
);

const PauseIcon = ({ className = "w-4 h-4", fill = "none" }: { className?: string; fill?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="14" y="4" width="4" height="16" rx="1" />
    <rect x="6" y="4" width="4" height="16" rx="1" />
  </svg>
);

const Volume2Icon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

const VolumeXIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="22" y1="9" x2="16" y2="15" />
    <line x1="16" y1="9" x2="22" y2="15" />
  </svg>
);

const MaximizeIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="15 3 21 3 21 9" />
    <polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);

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

export const CodeVideo = forwardRef<HTMLVideoElement, CodeVideoProps>(({
  fontSize = 7,
  colorMode = 'rgb',
  densityPreset = 'standard',
  customDensity = '',
  brightness = 1.15,
  contrast = 1.1,
  saturation = 1.25,
  pdhThreshold = 18,
  className = '',
  videoClassName = '',
  canvasClassName = '',
  asciiOpacity = 1.0,
  videoOpacity = 0.0,
  customControls = false,
  src,
  autoPlay,
  loop,
  muted,
  playsInline = true,
  crossOrigin = 'anonymous',
  style,
  ...restVideoProps
}, ref) => {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useImperativeHandle(ref, () => localVideoRef.current as HTMLVideoElement);

  const settings: AsciiSettings = {
    fontSize,
    colorMode: colorMode as ColorMode,
    densityPreset: densityPreset as DensityPreset,
    customDensity,
    brightness,
    contrast,
    saturation,
    enableDeltaRendering: true,
    pdhThreshold,
    asciiOpacity,
    videoOpacity,
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(!!muted);
  const [progress, setProgress] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(16 / 9);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const video = localVideoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => setIsMuted(video.muted);
    const handleTimeUpdate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };
    const handleLoadedMetadata = () => {
      if (video.videoWidth && video.videoHeight) {
        setAspectRatio(video.videoWidth / video.videoHeight);
      }
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    setIsPlaying(!video.paused);
    setIsMuted(video.muted);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  useEffect(() => {
    const video = localVideoRef.current;
    if (!video) return;

    if (src) {
      video.src = src;
      video.load();
      if (autoPlay) {
        video.play().catch(() => {});
      }
    }
  }, [src, autoPlay]);

  useEffect(() => {
    const video = localVideoRef.current;
    if (video) {
      video.muted = !!muted;
      setIsMuted(!!muted);
    }
  }, [muted]);

  const handleTogglePlay = () => {
    const video = localVideoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = localVideoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const video = localVideoRef.current;
    if (!video || !video.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickPercent = clickX / rect.width;
    video.currentTime = clickPercent * video.duration;
  };

  const handleFullScreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

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
      <video
        ref={localVideoRef}
        crossOrigin={crossOrigin}
        playsInline={playsInline}
        loop={loop}
        autoPlay={autoPlay}
        muted={isMuted}
        style={{ opacity: videoOpacity }}
        className={`absolute inset-0 w-full h-full object-cover select-none bg-black transition-opacity duration-300 pointer-events-none ${videoClassName}`}
        {...restVideoProps}
      />

      <div
        className={`absolute inset-0 w-full h-full pointer-events-none select-none transition-opacity duration-300 ${canvasClassName}`}
        style={{ opacity: asciiOpacity }}
      >
        <AsciiCanvas
          videoElement={localVideoRef.current}
          videoSrc={src}
          settings={settings}
        />
      </div>

      {customControls ? (
        <>
          <div
            onClick={handleTogglePlay}
            className="absolute inset-0 z-10 cursor-pointer flex items-center justify-center bg-black/0 active:bg-black/10 transition-colors"
          />

          {!isPlaying && (
            <div
              onClick={handleTogglePlay}
              className="absolute z-20 w-14 h-14 rounded-full border border-white/25 flex items-center justify-center backdrop-blur-md shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
              style={{ backgroundColor: 'rgba(18,18,18,0.9)', color: '#00FF94' }}
            >
              <PlayIcon className="w-5 h-5 stroke-none translate-x-[2px]" fill="currentColor" />
            </div>
          )}

          <div
            className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex flex-col gap-3 transition-opacity duration-300 z-20 ${
              hovered || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div
              onClick={handleProgressBarClick}
              className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer relative group/progress transition-all hover:h-2"
            >
              <div
                className="absolute top-0 left-0 bottom-0 rounded-full shadow-[0_0_8px_rgba(0,255,148,0.6)]"
                style={{ width: `${progress}%`, backgroundColor: '#00FF94' }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="p-1.5 rounded-md hover:bg-white/10 text-white transition-colors"
                >
                  {isPlaying ? <PauseIcon className="w-4 h-4 fill-white" fill="currentColor" /> : <PlayIcon className="w-4 h-4 stroke-none" fill="#00FF94" />}
                </button>

                <button
                  type="button"
                  onClick={handleToggleMute}
                  className="p-1.5 rounded-md hover:bg-white/10 text-white transition-colors"
                >
                  {isMuted ? <VolumeXIcon className="w-4 h-4" /> : <Volume2Icon className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleFullScreen}
                  className="p-1.5 rounded-md hover:bg-white/10 text-white transition-colors"
                >
                  <MaximizeIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        !customControls && restVideoProps.controls && (
          <div className="absolute bottom-2 right-2 z-20 bg-black/60 px-2 py-1 rounded border border-white/10 text-[9px] font-mono text-white/60">
            *Use customControls prop for styled overlay controls
          </div>
        )
      )}
    </div>
  );
});

CodeVideo.displayName = 'CodeVideo';
