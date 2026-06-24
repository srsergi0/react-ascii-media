/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { CodeVideo } from './lib/components/CodeVideo';
import { CodeImage } from './lib/components/CodeImage';
import { VideoSource, AsciiSettings, ColorMode, DensityPreset } from './lib/types';

import { 
  Circle, 
  Upload, 
  Video, 
  Copy, 
  Check, 
  Code2, 
  BookOpen, 
  Sliders, 
  RefreshCw, 
  Palette, 
  LayoutTemplate,
  Terminal,
  Play,
  Pause,
  Download,
  FileText,
  Image as ImageIcon
} from 'lucide-react';

export default function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageFileInputRef = useRef<HTMLInputElement | null>(null);
  const [mediaMode, setMediaMode] = useState<'video' | 'image'>('video');



  // Video settings passed to <CodeVideo /> and <CodeImage />
  const [settings, setSettings] = useState<AsciiSettings>({
    fontSize: 7, 
    colorMode: 'rgb', 
    densityPreset: 'standard',
    customDensity: '',
    brightness: 1.15, 
    contrast: 1.1, 
    saturation: 1.25, 
    enableDeltaRendering: true, 
    pdhThreshold: 18, 
    asciiOpacity: 1.0,
    videoOpacity: 0.0, // Used as imageOpacity on static images
  });

  const [customControls, setCustomControls] = useState<boolean>(true);
  const [videoSource, setVideoSource] = useState<VideoSource | null>(null);
  const [imageSource, setImageSource] = useState<{
    name: string;
    url: string | null;
    file: File | null;
  } | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isWindowDragging, setIsWindowDragging] = useState<boolean>(false);
  
  // Developer Console tabs
  const [activeTab, setActiveTab] = useState<'jsx' | 'install' | 'props' | 'export'>('jsx');
  const [copied, setCopied] = useState<boolean>(false);

  // Text & Image Export Engine state
  const [exportCols, setExportCols] = useState<number>(80);
  const [asciiTextSnapshot, setAsciiTextSnapshot] = useState<string>('');
  const [isGeneratingSnapshot, setIsGeneratingSnapshot] = useState<boolean>(false);
  const [textCopied, setTextCopied] = useState<boolean>(false);

  // Set default sample media on mount
  useEffect(() => {
    loadDemoVideo();
    loadDemoImage();
  }, []);

  // Global window drag & drop handlers supporting both Videos and Images anywhere on screen
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsWindowDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      if (e.clientX === 0 && e.clientY === 0) {
        setIsWindowDragging(false);
      }
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      setIsWindowDragging(false);
      if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith('video/')) {
          handleVideoFileSelect(file);
        } else if (file.type.startsWith('image/')) {
          handleImageFileSelect(file);
        } else {
          alert('Format not recognized. Please provide a video (.mp4/.mov) or an image (.png/.jpg/.webp).');
        }
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [videoSource, imageSource]);

  const loadDemoVideo = () => {
    if (videoSource?.url && videoSource.type === 'file') {
      URL.revokeObjectURL(videoSource.url);
    }
    setVideoSource({
      type: 'synthetic',
      name: 'big_buck_bunny.mp4',
      url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/av1/360/Big_Buck_Bunny_360_10s_1MB.mp4',
      file: null,
    });
    setIsPlaying(true);
  };

  const loadDemoImage = () => {
    if (imageSource?.url && imageSource.file) {
      URL.revokeObjectURL(imageSource.url);
    }
    setImageSource({
      name: 'synthwave_glow.jpg',
      url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800', // Gorgeous Retro Synthwave Cyber City
      file: null,
    });
  };

  const handleVideoFileSelect = (file: File) => {
    if (videoSource?.url && videoSource.type === 'file') {
      URL.revokeObjectURL(videoSource.url);
    }
    const fileUrl = URL.createObjectURL(file);
    setVideoSource({
      type: 'file',
      name: file.name,
      url: fileUrl,
      file: file,
    });
    setIsPlaying(true);
  };

  const handleImageFileSelect = (file: File) => {
    if (imageSource?.url && imageSource.file) {
      URL.revokeObjectURL(imageSource.url);
    }
    const fileUrl = URL.createObjectURL(file);
    setImageSource({
      name: file.name,
      url: fileUrl,
      file: file,
    });
  };

  // Convert density settings into an array of characters
  const getDensityCharacters = (preset: string, custom?: string): string[] => {
    if (custom) return custom.split('');
    switch (preset) {
      case 'blocks': return [' ', '░', '▒', '▓', '█'];
      case 'binary': return [' ', '0', '1'];
      case 'matrix': return [' ', '•', '▰', '▱', '▲', '▼', '◄', '►', '◈', '▣', '▤', '▥', '▦', '▧', '▨', '▩', '█'];
      case 'detailed': return ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$'.split('');
      case 'math': return ' +-\\/*=%()<>[]{}#&@'.split('');
      case 'braille': return [' ', '⠁', '⠃', '⠇', '⡇', '⣇', '⣧', '⣷', '⣿'];
      case 'stars': return [' ', '.', '*', '+', '✦', '★', '✵', '✹', '✺'];
      case 'cards': return [' ', '♣', '♦', '♥', '♠'];
      case 'alphanumeric': return ' 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
      case 'standard':
      default: return ' .:-=+*#%@'.split('');
    }
  };

  // Plain-text Downsampling ASCII Generation Engine
  const generateAsciiTextSnapshot = () => {
    setIsGeneratingSnapshot(true);
    // Give state updates a tick to render spinners beautifully
    setTimeout(() => {
      let element: HTMLVideoElement | HTMLImageElement | null = null;
      if (mediaMode === 'video') {
        element = videoRef.current;
      } else {
        element = document.getElementById('ascii-image-element') as HTMLImageElement | null;
      }

      if (!element) {
        setAsciiTextSnapshot('Error: Active media element not loaded in the DOM.');
        setIsGeneratingSnapshot(false);
        return;
      }

      let width = 0;
      let height = 0;
      if (element instanceof HTMLVideoElement) {
        width = element.videoWidth || 640;
        height = element.videoHeight || 360;
      } else {
        width = element.naturalWidth || 640;
        height = element.naturalHeight || 360;
      }

      if (width === 0 || height === 0) {
        setAsciiTextSnapshot('Media frame metadata is loading. If it is a video, press play then click capture!');
        setIsGeneratingSnapshot(false);
        return;
      }

      const aspect = width / height;
      // Monospace fonts have a height-to-width ratio of approx 1.8 to 2.0
      const rows = Math.max(4, Math.round(exportCols / aspect / 1.8));

      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = exportCols;
      offscreenCanvas.height = rows;
      const ctx = offscreenCanvas.getContext('2d');
      if (!ctx) {
        setAsciiTextSnapshot('Error: Unable to provision offscreen render context.');
        setIsGeneratingSnapshot(false);
        return;
      }

      try {
        ctx.drawImage(element, 0, 0, exportCols, rows);
        const imgData = ctx.getImageData(0, 0, exportCols, rows);
        const data = imgData.data;

        const chars = getDensityCharacters(settings.densityPreset, settings.customDensity);
        const charsLen = chars.length;
        let textResult = '';

        for (let r = 0; r < rows; r++) {
          let rowText = '';
          for (let c = 0; c < exportCols; c++) {
            const idx = (r * exportCols + c) * 4;
            const rVal = data[idx];
            const gVal = data[idx + 1];
            const bVal = data[idx + 2];

            // Apply filter equations dynamically on CPU to map ASCII perfectly
            let luma = 0.299 * rVal + 0.587 * gVal + 0.114 * bVal;
            luma = luma * settings.brightness;
            luma = (luma - 128) * settings.contrast + 128;
            luma = Math.max(0, Math.min(255, luma));

            let charIdx = 0;
            if (settings.customDensity) {
              charIdx = (r * exportCols + c) % charsLen;
            } else {
              charIdx = Math.floor((luma / 255.1) * charsLen);
            }

            rowText += chars[charIdx] || ' ';
          }
          textResult += rowText + '\n';
        }

        setAsciiTextSnapshot(textResult);
      } catch (e) {
        console.error(e);
        setAsciiTextSnapshot('Unable to generate text snapshot due to secure canvas constraints. Try dragging and dropping any local media file to process it locally!');
      } finally {
        setIsGeneratingSnapshot(false);
      }
    }, 40);
  };

  // Automatically refresh plain-text preview in static Image Mode whenever settings modify
  useEffect(() => {
    if (mediaMode === 'image' && imageSource?.url) {
      generateAsciiTextSnapshot();
    }
  }, [mediaMode, imageSource, settings.densityPreset, settings.customDensity, settings.brightness, settings.contrast, exportCols]);

  // Export File Download utilities
  const handleCopyTextSnapshot = () => {
    if (!asciiTextSnapshot) return;
    navigator.clipboard.writeText(asciiTextSnapshot);
    setTextCopied(true);
    setTimeout(() => setTextCopied(false), 2000);
  };

  const handleDownloadTxtFile = () => {
    if (!asciiTextSnapshot) return;
    const blob = new Blob([asciiTextSnapshot], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `ascii_art_${mediaMode}_${Date.now()}.txt`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPNG = () => {
    const canvasId = mediaMode === 'video' ? 'ascii-display-canvas' : 'ascii-image-display-canvas';
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (!canvas) {
      alert('Active visual canvas not found. Make sure the component preview is fully loaded.');
      return;
    }
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `ascii_screenshot_${mediaMode}_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error(e);
      alert('Unable to export WebGL canvas due to strict cross-origin image regulations. Try dragging and dropping a local image file!');
    }
  };

  // Generate copyable JSX code snippets representing current configuration
  const videoCodeSnippet = `import { CodeVideo } from './components/CodeVideo';

export default function App() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <CodeVideo
        src="${videoSource?.type === 'file' ? 'path/to/your-video.mp4' : 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/av1/360/Big_Buck_Bunny_360_10s_1MB.mp4'}"
        fontSize={${settings.fontSize}}
        colorMode="${settings.colorMode}"
        densityPreset="${settings.densityPreset}"${settings.customDensity ? `\n        customDensity="${settings.customDensity}"` : ''}
        brightness={${settings.brightness}}
        contrast={${settings.contrast}}
        saturation={${settings.saturation}}
        pdhThreshold={${settings.pdhThreshold}}
        asciiOpacity={${settings.asciiOpacity}}
        videoOpacity={${settings.videoOpacity}}
        customControls={${customControls}}
        autoPlay
        loop
        muted
        className="w-full shadow-2xl rounded-xl border border-white/10"
      />
    </div>
  );
}`;

  const imageCodeSnippet = `import { CodeImage } from './components/CodeImage';

export default function App() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <CodeImage
        src="${imageSource?.file ? 'path/to/your-image.jpg' : 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800'}"
        fontSize={${settings.fontSize}}
        colorMode="${settings.colorMode}"
        densityPreset="${settings.densityPreset}"${settings.customDensity ? `\n        customDensity="${settings.customDensity}"` : ''}
        brightness={${settings.brightness}}
        contrast={${settings.contrast}}
        saturation={${settings.saturation}}
        asciiOpacity={${settings.asciiOpacity}}
        imageOpacity={${settings.videoOpacity}}
        className="w-full shadow-2xl rounded-xl border border-white/10"
      />
    </div>
  );
}`;

  const currentCodeSnippet = mediaMode === 'video' ? videoCodeSnippet : imageCodeSnippet;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentCodeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateSetting = <K extends keyof AsciiSettings>(key: K, value: AsciiSettings[K]) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div id="app-root-viewport" className="min-h-screen bg-bg text-white flex flex-col items-center selection:bg-accent/30 selection:text-white transition-all duration-300">
      
      {/* Drag & Drop Window Overlay */}
      {isWindowDragging && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex flex-col items-center justify-center border-4 border-dashed border-accent m-4 rounded-2xl pointer-events-none transition-all animate-fade-in">
          <Upload className="w-16 h-16 text-accent animate-bounce mb-4" />
          <p className="font-sans font-bold text-lg tracking-[0.2em] text-white uppercase">DROP FILE ANYWHERE</p>
          <p className="font-mono text-xs text-white/40 mt-1">DIRECT CONVERSION FOR VIDEOS AND IMAGES</p>
        </div>
      )}

      {/* Header Bento Top Bar */}
      <header id="main-navigation-header" className="w-full max-w-7xl px-6 py-5 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="absolute inline-flex h-2 w-2 rounded-full bg-accent opacity-75 animate-ping" />
            <Circle className="w-2.5 h-2.5 text-accent fill-accent relative" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-sans font-extrabold text-sm tracking-[0.15em] text-accent uppercase flex items-center gap-1.5">
              <span>&lt;CodeASCII /&gt;</span>
              <span className="text-white/80">STUDIO</span>
            </h1>
            <span className="text-[9px] font-mono text-white/30 tracking-wider">ULTRA HD CLIENTSIDE ASCII GENERATOR</span>
          </div>
        </div>

      </header>

      {/* Main Workspace Stage */}
      <main id="app-content-stage" className="flex-1 w-full max-w-7xl px-6 py-8 flex flex-col gap-8">

        {/* Dynamic Studio Split Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Live Render Box & Developer Integration Drawer */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Render Stage: Video + Image stacked */}
            <div className="flex flex-col gap-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/50 flex items-center gap-1.5 mb-2">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                  Video ASCII
                </span>
                {videoSource ? (
                  <CodeVideo
                    ref={videoRef}
                    src={videoSource.url || ''}
                    fontSize={settings.fontSize}
                    colorMode={settings.colorMode}
                    densityPreset={settings.densityPreset}
                    customDensity={settings.customDensity}
                    brightness={settings.brightness}
                    contrast={settings.contrast}
                    saturation={settings.saturation}
                    enableDeltaRendering={settings.enableDeltaRendering}
                    pdhThreshold={settings.pdhThreshold}
                    asciiOpacity={settings.asciiOpacity}
                    videoOpacity={settings.videoOpacity}
                    customControls={customControls}
                    autoPlay={isPlaying}
                    loop
                    muted
                    className="shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 rounded-xl"
                  />
                ) : (
                  <div className="w-full aspect-video rounded-xl bg-surface border border-white/10 flex flex-col items-center justify-center text-center p-6 gap-3">
                    <Video className="w-12 h-12 text-white/20 animate-pulse" />
                    <span className="text-xs font-mono text-white/50">No video source loaded</span>
                  </div>
                )}
              </div>

              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/50 flex items-center gap-1.5 mb-2">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                  Image ASCII
                </span>
                {imageSource ? (
                  <>
                    <CodeImage
                      id="ascii-image-element"
                      src={imageSource.url || ''}
                      fontSize={settings.fontSize}
                      colorMode={settings.colorMode}
                      densityPreset={settings.densityPreset}
                      customDensity={settings.customDensity}
                      brightness={settings.brightness}
                      contrast={settings.contrast}
                      saturation={settings.saturation}
                      asciiOpacity={settings.asciiOpacity}
                      imageOpacity={settings.videoOpacity}
                      className="shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 rounded-xl w-full"
                    />
                    <img 
                      id="ascii-image-element" 
                      src={imageSource.url || ''} 
                      crossOrigin="anonymous" 
                      className="hidden" 
                      alt="hidden-calculator"
                    />
                  </>
                ) : (
                  <div className="w-full aspect-video rounded-xl bg-surface border border-white/10 flex flex-col items-center justify-center text-center p-6 gap-3">
                    <ImageIcon className="w-12 h-12 text-white/20 animate-pulse" />
                    <span className="text-xs font-mono text-white/50">No image source loaded</span>
                  </div>
                )}
              </div>
            </div>

            {/* Developer Integration Tabs Drawer */}
            <div className="rounded-xl bg-surface border border-white/10 overflow-hidden shadow-xl mt-2">
              
              {/* Tab headers */}
              <div className="flex border-b border-white/10 bg-black/20 font-mono text-xs overflow-x-auto">
                <button
                  onClick={() => setActiveTab('jsx')}
                  className={`px-5 py-3.5 flex items-center gap-2 border-r border-white/10 shrink-0 transition-colors ${
                    activeTab === 'jsx' ? 'bg-surface text-accent font-bold border-b-2 border-b-accent' : 'text-white/50 hover:text-white hover:bg-white/[0.02]'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>React JSX Code</span>
                </button>
                <button
                  onClick={() => setActiveTab('export')}
                  className={`px-5 py-3.5 flex items-center gap-2 border-r border-white/10 shrink-0 transition-colors ${
                    activeTab === 'export' ? 'bg-surface text-accent font-bold border-b-2 border-b-accent' : 'text-white/50 hover:text-white hover:bg-white/[0.02]'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="text-emerald-400 font-bold">Export Plain ASCII / PNG</span>
                </button>
                <button
                  onClick={() => setActiveTab('install')}
                  className={`px-5 py-3.5 flex items-center gap-2 border-r border-white/10 shrink-0 transition-colors ${
                    activeTab === 'install' ? 'bg-surface text-accent font-bold border-b-2 border-b-accent' : 'text-white/50 hover:text-white hover:bg-white/[0.02]'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Integration Guide</span>
                </button>
                <button
                  onClick={() => setActiveTab('props')}
                  className={`px-5 py-3.5 flex items-center gap-2 shrink-0 transition-colors ${
                    activeTab === 'props' ? 'bg-surface text-accent font-bold border-b-2 border-b-accent' : 'text-white/50 hover:text-white hover:bg-white/[0.02]'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Props Reference</span>
                </button>
              </div>

              {/* Tab contents */}
              <div className="p-5 font-mono text-xs text-white/80 leading-relaxed max-h-[550px] overflow-y-auto">
                
                {/* 1. JSX Code Tab */}
                {activeTab === 'jsx' && (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    <div className="flex items-center justify-between text-[11px] text-white/40">
                      <span>Reactive JSX Code based on your current settings:</span>
                      <button
                        onClick={handleCopyCode}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent/10 hover:bg-accent/20 border border-accent/20 text-accent transition-all cursor-pointer font-bold"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Component JSX</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="p-4 rounded-lg bg-black/60 border border-white/5 text-emerald-400 overflow-x-auto leading-normal whitespace-pre text-[11px]">
                      {currentCodeSnippet}
                    </pre>
                  </div>
                )}

                {/* 2. Export & Downsample Snapshot Tab */}
                {activeTab === 'export' && (
                  <div className="flex flex-col gap-5 animate-fade-in text-white/90">
                    <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex flex-col gap-1">
                        <h3 className="font-sans font-bold text-sm text-accent flex items-center gap-1.5">
                          <Download className="w-4 h-4" />
                          Plaintext & Styled Canvas Exporter
                        </h3>
                        <p className="font-sans text-[11px] text-white/60 leading-normal">
                          Freeze the active media canvas frame to extract raw copyable ASCII art characters, or export high-res PNG canvas renders directly!
                        </p>
                      </div>

                      <button
                        onClick={handleDownloadPNG}
                        className="px-4 py-2 bg-accent hover:bg-accent/90 text-black font-sans font-bold rounded-lg flex items-center justify-center gap-1.5 text-xs transition-all shadow-[0_4px_12px_rgba(0,255,148,0.25)] cursor-pointer shrink-0"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        Download styled PNG
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-white/40">Plaintext Output Width (columns)</label>
                        <div className="flex gap-1.5">
                          {[40, 80, 120, 160].map((cols) => (
                            <button
                              key={cols}
                              onClick={() => setExportCols(cols)}
                              className={`flex-1 py-1.5 rounded-lg border text-center transition-all ${
                                exportCols === cols
                                  ? 'bg-accent/15 border-accent/40 text-accent font-bold'
                                  : 'bg-black/40 border-white/10 text-white/60 hover:text-white'
                              }`}
                            >
                              {cols} cols
                            </button>
                          ))}
                        </div>
                      </div>

                      {mediaMode === 'video' && (
                        <div className="flex flex-col justify-end h-full">
                          <button
                            onClick={generateAsciiTextSnapshot}
                            disabled={isGeneratingSnapshot}
                            className="w-full py-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-sans font-medium rounded-lg flex items-center justify-center gap-1.5 text-xs transition-all cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-accent animate-pulse" />
                            {isGeneratingSnapshot ? 'Processing Frame...' : 'Capture active Video Frame'}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-white/40">
                        <span>Terminal / Comments ASCII Preview</span>
                        <div className="flex gap-2">
                          <button
                            onClick={handleCopyTextSnapshot}
                            disabled={!asciiTextSnapshot}
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            {textCopied ? <Check className="w-3 h-3 text-accent" /> : <Copy className="w-3 h-3" />}
                            <span>{textCopied ? 'Copied Plaintext' : 'Copy Plaintext'}</span>
                          </button>
                          <button
                            onClick={handleDownloadTxtFile}
                            disabled={!asciiTextSnapshot}
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download .txt</span>
                          </button>
                        </div>
                      </div>

                      {isGeneratingSnapshot ? (
                        <div className="w-full h-64 bg-black/70 rounded-lg border border-white/5 flex flex-col items-center justify-center gap-2">
                          <RefreshCw className="w-6 h-6 text-accent animate-spin" />
                          <span className="text-[10px] font-mono text-white/40 uppercase">Generating Downscaled Vector...</span>
                        </div>
                      ) : asciiTextSnapshot ? (
                        <textarea
                          readOnly
                          value={asciiTextSnapshot}
                          className="w-full h-64 p-3 font-mono text-[8px] bg-[#020202] border border-white/5 text-emerald-500 rounded-lg focus:outline-none overflow-x-auto whitespace-pre leading-[1.05] tracking-widest scrollbar-thin select-all resize-none shadow-inner"
                          style={{
                            fontFamily: '"Courier New", Courier, monospace',
                            lineHeight: '0.85',
                            letterSpacing: '0.15em'
                          }}
                        />
                      ) : (
                        <div className="w-full h-64 bg-black/40 rounded-lg border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-6 gap-2">
                          <FileText className="w-8 h-8 text-white/20" />
                          <span className="text-xs font-sans text-white/40">
                            {mediaMode === 'video' 
                              ? "Click 'Capture active Video Frame' above to pull a frame into plain text."
                              : "Generating and converting static image to plain text..."}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. Integration Guide Tab */}
                {activeTab === 'install' && (
                  <div className="flex flex-col gap-4 text-white/75 animate-fade-in">
                    <h3 className="font-sans font-bold text-sm text-white border-b border-white/10 pb-1 uppercase tracking-wider">Project Integration Guide</h3>
                    
                    <ol className="list-decimal pl-5 flex flex-col gap-3 text-[11px]">
                      <li>
                        <strong className="text-white font-sans">Copy Component Code:</strong>
                        <p className="mt-1">
                          In your repository, transfer the components directly:
                        </p>
                        <ul className="list-disc pl-5 mt-1 text-white/60 flex flex-col gap-0.5">
                          <li>Create <code className="text-accent">src/types.ts</code> containing core declarations.</li>
                          <li>Create <code className="text-accent">src/components/CodeVideo.tsx</code> or <code className="text-accent">CodeImage.tsx</code>.</li>
                          <li>Create corresponding WebGL handlers <code className="text-accent">AsciiCanvas.tsx</code> and <code className="text-accent">AsciiImageCanvas.tsx</code>.</li>
                        </ul>
                      </li>
                      <li>
                        <strong className="text-white font-sans">Responsive Rendering:</strong>
                        <p className="mt-1 font-sans">
                          Both components integrate a <code className="text-emerald-400">ResizeObserver</code> inside their canvases. Simply fit them inside any parent layout container and they will auto-scale dynamically!
                        </p>
                      </li>
                      <li>
                        <strong className="text-white font-sans">WebGL Capabilities:</strong>
                        <p className="mt-1">
                          Calculations are offloaded directly to GPU shader operations, allowing you to run multiple full-color, high-density conversions simultaneously at 60 FPS without slowing down user interactions.
                        </p>
                      </li>
                    </ol>
                  </div>
                )}

                {/* 4. Props Reference Tab */}
                {activeTab === 'props' && (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    <h3 className="font-sans font-bold text-sm text-white border-b border-white/10 pb-1 uppercase tracking-wider">Props Documentation</h3>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px] border-collapse">
                        <thead>
                          <tr className="border-b border-white/15 text-white/50 uppercase tracking-widest text-[9px]">
                            <th className="py-2 pr-3">Prop</th>
                            <th className="py-2 pr-3">Type</th>
                            <th className="py-2 pr-3">Default</th>
                            <th className="py-2">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-white/80">
                          <tr>
                            <td className="py-2 pr-3 text-accent font-bold">src</td>
                            <td className="py-2 pr-3 text-white/50">string</td>
                            <td className="py-2 pr-3 text-white/40">-</td>
                            <td className="py-2 text-white/60">Source media URL or local uploaded blob.</td>
                          </tr>
                          <tr>
                            <td className="py-2 pr-3 text-accent font-bold">fontSize</td>
                            <td className="py-2 pr-3 text-white/50">number</td>
                            <td className="py-2 pr-3 text-white/40">7</td>
                            <td className="py-2 text-white/60">Sizing of individual cells. Smaller means higher density (more glyphs).</td>
                          </tr>
                          <tr>
                            <td className="py-2 pr-3 text-accent font-bold">colorMode</td>
                            <td className="py-2 pr-3 text-white/50">string</td>
                            <td className="py-2 pr-3 text-white/40">'rgb'</td>
                            <td className="py-2 text-white/60">'rgb', 'green', 'amber', 'mono', 'cyberpunk' palettes.</td>
                          </tr>
                          <tr>
                            <td className="py-2 pr-3 text-accent font-bold">densityPreset</td>
                            <td className="py-2 pr-3 text-white/50">string</td>
                            <td className="py-2 pr-3 text-white/40">'standard'</td>
                            <td className="py-2 text-white/60">'standard', 'blocks', 'binary', 'matrix' etc.</td>
                          </tr>
                          <tr>
                            <td className="py-2 pr-3 text-accent font-bold">brightness</td>
                            <td className="py-2 pr-3 text-white/50">number</td>
                            <td className="py-2 pr-3 text-white/40">1.15</td>
                            <td className="py-2 text-white/60">Pre-processing brightness scalar. range: 0.5 to 2.0.</td>
                          </tr>
                          <tr>
                            <td className="py-2 pr-3 text-accent font-bold">contrast</td>
                            <td className="py-2 pr-3 text-white/50">number</td>
                            <td className="py-2 pr-3 text-white/40">1.1</td>
                            <td className="py-2 text-white/60">Contrast modifier. range: 0.5 to 2.0.</td>
                          </tr>
                          <tr>
                            <td className="py-2 pr-3 text-accent font-bold">saturation</td>
                            <td className="py-2 pr-3 text-white/50">number</td>
                            <td className="py-2 pr-3 text-white/40">1.25</td>
                            <td className="py-2 text-white/60">Saturation scalar. range: 0.0 to 2.5 (RGB modes only).</td>
                          </tr>
                          <tr>
                            <td className="py-2 pr-3 text-accent font-bold">asciiOpacity</td>
                            <td className="py-2 pr-3 text-white/50">number</td>
                            <td className="py-2 pr-3 text-white/40">1.0</td>
                            <td className="py-2 text-white/60">Blending mix opacity of the generated ASCII grid.</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>

          {/* Right Column: Live Prop Controller Panel */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Visual Header */}
            <div className="flex items-center gap-2 text-white/90 font-mono text-xs uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5 text-accent animate-pulse" />
              <span>Prop Settings Controller</span>
            </div>

            {/* Controller Body Box */}
            <div className="p-5 rounded-2xl bg-surface border border-white/10 flex flex-col gap-5 shadow-xl relative overflow-hidden">
              
              {/* Prop Section: Aesthetic Modes */}
              <div className="flex flex-col gap-3.5 pb-4 border-b border-white/5">
                <div className="flex items-center gap-1.5 text-white/80 font-mono text-[11px] uppercase tracking-wider">
                  <Palette className="w-3 h-3 text-accent" />
                  <span>Visual Props</span>
                </div>

                {/* ColorMode Selection */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-white/40 flex justify-between">
                    <span>Prop: colorMode</span>
                    <span className="text-accent font-medium">"{settings.colorMode}"</span>
                  </span>
                  <div className="grid grid-cols-2 gap-1 font-mono text-[10px]">
                    {[
                      { id: 'rgb', label: 'Full RGB' },
                      { id: 'cyberpunk', label: 'Neon Cyberpunk' },
                      { id: 'green', label: 'Cathode Green' },
                      { id: 'amber', label: 'CRT Amber' },
                      { id: 'mono', label: 'Grayscale' }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => updateSetting('colorMode', mode.id as ColorMode)}
                        className={`px-2.5 py-1.5 rounded-lg border text-left transition-all flex items-center justify-between ${
                          settings.colorMode === mode.id
                            ? 'bg-accent/10 border-accent/40 text-accent font-bold'
                            : 'bg-[#151515] border-white/5 text-white/60 hover:text-white'
                        }`}
                      >
                        <span>{mode.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* DensityPreset Selection */}
                <div className="flex flex-col gap-1.5 mt-1">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-white/40 flex justify-between">
                    <span>Prop: densityPreset</span>
                    <span className="text-accent font-medium">"{settings.densityPreset}"</span>
                  </span>
                  <div className="grid grid-cols-3 gap-1 font-mono text-[9px] text-center">
                    {[
                      { id: 'standard', label: 'Standard' },
                      { id: 'detailed', label: 'Detailed' },
                      { id: 'blocks', label: 'Blocks' },
                      { id: 'math', label: 'Math' },
                      { id: 'braille', label: 'Braille' },
                      { id: 'stars', label: 'Stars' },
                      { id: 'cards', label: 'Cards' },
                      { id: 'alphanumeric', label: 'Alphanum' },
                      { id: 'binary', label: 'Binary' },
                      { id: 'matrix', label: 'Matrix' }
                    ].map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => {
                          setSettings(prev => ({
                            ...prev,
                            densityPreset: preset.id as DensityPreset,
                            customDensity: ''
                          }));
                        }}
                        className={`py-1.5 rounded-md border transition-all ${
                          settings.densityPreset === preset.id && !settings.customDensity
                            ? 'bg-accent/10 border-accent/40 text-accent font-bold'
                            : 'bg-[#151515] border-white/5 text-white/60 hover:text-white'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Density input: Spell-out phrases/glyphs */}
                <div className="flex flex-col gap-2 mt-2 p-3 rounded-xl bg-black/30 border border-white/5">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-accent flex items-center justify-between">
                    <span>Frases y Glifos Personalizados</span>
                    <span className="text-[8px] font-mono text-white/30 lowercase italic">customDensity</span>
                  </span>
                  <input
                    type="text"
                    placeholder="Escriba palabras (ej: MICHAEL) o emojis..."
                    value={settings.customDensity}
                    onChange={(e) => updateSetting('customDensity', e.target.value)}
                    className="w-full px-3 py-2 text-[11px] font-mono rounded bg-[#101010] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-accent transition-all"
                  />
                  <p className="text-[9px] font-sans text-white/40 leading-normal">
                    <strong>Súper Interactivo:</strong> El compilador WebGL utilizará exactamente las letras o emojis ingresados para renderizar la imagen/video, regulando su brillo mediante opacidad.
                  </p>
                </div>
              </div>

              {/* Prop Section: Sizing & Sensation Sliders */}
              <div className="flex flex-col gap-4 pb-4 border-b border-white/5">
                <div className="flex items-center gap-1.5 text-white/80 font-mono text-[11px] uppercase tracking-wider">
                  <Terminal className="w-3 h-3 text-accent" />
                  <span>Sizing & Contrast</span>
                </div>

                {/* fontSize Slider */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-wider">
                    <span className="text-white/40">Prop: fontSize (density scale)</span>
                    <span className="text-accent font-bold">{settings.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="32"
                    step="1"
                    value={settings.fontSize}
                    onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                    className="w-full accent-accent h-1 rounded bg-white/10 appearance-none cursor-ew-resize"
                  />
                  <div className="flex justify-between text-[8px] font-mono text-white/30 uppercase tracking-widest">
                    <span>Ultra HD (4px)</span>
                    <span>Retro (32px)</span>
                  </div>
                </div>

                {/* Brightness Slider */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-wider">
                    <span className="text-white/40">Prop: brightness</span>
                    <span className="text-white/80 font-bold">{(settings.brightness * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.05"
                    value={settings.brightness}
                    onChange={(e) => updateSetting('brightness', parseFloat(e.target.value))}
                    className="w-full accent-accent h-1 rounded bg-white/10 appearance-none cursor-ew-resize"
                  />
                </div>

                {/* Contrast Slider */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-wider">
                    <span className="text-white/40">Prop: contrast</span>
                    <span className="text-white/80 font-bold">{(settings.contrast * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.05"
                    value={settings.contrast}
                    onChange={(e) => updateSetting('contrast', parseFloat(e.target.value))}
                    className="w-full accent-accent h-1 rounded bg-white/10 appearance-none cursor-ew-resize"
                  />
                </div>

                {/* Saturation Slider */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-wider">
                    <span className="text-white/40">Prop: saturation</span>
                    <span className="text-white/80 font-bold">{(settings.saturation * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="2.5"
                    step="0.05"
                    value={settings.saturation}
                    onChange={(e) => updateSetting('saturation', parseFloat(e.target.value))}
                    disabled={settings.colorMode === 'mono' || settings.colorMode === 'green' || settings.colorMode === 'amber'}
                    className="w-full accent-accent h-1 rounded bg-white/10 appearance-none cursor-ew-resize disabled:opacity-20"
                  />
                </div>
              </div>

              {/* Prop Section: Transparency Opacities */}
              <div className="flex flex-col gap-3.5 pt-1">
                <div className="flex items-center gap-1.5 text-white/80 font-mono text-[11px] uppercase tracking-wider">
                  <LayoutTemplate className="w-3 h-3 text-accent" />
                  <span>Interaction & Blending</span>
                </div>

                {/* Custom Controls Checkbox: Video Mode Only */}
                {mediaMode === 'video' && (
                  <div className="flex items-center justify-between gap-4 py-1">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-mono text-white/80 uppercase">Prop: customControls</span>
                      <span className="text-[8px] font-mono text-white/40 leading-tight">Enables built-in HUD playback seeker and control bar.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                      <input
                        type="checkbox"
                        checked={customControls}
                        onChange={(e) => setCustomControls(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent"></div>
                    </label>
                  </div>
                )}

                {/* Slider: asciiOpacity */}
                <div className="flex flex-col gap-1 py-1">
                  <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-wider">
                    <span className="text-white/40">Prop: asciiOpacity</span>
                    <span className="text-white/80 font-bold">{(settings.asciiOpacity * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.01"
                    value={settings.asciiOpacity}
                    onChange={(e) => updateSetting('asciiOpacity', parseFloat(e.target.value))}
                    className="w-full accent-accent h-1 rounded bg-white/10 appearance-none cursor-ew-resize"
                  />
                </div>

                {/* Slider: imageOpacity / videoOpacity */}
                <div className="flex flex-col gap-1 py-1">
                  <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-wider">
                    <span className="text-white/40">Prop: {mediaMode === 'video' ? 'videoOpacity' : 'imageOpacity'}</span>
                    <span className="text-white/80 font-bold">{(settings.videoOpacity * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.01"
                    value={settings.videoOpacity}
                    onChange={(e) => updateSetting('videoOpacity', parseFloat(e.target.value))}
                    className="w-full accent-accent h-1 rounded bg-white/10 appearance-none cursor-ew-resize"
                  />
                  <span className="text-[8px] font-mono text-white/40 leading-tight mt-1">Blend mix opacity of the original raw source layout.</span>
                </div>
              </div>

              {/* Upload custom video or image dynamically */}
              <div className="mt-3 pt-4 border-t border-white/10 flex flex-col gap-2">
                <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Test with local files</span>
                <div className="flex gap-2">
                  {mediaMode === 'video' ? (
                    <>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 font-mono text-[10px] text-white/90 uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-accent" />
                        <span>Upload Video</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleVideoFileSelect(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => imageFileInputRef.current?.click()}
                        className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 font-mono text-[10px] text-white/90 uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-accent" />
                        <span>Upload Image</span>
                      </button>
                      <input
                        ref={imageFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleImageFileSelect(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                    </>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>

      </main>

      {/* Footer credits */}
      <footer id="app-credits-footer" className="w-full max-w-7xl py-8 border-t border-white/10 text-center font-mono text-[10px] text-white/30 tracking-wider">
        <span>&lt;CodeASCII /&gt; Studio &nbsp;|&nbsp; GPU-Accelerated WebGL Engine &nbsp;|&nbsp; 100% Offline Compatible</span>
      </footer>

    </div>
  );
}
