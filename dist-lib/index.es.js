import { jsx as f, jsxs as se, Fragment as Ye } from "react/jsx-runtime";
import { useRef as l, useEffect as ae, forwardRef as We, useImperativeHandle as Ve, useState as ue } from "react";
const $e = ({
  videoElement: a,
  videoSrc: d,
  settings: m,
  className: he = "",
  onDimensionsUpdate: te
}) => {
  const re = l(null), I = l(null), B = l(null), k = l(null), X = l(null), D = l(null), G = l(null), ce = l(-1), j = l(null), K = l({}), oe = l(-1), W = l(null), M = l(0), J = l(!1), V = l(!1), ie = l(d), le = l(null), Q = l(!0), S = l(8), Z = l(6), F = l(null), x = l(null), t = l(null), y = l(/* @__PURE__ */ new Map()), c = l(new Uint8Array(256)), N = l(new Float32Array(256)), z = l(new Float32Array(256)), P = () => {
    if (m.customDensity)
      return m.customDensity.split("");
    switch (m.densityPreset) {
      case "blocks":
        return [" ", "░", "▒", "▓", "█"];
      case "binary":
        return [" ", "0", "1"];
      case "matrix":
        return [" ", "•", "▰", "▱", "▲", "▼", "◄", "►", "◈", "▣", "▤", "▥", "▦", "▧", "▨", "▩", "█"];
      case "detailed":
        return " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$".split("");
      case "math":
        return " +-\\/*=%()<>[]{}#&@".split("");
      case "braille":
        return [" ", "⠁", "⠃", "⠇", "⡇", "⣇", "⣧", "⣷", "⣿"];
      case "stars":
        return [" ", ".", "*", "+", "✦", "★", "✵", "✹", "✺"];
      case "cards":
        return [" ", "♣", "♦", "♥", "♠"];
      case "alphanumeric":
        return " 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
      case "standard":
      default:
        return " .:-=+*#%@".split("");
    }
  }, h = (r, e) => (F.current ? (F.current.width !== r || F.current.height !== e) && (F.current.width = r, F.current.height = e) : (F.current = document.createElement("canvas"), F.current.width = r, F.current.height = e, x.current = F.current.getContext("2d", {
    willReadFrequently: !1
  })), {
    canvas: F.current,
    ctx: x.current
  });
  return ae(() => {
    const r = re.current;
    if (!r) return;
    let e = null;
    try {
      e = r.getContext("webgl", {
        alpha: !0,
        depth: !1,
        antialias: !1,
        preserveDrawingBuffer: !0
      }) || r.getContext("experimental-webgl", {
        alpha: !0,
        depth: !1,
        antialias: !1,
        preserveDrawingBuffer: !0
      });
    } catch (R) {
      console.warn("WebGL initialization failed, falling back to 2D Canvas.", R);
    }
    if (!e) {
      t.current = r.getContext("2d");
      return;
    }
    I.current = e;
    const s = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;

      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `, u = `
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
    `, U = (R, w) => {
      const L = e.createShader(w);
      return L ? (e.shaderSource(L, R), e.compileShader(L), e.getShaderParameter(L, e.COMPILE_STATUS) ? L : (console.error("Shader compilation error:", e.getShaderInfoLog(L)), e.deleteShader(L), null)) : null;
    }, v = U(s, e.VERTEX_SHADER), o = U(u, e.FRAGMENT_SHADER);
    if (!v || !o) return;
    const i = e.createProgram();
    if (!i) return;
    if (e.attachShader(i, v), e.attachShader(i, o), e.linkProgram(i), !e.getProgramParameter(i, e.LINK_STATUS)) {
      console.error("Shader program linking error:", e.getProgramInfoLog(i));
      return;
    }
    B.current = i, K.current = {
      u_video_texture: e.getUniformLocation(i, "u_video_texture"),
      u_prev_video_texture: e.getUniformLocation(i, "u_prev_video_texture"),
      u_atlas_texture: e.getUniformLocation(i, "u_atlas_texture"),
      u_cols: e.getUniformLocation(i, "u_cols"),
      u_rows: e.getUniformLocation(i, "u_rows"),
      u_char_count: e.getUniformLocation(i, "u_char_count"),
      u_brightness: e.getUniformLocation(i, "u_brightness"),
      u_contrast: e.getUniformLocation(i, "u_contrast"),
      u_saturation: e.getUniformLocation(i, "u_saturation"),
      u_color_mode: e.getUniformLocation(i, "u_color_mode"),
      u_use_sequence: e.getUniformLocation(i, "u_use_sequence"),
      u_transition_progress: e.getUniformLocation(i, "u_transition_progress"),
      u_has_prev_texture: e.getUniformLocation(i, "u_has_prev_texture")
    }, oe.current = e.getAttribLocation(i, "a_position");
    const n = e.createBuffer();
    e.bindBuffer(e.ARRAY_BUFFER, n), e.bufferData(
      e.ARRAY_BUFFER,
      new Float32Array([
        -1,
        -1,
        1,
        -1,
        -1,
        1,
        -1,
        1,
        1,
        -1,
        1,
        1
      ]),
      e.STATIC_DRAW
    ), k.current = n;
    const E = e.createTexture();
    e.bindTexture(e.TEXTURE_2D, E), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.NEAREST), X.current = E;
    const T = e.createTexture();
    e.bindTexture(e.TEXTURE_2D, T), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.NEAREST), D.current = T;
    const p = e.createTexture();
    return e.bindTexture(e.TEXTURE_2D, p), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.NEAREST), W.current = p, () => {
      const R = I.current;
      R && (k.current && R.deleteBuffer(k.current), X.current && R.deleteTexture(X.current), D.current && R.deleteTexture(D.current), W.current && R.deleteTexture(W.current), B.current && R.deleteProgram(B.current)), I.current = null, t.current = null;
    };
  }, []), ae(() => {
    le.current = null, Q.current = !0;
    const r = I.current, e = re.current;
    if (!e) return;
    const s = m.fontSize * 0.6, u = m.fontSize, U = P();
    if (r && D.current) {
      const i = U.length, n = 48, E = Math.ceil(n * 0.6), T = document.createElement("canvas");
      T.width = i * E, T.height = n;
      const p = T.getContext("2d");
      if (p) {
        p.clearRect(0, 0, T.width, T.height), p.fillStyle = "#FFFFFF", p.textAlign = "center", p.textBaseline = "middle", p.font = `bold ${n}px "Fira Code", "Courier New", Courier, monospace`;
        for (let R = 0; R < i; R++) {
          const w = U[R], L = R * E + E / 2, b = n / 2;
          p.fillText(w, L, b);
        }
        r.activeTexture(r.TEXTURE1), r.bindTexture(r.TEXTURE_2D, D.current), r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL, 0), r.texImage2D(r.TEXTURE_2D, 0, r.RGBA, r.RGBA, r.UNSIGNED_BYTE, T), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_MIN_FILTER, r.LINEAR), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_MAG_FILTER, r.LINEAR);
      }
    }
    t.current && y.current.clear();
    const v = () => {
      const i = e.getBoundingClientRect(), n = Math.min(1.5, window.devicePixelRatio || 1), E = Math.floor(i.width) || (a == null ? void 0 : a.videoWidth) || 640, T = Math.floor(i.height) || (a == null ? void 0 : a.videoHeight) || 360;
      e.width = E * n, e.height = T * n, S.current = Math.max(8, Math.floor(e.width / s)), Z.current = Math.max(6, Math.floor(e.height / u)), r && r.viewport(0, 0, e.width, e.height), te && te(E, T);
    };
    v();
    const o = new ResizeObserver(() => {
      v();
    });
    return o.observe(e), G.current = o, () => {
      o.disconnect();
    };
  }, [a, m]), ae(() => {
    if (d !== ie.current) {
      const r = I.current;
      if (r && W.current && a && a.readyState >= 2)
        try {
          r.activeTexture(r.TEXTURE2), r.bindTexture(r.TEXTURE_2D, W.current), r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL, 1), r.texImage2D(r.TEXTURE_2D, 0, r.RGBA, r.RGBA, r.UNSIGNED_BYTE, a), V.current = !0, J.current = !1;
        } catch (e) {
          console.warn("Failed to capture old video frame for transition:", e);
        }
      ie.current = d;
    }
  }, [d, a]), ae(() => {
    if (!a) return;
    let r = !0, e = null;
    const s = (o, i, n) => {
      const E = Math.min(255, o >> 4 << 4), T = Math.min(255, i >> 4 << 4), p = Math.min(255, n >> 4 << 4), R = E >> 4 << 8 | T >> 4 << 4 | p >> 4;
      let w = y.current.get(R);
      return w || (w = `rgb(${E},${T},${p})`, y.current.set(R, w)), w;
    }, u = () => {
      if (!r) return;
      const o = re.current;
      if (!o) return;
      const i = a.currentTime;
      if (i === ce.current && !a.paused && !J.current && !V.current)
        return;
      ce.current = i;
      const n = I.current, E = B.current, T = m.fontSize * 0.6, p = m.fontSize, R = P(), w = S.current, L = Z.current;
      if (n && E && X.current && k.current) {
        n.viewport(0, 0, o.width, o.height), n.clearColor(0, 0, 0, 0), n.clear(n.COLOR_BUFFER_BIT), n.useProgram(E), a.readyState >= 2 && (n.activeTexture(n.TEXTURE0), n.bindTexture(n.TEXTURE_2D, X.current), n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL, 1), n.texImage2D(n.TEXTURE_2D, 0, n.RGBA, n.RGBA, n.UNSIGNED_BYTE, a));
        let b = 1, O = 0;
        if (V.current)
          a.readyState >= 2 ? (V.current = !1, J.current = !0, M.current = performance.now(), b = 0, O = 1) : (b = 0, O = 1);
        else if (J.current) {
          const H = performance.now() - M.current;
          b = Math.min(1, H / 800), O = 1, b >= 1 && (J.current = !1, O = 0);
        }
        O === 1 && W.current && (n.activeTexture(n.TEXTURE2), n.bindTexture(n.TEXTURE_2D, W.current)), n.activeTexture(n.TEXTURE1), n.bindTexture(n.TEXTURE_2D, D.current);
        let Y = 0;
        m.colorMode === "green" ? Y = 1 : m.colorMode === "amber" ? Y = 2 : m.colorMode === "mono" ? Y = 3 : m.colorMode === "cyberpunk" && (Y = 4);
        const g = K.current;
        n.uniform1i(g.u_video_texture || null, 0), n.uniform1i(g.u_prev_video_texture || null, 2), n.uniform1i(g.u_atlas_texture || null, 1), n.uniform1f(g.u_cols || null, w), n.uniform1f(g.u_rows || null, L), n.uniform1f(g.u_char_count || null, R.length), n.uniform1f(g.u_brightness || null, m.brightness), n.uniform1f(g.u_contrast || null, m.contrast), n.uniform1f(g.u_saturation || null, m.saturation), n.uniform1i(g.u_color_mode || null, Y), n.uniform1i(g.u_use_sequence || null, m.customDensity ? 1 : 0), n.uniform1f(g.u_transition_progress || null, b), n.uniform1i(g.u_has_prev_texture || null, O);
        const $ = oe.current;
        $ !== -1 && (n.enableVertexAttribArray($), n.bindBuffer(n.ARRAY_BUFFER, k.current), n.vertexAttribPointer($, 2, n.FLOAT, !1, 0, 0)), n.drawArrays(n.TRIANGLES, 0, 6);
      } else {
        const b = t.current;
        if (b) {
          const O = o.width, Y = o.height, { ctx: g } = h(w, L);
          if (g) {
            g.drawImage(a, 0, 0, w, L);
            const H = g.getImageData(0, 0, w, L).data, fe = w * L * 4, A = le.current, _e = !A || A.length !== fe || Q.current || !m.enableDeltaRendering;
            _e && (b.fillStyle = "#010101", b.fillRect(0, 0, O, Y), m.enableDeltaRendering && (le.current = new Uint8Array(H)), Q.current = !1);
            const be = m.brightness, ne = m.contrast, Ee = m.saturation, me = c.current, xe = N.current, ge = z.current;
            for (let _ = 0; _ < 256; _++) {
              let Te = _;
              be !== 1 && (Te *= be), ne !== 1 && (Te = (Te - 128) * ne + 128), me[_] = Math.max(0, Math.min(255, Math.floor(Te))), xe[_] = _ * Ee, ge[_] = _ * (1 - Ee);
            }
            let ye = `bold ${m.fontSize}px "JetBrains Mono", "Fira Code", Courier, monospace`;
            b.font = ye, b.textAlign = "center", b.textBaseline = "middle";
            let de = "";
            const Ce = R.length, ve = m.colorMode, ee = !!m.customDensity;
            for (let _ = 0; _ < L; _++) {
              const Te = _ * p + p / 2;
              for (let Re = 0; Re < w; Re++) {
                const q = (_ * w + Re) * 4, Me = H[q], Ue = H[q + 1], Le = H[q + 2];
                if (!_e && m.enableDeltaRendering && A) {
                  const C = A[q], Xe = A[q + 1], Ne = A[q + 2];
                  if (Math.abs(Me - C) + Math.abs(Ue - Xe) + Math.abs(Le - Ne) < m.pdhThreshold)
                    continue;
                }
                _e || (b.fillStyle = "#010101", b.fillRect(Re * T - 0.2, _ * p - 0.2, T + 0.4, p + 0.4), de = "#010101");
                const Ae = me[Me], Fe = me[Ue], De = me[Le];
                let Se = Ae, Pe = Fe, Ie = De;
                if (Ee !== 1) {
                  const C = Ae * 77 + Fe * 150 + De * 29 >> 8;
                  Se = Math.max(0, Math.min(255, Math.floor(xe[Ae] + ge[C]))), Pe = Math.max(0, Math.min(255, Math.floor(xe[Fe] + ge[C]))), Ie = Math.max(0, Math.min(255, Math.floor(xe[De] + ge[C])));
                }
                const we = Se * 77 + Pe * 150 + Ie * 29 >> 8, ze = ee ? (_ * w + Re) % Ce : we * Ce >> 8, Be = R[ze] || R[Ce - 1];
                if (Be === " ") {
                  m.enableDeltaRendering && A && (A[q] = Me, A[q + 1] = Ue, A[q + 2] = Le);
                  continue;
                }
                ee ? b.globalAlpha = we / 255 : b.globalAlpha = 1;
                let pe = "#FFFFFF";
                if (ve === "rgb")
                  pe = s(Se, Pe, Ie);
                else if (ve === "green") {
                  const C = Math.max(0, Math.min(255, 50 + (we * 205 >> 8)));
                  pe = s(0, C, 30);
                } else if (ve === "amber") {
                  const C = Math.max(0, Math.min(255, we));
                  pe = s(C, Math.max(0, Math.min(255, C * 166 >> 8)), 0);
                } else if (ve === "mono") {
                  const C = Math.max(0, Math.min(255, we));
                  pe = s(C, C, C);
                } else if (ve === "cyberpunk") {
                  const C = we / 255 * 0.6 + _ / L * 0.4, Xe = Math.max(0, Math.min(255, Math.floor(0 * (1 - C) + 255 * C))), Ne = Math.max(0, Math.min(255, Math.floor(240 * (1 - C) + 10 * C))), ke = Math.max(0, Math.min(255, Math.floor(255 * (1 - C) + 160 * C)));
                  pe = s(Xe, Ne, ke);
                }
                pe !== de && (b.fillStyle = pe, de = pe);
                const Oe = Re * T + T / 2, qe = Te;
                b.fillText(Be, Oe, qe), m.enableDeltaRendering && A && (A[q] = Me, A[q + 1] = Ue, A[q + 2] = Le);
              }
            }
            ee && (b.globalAlpha = 1);
          }
        }
      }
    };
    (() => {
      if ("requestVideoFrameCallback" in a) {
        const o = () => {
          u(), r && (e = a.requestVideoFrameCallback(o));
        };
        e = a.requestVideoFrameCallback(o);
      } else {
        const o = () => {
          u(), r && (j.current = requestAnimationFrame(o));
        };
        j.current = requestAnimationFrame(o);
      }
    })(), u();
    const v = () => {
      u();
    };
    return a.addEventListener("seeked", v), () => {
      r = !1, a.removeEventListener("seeked", v), e !== null && "cancelVideoFrameCallback" in a && a.cancelVideoFrameCallback(e), j.current !== null && cancelAnimationFrame(j.current);
    };
  }, [a, m]), /* @__PURE__ */ f(
    "canvas",
    {
      id: "ascii-display-canvas",
      ref: re,
      className: `absolute inset-0 w-full h-full pointer-events-none select-none bg-transparent ${he}`
    }
  );
}, Ge = ({ className: a = "w-4 h-4", fill: d = "none" }) => /* @__PURE__ */ f("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: d, stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: a, children: /* @__PURE__ */ f("polygon", { points: "6 3 20 12 6 21 6 3" }) }), He = ({ className: a = "w-4 h-4", fill: d = "none" }) => /* @__PURE__ */ se("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: d, stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: a, children: [
  /* @__PURE__ */ f("rect", { x: "14", y: "4", width: "4", height: "16", rx: "1" }),
  /* @__PURE__ */ f("rect", { x: "6", y: "4", width: "4", height: "16", rx: "1" })
] }), je = ({ className: a = "w-4 h-4" }) => /* @__PURE__ */ se("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: a, children: [
  /* @__PURE__ */ f("polygon", { points: "11 5 6 9 2 9 2 15 6 15 11 19 11 5" }),
  /* @__PURE__ */ f("path", { d: "M15.54 8.46a5 5 0 0 1 0 7.07" }),
  /* @__PURE__ */ f("path", { d: "M19.07 4.93a10 10 0 0 1 0 14.14" })
] }), Ke = ({ className: a = "w-4 h-4" }) => /* @__PURE__ */ se("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: a, children: [
  /* @__PURE__ */ f("polygon", { points: "11 5 6 9 2 9 2 15 6 15 11 19 11 5" }),
  /* @__PURE__ */ f("line", { x1: "22", y1: "9", x2: "16", y2: "15" }),
  /* @__PURE__ */ f("line", { x1: "16", y1: "9", x2: "22", y2: "15" })
] }), Je = ({ className: a = "w-4 h-4" }) => /* @__PURE__ */ se("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: a, children: [
  /* @__PURE__ */ f("polyline", { points: "15 3 21 3 21 9" }),
  /* @__PURE__ */ f("polyline", { points: "9 21 3 21 3 15" }),
  /* @__PURE__ */ f("line", { x1: "21", y1: "3", x2: "14", y2: "10" }),
  /* @__PURE__ */ f("line", { x1: "3", y1: "21", x2: "10", y2: "14" })
] }), Qe = We(({
  fontSize: a = 7,
  colorMode: d = "rgb",
  densityPreset: m = "standard",
  customDensity: he = "",
  brightness: te = 1.15,
  contrast: re = 1.1,
  saturation: I = 1.25,
  pdhThreshold: B = 18,
  className: k = "",
  videoClassName: X = "",
  canvasClassName: D = "",
  asciiOpacity: G = 1,
  videoOpacity: ce = 0,
  customControls: j = !1,
  src: K,
  autoPlay: oe,
  loop: W,
  muted: M,
  playsInline: J = !0,
  crossOrigin: V = "anonymous",
  style: ie,
  ...le
}, Q) => {
  const S = l(null), Z = l(null);
  Ve(Q, () => S.current);
  const F = {
    fontSize: a,
    colorMode: d,
    densityPreset: m,
    customDensity: he,
    brightness: te,
    contrast: re,
    saturation: I,
    enableDeltaRendering: !0,
    pdhThreshold: B,
    asciiOpacity: G,
    videoOpacity: ce
  }, [x, t] = ue(!1), [y, c] = ue(!!M), [N, z] = ue(0), [P, h] = ue(16 / 9), [r, e] = ue(!1);
  ae(() => {
    const o = S.current;
    if (!o) return;
    const i = () => t(!0), n = () => t(!1), E = () => c(o.muted), T = () => {
      o.duration && z(o.currentTime / o.duration * 100);
    }, p = () => {
      o.videoWidth && o.videoHeight && h(o.videoWidth / o.videoHeight);
    };
    return o.addEventListener("play", i), o.addEventListener("pause", n), o.addEventListener("volumechange", E), o.addEventListener("timeupdate", T), o.addEventListener("loadedmetadata", p), t(!o.paused), c(o.muted), () => {
      o.removeEventListener("play", i), o.removeEventListener("pause", n), o.removeEventListener("volumechange", E), o.removeEventListener("timeupdate", T), o.removeEventListener("loadedmetadata", p);
    };
  }, []), ae(() => {
    const o = S.current;
    o && K && (o.src = K, o.load(), oe && o.play().catch(() => {
    }));
  }, [K, oe]), ae(() => {
    const o = S.current;
    o && (o.muted = !!M, c(!!M));
  }, [M]);
  const s = () => {
    const o = S.current;
    o && (o.paused ? o.play().catch(() => {
    }) : o.pause());
  }, u = (o) => {
    o.stopPropagation();
    const i = S.current;
    i && (i.muted = !i.muted, c(i.muted));
  }, U = (o) => {
    o.stopPropagation();
    const i = S.current;
    if (!i || !i.duration) return;
    const n = o.currentTarget.getBoundingClientRect(), T = (o.clientX - n.left) / n.width;
    i.currentTime = T * i.duration;
  }, v = (o) => {
    o.stopPropagation(), Z.current && (document.fullscreenElement ? document.exitFullscreen().catch(() => {
    }) : Z.current.requestFullscreen().catch(() => {
    }));
  };
  return /* @__PURE__ */ se(
    "div",
    {
      ref: Z,
      onMouseEnter: () => e(!0),
      onMouseLeave: () => e(!1),
      className: `relative rounded-xl overflow-hidden bg-[#050505] border border-white/10 group select-none transition-all duration-300 flex items-center justify-center ${k}`,
      style: {
        aspectRatio: `${P}`,
        width: "100%",
        ...ie
      },
      children: [
        /* @__PURE__ */ f(
          "video",
          {
            ref: S,
            crossOrigin: V,
            playsInline: J,
            loop: W,
            autoPlay: oe,
            muted: y,
            style: { opacity: ce },
            className: `absolute inset-0 w-full h-full object-cover select-none bg-black transition-opacity duration-300 pointer-events-none ${X}`,
            ...le
          }
        ),
        /* @__PURE__ */ f(
          "div",
          {
            className: `absolute inset-0 w-full h-full pointer-events-none select-none transition-opacity duration-300 ${D}`,
            style: { opacity: G },
            children: /* @__PURE__ */ f(
              $e,
              {
                videoElement: S.current,
                videoSrc: K,
                settings: F
              }
            )
          }
        ),
        j ? /* @__PURE__ */ se(Ye, { children: [
          /* @__PURE__ */ f(
            "div",
            {
              onClick: s,
              className: "absolute inset-0 z-10 cursor-pointer flex items-center justify-center bg-black/0 active:bg-black/10 transition-colors"
            }
          ),
          !x && /* @__PURE__ */ f(
            "div",
            {
              onClick: s,
              className: "absolute z-20 w-14 h-14 rounded-full border border-white/25 flex items-center justify-center backdrop-blur-md shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer",
              style: { backgroundColor: "rgba(18,18,18,0.9)", color: "#00FF94" },
              children: /* @__PURE__ */ f(Ge, { className: "w-5 h-5 stroke-none translate-x-[2px]", fill: "currentColor" })
            }
          ),
          /* @__PURE__ */ se(
            "div",
            {
              className: `absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex flex-col gap-3 transition-opacity duration-300 z-20 ${r || !x ? "opacity-100" : "opacity-0 pointer-events-none"}`,
              children: [
                /* @__PURE__ */ f(
                  "div",
                  {
                    onClick: U,
                    className: "w-full h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer relative group/progress transition-all hover:h-2",
                    children: /* @__PURE__ */ f(
                      "div",
                      {
                        className: "absolute top-0 left-0 bottom-0 rounded-full shadow-[0_0_8px_rgba(0,255,148,0.6)]",
                        style: { width: `${N}%`, backgroundColor: "#00FF94" }
                      }
                    )
                  }
                ),
                /* @__PURE__ */ se("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ se("div", { className: "flex items-center gap-3", children: [
                    /* @__PURE__ */ f(
                      "button",
                      {
                        type: "button",
                        onClick: s,
                        className: "p-1.5 rounded-md hover:bg-white/10 text-white transition-colors",
                        children: x ? /* @__PURE__ */ f(He, { className: "w-4 h-4 fill-white", fill: "currentColor" }) : /* @__PURE__ */ f(Ge, { className: "w-4 h-4 stroke-none", fill: "#00FF94" })
                      }
                    ),
                    /* @__PURE__ */ f(
                      "button",
                      {
                        type: "button",
                        onClick: u,
                        className: "p-1.5 rounded-md hover:bg-white/10 text-white transition-colors",
                        children: y ? /* @__PURE__ */ f(Ke, { className: "w-4 h-4" }) : /* @__PURE__ */ f(je, { className: "w-4 h-4" })
                      }
                    )
                  ] }),
                  /* @__PURE__ */ f("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ f(
                    "button",
                    {
                      type: "button",
                      onClick: v,
                      className: "p-1.5 rounded-md hover:bg-white/10 text-white transition-colors",
                      children: /* @__PURE__ */ f(Je, { className: "w-4 h-4" })
                    }
                  ) })
                ] })
              ]
            }
          )
        ] }) : !j && le.controls && /* @__PURE__ */ f("div", { className: "absolute bottom-2 right-2 z-20 bg-black/60 px-2 py-1 rounded border border-white/10 text-[9px] font-mono text-white/60", children: "*Use customControls prop for styled overlay controls" })
      ]
    }
  );
});
Qe.displayName = "CodeVideo";
const Ze = ({
  imageElement: a,
  settings: d,
  className: m = "",
  onDimensionsUpdate: he,
  onFirstRender: te,
  triggerRender: re = 0
}) => {
  const I = l(null), B = l(null), k = l(null), X = l(null), D = l(null), G = l(null), ce = l(null), j = l({}), K = l(-1), oe = l(8), W = l(6), M = l(null), J = l(null), V = l(null), ie = l(/* @__PURE__ */ new Map()), le = l(new Uint8Array(256)), Q = l(new Float32Array(256)), S = l(new Float32Array(256)), Z = () => {
    if (d.customDensity)
      return d.customDensity.split("");
    switch (d.densityPreset) {
      case "blocks":
        return [" ", "░", "▒", "▓", "█"];
      case "binary":
        return [" ", "0", "1"];
      case "matrix":
        return [" ", "•", "▰", "▱", "▲", "▼", "◄", "►", "◈", "▣", "▤", "▥", "▦", "▧", "▨", "▩", "█"];
      case "detailed":
        return " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$".split("");
      case "math":
        return " +-\\/*=%()<>[]{}#&@".split("");
      case "braille":
        return [" ", "⠁", "⠃", "⠇", "⡇", "⣇", "⣧", "⣷", "⣿"];
      case "stars":
        return [" ", ".", "*", "+", "✦", "★", "✵", "✹", "✺"];
      case "cards":
        return [" ", "♣", "♦", "♥", "♠"];
      case "alphanumeric":
        return " 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
      case "standard":
      default:
        return " .:-=+*#%@".split("");
    }
  }, F = (x, t) => (M.current ? (M.current.width !== x || M.current.height !== t) && (M.current.width = x, M.current.height = t) : (M.current = document.createElement("canvas"), M.current.width = x, M.current.height = t, J.current = M.current.getContext("2d", {
    willReadFrequently: !1
  })), {
    canvas: M.current,
    ctx: J.current
  });
  return ae(() => {
    const x = I.current;
    if (!x) return;
    let t = null;
    try {
      t = x.getContext("webgl", {
        alpha: !1,
        depth: !1,
        antialias: !1,
        preserveDrawingBuffer: !0
      }) || x.getContext("experimental-webgl", {
        alpha: !1,
        depth: !1,
        antialias: !1,
        preserveDrawingBuffer: !0
      });
    } catch (u) {
      console.warn("WebGL initialization failed, falling back to 2D Canvas.", u);
    }
    if (!t) {
      V.current = x.getContext("2d");
      return;
    }
    B.current = t;
    const y = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;

      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `, c = `
      precision highp float;

      varying vec2 v_texCoord;

      uniform sampler2D u_video_texture;
      uniform sampler2D u_atlas_texture;

      uniform float u_cols;
      uniform float u_rows;

      uniform float u_char_count;
      uniform float u_brightness;
      uniform float u_contrast;
      uniform float u_saturation;
      uniform int u_color_mode;
      uniform int u_use_sequence;

      void main() {
        float col = floor(v_texCoord.x * u_cols);
        float row = floor((1.0 - v_texCoord.y) * u_rows);

        if (col < 0.0 || col >= u_cols || row < 0.0 || row >= u_rows) {
          discard;
        }

        vec2 videoUV = vec2((col + 0.5) / u_cols, 1.0 - (row + 0.5) / u_rows);
        vec4 videoColor = texture2D(u_video_texture, videoUV);
        vec3 rgb = videoColor.rgb;

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

        float cellFractX = fract(v_texCoord.x * u_cols);
        float cellFractY = fract((1.0 - v_texCoord.y) * u_rows);

        vec2 atlasUV = vec2((charIndex + cellFractX) / u_char_count, cellFractY);
        vec4 glyphColor = texture2D(u_atlas_texture, atlasUV);
        float intensity = glyphColor.a;

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

        vec3 bg = vec3(0.0196, 0.0196, 0.0196);
        gl_FragColor = vec4(mix(bg, finalColor, intensity), 1.0);
      }
    `, N = (u, U) => {
      const v = t.createShader(U);
      return v ? (t.shaderSource(v, u), t.compileShader(v), t.getShaderParameter(v, t.COMPILE_STATUS) ? v : (console.error("Shader compilation error:", t.getShaderInfoLog(v)), t.deleteShader(v), null)) : null;
    }, z = N(y, t.VERTEX_SHADER), P = N(c, t.FRAGMENT_SHADER);
    if (!z || !P) return;
    const h = t.createProgram();
    if (!h) return;
    if (t.attachShader(h, z), t.attachShader(h, P), t.linkProgram(h), !t.getProgramParameter(h, t.LINK_STATUS)) {
      console.error("Shader program linking error:", t.getProgramInfoLog(h));
      return;
    }
    k.current = h, j.current = {
      u_video_texture: t.getUniformLocation(h, "u_video_texture"),
      u_atlas_texture: t.getUniformLocation(h, "u_atlas_texture"),
      u_cols: t.getUniformLocation(h, "u_cols"),
      u_rows: t.getUniformLocation(h, "u_rows"),
      u_char_count: t.getUniformLocation(h, "u_char_count"),
      u_brightness: t.getUniformLocation(h, "u_brightness"),
      u_contrast: t.getUniformLocation(h, "u_contrast"),
      u_saturation: t.getUniformLocation(h, "u_saturation"),
      u_color_mode: t.getUniformLocation(h, "u_color_mode"),
      u_use_sequence: t.getUniformLocation(h, "u_use_sequence")
    }, K.current = t.getAttribLocation(h, "a_position");
    const r = t.createBuffer();
    t.bindBuffer(t.ARRAY_BUFFER, r), t.bufferData(
      t.ARRAY_BUFFER,
      new Float32Array([
        -1,
        -1,
        1,
        -1,
        -1,
        1,
        -1,
        1,
        1,
        -1,
        1,
        1
      ]),
      t.STATIC_DRAW
    ), X.current = r;
    const e = t.createTexture();
    t.bindTexture(t.TEXTURE_2D, e), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_S, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_T, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.NEAREST), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, t.NEAREST), D.current = e;
    const s = t.createTexture();
    return t.bindTexture(t.TEXTURE_2D, s), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_S, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_T, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.NEAREST), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, t.NEAREST), G.current = s, () => {
      const u = B.current;
      u && (X.current && u.deleteBuffer(X.current), D.current && u.deleteTexture(D.current), G.current && u.deleteTexture(G.current), k.current && u.deleteProgram(k.current)), B.current = null, V.current = null;
    };
  }, []), ae(() => {
    const x = B.current, t = I.current;
    if (!t) return;
    const y = d.fontSize * 0.6, c = d.fontSize, N = Z();
    if (x && G.current) {
      const h = N.length, r = document.createElement("canvas");
      r.width = Math.ceil(h * y), r.height = Math.ceil(c);
      const e = r.getContext("2d");
      if (e) {
        e.clearRect(0, 0, r.width, r.height), e.fillStyle = "#FFFFFF", e.font = `bold ${d.fontSize}px "JetBrains Mono", "Fira Code", Courier, monospace`, e.textAlign = "center", e.textBaseline = "middle";
        for (let s = 0; s < h; s++) {
          const u = N[s], U = s * y + y / 2, v = c / 2;
          e.fillText(u, U, v);
        }
        x.activeTexture(x.TEXTURE1), x.bindTexture(x.TEXTURE_2D, G.current), x.pixelStorei(x.UNPACK_FLIP_Y_WEBGL, 0), x.texImage2D(x.TEXTURE_2D, 0, x.RGBA, x.RGBA, x.UNSIGNED_BYTE, r);
      }
    }
    V.current && ie.current.clear();
    const z = () => {
      const h = t.getBoundingClientRect(), r = Math.min(1.5, window.devicePixelRatio || 1), e = Math.floor(h.width) || (a == null ? void 0 : a.naturalWidth) || 640, s = Math.floor(h.height) || (a == null ? void 0 : a.naturalHeight) || 360;
      t.width = e * r, t.height = s * r, oe.current = Math.max(8, Math.floor(t.width / y)), W.current = Math.max(6, Math.floor(t.height / c)), x && x.viewport(0, 0, t.width, t.height), he && he(e, s);
    };
    z();
    const P = new ResizeObserver(() => {
      z();
    });
    return P.observe(t), ce.current = P, () => {
      P.disconnect();
    };
  }, [a, d, re]), ae(() => {
    if (!a || !a.complete || a.naturalHeight === 0) return;
    const x = () => {
      const y = I.current;
      if (!y) return;
      const c = B.current, N = k.current, z = d.fontSize * 0.6, P = d.fontSize, h = Z(), r = oe.current, e = W.current;
      if (c && N && D.current && X.current) {
        c.viewport(0, 0, y.width, y.height), c.clearColor(0.0196, 0.0196, 0.0196, 1), c.clear(c.COLOR_BUFFER_BIT), c.useProgram(N), c.activeTexture(c.TEXTURE0), c.bindTexture(c.TEXTURE_2D, D.current), c.pixelStorei(c.UNPACK_FLIP_Y_WEBGL, 1), c.texImage2D(c.TEXTURE_2D, 0, c.RGBA, c.RGBA, c.UNSIGNED_BYTE, a), c.activeTexture(c.TEXTURE1), c.bindTexture(c.TEXTURE_2D, G.current);
        let s = 0;
        d.colorMode === "green" ? s = 1 : d.colorMode === "amber" ? s = 2 : d.colorMode === "mono" ? s = 3 : d.colorMode === "cyberpunk" && (s = 4);
        const u = j.current;
        c.uniform1i(u.u_video_texture || null, 0), c.uniform1i(u.u_atlas_texture || null, 1), c.uniform1f(u.u_cols || null, r), c.uniform1f(u.u_rows || null, e), c.uniform1f(u.u_char_count || null, h.length), c.uniform1f(u.u_brightness || null, d.brightness), c.uniform1f(u.u_contrast || null, d.contrast), c.uniform1f(u.u_saturation || null, d.saturation), c.uniform1i(u.u_color_mode || null, s), c.uniform1i(u.u_use_sequence || null, d.customDensity ? 1 : 0);
        const U = K.current;
        U !== -1 && (c.enableVertexAttribArray(U), c.bindBuffer(c.ARRAY_BUFFER, X.current), c.vertexAttribPointer(U, 2, c.FLOAT, !1, 0, 0)), c.drawArrays(c.TRIANGLES, 0, 6), te && te();
      } else {
        const s = V.current;
        if (s) {
          const u = y.width, U = y.height, { ctx: v } = F(r, e);
          if (v) {
            v.drawImage(a, 0, 0, r, e);
            const i = v.getImageData(0, 0, r, e).data;
            s.fillStyle = "#010101", s.fillRect(0, 0, u, U);
            const n = d.brightness, E = d.contrast, T = d.saturation, p = le.current, R = Q.current, w = S.current;
            for (let g = 0; g < 256; g++) {
              let $ = g;
              n !== 1 && ($ *= n), E !== 1 && ($ = ($ - 128) * E + 128), p[g] = Math.max(0, Math.min(255, Math.floor($))), R[g] = g * T, w[g] = g * (1 - T);
            }
            s.font = `bold ${d.fontSize}px "JetBrains Mono", "Fira Code", Courier, monospace`, s.textAlign = "center", s.textBaseline = "middle";
            let L = "";
            const b = h.length, O = d.colorMode, Y = (g, $, H) => {
              const fe = Math.min(255, g >> 4 << 4), A = Math.min(255, $ >> 4 << 4), _e = Math.min(255, H >> 4 << 4), be = fe >> 4 << 8 | A >> 4 << 4 | _e >> 4;
              let ne = ie.current.get(be);
              return ne || (ne = `rgb(${fe},${A},${_e})`, ie.current.set(be, ne)), ne;
            };
            for (let g = 0; g < e; g++) {
              const $ = g * P + P / 2;
              for (let H = 0; H < r; H++) {
                const fe = (g * r + H) * 4, A = i[fe], _e = i[fe + 1], be = i[fe + 2], ne = p[A], Ee = p[_e], me = p[be];
                let xe = ne, ge = Ee, ye = me;
                if (T !== 1) {
                  const _ = ne * 77 + Ee * 150 + me * 29 >> 8;
                  xe = Math.max(0, Math.min(255, Math.floor(R[ne] + w[_]))), ge = Math.max(0, Math.min(255, Math.floor(R[Ee] + w[_]))), ye = Math.max(0, Math.min(255, Math.floor(R[me] + w[_])));
                }
                const de = xe * 77 + ge * 150 + ye * 29 >> 8, Ce = de * b >> 8, ve = h[Ce] || h[b - 1];
                if (ve === " ")
                  continue;
                let ee = "#FFFFFF";
                if (O === "rgb")
                  ee = Y(xe, ge, ye);
                else if (O === "green") {
                  const _ = Math.max(0, Math.min(255, 50 + (de * 205 >> 8)));
                  ee = Y(0, _, 30);
                } else if (O === "amber") {
                  const _ = Math.max(0, Math.min(255, de));
                  ee = Y(_, Math.max(0, Math.min(255, _ * 166 >> 8)), 0);
                } else if (O === "mono") {
                  const _ = Math.max(0, Math.min(255, de));
                  ee = Y(_, _, _);
                } else if (O === "cyberpunk") {
                  const _ = de / 255 * 0.6 + g / e * 0.4, Te = Math.max(0, Math.min(255, Math.floor(0 * (1 - _) + 255 * _))), Re = Math.max(0, Math.min(255, Math.floor(240 * (1 - _) + 10 * _))), q = Math.max(0, Math.min(255, Math.floor(255 * (1 - _) + 160 * _)));
                  ee = Y(Te, Re, q);
                }
                ee !== L && (s.fillStyle = ee, L = ee), s.fillText(ve, H * z + z / 2, $);
              }
            }
          }
        }
        te && te();
      }
    }, t = requestAnimationFrame(() => {
      x();
    });
    return () => cancelAnimationFrame(t);
  }, [a, d, re]), /* @__PURE__ */ f(
    "canvas",
    {
      id: "ascii-image-display-canvas",
      ref: I,
      className: `absolute inset-0 w-full h-full pointer-events-none select-none bg-transparent ${m}`
    }
  );
}, et = We(({
  fontSize: a = 7,
  colorMode: d = "rgb",
  densityPreset: m = "standard",
  customDensity: he = "",
  brightness: te = 1.15,
  contrast: re = 1.1,
  saturation: I = 1.25,
  pdhThreshold: B = 18,
  className: k = "",
  imageClassName: X = "",
  canvasClassName: D = "",
  asciiOpacity: G = 1,
  imageOpacity: ce = 0,
  hoverFontSize: j = 2,
  hoverSaturation: K = 1,
  src: oe,
  alt: W = "",
  crossOrigin: M = "anonymous",
  style: J,
  onLoad: V,
  ...ie
}, le) => {
  const Q = l(null), S = l(null);
  Ve(le, () => Q.current);
  const [Z, F] = ue(!1), [x, t] = ue(16 / 9), [y, c] = ue(!1), [N, z] = ue(!1), [P, h] = ue(0), s = {
    fontSize: Z ? j : a,
    colorMode: d,
    densityPreset: m,
    customDensity: he,
    brightness: te,
    contrast: re,
    saturation: Z ? K : I,
    enableDeltaRendering: !1,
    pdhThreshold: B,
    asciiOpacity: G,
    videoOpacity: ce
  }, u = (v) => {
    const o = v.currentTarget;
    o.naturalWidth && o.naturalHeight && t(o.naturalWidth / o.naturalHeight), c(!0), h((i) => i + 1), V && V(v);
  }, U = () => {
    z(!0);
  };
  return ae(() => {
    const v = Q.current;
    v && v.complete && v.naturalWidth > 0 && (t(v.naturalWidth / v.naturalHeight), c(!0), h((o) => o + 1));
  }, []), /* @__PURE__ */ se(
    "div",
    {
      ref: S,
      onMouseEnter: () => F(!0),
      onMouseLeave: () => F(!1),
      className: `relative rounded-xl overflow-hidden bg-[#050505] border border-white/10 group select-none transition-all duration-300 flex items-center justify-center ${k}`,
      style: {
        aspectRatio: `${x}`,
        width: "100%",
        ...J
      },
      children: [
        /* @__PURE__ */ f(
          "img",
          {
            ref: Q,
            src: oe,
            alt: W,
            crossOrigin: M,
            onLoad: u,
            style: { opacity: N ? ce : 0 },
            className: `absolute inset-0 w-full h-full object-cover select-none bg-black transition-opacity duration-300 pointer-events-none ${X}`,
            ...ie
          }
        ),
        y && /* @__PURE__ */ f(
          "div",
          {
            className: `absolute inset-0 w-full h-full pointer-events-none select-none transition-opacity duration-300 ${D}`,
            style: { opacity: N ? G : 0 },
            children: /* @__PURE__ */ f(
              Ze,
              {
                imageElement: Q.current,
                settings: s,
                triggerRender: P,
                onFirstRender: U
              }
            )
          }
        )
      ]
    }
  );
});
et.displayName = "CodeImage";
export {
  et as CodeImage,
  Qe as CodeVideo
};
//# sourceMappingURL=index.es.js.map
