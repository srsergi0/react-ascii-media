/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { 
  Palette, 
  Sparkles, 
  Type, 
  Sliders, 
  Upload, 
  Video,
  Zap
} from 'lucide-react';
import { AsciiSettings, ColorMode, DensityPreset } from '../lib/types';

interface ControlPanelProps {
  settings: AsciiSettings;
  onChangeSettings: (settings: AsciiSettings) => void;
  onFileSelect: (file: File) => void;
  currentVideoName: string;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  settings,
  onChangeSettings,
  onFileSelect,
  currentVideoName,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const updateSetting = <K extends keyof AsciiSettings>(key: K, value: AsciiSettings[K]) => {
    onChangeSettings({
      ...settings,
      [key]: value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const colorModes: { id: ColorMode; label: string; desc: string }[] = [
    { id: 'rgb', label: 'Full RGB', desc: 'True color video matching' },
    { id: 'cyberpunk', label: 'Neon Glow', desc: 'Cyan & pink cyberpunk tint' },
    { id: 'green', label: 'Matrix', desc: 'Classic phosphor cathode green' },
    { id: 'amber', label: 'Amber', desc: 'Warm vintage microcomputer glowing' },
    { id: 'mono', label: 'Monochrome', desc: 'High fidelity grayscale rendering' },
  ];

  const densityPresets: { id: DensityPreset; label: string }[] = [
    { id: 'standard', label: 'Standard' },
    { id: 'detailed', label: 'Detailed' },
    { id: 'blocks', label: 'Solid Blocks' },
    { id: 'math', label: 'Math Symbols' },
    { id: 'braille', label: 'Braille' },
    { id: 'stars', label: 'Stars' },
    { id: 'cards', label: 'Card Suits' },
    { id: 'alphanumeric', label: 'Alphanumeric' },
    { id: 'binary', label: 'Binary Code' },
    { id: 'matrix', label: 'Cyber Glyphs' },
  ];

  return (
    <div className="w-full pb-12 flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-5">
        
        {/* Panel Section 1: Color & Glyphs */}
        <div id="panel-section-aesthetic" className="p-5 rounded-xl bg-surface border border-white/10 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center gap-2 text-white/90 font-mono text-xs uppercase tracking-wider border-b border-white/10 pb-2">
            <Palette className="w-3.5 h-3.5 text-accent" />
            <span>Style & Color</span>
          </div>

          {/* Color Select Grid */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">Color Palette</span>
            <div className="grid grid-cols-1 gap-1">
              {colorModes.map((mode) => (
                <button
                  id={`color-mode-${mode.id}`}
                  key={mode.id}
                  onClick={() => updateSetting('colorMode', mode.id)}
                  className={`px-3 py-1.5 rounded-md text-left text-xs font-mono transition-all flex items-center justify-between ${
                    settings.colorMode === mode.id
                      ? 'bg-accent/10 text-accent border-l-2 border-accent pl-2'
                      : 'hover:bg-white/5 text-white/60 hover:text-white'
                  }`}
                >
                  <span>{mode.label}</span>
                  {settings.colorMode === mode.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Glyphs Preset Select */}
          <div className="flex flex-col gap-1.5 mt-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">Glyph Set</span>
            <div className="grid grid-cols-2 gap-1">
              {densityPresets.map((preset) => (
                <button
                  id={`glyph-preset-${preset.id}`}
                  key={preset.id}
                  onClick={() => updateSetting('densityPreset', preset.id)}
                  className={`px-2.5 py-1.5 rounded-md text-center text-[11px] font-mono transition-all border ${
                    settings.densityPreset === preset.id
                      ? 'bg-accent/10 border-accent/30 text-accent font-medium'
                      : 'bg-transparent border-white/10 text-white/60 hover:text-white hover:border-white/20'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Panel Section 2: Layout & Detail sliders */}
        <div id="panel-section-rendering" className="p-5 rounded-xl bg-surface border border-white/10 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center gap-2 text-white/90 font-mono text-xs uppercase tracking-wider border-b border-white/10 pb-2">
            <Type className="w-3.5 h-3.5 text-accent" />
            <span>Resolution & Contrast</span>
          </div>

          {/* Font Size (Resolution) Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider">
              <span className="text-white/40">Font size (Glyph scale)</span>
              <span className="text-accent font-mono">{settings.fontSize}px</span>
            </div>
            <input
              id="fontSize-slider"
              type="range"
              min="4"
              max="36"
              step="1"
              value={settings.fontSize}
              onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
              className="w-full accent-accent h-1 rounded-lg bg-white/10 appearance-none cursor-ew-resize"
            />
            <div className="flex justify-between text-[8px] font-mono text-white/30 uppercase tracking-wider">
              <span>HD (High density)</span>
              <span>Ultra Retro (Ultra low file size)</span>
            </div>
          </div>

          {/* Brightness Adjustment */}
          <div className="flex flex-col gap-1.5 mt-2">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider">
              <span className="text-white/40">Brightness</span>
              <span className="text-white/80 font-mono">{(settings.brightness * 100).toFixed(0)}%</span>
            </div>
            <input
              id="brightness-slider"
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={settings.brightness}
              onChange={(e) => updateSetting('brightness', parseFloat(e.target.value))}
              className="w-full accent-accent h-1 rounded-lg bg-white/10 appearance-none cursor-ew-resize"
            />
          </div>

          {/* Contrast Adjustment */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider">
              <span className="text-white/40">Contrast</span>
              <span className="text-white/80 font-mono">{(settings.contrast * 100).toFixed(0)}%</span>
            </div>
            <input
              id="contrast-slider"
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={settings.contrast}
              onChange={(e) => updateSetting('contrast', parseFloat(e.target.value))}
              className="w-full accent-accent h-1 rounded-lg bg-white/10 appearance-none cursor-ew-resize"
            />
          </div>

          {/* Saturation Adjustment - Only useful in color modes */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider">
              <span className="text-white/40">Saturation</span>
              <span className="text-white/80 font-mono">{(settings.saturation * 100).toFixed(0)}%</span>
            </div>
            <input
              id="saturation-slider"
              type="range"
              min="0.0"
              max="2.5"
              step="0.05"
              value={settings.saturation}
              onChange={(e) => updateSetting('saturation', parseFloat(e.target.value))}
              disabled={settings.colorMode === 'mono' || settings.colorMode === 'green' || settings.colorMode === 'amber'}
              className="w-full accent-accent h-1 rounded-lg bg-white/10 appearance-none cursor-ew-resize disabled:opacity-20 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Panel Section: 10x Performance Engine */}
        <div id="panel-section-performance" className="p-5 rounded-xl bg-surface border border-white/10 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center gap-2 text-white/90 font-mono text-xs uppercase tracking-wider border-b border-white/10 pb-2">
            <Zap className="w-3.5 h-3.5 text-accent" />
            <span>10x PDH Performance Engine</span>
          </div>

          {/* Toggle for Delta-Encoding */}
          <div className="flex items-center justify-between gap-4 py-1">
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-mono text-white/80">Delta-Encoding (Skipping)</span>
              <span className="text-[9px] font-mono text-white/40 leading-tight">Only redraw cells when they change. Saves up to 90% CPU rendering work.</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
              <input
                id="delta-rendering-toggle"
                type="checkbox"
                checked={settings.enableDeltaRendering}
                onChange={(e) => updateSetting('enableDeltaRendering', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>

          {/* PDH Threshold (Just Noticeable Difference) Slider */}
          <div className="flex flex-col gap-1.5 mt-2">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider">
              <span className="text-white/40">PDH JND Jitter Threshold</span>
              <span className="text-accent font-mono">{settings.pdhThreshold} L1</span>
            </div>
            <input
              id="pdh-threshold-slider"
              type="range"
              min="0"
              max="60"
              step="1"
              value={settings.pdhThreshold}
              onChange={(e) => updateSetting('pdhThreshold', parseInt(e.target.value))}
              disabled={!settings.enableDeltaRendering}
              className="w-full accent-accent h-1 rounded-lg bg-white/10 appearance-none cursor-ew-resize disabled:opacity-20 disabled:cursor-not-allowed"
            />
            <div className="flex justify-between text-[8px] font-mono text-white/30 uppercase tracking-wider">
              <span>Mathematical Exact (0)</span>
              <span>Ultra Aggressive (60)</span>
            </div>
          </div>
        </div>

        {/* Panel Section 3: File Input & Streaming */}
        <div id="panel-section-file" className="p-5 rounded-xl bg-surface border border-white/10 flex flex-col justify-between gap-4 shadow-xl">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-white/90 font-mono text-xs uppercase tracking-wider border-b border-white/10 pb-2">
              <Upload className="w-3.5 h-3.5 text-accent" />
              <span>Input Source</span>
            </div>

            {/* Custom drag and drop zone */}
            <div
              id="drag-drop-zone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed rounded-lg p-5 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-accent bg-accent/5'
                  : 'border-white/10 bg-transparent hover:bg-white/[0.02] hover:border-white/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Video className="w-6 h-6 text-white/50" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-mono text-white/80">Drag video file here</span>
                <span className="text-[9px] font-mono text-white/40">or click to browse local storage</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            {/* Display active source name */}
            <div className="flex items-center justify-between text-[10px] font-mono bg-black/60 px-2.5 py-1.5 rounded-md border border-white/10 overflow-hidden text-ellipsis whitespace-nowrap">
              <span className="text-white/40 uppercase tracking-wider mr-1">Active:</span>
              <span className="text-accent overflow-hidden text-ellipsis font-bold flex-1 text-right">{currentVideoName}</span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};
