import { jsx as f, jsxs as le, Fragment as Ye } from "react/jsx-runtime";
import { useRef as l, useEffect as ae, forwardRef as We, useImperativeHandle as Ve, useState as se } from "react";
const $e = ({
  videoElement: c,
  videoSrc: d,
  settings: _,
  className: he = "",
  onDimensionsUpdate: Z
}) => {
  const ee = l(null), I = l(null), k = l(null), G = l(null), X = l(null), S = l(null), W = l(null), ce = l(-1), j = l(null), K = l({}), te = l(-1), V = l(null), M = l(0), J = l(!1), q = l(!1), re = l(d), ie = l(null), ue = l(!0), A = l(8), oe = l(6), D = l(null), m = l(null), t = l(null), E = l(/* @__PURE__ */ new Map()), i = l(new Uint8Array(256)), N = l(new Float32Array(256)), B = l(new Float32Array(256)), P = () => {
    if (_.customDensity)
      return _.customDensity.split("");
    switch (_.densityPreset) {
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
  }, x = (r, e) => (D.current ? (D.current.width !== r || D.current.height !== e) && (D.current.width = r, D.current.height = e) : (D.current = document.createElement("canvas"), D.current.width = r, D.current.height = e, m.current = D.current.getContext("2d", {
    willReadFrequently: !1
  })), {
    canvas: D.current,
    ctx: m.current
  });
  return ae(() => {
    const r = ee.current;
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
    } catch (T) {
      console.warn("WebGL initialization failed, falling back to 2D Canvas.", T);
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
    `, U = (T, y) => {
      const L = e.createShader(y);
      return L ? (e.shaderSource(L, T), e.compileShader(L), e.getShaderParameter(L, e.COMPILE_STATUS) ? L : (console.error("Shader compilation error:", e.getShaderInfoLog(L)), e.deleteShader(L), null)) : null;
    }, R = U(s, e.VERTEX_SHADER), o = U(u, e.FRAGMENT_SHADER);
    if (!R || !o) return;
    const a = e.createProgram();
    if (!a) return;
    if (e.attachShader(a, R), e.attachShader(a, o), e.linkProgram(a), !e.getProgramParameter(a, e.LINK_STATUS)) {
      console.error("Shader program linking error:", e.getProgramInfoLog(a));
      return;
    }
    k.current = a, K.current = {
      u_video_texture: e.getUniformLocation(a, "u_video_texture"),
      u_prev_video_texture: e.getUniformLocation(a, "u_prev_video_texture"),
      u_atlas_texture: e.getUniformLocation(a, "u_atlas_texture"),
      u_cols: e.getUniformLocation(a, "u_cols"),
      u_rows: e.getUniformLocation(a, "u_rows"),
      u_char_count: e.getUniformLocation(a, "u_char_count"),
      u_brightness: e.getUniformLocation(a, "u_brightness"),
      u_contrast: e.getUniformLocation(a, "u_contrast"),
      u_saturation: e.getUniformLocation(a, "u_saturation"),
      u_color_mode: e.getUniformLocation(a, "u_color_mode"),
      u_use_sequence: e.getUniformLocation(a, "u_use_sequence"),
      u_transition_progress: e.getUniformLocation(a, "u_transition_progress"),
      u_has_prev_texture: e.getUniformLocation(a, "u_has_prev_texture")
    }, te.current = e.getAttribLocation(a, "a_position");
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
    ), G.current = n;
    const w = e.createTexture();
    e.bindTexture(e.TEXTURE_2D, w), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.NEAREST), X.current = w;
    const v = e.createTexture();
    e.bindTexture(e.TEXTURE_2D, v), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.NEAREST), S.current = v;
    const p = e.createTexture();
    return e.bindTexture(e.TEXTURE_2D, p), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.NEAREST), V.current = p, () => {
      const T = I.current;
      T && (G.current && T.deleteBuffer(G.current), X.current && T.deleteTexture(X.current), S.current && T.deleteTexture(S.current), V.current && T.deleteTexture(V.current), k.current && T.deleteProgram(k.current)), I.current = null, t.current = null;
    };
  }, []), ae(() => {
    ie.current = null, ue.current = !0;
    const r = I.current, e = ee.current;
    if (!e) return;
    const s = _.fontSize * 0.6, u = _.fontSize, U = P();
    if (r && S.current) {
      const a = U.length, n = 48, w = Math.ceil(n * 0.6), v = document.createElement("canvas");
      v.width = a * w, v.height = n;
      const p = v.getContext("2d");
      if (p) {
        p.clearRect(0, 0, v.width, v.height), p.fillStyle = "#FFFFFF", p.textAlign = "center", p.textBaseline = "middle", p.font = `bold ${n}px "Fira Code", "Courier New", Courier, monospace`;
        for (let T = 0; T < a; T++) {
          const y = U[T], L = T * w + w / 2, b = n / 2;
          p.fillText(y, L, b);
        }
        r.activeTexture(r.TEXTURE1), r.bindTexture(r.TEXTURE_2D, S.current), r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL, 0), r.texImage2D(r.TEXTURE_2D, 0, r.RGBA, r.RGBA, r.UNSIGNED_BYTE, v), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_MIN_FILTER, r.LINEAR), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_MAG_FILTER, r.LINEAR);
      }
    }
    t.current && E.current.clear();
    const R = () => {
      const a = e.getBoundingClientRect(), n = Math.min(1.5, window.devicePixelRatio || 1), w = Math.floor(a.width) || (c == null ? void 0 : c.videoWidth) || 640, v = Math.floor(a.height) || (c == null ? void 0 : c.videoHeight) || 360;
      e.width = w * n, e.height = v * n, A.current = Math.max(8, Math.floor(e.width / s)), oe.current = Math.max(6, Math.floor(e.height / u)), r && r.viewport(0, 0, e.width, e.height), Z && Z(w, v);
    };
    R();
    const o = new ResizeObserver(() => {
      R();
    });
    return o.observe(e), W.current = o, () => {
      o.disconnect();
    };
  }, [c, _]), ae(() => {
    if (d !== re.current) {
      const r = I.current;
      if (r && V.current && c && c.readyState >= 2)
        try {
          r.activeTexture(r.TEXTURE2), r.bindTexture(r.TEXTURE_2D, V.current), r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL, 1), r.texImage2D(r.TEXTURE_2D, 0, r.RGBA, r.RGBA, r.UNSIGNED_BYTE, c), q.current = !0, J.current = !1;
        } catch (e) {
          console.warn("Failed to capture old video frame for transition:", e);
        }
      re.current = d;
    }
  }, [d, c]), ae(() => {
    if (!c) return;
    let r = !0, e = null;
    const s = (o, a, n) => {
      const w = Math.min(255, o >> 4 << 4), v = Math.min(255, a >> 4 << 4), p = Math.min(255, n >> 4 << 4), T = w >> 4 << 8 | v >> 4 << 4 | p >> 4;
      let y = E.current.get(T);
      return y || (y = `rgb(${w},${v},${p})`, E.current.set(T, y)), y;
    }, u = () => {
      if (!r) return;
      const o = ee.current;
      if (!o) return;
      const a = c.currentTime;
      if (a === ce.current && !c.paused && !J.current && !q.current)
        return;
      ce.current = a;
      const n = I.current, w = k.current, v = _.fontSize * 0.6, p = _.fontSize, T = P(), y = A.current, L = oe.current;
      if (n && w && X.current && G.current) {
        n.viewport(0, 0, o.width, o.height), n.clearColor(0, 0, 0, 0), n.clear(n.COLOR_BUFFER_BIT), n.useProgram(w), c.readyState >= 2 && (n.activeTexture(n.TEXTURE0), n.bindTexture(n.TEXTURE_2D, X.current), n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL, 1), n.texImage2D(n.TEXTURE_2D, 0, n.RGBA, n.RGBA, n.UNSIGNED_BYTE, c));
        let b = 1, z = 0;
        if (q.current)
          c.readyState >= 2 ? (q.current = !1, J.current = !0, M.current = performance.now(), b = 0, z = 1) : (b = 0, z = 1);
        else if (J.current) {
          const H = performance.now() - M.current;
          b = Math.min(1, H / 800), z = 1, b >= 1 && (J.current = !1, z = 0);
        }
        z === 1 && V.current && (n.activeTexture(n.TEXTURE2), n.bindTexture(n.TEXTURE_2D, V.current)), n.activeTexture(n.TEXTURE1), n.bindTexture(n.TEXTURE_2D, S.current);
        let Y = 0;
        _.colorMode === "green" ? Y = 1 : _.colorMode === "amber" ? Y = 2 : _.colorMode === "mono" ? Y = 3 : _.colorMode === "cyberpunk" && (Y = 4);
        const g = K.current;
        n.uniform1i(g.u_video_texture || null, 0), n.uniform1i(g.u_prev_video_texture || null, 2), n.uniform1i(g.u_atlas_texture || null, 1), n.uniform1f(g.u_cols || null, y), n.uniform1f(g.u_rows || null, L), n.uniform1f(g.u_char_count || null, T.length), n.uniform1f(g.u_brightness || null, _.brightness), n.uniform1f(g.u_contrast || null, _.contrast), n.uniform1f(g.u_saturation || null, _.saturation), n.uniform1i(g.u_color_mode || null, Y), n.uniform1i(g.u_use_sequence || null, _.customDensity ? 1 : 0), n.uniform1f(g.u_transition_progress || null, b), n.uniform1i(g.u_has_prev_texture || null, z);
        const $ = te.current;
        $ !== -1 && (n.enableVertexAttribArray($), n.bindBuffer(n.ARRAY_BUFFER, G.current), n.vertexAttribPointer($, 2, n.FLOAT, !1, 0, 0)), n.drawArrays(n.TRIANGLES, 0, 6);
      } else {
        const b = t.current;
        if (b) {
          const z = o.width, Y = o.height, { ctx: g } = x(y, L);
          if (g) {
            g.drawImage(c, 0, 0, y, L);
            const H = g.getImageData(0, 0, y, L).data, fe = y * L * 4, F = ie.current, _e = !F || F.length !== fe || ue.current || !_.enableDeltaRendering;
            _e && (b.fillStyle = "#010101", b.fillRect(0, 0, z, Y), _.enableDeltaRendering && (ie.current = new Uint8Array(H)), ue.current = !1);
            const be = _.brightness, ne = _.contrast, Ee = _.saturation, me = i.current, xe = N.current, ge = B.current;
            for (let h = 0; h < 256; h++) {
              let Te = h;
              be !== 1 && (Te *= be), ne !== 1 && (Te = (Te - 128) * ne + 128), me[h] = Math.max(0, Math.min(255, Math.floor(Te))), xe[h] = h * Ee, ge[h] = h * (1 - Ee);
            }
            let ye = `bold ${_.fontSize}px "JetBrains Mono", "Fira Code", Courier, monospace`;
            b.font = ye, b.textAlign = "center", b.textBaseline = "middle";
            let de = "";
            const Ce = T.length, ve = _.colorMode, Q = !!_.customDensity;
            for (let h = 0; h < L; h++) {
              const Te = h * p + p / 2;
              for (let Re = 0; Re < y; Re++) {
                const O = (h * y + Re) * 4, Me = H[O], Ue = H[O + 1], Le = H[O + 2];
                if (!_e && _.enableDeltaRendering && F) {
                  const C = F[O], Xe = F[O + 1], Ne = F[O + 2];
                  if (Math.abs(Me - C) + Math.abs(Ue - Xe) + Math.abs(Le - Ne) < _.pdhThreshold)
                    continue;
                }
                _e || (b.fillStyle = "#010101", b.fillRect(Re * v - 0.2, h * p - 0.2, v + 0.4, p + 0.4), de = "#010101");
                const Ae = me[Me], Fe = me[Ue], De = me[Le];
                let Se = Ae, Pe = Fe, Ie = De;
                if (Ee !== 1) {
                  const C = Ae * 77 + Fe * 150 + De * 29 >> 8;
                  Se = Math.max(0, Math.min(255, Math.floor(xe[Ae] + ge[C]))), Pe = Math.max(0, Math.min(255, Math.floor(xe[Fe] + ge[C]))), Ie = Math.max(0, Math.min(255, Math.floor(xe[De] + ge[C])));
                }
                const we = Se * 77 + Pe * 150 + Ie * 29 >> 8, ze = Q ? (h * y + Re) % Ce : we * Ce >> 8, Be = T[ze] || T[Ce - 1];
                if (Be === " ") {
                  _.enableDeltaRendering && F && (F[O] = Me, F[O + 1] = Ue, F[O + 2] = Le);
                  continue;
                }
                Q ? b.globalAlpha = we / 255 : b.globalAlpha = 1;
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
                  const C = we / 255 * 0.6 + h / L * 0.4, Xe = Math.max(0, Math.min(255, Math.floor(0 * (1 - C) + 255 * C))), Ne = Math.max(0, Math.min(255, Math.floor(240 * (1 - C) + 10 * C))), ke = Math.max(0, Math.min(255, Math.floor(255 * (1 - C) + 160 * C)));
                  pe = s(Xe, Ne, ke);
                }
                pe !== de && (b.fillStyle = pe, de = pe);
                const Oe = Re * v + v / 2, qe = Te;
                b.fillText(Be, Oe, qe), _.enableDeltaRendering && F && (F[O] = Me, F[O + 1] = Ue, F[O + 2] = Le);
              }
            }
            Q && (b.globalAlpha = 1);
          }
        }
      }
    };
    (() => {
      if ("requestVideoFrameCallback" in c) {
        const o = () => {
          u(), r && (e = c.requestVideoFrameCallback(o));
        };
        e = c.requestVideoFrameCallback(o);
      } else {
        const o = () => {
          u(), r && (j.current = requestAnimationFrame(o));
        };
        j.current = requestAnimationFrame(o);
      }
    })(), u();
    const R = () => {
      u();
    };
    return c.addEventListener("seeked", R), () => {
      r = !1, c.removeEventListener("seeked", R), e !== null && "cancelVideoFrameCallback" in c && c.cancelVideoFrameCallback(e), j.current !== null && cancelAnimationFrame(j.current);
    };
  }, [c, _]), /* @__PURE__ */ f(
    "canvas",
    {
      id: "ascii-display-canvas",
      ref: ee,
      className: `absolute inset-0 w-full h-full pointer-events-none select-none bg-transparent ${he}`
    }
  );
}, Ge = ({ className: c = "w-4 h-4", fill: d = "none" }) => /* @__PURE__ */ f("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: d, stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: c, children: /* @__PURE__ */ f("polygon", { points: "6 3 20 12 6 21 6 3" }) }), He = ({ className: c = "w-4 h-4", fill: d = "none" }) => /* @__PURE__ */ le("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: d, stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: c, children: [
  /* @__PURE__ */ f("rect", { x: "14", y: "4", width: "4", height: "16", rx: "1" }),
  /* @__PURE__ */ f("rect", { x: "6", y: "4", width: "4", height: "16", rx: "1" })
] }), je = ({ className: c = "w-4 h-4" }) => /* @__PURE__ */ le("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: c, children: [
  /* @__PURE__ */ f("polygon", { points: "11 5 6 9 2 9 2 15 6 15 11 19 11 5" }),
  /* @__PURE__ */ f("path", { d: "M15.54 8.46a5 5 0 0 1 0 7.07" }),
  /* @__PURE__ */ f("path", { d: "M19.07 4.93a10 10 0 0 1 0 14.14" })
] }), Ke = ({ className: c = "w-4 h-4" }) => /* @__PURE__ */ le("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: c, children: [
  /* @__PURE__ */ f("polygon", { points: "11 5 6 9 2 9 2 15 6 15 11 19 11 5" }),
  /* @__PURE__ */ f("line", { x1: "22", y1: "9", x2: "16", y2: "15" }),
  /* @__PURE__ */ f("line", { x1: "16", y1: "9", x2: "22", y2: "15" })
] }), Je = ({ className: c = "w-4 h-4" }) => /* @__PURE__ */ le("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: c, children: [
  /* @__PURE__ */ f("polyline", { points: "15 3 21 3 21 9" }),
  /* @__PURE__ */ f("polyline", { points: "9 21 3 21 3 15" }),
  /* @__PURE__ */ f("line", { x1: "21", y1: "3", x2: "14", y2: "10" }),
  /* @__PURE__ */ f("line", { x1: "3", y1: "21", x2: "10", y2: "14" })
] }), Qe = We(({
  fontSize: c = 7,
  colorMode: d = "rgb",
  densityPreset: _ = "standard",
  customDensity: he = "",
  brightness: Z = 1.15,
  contrast: ee = 1.1,
  saturation: I = 1.25,
  pdhThreshold: k = 18,
  className: G = "",
  videoClassName: X = "",
  canvasClassName: S = "",
  asciiOpacity: W = 1,
  videoOpacity: ce = 0,
  customControls: j = !1,
  src: K,
  autoPlay: te,
  loop: V,
  muted: M,
  playsInline: J = !0,
  crossOrigin: q = "anonymous",
  style: re,
  ...ie
}, ue) => {
  const A = l(null), oe = l(null);
  Ve(ue, () => A.current);
  const D = {
    fontSize: c,
    colorMode: d,
    densityPreset: _,
    customDensity: he,
    brightness: Z,
    contrast: ee,
    saturation: I,
    enableDeltaRendering: !0,
    pdhThreshold: k,
    asciiOpacity: W,
    videoOpacity: ce
  }, [m, t] = se(!1), [E, i] = se(!!M), [N, B] = se(0), [P, x] = se(16 / 9), [r, e] = se(!1);
  ae(() => {
    const o = A.current;
    if (!o) return;
    const a = () => t(!0), n = () => t(!1), w = () => i(o.muted), v = () => {
      o.duration && B(o.currentTime / o.duration * 100);
    }, p = () => {
      o.videoWidth && o.videoHeight && x(o.videoWidth / o.videoHeight);
    };
    return o.addEventListener("play", a), o.addEventListener("pause", n), o.addEventListener("volumechange", w), o.addEventListener("timeupdate", v), o.addEventListener("loadedmetadata", p), t(!o.paused), i(o.muted), () => {
      o.removeEventListener("play", a), o.removeEventListener("pause", n), o.removeEventListener("volumechange", w), o.removeEventListener("timeupdate", v), o.removeEventListener("loadedmetadata", p);
    };
  }, []), ae(() => {
    const o = A.current;
    o && K && (o.src = K, o.load(), te && o.play().catch(() => {
    }));
  }, [K, te]), ae(() => {
    const o = A.current;
    o && (o.muted = !!M, i(!!M));
  }, [M]);
  const s = () => {
    const o = A.current;
    o && (o.paused ? o.play().catch(() => {
    }) : o.pause());
  }, u = (o) => {
    o.stopPropagation();
    const a = A.current;
    a && (a.muted = !a.muted, i(a.muted));
  }, U = (o) => {
    o.stopPropagation();
    const a = A.current;
    if (!a || !a.duration) return;
    const n = o.currentTarget.getBoundingClientRect(), v = (o.clientX - n.left) / n.width;
    a.currentTime = v * a.duration;
  }, R = (o) => {
    o.stopPropagation(), oe.current && (document.fullscreenElement ? document.exitFullscreen().catch(() => {
    }) : oe.current.requestFullscreen().catch(() => {
    }));
  };
  return /* @__PURE__ */ le(
    "div",
    {
      ref: oe,
      onMouseEnter: () => e(!0),
      onMouseLeave: () => e(!1),
      className: `relative rounded-xl overflow-hidden bg-[#050505] border border-white/10 group select-none transition-all duration-300 flex items-center justify-center ${G}`,
      style: {
        aspectRatio: `${P}`,
        width: "100%",
        ...re
      },
      children: [
        /* @__PURE__ */ f(
          "video",
          {
            ref: A,
            crossOrigin: q,
            playsInline: J,
            loop: V,
            autoPlay: te,
            muted: E,
            style: { opacity: ce },
            className: `absolute inset-0 w-full h-full object-cover select-none bg-black transition-opacity duration-300 pointer-events-none ${X}`,
            ...ie
          }
        ),
        /* @__PURE__ */ f(
          "div",
          {
            className: `absolute inset-0 w-full h-full pointer-events-none select-none transition-opacity duration-300 ${S}`,
            style: { opacity: W },
            children: /* @__PURE__ */ f(
              $e,
              {
                videoElement: A.current,
                videoSrc: K,
                settings: D
              }
            )
          }
        ),
        j ? /* @__PURE__ */ le(Ye, { children: [
          /* @__PURE__ */ f(
            "div",
            {
              onClick: s,
              className: "absolute inset-0 z-10 cursor-pointer flex items-center justify-center bg-black/0 active:bg-black/10 transition-colors"
            }
          ),
          !m && /* @__PURE__ */ f(
            "div",
            {
              onClick: s,
              className: "absolute z-20 w-14 h-14 rounded-full border border-white/25 flex items-center justify-center backdrop-blur-md shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer",
              style: { backgroundColor: "rgba(18,18,18,0.9)", color: "#00FF94" },
              children: /* @__PURE__ */ f(Ge, { className: "w-5 h-5 stroke-none translate-x-[2px]", fill: "currentColor" })
            }
          ),
          /* @__PURE__ */ le(
            "div",
            {
              className: `absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex flex-col gap-3 transition-opacity duration-300 z-20 ${r || !m ? "opacity-100" : "opacity-0 pointer-events-none"}`,
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
                /* @__PURE__ */ le("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ le("div", { className: "flex items-center gap-3", children: [
                    /* @__PURE__ */ f(
                      "button",
                      {
                        type: "button",
                        onClick: s,
                        className: "p-1.5 rounded-md hover:bg-white/10 text-white transition-colors",
                        children: m ? /* @__PURE__ */ f(He, { className: "w-4 h-4 fill-white", fill: "currentColor" }) : /* @__PURE__ */ f(Ge, { className: "w-4 h-4 stroke-none", fill: "#00FF94" })
                      }
                    ),
                    /* @__PURE__ */ f(
                      "button",
                      {
                        type: "button",
                        onClick: u,
                        className: "p-1.5 rounded-md hover:bg-white/10 text-white transition-colors",
                        children: E ? /* @__PURE__ */ f(Ke, { className: "w-4 h-4" }) : /* @__PURE__ */ f(je, { className: "w-4 h-4" })
                      }
                    )
                  ] }),
                  /* @__PURE__ */ f("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ f(
                    "button",
                    {
                      type: "button",
                      onClick: R,
                      className: "p-1.5 rounded-md hover:bg-white/10 text-white transition-colors",
                      children: /* @__PURE__ */ f(Je, { className: "w-4 h-4" })
                    }
                  ) })
                ] })
              ]
            }
          )
        ] }) : !j && ie.controls && /* @__PURE__ */ f("div", { className: "absolute bottom-2 right-2 z-20 bg-black/60 px-2 py-1 rounded border border-white/10 text-[9px] font-mono text-white/60", children: "*Use customControls prop for styled overlay controls" })
      ]
    }
  );
});
Qe.displayName = "CodeVideo";
const Ze = ({
  imageElement: c,
  settings: d,
  className: _ = "",
  onDimensionsUpdate: he,
  onFirstRender: Z,
  triggerRender: ee = 0
}) => {
  const I = l(null), k = l(null), G = l(null), X = l(null), S = l(null), W = l(null), ce = l(null), j = l({}), K = l(-1), te = l(8), V = l(6), M = l(null), J = l(null), q = l(null), re = l(/* @__PURE__ */ new Map()), ie = l(new Uint8Array(256)), ue = l(new Float32Array(256)), A = l(new Float32Array(256)), oe = () => {
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
  }, D = (m, t) => (M.current ? (M.current.width !== m || M.current.height !== t) && (M.current.width = m, M.current.height = t) : (M.current = document.createElement("canvas"), M.current.width = m, M.current.height = t, J.current = M.current.getContext("2d", {
    willReadFrequently: !1
  })), {
    canvas: M.current,
    ctx: J.current
  });
  return ae(() => {
    const m = I.current;
    if (!m) return;
    let t = null;
    try {
      t = m.getContext("webgl", {
        alpha: !1,
        depth: !1,
        antialias: !1,
        preserveDrawingBuffer: !0
      }) || m.getContext("experimental-webgl", {
        alpha: !1,
        depth: !1,
        antialias: !1,
        preserveDrawingBuffer: !0
      });
    } catch (u) {
      console.warn("WebGL initialization failed, falling back to 2D Canvas.", u);
    }
    if (!t) {
      q.current = m.getContext("2d");
      return;
    }
    k.current = t;
    const E = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;

      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `, i = `
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
      const R = t.createShader(U);
      return R ? (t.shaderSource(R, u), t.compileShader(R), t.getShaderParameter(R, t.COMPILE_STATUS) ? R : (console.error("Shader compilation error:", t.getShaderInfoLog(R)), t.deleteShader(R), null)) : null;
    }, B = N(E, t.VERTEX_SHADER), P = N(i, t.FRAGMENT_SHADER);
    if (!B || !P) return;
    const x = t.createProgram();
    if (!x) return;
    if (t.attachShader(x, B), t.attachShader(x, P), t.linkProgram(x), !t.getProgramParameter(x, t.LINK_STATUS)) {
      console.error("Shader program linking error:", t.getProgramInfoLog(x));
      return;
    }
    G.current = x, j.current = {
      u_video_texture: t.getUniformLocation(x, "u_video_texture"),
      u_atlas_texture: t.getUniformLocation(x, "u_atlas_texture"),
      u_cols: t.getUniformLocation(x, "u_cols"),
      u_rows: t.getUniformLocation(x, "u_rows"),
      u_char_count: t.getUniformLocation(x, "u_char_count"),
      u_brightness: t.getUniformLocation(x, "u_brightness"),
      u_contrast: t.getUniformLocation(x, "u_contrast"),
      u_saturation: t.getUniformLocation(x, "u_saturation"),
      u_color_mode: t.getUniformLocation(x, "u_color_mode"),
      u_use_sequence: t.getUniformLocation(x, "u_use_sequence")
    }, K.current = t.getAttribLocation(x, "a_position");
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
    t.bindTexture(t.TEXTURE_2D, e), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_S, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_T, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.NEAREST), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, t.NEAREST), S.current = e;
    const s = t.createTexture();
    return t.bindTexture(t.TEXTURE_2D, s), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_S, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_T, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.NEAREST), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, t.NEAREST), W.current = s, () => {
      const u = k.current;
      u && (X.current && u.deleteBuffer(X.current), S.current && u.deleteTexture(S.current), W.current && u.deleteTexture(W.current), G.current && u.deleteProgram(G.current)), k.current = null, q.current = null;
    };
  }, []), ae(() => {
    const m = k.current, t = I.current;
    if (!t) return;
    const E = d.fontSize * 0.6, i = d.fontSize, N = oe();
    if (m && W.current) {
      const x = N.length, r = document.createElement("canvas");
      r.width = Math.ceil(x * E), r.height = Math.ceil(i);
      const e = r.getContext("2d");
      if (e) {
        e.clearRect(0, 0, r.width, r.height), e.fillStyle = "#FFFFFF", e.font = `bold ${d.fontSize}px "JetBrains Mono", "Fira Code", Courier, monospace`, e.textAlign = "center", e.textBaseline = "middle";
        for (let s = 0; s < x; s++) {
          const u = N[s], U = s * E + E / 2, R = i / 2;
          e.fillText(u, U, R);
        }
        m.activeTexture(m.TEXTURE1), m.bindTexture(m.TEXTURE_2D, W.current), m.pixelStorei(m.UNPACK_FLIP_Y_WEBGL, 0), m.texImage2D(m.TEXTURE_2D, 0, m.RGBA, m.RGBA, m.UNSIGNED_BYTE, r);
      }
    }
    q.current && re.current.clear();
    const B = () => {
      const x = t.getBoundingClientRect(), r = Math.min(1.5, window.devicePixelRatio || 1), e = Math.floor(x.width) || (c == null ? void 0 : c.naturalWidth) || 640, s = Math.floor(x.height) || (c == null ? void 0 : c.naturalHeight) || 360;
      t.width = e * r, t.height = s * r, te.current = Math.max(8, Math.floor(t.width / E)), V.current = Math.max(6, Math.floor(t.height / i)), m && m.viewport(0, 0, t.width, t.height), he && he(e, s);
    };
    B();
    const P = new ResizeObserver(() => {
      B();
    });
    return P.observe(t), ce.current = P, () => {
      P.disconnect();
    };
  }, [c, d, ee]), ae(() => {
    if (!c || !c.complete || c.naturalHeight === 0) return;
    const m = () => {
      const E = I.current;
      if (!E) return;
      const i = k.current, N = G.current, B = d.fontSize * 0.6, P = d.fontSize, x = oe(), r = te.current, e = V.current;
      if (i && N && S.current && X.current) {
        i.viewport(0, 0, E.width, E.height), i.clearColor(0.0196, 0.0196, 0.0196, 1), i.clear(i.COLOR_BUFFER_BIT), i.useProgram(N), i.activeTexture(i.TEXTURE0), i.bindTexture(i.TEXTURE_2D, S.current), i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, 1), i.texImage2D(i.TEXTURE_2D, 0, i.RGBA, i.RGBA, i.UNSIGNED_BYTE, c), i.activeTexture(i.TEXTURE1), i.bindTexture(i.TEXTURE_2D, W.current);
        let s = 0;
        d.colorMode === "green" ? s = 1 : d.colorMode === "amber" ? s = 2 : d.colorMode === "mono" ? s = 3 : d.colorMode === "cyberpunk" && (s = 4);
        const u = j.current;
        i.uniform1i(u.u_video_texture || null, 0), i.uniform1i(u.u_atlas_texture || null, 1), i.uniform1f(u.u_cols || null, r), i.uniform1f(u.u_rows || null, e), i.uniform1f(u.u_char_count || null, x.length), i.uniform1f(u.u_brightness || null, d.brightness), i.uniform1f(u.u_contrast || null, d.contrast), i.uniform1f(u.u_saturation || null, d.saturation), i.uniform1i(u.u_color_mode || null, s), i.uniform1i(u.u_use_sequence || null, d.customDensity ? 1 : 0);
        const U = K.current;
        U !== -1 && (i.enableVertexAttribArray(U), i.bindBuffer(i.ARRAY_BUFFER, X.current), i.vertexAttribPointer(U, 2, i.FLOAT, !1, 0, 0)), i.drawArrays(i.TRIANGLES, 0, 6), Z && Z();
      } else {
        const s = q.current;
        if (s) {
          const u = E.width, U = E.height, { ctx: R } = D(r, e);
          if (R) {
            R.drawImage(c, 0, 0, r, e);
            const a = R.getImageData(0, 0, r, e).data;
            s.fillStyle = "#010101", s.fillRect(0, 0, u, U);
            const n = d.brightness, w = d.contrast, v = d.saturation, p = ie.current, T = ue.current, y = A.current;
            for (let g = 0; g < 256; g++) {
              let $ = g;
              n !== 1 && ($ *= n), w !== 1 && ($ = ($ - 128) * w + 128), p[g] = Math.max(0, Math.min(255, Math.floor($))), T[g] = g * v, y[g] = g * (1 - v);
            }
            s.font = `bold ${d.fontSize}px "JetBrains Mono", "Fira Code", Courier, monospace`, s.textAlign = "center", s.textBaseline = "middle";
            let L = "";
            const b = x.length, z = d.colorMode, Y = (g, $, H) => {
              const fe = Math.min(255, g >> 4 << 4), F = Math.min(255, $ >> 4 << 4), _e = Math.min(255, H >> 4 << 4), be = fe >> 4 << 8 | F >> 4 << 4 | _e >> 4;
              let ne = re.current.get(be);
              return ne || (ne = `rgb(${fe},${F},${_e})`, re.current.set(be, ne)), ne;
            };
            for (let g = 0; g < e; g++) {
              const $ = g * P + P / 2;
              for (let H = 0; H < r; H++) {
                const fe = (g * r + H) * 4, F = a[fe], _e = a[fe + 1], be = a[fe + 2], ne = p[F], Ee = p[_e], me = p[be];
                let xe = ne, ge = Ee, ye = me;
                if (v !== 1) {
                  const h = ne * 77 + Ee * 150 + me * 29 >> 8;
                  xe = Math.max(0, Math.min(255, Math.floor(T[ne] + y[h]))), ge = Math.max(0, Math.min(255, Math.floor(T[Ee] + y[h]))), ye = Math.max(0, Math.min(255, Math.floor(T[me] + y[h])));
                }
                const de = xe * 77 + ge * 150 + ye * 29 >> 8, Ce = de * b >> 8, ve = x[Ce] || x[b - 1];
                if (ve === " ")
                  continue;
                let Q = "#FFFFFF";
                if (z === "rgb")
                  Q = Y(xe, ge, ye);
                else if (z === "green") {
                  const h = Math.max(0, Math.min(255, 50 + (de * 205 >> 8)));
                  Q = Y(0, h, 30);
                } else if (z === "amber") {
                  const h = Math.max(0, Math.min(255, de));
                  Q = Y(h, Math.max(0, Math.min(255, h * 166 >> 8)), 0);
                } else if (z === "mono") {
                  const h = Math.max(0, Math.min(255, de));
                  Q = Y(h, h, h);
                } else if (z === "cyberpunk") {
                  const h = de / 255 * 0.6 + g / e * 0.4, Te = Math.max(0, Math.min(255, Math.floor(0 * (1 - h) + 255 * h))), Re = Math.max(0, Math.min(255, Math.floor(240 * (1 - h) + 10 * h))), O = Math.max(0, Math.min(255, Math.floor(255 * (1 - h) + 160 * h)));
                  Q = Y(Te, Re, O);
                }
                Q !== L && (s.fillStyle = Q, L = Q), s.fillText(ve, H * B + B / 2, $);
              }
            }
          }
        }
        Z && Z();
      }
    }, t = requestAnimationFrame(() => {
      m();
    });
    return () => cancelAnimationFrame(t);
  }, [c, d, ee]), /* @__PURE__ */ f(
    "canvas",
    {
      id: "ascii-image-display-canvas",
      ref: I,
      className: `absolute inset-0 w-full h-full pointer-events-none select-none bg-transparent ${_}`
    }
  );
}, et = We(({
  fontSize: c = 7,
  colorMode: d = "rgb",
  densityPreset: _ = "standard",
  customDensity: he = "",
  brightness: Z = 1.15,
  contrast: ee = 1.1,
  saturation: I = 1.25,
  pdhThreshold: k = 18,
  className: G = "",
  imageClassName: X = "",
  canvasClassName: S = "",
  asciiOpacity: W = 1,
  imageOpacity: ce = 0,
  hoverFontSize: j = 2,
  hoverSaturation: K = 1,
  rounded: te = !1,
  src: V,
  alt: M = "",
  crossOrigin: J = "anonymous",
  style: q,
  onLoad: re,
  ...ie
}, ue) => {
  const A = l(null), oe = l(null);
  Ve(ue, () => A.current);
  const [D, m] = se(!1), [t, E] = se(16 / 9), [i, N] = se(!1), [B, P] = se(!1), [x, r] = se(0), u = {
    fontSize: D ? j : c,
    colorMode: d,
    densityPreset: _,
    customDensity: he,
    brightness: Z,
    contrast: ee,
    saturation: D ? K : I,
    enableDeltaRendering: !1,
    pdhThreshold: k,
    asciiOpacity: W,
    videoOpacity: ce
  }, U = (o) => {
    const a = o.currentTarget;
    a.naturalWidth && a.naturalHeight && E(a.naturalWidth / a.naturalHeight), N(!0), r((n) => n + 1), re && re(o);
  }, R = () => {
    P(!0);
  };
  return ae(() => {
    const o = A.current;
    o && o.complete && o.naturalWidth > 0 && (E(o.naturalWidth / o.naturalHeight), N(!0), r((a) => a + 1));
  }, []), /* @__PURE__ */ le(
    "div",
    {
      ref: oe,
      onMouseEnter: () => m(!0),
      onMouseLeave: () => m(!1),
      className: `relative overflow-hidden bg-[#050505] border border-white/10 group select-none transition-all duration-300 flex items-center justify-center ${te ? "rounded-xl" : ""} ${G}`,
      style: {
        aspectRatio: `${t}`,
        width: "100%",
        ...q
      },
      children: [
        /* @__PURE__ */ f(
          "img",
          {
            ref: A,
            src: V,
            alt: M,
            crossOrigin: J,
            onLoad: U,
            style: { opacity: B ? ce : 0 },
            className: `absolute inset-0 w-full h-full object-cover select-none bg-black transition-opacity duration-300 pointer-events-none ${X}`,
            ...ie
          }
        ),
        i && /* @__PURE__ */ f(
          "div",
          {
            className: `absolute inset-0 w-full h-full pointer-events-none select-none transition-opacity duration-300 ${S}`,
            style: { opacity: B ? W : 0 },
            children: /* @__PURE__ */ f(
              Ze,
              {
                imageElement: A.current,
                settings: u,
                triggerRender: x,
                onFirstRender: R
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
