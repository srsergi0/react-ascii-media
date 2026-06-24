import React, { useEffect, useRef } from 'react';
import { AsciiSettings } from '../types';

interface AsciiCanvasProps {
  videoElement: HTMLVideoElement | null;
  videoSrc?: string;
  settings: AsciiSettings;
  className?: string;
  onDimensionsUpdate?: (width: number, height: number) => void;
}

export const AsciiCanvas: React.FC<AsciiCanvasProps> = ({
  videoElement,
  videoSrc,
  settings,
  className = '',
  onDimensionsUpdate,
}) => {
  const displayCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const vertexBufferRef = useRef<WebGLBuffer | null>(null);
  const videoTextureRef = useRef<WebGLTexture | null>(null);
  const atlasTextureRef = useRef<WebGLTexture | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const lastProcessedTimeRef = useRef<number>(-1);
  const animationFrameIdRef = useRef<number | null>(null);
  const uniformsRef = useRef<Record<string, WebGLUniformLocation | null>>({});
  const aPositionLocRef = useRef<number>(-1);

  const prevVideoTextureRef = useRef<WebGLTexture | null>(null);
  const transitionStartTimeRef = useRef<number>(0);
  const isTransitioningRef = useRef<boolean>(false);
  const hasCapturedFrameRef = useRef<boolean>(false);
  const prevSrcRef = useRef<string | undefined>(videoSrc);

  const prevFrameDataRef = useRef<Uint8Array | null>(null);
  const forceRedrawRef = useRef<boolean>(true);

  const colsRef = useRef<number>(8);
  const rowsRef = useRef<number>(6);

  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  const ctx2DRef = useRef<CanvasRenderingContext2D | null>(null);
  const colorStringCache2D = useRef<Map<number, string>>(new Map());
  const lutBCRef = useRef<Uint8Array>(new Uint8Array(256));
  const lutSatRef = useRef<Float32Array>(new Float32Array(256));
  const lutInvSatRef = useRef<Float32Array>(new Float32Array(256));

  const getDensityCharacters = (): string[] => {
    if (settings.customDensity) {
      return settings.customDensity.split('');
    }
    switch (settings.densityPreset) {
      case 'blocks':
        return [' ', '░', '▒', '▓', '█'];
      case 'binary':
        return [' ', '0', '1'];
      case 'matrix':
        return [' ', '•', '▰', '▱', '▲', '▼', '◄', '►', '◈', '▣', '▤', '▥', '▦', '▧', '▨', '▩', '█'];
      case 'detailed':
        return ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$'.split('');
      case 'math':
        return ' +-\\/*=%()<>[]{}#&@'.split('');
      case 'braille':
        return [' ', '⠁', '⠃', '⠇', '⡇', '⣇', '⣧', '⣷', '⣿'];
      case 'stars':
        return [' ', '.', '*', '+', '✦', '★', '✵', '✹', '✺'];
      case 'cards':
        return [' ', '♣', '♦', '♥', '♠'];
      case 'alphanumeric':
        return ' 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
      case 'standard':
      default:
        return ' .:-=+*#%@'.split('');
    }
  };

  const getOffscreenCanvas = (width: number, height: number) => {
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
      offscreenCanvasRef.current.width = width;
      offscreenCanvasRef.current.height = height;
      offscreenCtxRef.current = offscreenCanvasRef.current.getContext('2d', {
        willReadFrequently: false,
      });
    } else {
      if (offscreenCanvasRef.current.width !== width || offscreenCanvasRef.current.height !== height) {
        offscreenCanvasRef.current.width = width;
        offscreenCanvasRef.current.height = height;
      }
    }
    return {
      canvas: offscreenCanvasRef.current,
      ctx: offscreenCtxRef.current,
    };
  };

  useEffect(() => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return;

    let gl: WebGLRenderingContext | null = null;

    try {
      gl = (canvas.getContext('webgl', {
        alpha: true,
        depth: false,
        antialias: false,
        preserveDrawingBuffer: true,
      }) || canvas.getContext('experimental-webgl', {
        alpha: true,
        depth: false,
        antialias: false,
        preserveDrawingBuffer: true,
      })) as WebGLRenderingContext;
    } catch (e) {
      console.warn('WebGL initialization failed, falling back to 2D Canvas.', e);
    }

    if (!gl) {
      ctx2DRef.current = canvas.getContext('2d');
      return;
    }

    glRef.current = gl;

    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;

      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;

      varying vec2 v_texCoord;

      uniform sampler2D u_video_texture;
      uniform sampler2D u_prev_video_texture;
      uniform sampler2D u_atlas_texture;

      uniform float u_cols;
      uniform float u_rows;

      uniform float u_char_count;
      uniform float u_brightness;
      uniform float u_contrast;
      uniform float u_saturation;
      uniform int u_color_mode;
      uniform int u_use_sequence;

      uniform float u_transition_progress;
      uniform int u_has_prev_texture;

      void main() {
        float col = floor(v_texCoord.x * u_cols);
        float row = floor((1.0 - v_texCoord.y) * u_rows);

        if (col < 0.0 || col >= u_cols || row < 0.0 || row >= u_rows) {
          discard;
        }

        float localX = fract(v_texCoord.x * u_cols);
        float localY = fract((1.0 - v_texCoord.y) * u_rows);

        vec2 videoUV = vec2((col + 0.5) / u_cols, 1.0 - (row + 0.5) / u_rows);

        vec3 rgb;

        if (u_has_prev_texture == 1) {
          float progress = u_transition_progress;

          vec4 baseOld = texture2D(u_prev_video_texture, videoUV);
          vec4 baseNew = texture2D(u_video_texture, videoUV);

          float lumaOld = dot(baseOld.rgb, vec3(0.299, 0.587, 0.114));
          float lumaNew = dot(baseNew.rgb, vec3(0.299, 0.587, 0.114));

          vec2 dirOld = vec2(lumaOld - 0.5, (1.0 - lumaOld) - 0.5) * 0.18;
          vec2 uvOld = videoUV + dirOld * progress;
          vec4 oldColor = texture2D(u_prev_video_texture, clamp(uvOld, 0.0, 1.0));

          vec2 dirNew = vec2(lumaNew - 0.5, (1.0 - lumaNew) - 0.5) * 0.18;
          vec2 uvNew = videoUV - dirNew * (1.0 - progress);
          vec4 newColor = texture2D(u_video_texture, clamp(uvNew, 0.0, 1.0));

          rgb = mix(oldColor.rgb, newColor.rgb, progress);
        } else {
          vec4 videoColor = texture2D(u_video_texture, videoUV);
          rgb = videoColor.rgb;
        }

        rgb = rgb * u_brightness;
        rgb = (rgb - vec3(0.5)) * u_contrast + vec3(0.5);
        float luma = dot(rgb, vec3(0.299, 0.587, 0.114));
        rgb = mix(vec3(luma), rgb, u_saturation);
        rgb = clamp(rgb, 0.0, 1.0);

        float finalLuma = dot(rgb, vec3(0.299, 0.587, 0.114));
        float charIndex;
        if (u_use_sequence == 1) {
          charIndex = floor(mod(row * u_cols + col, u_char_count) + 0.1);
        } else {
          charIndex = floor(finalLuma * (u_char_count - 0.0001));
        }

        float intensity = 0.0;
        if (localX >= 0.0 && localX <= 1.0 && localY >= 0.0 && localY <= 1.0) {
          vec2 atlasUV = vec2((charIndex + localX) / u_char_count, localY);
          intensity = texture2D(u_atlas_texture, atlasUV).a;
        }

        if (u_use_sequence == 1) {
          intensity *= finalLuma;
        }

        vec3 finalColor = vec3(1.0);
        if (u_color_mode == 0) {
          finalColor = rgb;
        } else if (u_color_mode == 1) {
          float intensityG = mix(50.0/255.0, 255.0/255.0, finalLuma);
          finalColor = vec3(0.0, intensityG, 30.0/255.0);
        } else if (u_color_mode == 2) {
          finalColor = vec3(finalLuma, finalLuma * 0.65, 0.0);
        } else if (u_color_mode == 3) {
          finalColor = vec3(finalLuma);
        } else if (u_color_mode == 4) {
          float ratio = finalLuma * 0.6 + (row / u_rows) * 0.4;
          finalColor = vec3(
            mix(0.0, 1.0, ratio),
            mix(0.94, 0.04, ratio),
            mix(1.0, 0.63, ratio)
          );
        }

        gl_FragColor = vec4(finalColor * intensity, intensity);
      }
    `;

    const compileShader = (source: string, type: number): WebGLShader | null => {
      const shader = gl!.createShader(type);
      if (!shader) return null;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl!.getShaderInfoLog(shader));
        gl!.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(vsSource, gl.VERTEX_SHADER);
    const fs = compileShader(fsSource, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Shader program linking error:', gl.getProgramInfoLog(program));
      return;
    }

    programRef.current = program;

    uniformsRef.current = {
      u_video_texture: gl.getUniformLocation(program, 'u_video_texture'),
      u_prev_video_texture: gl.getUniformLocation(program, 'u_prev_video_texture'),
      u_atlas_texture: gl.getUniformLocation(program, 'u_atlas_texture'),
      u_cols: gl.getUniformLocation(program, 'u_cols'),
      u_rows: gl.getUniformLocation(program, 'u_rows'),
      u_char_count: gl.getUniformLocation(program, 'u_char_count'),
      u_brightness: gl.getUniformLocation(program, 'u_brightness'),
      u_contrast: gl.getUniformLocation(program, 'u_contrast'),
      u_saturation: gl.getUniformLocation(program, 'u_saturation'),
      u_color_mode: gl.getUniformLocation(program, 'u_color_mode'),
      u_use_sequence: gl.getUniformLocation(program, 'u_use_sequence'),
      u_transition_progress: gl.getUniformLocation(program, 'u_transition_progress'),
      u_has_prev_texture: gl.getUniformLocation(program, 'u_has_prev_texture'),
    };
    aPositionLocRef.current = gl.getAttribLocation(program, 'a_position');

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]),
      gl.STATIC_DRAW
    );
    vertexBufferRef.current = vertexBuffer;

    const videoTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, videoTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    videoTextureRef.current = videoTexture;

    const atlasTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    atlasTextureRef.current = atlasTexture;

    const prevVideoTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, prevVideoTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    prevVideoTextureRef.current = prevVideoTexture;

    return () => {
      const glCtx = glRef.current;
      if (glCtx) {
        if (vertexBufferRef.current) glCtx.deleteBuffer(vertexBufferRef.current);
        if (videoTextureRef.current) glCtx.deleteTexture(videoTextureRef.current);
        if (atlasTextureRef.current) glCtx.deleteTexture(atlasTextureRef.current);
        if (prevVideoTextureRef.current) glCtx.deleteTexture(prevVideoTextureRef.current);
        if (programRef.current) glCtx.deleteProgram(programRef.current);
      }
      glRef.current = null;
      ctx2DRef.current = null;
    };
  }, []);

  useEffect(() => {
    prevFrameDataRef.current = null;
    forceRedrawRef.current = true;

    const gl = glRef.current;
    const canvas = displayCanvasRef.current;
    if (!canvas) return;

    const charWidth = settings.fontSize * 0.6;
    const charHeight = settings.fontSize;
    const chars = getDensityCharacters();

    if (gl && atlasTextureRef.current) {
      const numChars = chars.length;
      const atlasGlyphHeight = 48;
      const atlasGlyphWidth = Math.ceil(atlasGlyphHeight * 0.6);

      const atlasCanvas = document.createElement('canvas');
      atlasCanvas.width = numChars * atlasGlyphWidth;
      atlasCanvas.height = atlasGlyphHeight;

      const atlasCtx = atlasCanvas.getContext('2d');
      if (atlasCtx) {
        atlasCtx.clearRect(0, 0, atlasCanvas.width, atlasCanvas.height);
        atlasCtx.fillStyle = '#FFFFFF';
        atlasCtx.textAlign = 'center';
        atlasCtx.textBaseline = 'middle';
        atlasCtx.font = `bold ${atlasGlyphHeight}px "Fira Code", "Courier New", Courier, monospace`;

        for (let i = 0; i < numChars; i++) {
          const char = chars[i];
          const x = i * atlasGlyphWidth + atlasGlyphWidth / 2;
          const y = atlasGlyphHeight / 2;
          atlasCtx.fillText(char, x, y);
        }

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, atlasTextureRef.current);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlasCanvas);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      }
    }

    if (ctx2DRef.current) {
      colorStringCache2D.current.clear();
    }

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      const w = Math.floor(rect.width) || videoElement?.videoWidth || 640;
      const h = Math.floor(rect.height) || videoElement?.videoHeight || 360;

      canvas.width = w * dpr;
      canvas.height = h * dpr;

      colsRef.current = Math.max(8, Math.floor(canvas.width / charWidth));
      rowsRef.current = Math.max(6, Math.floor(canvas.height / charHeight));

      if (gl) {
        gl.viewport(0, 0, canvas.width, canvas.height);
      }

      if (onDimensionsUpdate) {
        onDimensionsUpdate(w, h);
      }
    };

    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(canvas);
    resizeObserverRef.current = resizeObserver;

    return () => {
      resizeObserver.disconnect();
    };
  }, [videoElement, settings]);

  useEffect(() => {
    if (videoSrc !== prevSrcRef.current) {
      const gl = glRef.current;
      if (gl && prevVideoTextureRef.current && videoElement && videoElement.readyState >= 2) {
        try {
          gl.activeTexture(gl.TEXTURE2);
          gl.bindTexture(gl.TEXTURE_2D, prevVideoTextureRef.current);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, videoElement);

          hasCapturedFrameRef.current = true;
          isTransitioningRef.current = false;
        } catch (e) {
          console.warn('Failed to capture old video frame for transition:', e);
        }
      }
      prevSrcRef.current = videoSrc;
    }
  }, [videoSrc, videoElement]);

  useEffect(() => {
    if (!videoElement) return;

    let isActive = true;
    let requestCallbackId: number | null = null;

    const getQuantizedColor2D = (r: number, g: number, b: number): string => {
      const qr = Math.min(255, (r >> 4) << 4);
      const qg = Math.min(255, (g >> 4) << 4);
      const qb = Math.min(255, (b >> 4) << 4);
      const key = ((qr >> 4) << 8) | ((qg >> 4) << 4) | (qb >> 4);
      let cached = colorStringCache2D.current.get(key);
      if (!cached) {
        cached = `rgb(${qr},${qg},${qb})`;
        colorStringCache2D.current.set(key, cached);
      }
      return cached;
    };

    const renderFrame = () => {
      if (!isActive) return;

      const canvas = displayCanvasRef.current;
      if (!canvas) return;

      const time = videoElement.currentTime;
      if (time === lastProcessedTimeRef.current && !videoElement.paused && !isTransitioningRef.current && !hasCapturedFrameRef.current) {
        return;
      }
      lastProcessedTimeRef.current = time;

      const gl = glRef.current;
      const program = programRef.current;

      const charWidth = settings.fontSize * 0.6;
      const charHeight = settings.fontSize;
      const chars = getDensityCharacters();

      const cols = colsRef.current;
      const rows = rowsRef.current;

      if (gl && program && videoTextureRef.current && vertexBufferRef.current) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);

        if (videoElement.readyState >= 2) {
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, videoTextureRef.current);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, videoElement);
        }

        let progress = 1.0;
        let hasPrevTexture = 0;

        if (hasCapturedFrameRef.current) {
          if (videoElement.readyState >= 2) {
            hasCapturedFrameRef.current = false;
            isTransitioningRef.current = true;
            transitionStartTimeRef.current = performance.now();
            progress = 0.0;
            hasPrevTexture = 1;
          } else {
            progress = 0.0;
            hasPrevTexture = 1;
          }
        } else if (isTransitioningRef.current) {
          const elapsed = performance.now() - transitionStartTimeRef.current;
          const duration = 800;
          progress = Math.min(1.0, elapsed / duration);
          hasPrevTexture = 1;
          if (progress >= 1.0) {
            isTransitioningRef.current = false;
            hasPrevTexture = 0;
          }
        }

        if (hasPrevTexture === 1 && prevVideoTextureRef.current) {
          gl.activeTexture(gl.TEXTURE2);
          gl.bindTexture(gl.TEXTURE_2D, prevVideoTextureRef.current);
        }

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, atlasTextureRef.current);

        let colorModeInt = 0;
        if (settings.colorMode === 'green') colorModeInt = 1;
        else if (settings.colorMode === 'amber') colorModeInt = 2;
        else if (settings.colorMode === 'mono') colorModeInt = 3;
        else if (settings.colorMode === 'cyberpunk') colorModeInt = 4;

        const u = uniformsRef.current;
        gl.uniform1i(u.u_video_texture || null, 0);
        gl.uniform1i(u.u_prev_video_texture || null, 2);
        gl.uniform1i(u.u_atlas_texture || null, 1);
        gl.uniform1f(u.u_cols || null, cols);
        gl.uniform1f(u.u_rows || null, rows);
        gl.uniform1f(u.u_char_count || null, chars.length);
        gl.uniform1f(u.u_brightness || null, settings.brightness);
        gl.uniform1f(u.u_contrast || null, settings.contrast);
        gl.uniform1f(u.u_saturation || null, settings.saturation);
        gl.uniform1i(u.u_color_mode || null, colorModeInt);
        gl.uniform1i(u.u_use_sequence || null, settings.customDensity ? 1 : 0);
        gl.uniform1f(u.u_transition_progress || null, progress);
        gl.uniform1i(u.u_has_prev_texture || null, hasPrevTexture);

        const aPositionLoc = aPositionLocRef.current;
        if (aPositionLoc !== -1) {
          gl.enableVertexAttribArray(aPositionLoc);
          gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferRef.current);
          gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);
        }

        gl.drawArrays(gl.TRIANGLES, 0, 6);
      } else {
        const ctx2D = ctx2DRef.current;
        if (ctx2D) {
          const width = canvas.width;
          const height = canvas.height;

          const { canvas: offscreenCanvas, ctx: offscreenCtx } = getOffscreenCanvas(cols, rows);
          if (offscreenCtx) {
            offscreenCtx.drawImage(videoElement, 0, 0, cols, rows);
            const imgData = offscreenCtx.getImageData(0, 0, cols, rows);
            const dataBytes = imgData.data;
            const currentSize = cols * rows * 4;

            const prevFrameData = prevFrameDataRef.current;
            const forceFullRedraw = !prevFrameData || prevFrameData.length !== currentSize || forceRedrawRef.current || !settings.enableDeltaRendering;

            if (forceFullRedraw) {
              ctx2D.fillStyle = '#010101';
              ctx2D.fillRect(0, 0, width, height);
              if (settings.enableDeltaRendering) {
                prevFrameDataRef.current = new Uint8Array(dataBytes);
              }
              forceRedrawRef.current = false;
            }

            const bri = settings.brightness;
            const con = settings.contrast;
            const sat = settings.saturation;

            const lutBC = lutBCRef.current;
            const lutSat = lutSatRef.current;
            const lutInvSat = lutInvSatRef.current;

            for (let i = 0; i < 256; i++) {
              let v = i;
              if (bri !== 1.0) v *= bri;
              if (con !== 1.0) v = (v - 128) * con + 128;
              lutBC[i] = Math.max(0, Math.min(255, Math.floor(v)));

              lutSat[i] = i * sat;
              lutInvSat[i] = i * (1 - sat);
            }

            let currentFont = `bold ${settings.fontSize}px "JetBrains Mono", "Fira Code", Courier, monospace`;
            ctx2D.font = currentFont;
            ctx2D.textAlign = 'center';
            ctx2D.textBaseline = 'middle';

            let currentFillStyle = '';
            const charsLen = chars.length;
            const mode = settings.colorMode;
            const isCustom = !!settings.customDensity;

            for (let r = 0; r < rows; r++) {
              const y = r * charHeight + charHeight / 2;
              for (let c = 0; c < cols; c++) {
                const idx = (r * cols + c) * 4;
                const rVal = dataBytes[idx];
                const gVal = dataBytes[idx + 1];
                const bVal = dataBytes[idx + 2];

                if (!forceFullRedraw && settings.enableDeltaRendering && prevFrameData) {
                  const rPrev = prevFrameData[idx];
                  const gPrev = prevFrameData[idx + 1];
                  const bPrev = prevFrameData[idx + 2];

                  const diff = Math.abs(rVal - rPrev) + Math.abs(gVal - gPrev) + Math.abs(bVal - bPrev);
                  if (diff < settings.pdhThreshold) {
                    continue;
                  }
                }

                if (!forceFullRedraw) {
                  ctx2D.fillStyle = '#010101';
                  ctx2D.fillRect(c * charWidth - 0.2, r * charHeight - 0.2, charWidth + 0.4, charHeight + 0.4);
                  currentFillStyle = '#010101';
                }

                const rFiltered = lutBC[rVal];
                const gFiltered = lutBC[gVal];
                const bFiltered = lutBC[bVal];

                let finalR = rFiltered;
                let finalG = gFiltered;
                let finalB = bFiltered;

                if (sat !== 1.0) {
                  const gray = (rFiltered * 77 + gFiltered * 150 + bFiltered * 29) >> 8;
                  finalR = Math.max(0, Math.min(255, Math.floor(lutSat[rFiltered] + lutInvSat[gray])));
                  finalG = Math.max(0, Math.min(255, Math.floor(lutSat[gFiltered] + lutInvSat[gray])));
                  finalB = Math.max(0, Math.min(255, Math.floor(lutSat[bFiltered] + lutInvSat[gray])));
                }

                const luma = (finalR * 77 + finalG * 150 + finalB * 29) >> 8;
                const charIdx = isCustom
                  ? (r * cols + c) % charsLen
                  : (luma * charsLen) >> 8;
                const char = chars[charIdx] || chars[charsLen - 1];

                if (char === ' ') {
                  if (settings.enableDeltaRendering && prevFrameData) {
                    prevFrameData[idx] = rVal;
                    prevFrameData[idx + 1] = gVal;
                    prevFrameData[idx + 2] = bVal;
                  }
                  continue;
                }

                if (isCustom) {
                  ctx2D.globalAlpha = luma / 255;
                } else {
                  ctx2D.globalAlpha = 1.0;
                }

                let fillStyle = '#FFFFFF';
                if (mode === 'rgb') {
                  fillStyle = getQuantizedColor2D(finalR, finalG, finalB);
                } else if (mode === 'green') {
                  const intensity = Math.max(0, Math.min(255, 50 + ((luma * 205) >> 8)));
                  fillStyle = getQuantizedColor2D(0, intensity, 30);
                } else if (mode === 'amber') {
                  const intensity = Math.max(0, Math.min(255, luma));
                  fillStyle = getQuantizedColor2D(intensity, Math.max(0, Math.min(255, (intensity * 166) >> 8)), 0);
                } else if (mode === 'mono') {
                  const intensity = Math.max(0, Math.min(255, luma));
                  fillStyle = getQuantizedColor2D(intensity, intensity, intensity);
                } else if (mode === 'cyberpunk') {
                  const ratio = (luma / 255) * 0.6 + (r / rows) * 0.4;
                  const cyR = Math.max(0, Math.min(255, Math.floor(0 * (1 - ratio) + 255 * ratio)));
                  const cyG = Math.max(0, Math.min(255, Math.floor(240 * (1 - ratio) + 10 * ratio)));
                  const cyB = Math.max(0, Math.min(255, Math.floor(255 * (1 - ratio) + 160 * ratio)));
                  fillStyle = getQuantizedColor2D(cyR, cyG, cyB);
                }

                if (fillStyle !== currentFillStyle) {
                  ctx2D.fillStyle = fillStyle;
                  currentFillStyle = fillStyle;
                }

                const drawX = c * charWidth + charWidth / 2;
                const drawY = y;

                ctx2D.fillText(char, drawX, drawY);

                if (settings.enableDeltaRendering && prevFrameData) {
                  prevFrameData[idx] = rVal;
                  prevFrameData[idx + 1] = gVal;
                  prevFrameData[idx + 2] = bVal;
                }
              }
            }
            if (isCustom) {
              ctx2D.globalAlpha = 1.0;
            }
          }
        }
      }
    };

    const registerVideoFrameCallback = () => {
      if ('requestVideoFrameCallback' in videoElement) {
        const callbackLoop = () => {
          renderFrame();
          if (isActive) {
            requestCallbackId = (videoElement as any).requestVideoFrameCallback(callbackLoop);
          }
        };
        requestCallbackId = (videoElement as any).requestVideoFrameCallback(callbackLoop);
      } else {
        const animationLoop = () => {
          renderFrame();
          if (isActive) {
            animationFrameIdRef.current = requestAnimationFrame(animationLoop);
          }
        };
        animationFrameIdRef.current = requestAnimationFrame(animationLoop);
      }
    };

    registerVideoFrameCallback();
    renderFrame();

    const handleSeeked = () => {
      renderFrame();
    };
    videoElement.addEventListener('seeked', handleSeeked);

    return () => {
      isActive = false;
      videoElement.removeEventListener('seeked', handleSeeked);
      if (requestCallbackId !== null && 'cancelVideoFrameCallback' in videoElement) {
        (videoElement as any).cancelVideoFrameCallback(requestCallbackId);
      }
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [videoElement, settings]);

  return (
    <canvas
      id="ascii-display-canvas"
      ref={displayCanvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none select-none bg-transparent ${className}`}
    />
  );
};
