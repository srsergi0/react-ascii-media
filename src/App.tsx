import { useState, useEffect, useRef } from 'react';
import { CodeVideo } from './lib/components/CodeVideo';
import { CodeImage } from './lib/components/CodeImage';
import type { VideoSource, AsciiSettings, ColorMode, DensityPreset } from './lib/types';

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [settings, setSettings] = useState<AsciiSettings>({
    fontSize: 7, colorMode: 'rgb', densityPreset: 'standard', customDensity: '',
    brightness: 1.15, contrast: 1.1, saturation: 1.25,
    enableDeltaRendering: true, pdhThreshold: 18,
    asciiOpacity: 1.0, videoOpacity: 0.0,
  });
  const [videoSource, setVideoSource] = useState<VideoSource | null>(null);
  const [imageSource, setImageSource] = useState<{ name: string; url: string | null; file: File | null } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [tab, setTab] = useState<'usage' | 'props'>('usage');

  useEffect(() => { loadDemoVideo(); loadDemoImage(); }, []);
  useEffect(() => {
    const onOver = (e: DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const onLeave = (e: DragEvent) => { e.preventDefault(); if (e.clientX === 0 && e.clientY === 0) setIsDragging(false); };
    const onDrop = (e: DragEvent) => {
      e.preventDefault(); setIsDragging(false);
      const f = e.dataTransfer?.files?.[0];
      if (!f) return;
      if (f.type.startsWith('video/')) handleVideoFile(f);
      else if (f.type.startsWith('image/')) handleImageFile(f);
      else alert('Use .mp4/.mov for video or .png/.jpg/.webp for image');
    };
    window.addEventListener('dragover', onOver);
    window.addEventListener('dragleave', onLeave);
    window.addEventListener('drop', onDrop);
    return () => { window.removeEventListener('dragover', onOver); window.removeEventListener('dragleave', onLeave); window.removeEventListener('drop', onDrop); };
  }, []);

  function loadDemoVideo() {
    if (videoSource?.url && videoSource.type === 'file') URL.revokeObjectURL(videoSource.url);
    setVideoSource({ type: 'synthetic', name: 'big_buck_bunny.mp4', url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/av1/360/Big_Buck_Bunny_360_10s_1MB.mp4', file: null });
    setIsPlaying(true);
  }
  function loadDemoImage() {
    if (imageSource?.url && imageSource.file) URL.revokeObjectURL(imageSource.url);
    setImageSource({ name: 'synthwave_glow.jpg', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800', file: null });
  }
  function handleVideoFile(f: File) {
    if (videoSource?.url && videoSource.type === 'file') URL.revokeObjectURL(videoSource.url);
    setVideoSource({ type: 'file', name: f.name, url: URL.createObjectURL(f), file: f });
    setIsPlaying(true);
  }
  function handleImageFile(f: File) {
    if (imageSource?.url && imageSource.file) URL.revokeObjectURL(imageSource.url);
    setImageSource({ name: f.name, url: URL.createObjectURL(f), file: f });
  }
  function upsert<K extends keyof AsciiSettings>(k: K, v: AsciiSettings[K]) {
    setSettings(p => ({ ...p, [k]: v }));
  }

  const code = `import { CodeVideo, CodeImage } from 'react-ascii-media';

export default function Demo() {
  return (
    <>
      <CodeVideo
        src="video.mp4"
        fontSize={${settings.fontSize}}
        colorMode="${settings.colorMode}"
        densityPreset="${settings.densityPreset}"
        brightness={${settings.brightness}} ${''}
        contrast={${settings.contrast}}
        saturation={${settings.saturation}}
        customControls
        autoPlay loop muted
      />
      <CodeImage
        src="image.jpg"
        fontSize={${settings.fontSize}}
        colorMode="${settings.colorMode}"
        densityPreset="${settings.densityPreset}"
        brightness={${settings.brightness}}
        contrast={${settings.contrast}}
        saturation={${settings.saturation}}
      />
    </>
  );
}`;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center">

      {isDragging && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center border-4 border-dashed border-[#00FF94] m-4 rounded-2xl pointer-events-none">
          <p className="text-lg font-bold tracking-widest text-[#00FF94] uppercase">Drop video or image anywhere</p>
        </div>
      )}

      <header className="w-full max-w-7xl px-6 py-5 flex items-center justify-between border-b border-white/10">
        <div>
          <h1 className="font-bold text-sm text-[#00FF94]">react-ascii-media <span className="text-white/40 font-normal">v1.0.0</span></h1>
          <p className="text-[9px] font-mono text-white/30 tracking-wider">VIDEO & IMAGE TO ASCII ART CONVERTER</p>
        </div>
        <code className="text-xs font-mono bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 text-[#00FF94]">npm install react-ascii-media</code>
      </header>

      <main className="flex-1 w-full max-w-7xl px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left: Previews + Code */}
        <div className="lg:col-span-7 flex flex-col gap-6">

          <section>
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#00FF94] rounded-full" /> Video ASCII
            </p>
            {videoSource ? (
              <CodeVideo ref={videoRef} src={videoSource.url || ''} {...settings} customControls autoPlay={isPlaying} loop muted
                className="shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 rounded-xl" />
            ) : (
              <div className="w-full aspect-video rounded-xl bg-[#121212] border border-white/10 flex items-center justify-center text-xs font-mono text-white/50">No video</div>
            )}
          </section>

          <section>
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#00FF94] rounded-full" /> Image ASCII
            </p>
            {imageSource ? (
              <CodeImage id="ascii-image" src={imageSource.url || ''} {...settings} imageOpacity={settings.videoOpacity}
                className="shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 rounded-xl w-full" />
            ) : (
              <div className="w-full aspect-video rounded-xl bg-[#121212] border border-white/10 flex items-center justify-center text-xs font-mono text-white/50">No image</div>
            )}
          </section>

          {/* Code & Props */}
          <div className="rounded-xl bg-[#121212] border border-white/10 overflow-hidden">
            <div className="flex border-b border-white/10">
              <button onClick={() => setTab('usage')} className={`px-4 py-3 text-[11px] font-mono transition-colors ${tab === 'usage' ? 'bg-[#121212] text-[#00FF94] font-bold border-b-2 border-b-[#00FF94]' : 'text-white/50 hover:text-white'}`}>Usage</button>
              <button onClick={() => setTab('props')} className={`px-4 py-3 text-[11px] font-mono transition-colors ${tab === 'props' ? 'bg-[#121212] text-[#00FF94] font-bold border-b-2 border-b-[#00FF94]' : 'text-white/50 hover:text-white'}`}>Props</button>
            </div>

            {tab === 'usage' && (
              <div className="p-4">
                <p className="text-[11px] font-mono text-white/40 mb-2">Current config:</p>
                <pre className="p-4 rounded-lg bg-black/60 border border-white/5 text-emerald-400 text-[11px] overflow-x-auto leading-relaxed">{code}</pre>
              </div>
            )}

            {tab === 'props' && (
              <div className="p-4 overflow-x-auto">
                <table className="w-full text-left text-[11px] font-mono border-collapse">
                  <thead><tr className="border-b border-white/10 text-white/30 uppercase text-[9px]">
                    <th className="py-2 pr-3">Prop</th><th className="py-2 pr-3">Type</th><th className="py-2 pr-3">Default</th><th className="py-2">Description</th>
                  </tr></thead>
                  <tbody className="divide-y divide-white/5 text-white/70">
                    <tr><td className="py-2 pr-3 text-[#00FF94]">fontSize</td><td className="pr-3 text-white/40">number</td><td className="pr-3 text-white/40">7</td><td>Glyph size. Smaller = more detail</td></tr>
                    <tr><td className="py-2 pr-3 text-[#00FF94]">colorMode</td><td className="pr-3 text-white/40">string</td><td className="pr-3 text-white/40">'rgb'</td><td>rgb / green / amber / mono / cyberpunk</td></tr>
                    <tr><td className="py-2 pr-3 text-[#00FF94]">densityPreset</td><td className="pr-3 text-white/40">string</td><td className="pr-3 text-white/40">'standard'</td><td>standard / blocks / binary / matrix / detailed / math / braille / stars / cards / alphanumeric</td></tr>
                    <tr><td className="py-2 pr-3 text-[#00FF94]">customDensity</td><td className="pr-3 text-white/40">string</td><td className="pr-3 text-white/40">''</td><td>Custom character sequence</td></tr>
                    <tr><td className="py-2 pr-3 text-[#00FF94]">brightness</td><td className="pr-3 text-white/40">number</td><td className="pr-3 text-white/40">1.15</td><td>0.5–2.0</td></tr>
                    <tr><td className="py-2 pr-3 text-[#00FF94]">contrast</td><td className="pr-3 text-white/40">number</td><td className="pr-3 text-white/40">1.1</td><td>0.5–2.0</td></tr>
                    <tr><td className="py-2 pr-3 text-[#00FF94]">saturation</td><td className="pr-3 text-white/40">number</td><td className="pr-3 text-white/40">1.25</td><td>0.0–2.5</td></tr>
                    <tr><td className="py-2 pr-3 text-[#00FF94]">asciiOpacity</td><td className="pr-3 text-white/40">number</td><td className="pr-3 text-white/40">1.0</td><td>ASCII layer opacity</td></tr>
                    <tr><td className="py-2 pr-3 text-[#00FF94]">videoOpacity / imageOpacity</td><td className="pr-3 text-white/40">number</td><td className="pr-3 text-white/40">0.0</td><td>Original media opacity (overlay)</td></tr>
                    <tr><td className="py-2 pr-3 text-[#00FF94]">customControls</td><td className="pr-3 text-white/40">boolean</td><td className="pr-3 text-white/40">false</td><td>Show player controls (CodeVideo only)</td></tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right: Controls */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <p className="font-mono text-xs uppercase tracking-wider text-white/80 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#00FF94] rounded-full animate-pulse" /> Controls
          </p>

          <div className="p-5 rounded-2xl bg-[#121212] border border-white/10 flex flex-col gap-5">

            {/* Color mode */}
            <div>
              <p className="text-[9px] font-mono uppercase tracking-wider text-white/40 mb-1.5">Color mode: <span className="text-[#00FF94]">"{settings.colorMode}"</span></p>
              <div className="grid grid-cols-2 gap-1">
                {(['rgb','cyberpunk','green','amber','mono'] as ColorMode[]).map(m => (
                  <button key={m} onClick={() => upsert('colorMode', m)}
                    className={`text-[10px] font-mono py-1.5 rounded-lg border text-left px-2.5 transition-all ${settings.colorMode === m ? 'bg-[#00FF94]/10 border-[#00FF94]/40 text-[#00FF94] font-bold' : 'bg-[#151515] border-white/5 text-white/60 hover:text-white'}`}>{m}</button>
                ))}
              </div>
            </div>

            {/* Density preset */}
            <div>
              <p className="text-[9px] font-mono uppercase tracking-wider text-white/40 mb-1.5">Density: <span className="text-[#00FF94]">"{settings.densityPreset}"</span></p>
              <div className="grid grid-cols-3 gap-1">
                {(['standard','detailed','blocks','math','braille','stars','cards','alphanumeric','binary','matrix'] as DensityPreset[]).map(d => (
                  <button key={d} onClick={() => { upsert('densityPreset', d); upsert('customDensity', ''); }}
                    className={`text-[9px] font-mono py-1 rounded-md border text-center transition-all ${settings.densityPreset === d && !settings.customDensity ? 'bg-[#00FF94]/10 border-[#00FF94]/40 text-[#00FF94] font-bold' : 'bg-[#151515] border-white/5 text-white/60 hover:text-white'}`}>{d}</button>
                ))}
              </div>
            </div>

            {/* Custom density */}
            <div className="p-3 rounded-xl bg-black/30 border border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#00FF94] mb-1">Custom glyphs</p>
              <input value={settings.customDensity} onChange={e => upsert('customDensity', e.target.value)} placeholder="e.g. @#$%.* " className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white outline-none focus:border-[#00FF94]/50 placeholder:text-white/20" />
              <p className="text-[8px] font-mono text-white/30 mt-1">Overrides density preset. Each char = one brightness level.</p>
            </div>

            {/* Sliders */}
            <Slider label="Font size" value={settings.fontSize} min={4} max={36} step={1} onChange={v => upsert('fontSize', v)} unit="px" />
            <Slider label="Brightness" value={settings.brightness} min={0.5} max={2} step={0.05} onChange={v => upsert('brightness', v)} unit="%" />
            <Slider label="Contrast" value={settings.contrast} min={0.5} max={2} step={0.05} onChange={v => upsert('contrast', v)} unit="%" />
            <Slider label="Saturation" value={settings.saturation} min={0} max={2.5} step={0.05} onChange={v => upsert('saturation', v)} unit="%" />
          </div>

          <div className="p-5 rounded-2xl bg-[#121212] border border-white/10 flex flex-col gap-4">
            <p className="text-[9px] font-mono uppercase tracking-wider text-white/40">Source files</p>
            <label className="flex flex-col items-center gap-2 p-4 rounded-lg border border-dashed border-white/10 hover:border-white/20 cursor-pointer bg-transparent text-center">
              <input type="file" accept="video/*" onChange={e => e.target.files?.[0] && handleVideoFile(e.target.files[0])} className="hidden" />
              <span className="text-[11px] font-mono text-white/60">Drop or click to load video</span>
            </label>
            <label className="flex flex-col items-center gap-2 p-4 rounded-lg border border-dashed border-white/10 hover:border-white/20 cursor-pointer bg-transparent text-center">
              <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0])} className="hidden" />
              <span className="text-[11px] font-mono text-white/60">Drop or click to load image</span>
            </label>
          </div>
        </div>
      </main>

      <footer className="w-full max-w-7xl py-6 border-t border-white/10 text-center font-mono text-[10px] text-white/30 tracking-wider">
        react-ascii-media &middot; WebGL-accelerated &middot; MIT
      </footer>
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange, unit }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; unit: string;
}) {
  const pct = unit === '%' ? Math.round(value * 100) : value;
  return (
    <div>
      <div className="flex justify-between text-[9px] font-mono uppercase tracking-wider text-white/40 mb-1">
        <span>{label}</span><span className="text-[#00FF94]">{pct}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full accent-[#00FF94] h-1 rounded-lg bg-white/10 appearance-none cursor-ew-resize" />
    </div>
  );
}
