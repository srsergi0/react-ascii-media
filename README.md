# react-ascii-media

WebGL-accelerated React components for real-time video & image to full-color RGB ASCII art conversion. Renders at 60fps with GPU shaders.

## Features

- `CodeVideo` — live video to ASCII with WebGL shaders, 60fps
- `CodeImage` — static image to ASCII with GPU acceleration
- 5 color modes: RGB, Cyberpunk, Matrix Green, CRT Amber, Monochrome
- 10+ glyph sets: standard, blocks, braille, matrix, math, stars, cards, detailed, alphanumeric, binary
- Custom density sequences (use any characters)
- Visual filters: brightness, contrast, saturation
- Delta-encoding for CPU-efficient partial re-renders
- Optional custom player controls
- No external CSS or font dependencies

## Install

```bash
npm install react-ascii-media
```

## Usage

```tsx
import { CodeVideo, CodeImage } from 'react-ascii-media';

function VideoDemo() {
  return (
    <CodeVideo
      src="https://example.com/video.mp4"
      fontSize={7}
      colorMode="rgb"
      densityPreset="standard"
      customControls
      autoPlay
      loop
      muted
      className="w-full rounded-xl"
    />
  );
}

function ImageDemo() {
  return (
    <CodeImage
      src="https://example.com/image.jpg"
      fontSize={7}
      colorMode="cyberpunk"
      densityPreset="blocks"
      className="w-full rounded-xl"
    />
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fontSize` | number | 7 | Glyph size (px). Smaller = more detail |
| `colorMode` | `'rgb' \| 'green' \| 'amber' \| 'mono' \| 'cyberpunk'` | `'rgb'` | Color palette |
| `densityPreset` | `'standard' \| 'blocks' \| 'binary' \| 'matrix' \| 'detailed' \| 'math' \| 'braille' \| 'stars' \| 'cards' \| 'alphanumeric'` | `'standard'` | Glyph set |
| `customDensity` | string | `''` | Custom character sequence (overrides densityPreset) |
| `brightness` | number | 1.15 | Pre-processing brightness (0.5–2.0) |
| `contrast` | number | 1.1 | Contrast modifier (0.5–2.0) |
| `saturation` | number | 1.25 | Saturation scalar (0.0–2.5) |
| `asciiOpacity` | number | 1.0 | ASCII layer opacity (0.0–1.0) |
| `videoOpacity` / `imageOpacity` | number | 0.0 | Original media opacity (0.0–1.0) for comparison overlays |
| `customControls` | boolean | false | Show custom video player controls (CodeVideo only) |

## Browser Support

Works in any browser with WebGL support (Chrome, Firefox, Safari 15+, Edge). Falls back to Canvas 2D if WebGL is unavailable.

## Development

```bash
git clone https://github.com/srsergi0/react-ascii-media.git
cd react-ascii-media
npm install
npm run dev
```

## Builds

```bash
npm run build        # Library (dist-lib/)
npm run build:demo   # Demo site (dist/)
```

## License

Apache-2.0
