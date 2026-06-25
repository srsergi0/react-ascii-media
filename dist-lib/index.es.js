import { jsx as f, jsxs as se, Fragment as Ye } from "react/jsx-runtime";
import { useRef as l, useEffect as ae, forwardRef as We, useImperativeHandle as Ve, useState as de } from "react";
const $e = ({
  videoElement: a,
  videoSrc: d,
  settings: _,
  className: he = "",
  onDimensionsUpdate: ee
}) => {
  const te = l(null), I = l(null), k = l(null), G = l(null), X = l(null), S = l(null), W = l(null), ce = l(-1), F = l(null), K = l({}), re = l(-1), V = l(null), U = l(0), J = l(!1), z = l(!1), ie = l(d), le = l(null), Q = l(!0), P = l(8), oe = l(6), D = l(null), m = l(null), t = l(null), w = l(/* @__PURE__ */ new Map()), c = l(new Uint8Array(256)), O = l(new Float32Array(256)), N = l(new Float32Array(256)), B = () => {
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
    const r = te.current;
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
    const u = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;

      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `, s = `
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
    `, b = (T, C) => {
      const L = e.createShader(C);
      return L ? (e.shaderSource(L, T), e.compileShader(L), e.getShaderParameter(L, e.COMPILE_STATUS) ? L : (console.error("Shader compilation error:", e.getShaderInfoLog(L)), e.deleteShader(L), null)) : null;
    }, R = b(u, e.VERTEX_SHADER), n = b(s, e.FRAGMENT_SHADER);
    if (!R || !n) return;
    const i = e.createProgram();
    if (!i) return;
    if (e.attachShader(i, R), e.attachShader(i, n), e.linkProgram(i), !e.getProgramParameter(i, e.LINK_STATUS)) {
      console.error("Shader program linking error:", e.getProgramInfoLog(i));
      return;
    }
    k.current = i, K.current = {
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
    }, re.current = e.getAttribLocation(i, "a_position");
    const o = e.createBuffer();
    e.bindBuffer(e.ARRAY_BUFFER, o), e.bufferData(
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
    ), G.current = o;
    const y = e.createTexture();
    e.bindTexture(e.TEXTURE_2D, y), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.NEAREST), X.current = y;
    const v = e.createTexture();
    e.bindTexture(e.TEXTURE_2D, v), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.NEAREST), S.current = v;
    const p = e.createTexture();
    return e.bindTexture(e.TEXTURE_2D, p), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.NEAREST), V.current = p, () => {
      const T = I.current;
      T && (G.current && T.deleteBuffer(G.current), X.current && T.deleteTexture(X.current), S.current && T.deleteTexture(S.current), V.current && T.deleteTexture(V.current), k.current && T.deleteProgram(k.current)), I.current = null, t.current = null;
    };
  }, []), ae(() => {
    le.current = null, Q.current = !0;
    const r = I.current, e = te.current;
    if (!e) return;
    const u = _.fontSize * 0.6, s = _.fontSize, b = B();
    if (r && S.current) {
      const i = b.length, o = 48, y = Math.ceil(o * 0.6), v = document.createElement("canvas");
      v.width = i * y, v.height = o;
      const p = v.getContext("2d");
      if (p) {
        p.clearRect(0, 0, v.width, v.height), p.fillStyle = "#FFFFFF", p.textAlign = "center", p.textBaseline = "middle", p.font = `bold ${o}px "Fira Code", "Courier New", Courier, monospace`;
        for (let T = 0; T < i; T++) {
          const C = b[T], L = T * y + y / 2, E = o / 2;
          p.fillText(C, L, E);
        }
        r.activeTexture(r.TEXTURE1), r.bindTexture(r.TEXTURE_2D, S.current), r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL, 0), r.texImage2D(r.TEXTURE_2D, 0, r.RGBA, r.RGBA, r.UNSIGNED_BYTE, v), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_MIN_FILTER, r.LINEAR), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_MAG_FILTER, r.LINEAR);
      }
    }
    t.current && w.current.clear();
    const R = () => {
      const i = e.getBoundingClientRect(), o = Math.min(1.5, window.devicePixelRatio || 1), y = Math.floor(i.width) || (a == null ? void 0 : a.videoWidth) || 640, v = Math.floor(i.height) || (a == null ? void 0 : a.videoHeight) || 360;
      e.width = y * o, e.height = v * o, P.current = Math.max(8, Math.floor(e.width / u)), oe.current = Math.max(6, Math.floor(e.height / s)), r && r.viewport(0, 0, e.width, e.height), ee && ee(y, v);
    };
    R();
    const n = new ResizeObserver(() => {
      R();
    });
    return n.observe(e), W.current = n, () => {
      n.disconnect();
    };
  }, [a, _]), ae(() => {
    if (d !== ie.current) {
      const r = I.current;
      if (r && V.current && a && a.readyState >= 2)
        try {
          r.activeTexture(r.TEXTURE2), r.bindTexture(r.TEXTURE_2D, V.current), r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL, 1), r.texImage2D(r.TEXTURE_2D, 0, r.RGBA, r.RGBA, r.UNSIGNED_BYTE, a), z.current = !0, J.current = !1;
        } catch (e) {
          console.warn("Failed to capture old video frame for transition:", e);
        }
      ie.current = d;
    }
  }, [d, a]), ae(() => {
    if (!a) return;
    let r = !0, e = null;
    const u = (n, i, o) => {
      const y = Math.min(255, n >> 4 << 4), v = Math.min(255, i >> 4 << 4), p = Math.min(255, o >> 4 << 4), T = y >> 4 << 8 | v >> 4 << 4 | p >> 4;
      let C = w.current.get(T);
      return C || (C = `rgb(${y},${v},${p})`, w.current.set(T, C)), C;
    }, s = () => {
      if (!r) return;
      const n = te.current;
      if (!n) return;
      const i = a.currentTime;
      if (i === ce.current && !a.paused && !J.current && !z.current)
        return;
      ce.current = i;
      const o = I.current, y = k.current, v = _.fontSize * 0.6, p = _.fontSize, T = B(), C = P.current, L = oe.current;
      if (o && y && X.current && G.current) {
        o.viewport(0, 0, n.width, n.height), o.clearColor(0, 0, 0, 0), o.clear(o.COLOR_BUFFER_BIT), o.useProgram(y), a.readyState >= 2 && (o.activeTexture(o.TEXTURE0), o.bindTexture(o.TEXTURE_2D, X.current), o.pixelStorei(o.UNPACK_FLIP_Y_WEBGL, 1), o.texImage2D(o.TEXTURE_2D, 0, o.RGBA, o.RGBA, o.UNSIGNED_BYTE, a));
        let E = 1, q = 0;
        if (z.current)
          a.readyState >= 2 ? (z.current = !1, J.current = !0, U.current = performance.now(), E = 0, q = 1) : (E = 0, q = 1);
        else if (J.current) {
          const H = performance.now() - U.current;
          E = Math.min(1, H / 800), q = 1, E >= 1 && (J.current = !1, q = 0);
        }
        q === 1 && V.current && (o.activeTexture(o.TEXTURE2), o.bindTexture(o.TEXTURE_2D, V.current)), o.activeTexture(o.TEXTURE1), o.bindTexture(o.TEXTURE_2D, S.current);
        let $ = 0;
        _.colorMode === "green" ? $ = 1 : _.colorMode === "amber" ? $ = 2 : _.colorMode === "mono" ? $ = 3 : _.colorMode === "cyberpunk" && ($ = 4);
        const g = K.current;
        o.uniform1i(g.u_video_texture || null, 0), o.uniform1i(g.u_prev_video_texture || null, 2), o.uniform1i(g.u_atlas_texture || null, 1), o.uniform1f(g.u_cols || null, C), o.uniform1f(g.u_rows || null, L), o.uniform1f(g.u_char_count || null, T.length), o.uniform1f(g.u_brightness || null, _.brightness), o.uniform1f(g.u_contrast || null, _.contrast), o.uniform1f(g.u_saturation || null, _.saturation), o.uniform1i(g.u_color_mode || null, $), o.uniform1i(g.u_use_sequence || null, _.customDensity ? 1 : 0), o.uniform1f(g.u_transition_progress || null, E), o.uniform1i(g.u_has_prev_texture || null, q);
        const j = re.current;
        j !== -1 && (o.enableVertexAttribArray(j), o.bindBuffer(o.ARRAY_BUFFER, G.current), o.vertexAttribPointer(j, 2, o.FLOAT, !1, 0, 0)), o.drawArrays(o.TRIANGLES, 0, 6);
      } else {
        const E = t.current;
        if (E) {
          const q = n.width, $ = n.height, { ctx: g } = x(C, L);
          if (g) {
            g.drawImage(a, 0, 0, C, L);
            const H = g.getImageData(0, 0, C, L).data, ue = C * L * 4, A = le.current, _e = !A || A.length !== ue || Q.current || !_.enableDeltaRendering;
            _e && (E.fillStyle = "#010101", E.fillRect(0, 0, q, $), _.enableDeltaRendering && (le.current = new Uint8Array(H)), Q.current = !1);
            const be = _.brightness, ne = _.contrast, Ee = _.saturation, me = c.current, xe = O.current, ge = N.current;
            for (let h = 0; h < 256; h++) {
              let Te = h;
              be !== 1 && (Te *= be), ne !== 1 && (Te = (Te - 128) * ne + 128), me[h] = Math.max(0, Math.min(255, Math.floor(Te))), xe[h] = h * Ee, ge[h] = h * (1 - Ee);
            }
            let ye = `bold ${_.fontSize}px "JetBrains Mono", "Fira Code", Courier, monospace`;
            E.font = ye, E.textAlign = "center", E.textBaseline = "middle";
            let fe = "";
            const Ce = T.length, ve = _.colorMode, Z = !!_.customDensity;
            for (let h = 0; h < L; h++) {
              const Te = h * p + p / 2;
              for (let Re = 0; Re < C; Re++) {
                const Y = (h * C + Re) * 4, Me = H[Y], Ue = H[Y + 1], Le = H[Y + 2];
                if (!_e && _.enableDeltaRendering && A) {
                  const M = A[Y], Xe = A[Y + 1], Ne = A[Y + 2];
                  if (Math.abs(Me - M) + Math.abs(Ue - Xe) + Math.abs(Le - Ne) < _.pdhThreshold)
                    continue;
                }
                _e || (E.fillStyle = "#010101", E.fillRect(Re * v - 0.2, h * p - 0.2, v + 0.4, p + 0.4), fe = "#010101");
                const Ae = me[Me], Fe = me[Ue], De = me[Le];
                let Se = Ae, Pe = Fe, Ie = De;
                if (Ee !== 1) {
                  const M = Ae * 77 + Fe * 150 + De * 29 >> 8;
                  Se = Math.max(0, Math.min(255, Math.floor(xe[Ae] + ge[M]))), Pe = Math.max(0, Math.min(255, Math.floor(xe[Fe] + ge[M]))), Ie = Math.max(0, Math.min(255, Math.floor(xe[De] + ge[M])));
                }
                const we = Se * 77 + Pe * 150 + Ie * 29 >> 8, ze = Z ? (h * C + Re) % Ce : we * Ce >> 8, Be = T[ze] || T[Ce - 1];
                if (Be === " ") {
                  _.enableDeltaRendering && A && (A[Y] = Me, A[Y + 1] = Ue, A[Y + 2] = Le);
                  continue;
                }
                Z ? E.globalAlpha = we / 255 : E.globalAlpha = 1;
                let pe = "#FFFFFF";
                if (ve === "rgb")
                  pe = u(Se, Pe, Ie);
                else if (ve === "green") {
                  const M = Math.max(0, Math.min(255, 50 + (we * 205 >> 8)));
                  pe = u(0, M, 30);
                } else if (ve === "amber") {
                  const M = Math.max(0, Math.min(255, we));
                  pe = u(M, Math.max(0, Math.min(255, M * 166 >> 8)), 0);
                } else if (ve === "mono") {
                  const M = Math.max(0, Math.min(255, we));
                  pe = u(M, M, M);
                } else if (ve === "cyberpunk") {
                  const M = we / 255 * 0.6 + h / L * 0.4, Xe = Math.max(0, Math.min(255, Math.floor(0 * (1 - M) + 255 * M))), Ne = Math.max(0, Math.min(255, Math.floor(240 * (1 - M) + 10 * M))), ke = Math.max(0, Math.min(255, Math.floor(255 * (1 - M) + 160 * M)));
                  pe = u(Xe, Ne, ke);
                }
                pe !== fe && (E.fillStyle = pe, fe = pe);
                const Oe = Re * v + v / 2, qe = Te;
                E.fillText(Be, Oe, qe), _.enableDeltaRendering && A && (A[Y] = Me, A[Y + 1] = Ue, A[Y + 2] = Le);
              }
            }
            Z && (E.globalAlpha = 1);
          }
        }
      }
    };
    (() => {
      if ("requestVideoFrameCallback" in a) {
        const n = () => {
          s(), r && (e = a.requestVideoFrameCallback(n));
        };
        e = a.requestVideoFrameCallback(n);
      } else {
        const n = () => {
          s(), r && (F.current = requestAnimationFrame(n));
        };
        F.current = requestAnimationFrame(n);
      }
    })(), s();
    const R = () => {
      s();
    };
    return a.addEventListener("seeked", R), () => {
      r = !1, a.removeEventListener("seeked", R), e !== null && "cancelVideoFrameCallback" in a && a.cancelVideoFrameCallback(e), F.current !== null && cancelAnimationFrame(F.current);
    };
  }, [a, _]), /* @__PURE__ */ f(
    "canvas",
    {
      id: "ascii-display-canvas",
      ref: te,
      className: `absolute inset-0 w-full h-full pointer-events-none select-none bg-transparent ${he}`
    }
  );
}, Ge = ({ className: a = "w-4 h-4", fill: d = "none" }) => /* @__PURE__ */ f("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: d, stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: a, children: /* @__PURE__ */ f("polygon", { points: "6 3 20 12 6 21 6 3" }) }), je = ({ className: a = "w-4 h-4", fill: d = "none" }) => /* @__PURE__ */ se("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: d, stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: a, children: [
  /* @__PURE__ */ f("rect", { x: "14", y: "4", width: "4", height: "16", rx: "1" }),
  /* @__PURE__ */ f("rect", { x: "6", y: "4", width: "4", height: "16", rx: "1" })
] }), He = ({ className: a = "w-4 h-4" }) => /* @__PURE__ */ se("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: a, children: [
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
  densityPreset: _ = "standard",
  customDensity: he = "",
  brightness: ee = 1.15,
  contrast: te = 1.1,
  saturation: I = 1.25,
  pdhThreshold: k = 18,
  className: G = "",
  videoClassName: X = "",
  canvasClassName: S = "",
  asciiOpacity: W = 1,
  videoOpacity: ce = 0,
  customControls: F = !1,
  src: K,
  autoPlay: re,
  loop: V,
  muted: U,
  playsInline: J = !0,
  crossOrigin: z = "anonymous",
  style: ie,
  ...le
}, Q) => {
  const P = l(null), oe = l(null);
  Ve(Q, () => P.current);
  const D = {
    fontSize: a,
    colorMode: d,
    densityPreset: _,
    customDensity: he,
    brightness: ee,
    contrast: te,
    saturation: I,
    enableDeltaRendering: !0,
    pdhThreshold: k,
    asciiOpacity: W,
    videoOpacity: ce
  }, [m, t] = de(!1), [w, c] = de(!!U), [O, N] = de(0), [B, x] = de(16 / 9), [r, e] = de(!1);
  ae(() => {
    const n = P.current;
    if (!n) return;
    const i = () => t(!0), o = () => t(!1), y = () => c(n.muted), v = () => {
      n.duration && N(n.currentTime / n.duration * 100);
    }, p = () => {
      n.videoWidth && n.videoHeight && x(n.videoWidth / n.videoHeight);
    };
    return n.addEventListener("play", i), n.addEventListener("pause", o), n.addEventListener("volumechange", y), n.addEventListener("timeupdate", v), n.addEventListener("loadedmetadata", p), t(!n.paused), c(n.muted), () => {
      n.removeEventListener("play", i), n.removeEventListener("pause", o), n.removeEventListener("volumechange", y), n.removeEventListener("timeupdate", v), n.removeEventListener("loadedmetadata", p);
    };
  }, []), ae(() => {
    const n = P.current;
    n && K && (n.src = K, n.load(), re && n.play().catch(() => {
    }));
  }, [K, re]), ae(() => {
    const n = P.current;
    n && (n.muted = !!U, c(!!U));
  }, [U]);
  const u = () => {
    const n = P.current;
    n && (n.paused ? n.play().catch(() => {
    }) : n.pause());
  }, s = (n) => {
    n.stopPropagation();
    const i = P.current;
    i && (i.muted = !i.muted, c(i.muted));
  }, b = (n) => {
    n.stopPropagation();
    const i = P.current;
    if (!i || !i.duration) return;
    const o = n.currentTarget.getBoundingClientRect(), v = (n.clientX - o.left) / o.width;
    i.currentTime = v * i.duration;
  }, R = (n) => {
    n.stopPropagation(), oe.current && (document.fullscreenElement ? document.exitFullscreen().catch(() => {
    }) : oe.current.requestFullscreen().catch(() => {
    }));
  };
  return /* @__PURE__ */ se(
    "div",
    {
      ref: oe,
      onMouseEnter: () => e(!0),
      onMouseLeave: () => e(!1),
      className: `relative rounded-xl overflow-hidden bg-[#050505] border border-white/10 group select-none transition-all duration-300 flex items-center justify-center ${G}`,
      style: {
        aspectRatio: `${B}`,
        width: "100%",
        ...ie
      },
      children: [
        /* @__PURE__ */ f(
          "video",
          {
            ref: P,
            crossOrigin: z,
            playsInline: J,
            loop: V,
            autoPlay: re,
            muted: w,
            style: { opacity: ce },
            className: `absolute inset-0 w-full h-full object-cover select-none bg-black transition-opacity duration-300 pointer-events-none ${X}`,
            ...le
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
                videoElement: P.current,
                videoSrc: K,
                settings: D
              }
            )
          }
        ),
        F ? /* @__PURE__ */ se(Ye, { children: [
          /* @__PURE__ */ f(
            "div",
            {
              onClick: u,
              className: "absolute inset-0 z-10 cursor-pointer flex items-center justify-center bg-black/0 active:bg-black/10 transition-colors"
            }
          ),
          !m && /* @__PURE__ */ f(
            "div",
            {
              onClick: u,
              className: "absolute z-20 w-14 h-14 rounded-full border border-white/25 flex items-center justify-center backdrop-blur-md shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer",
              style: { backgroundColor: "rgba(18,18,18,0.9)", color: "#00FF94" },
              children: /* @__PURE__ */ f(Ge, { className: "w-5 h-5 stroke-none translate-x-[2px]", fill: "currentColor" })
            }
          ),
          /* @__PURE__ */ se(
            "div",
            {
              className: `absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex flex-col gap-3 transition-opacity duration-300 z-20 ${r || !m ? "opacity-100" : "opacity-0 pointer-events-none"}`,
              children: [
                /* @__PURE__ */ f(
                  "div",
                  {
                    onClick: b,
                    className: "w-full h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer relative group/progress transition-all hover:h-2",
                    children: /* @__PURE__ */ f(
                      "div",
                      {
                        className: "absolute top-0 left-0 bottom-0 rounded-full shadow-[0_0_8px_rgba(0,255,148,0.6)]",
                        style: { width: `${O}%`, backgroundColor: "#00FF94" }
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
                        onClick: u,
                        className: "p-1.5 rounded-md hover:bg-white/10 text-white transition-colors",
                        children: m ? /* @__PURE__ */ f(je, { className: "w-4 h-4 fill-white", fill: "currentColor" }) : /* @__PURE__ */ f(Ge, { className: "w-4 h-4 stroke-none", fill: "#00FF94" })
                      }
                    ),
                    /* @__PURE__ */ f(
                      "button",
                      {
                        type: "button",
                        onClick: s,
                        className: "p-1.5 rounded-md hover:bg-white/10 text-white transition-colors",
                        children: w ? /* @__PURE__ */ f(Ke, { className: "w-4 h-4" }) : /* @__PURE__ */ f(He, { className: "w-4 h-4" })
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
        ] }) : !F && le.controls && /* @__PURE__ */ f("div", { className: "absolute bottom-2 right-2 z-20 bg-black/60 px-2 py-1 rounded border border-white/10 text-[9px] font-mono text-white/60", children: "*Use customControls prop for styled overlay controls" })
      ]
    }
  );
});
Qe.displayName = "CodeVideo";
const Ze = ({
  imageElement: a,
  settings: d,
  className: _ = "",
  onDimensionsUpdate: he,
  onFirstRender: ee,
  triggerRender: te = 0
}) => {
  const I = l(null), k = l(null), G = l(null), X = l(null), S = l(null), W = l(null), ce = l(null), F = l({}), K = l(-1), re = l(8), V = l(6), U = l(null), J = l(null), z = l(null), ie = l(/* @__PURE__ */ new Map()), le = l(new Uint8Array(256)), Q = l(new Float32Array(256)), P = l(new Float32Array(256)), oe = () => {
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
  }, D = (m, t) => (U.current ? (U.current.width !== m || U.current.height !== t) && (U.current.width = m, U.current.height = t) : (U.current = document.createElement("canvas"), U.current.width = m, U.current.height = t, J.current = U.current.getContext("2d", {
    willReadFrequently: !1
  })), {
    canvas: U.current,
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
    } catch (s) {
      console.warn("WebGL initialization failed, falling back to 2D Canvas.", s);
    }
    if (!t) {
      z.current = m.getContext("2d");
      return;
    }
    k.current = t;
    const w = `
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
    `, O = (s, b) => {
      const R = t.createShader(b);
      return R ? (t.shaderSource(R, s), t.compileShader(R), t.getShaderParameter(R, t.COMPILE_STATUS) ? R : (console.error("Shader compilation error:", t.getShaderInfoLog(R)), t.deleteShader(R), null)) : null;
    }, N = O(w, t.VERTEX_SHADER), B = O(c, t.FRAGMENT_SHADER);
    if (!N || !B) return;
    const x = t.createProgram();
    if (!x) return;
    if (t.attachShader(x, N), t.attachShader(x, B), t.linkProgram(x), !t.getProgramParameter(x, t.LINK_STATUS)) {
      console.error("Shader program linking error:", t.getProgramInfoLog(x));
      return;
    }
    G.current = x, F.current = {
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
    const u = t.createTexture();
    return t.bindTexture(t.TEXTURE_2D, u), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_S, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_T, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.NEAREST), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, t.NEAREST), W.current = u, () => {
      const s = k.current;
      s && (X.current && s.deleteBuffer(X.current), S.current && s.deleteTexture(S.current), W.current && s.deleteTexture(W.current), G.current && s.deleteProgram(G.current)), k.current = null, z.current = null;
    };
  }, []), ae(() => {
    const m = k.current, t = I.current;
    if (!t) return;
    const w = d.fontSize * 0.6, c = d.fontSize, O = oe();
    if (m && W.current) {
      const x = O.length, r = document.createElement("canvas");
      r.width = Math.ceil(x * w), r.height = Math.ceil(c);
      const e = r.getContext("2d");
      if (e) {
        e.clearRect(0, 0, r.width, r.height), e.fillStyle = "#FFFFFF", e.font = `bold ${d.fontSize}px "JetBrains Mono", "Fira Code", Courier, monospace`, e.textAlign = "center", e.textBaseline = "middle";
        for (let u = 0; u < x; u++) {
          const s = O[u], b = u * w + w / 2, R = c / 2;
          e.fillText(s, b, R);
        }
        m.activeTexture(m.TEXTURE1), m.bindTexture(m.TEXTURE_2D, W.current), m.pixelStorei(m.UNPACK_FLIP_Y_WEBGL, 0), m.texImage2D(m.TEXTURE_2D, 0, m.RGBA, m.RGBA, m.UNSIGNED_BYTE, r);
      }
    }
    z.current && ie.current.clear();
    const N = () => {
      const x = t.getBoundingClientRect(), r = Math.min(1.5, window.devicePixelRatio || 1), e = Math.floor(x.width) || (a == null ? void 0 : a.naturalWidth) || 640, u = Math.floor(x.height) || (a == null ? void 0 : a.naturalHeight) || 360;
      t.width = e * r, t.height = u * r, re.current = Math.max(8, Math.floor(t.width / w)), V.current = Math.max(6, Math.floor(t.height / c)), m && m.viewport(0, 0, t.width, t.height), he && he(e, u);
    };
    N();
    const B = new ResizeObserver(() => {
      N();
    });
    return B.observe(t), ce.current = B, () => {
      B.disconnect();
    };
  }, [a, d, te]), ae(() => {
    if (!a || !a.complete || a.naturalHeight === 0) return;
    const m = () => {
      const w = I.current;
      if (!w) return;
      const c = k.current, O = G.current, N = d.fontSize * 0.6, B = d.fontSize, x = oe(), r = re.current, e = V.current;
      if (c && O && S.current && X.current) {
        c.viewport(0, 0, w.width, w.height), c.clearColor(0.0196, 0.0196, 0.0196, 1), c.clear(c.COLOR_BUFFER_BIT), c.useProgram(O), c.activeTexture(c.TEXTURE0), c.bindTexture(c.TEXTURE_2D, S.current), c.pixelStorei(c.UNPACK_FLIP_Y_WEBGL, 1), c.texImage2D(c.TEXTURE_2D, 0, c.RGBA, c.RGBA, c.UNSIGNED_BYTE, a), c.activeTexture(c.TEXTURE1), c.bindTexture(c.TEXTURE_2D, W.current);
        let u = 0;
        d.colorMode === "green" ? u = 1 : d.colorMode === "amber" ? u = 2 : d.colorMode === "mono" ? u = 3 : d.colorMode === "cyberpunk" && (u = 4);
        const s = F.current;
        c.uniform1i(s.u_video_texture || null, 0), c.uniform1i(s.u_atlas_texture || null, 1), c.uniform1f(s.u_cols || null, r), c.uniform1f(s.u_rows || null, e), c.uniform1f(s.u_char_count || null, x.length), c.uniform1f(s.u_brightness || null, d.brightness), c.uniform1f(s.u_contrast || null, d.contrast), c.uniform1f(s.u_saturation || null, d.saturation), c.uniform1i(s.u_color_mode || null, u), c.uniform1i(s.u_use_sequence || null, d.customDensity ? 1 : 0);
        const b = K.current;
        b !== -1 && (c.enableVertexAttribArray(b), c.bindBuffer(c.ARRAY_BUFFER, X.current), c.vertexAttribPointer(b, 2, c.FLOAT, !1, 0, 0)), c.drawArrays(c.TRIANGLES, 0, 6), ee && ee();
      } else {
        const u = z.current;
        if (u) {
          const s = w.width, b = w.height, { ctx: R } = D(r, e);
          if (R) {
            R.drawImage(a, 0, 0, r, e);
            const i = R.getImageData(0, 0, r, e).data;
            u.fillStyle = "#010101", u.fillRect(0, 0, s, b);
            const o = d.brightness, y = d.contrast, v = d.saturation, p = le.current, T = Q.current, C = P.current;
            for (let g = 0; g < 256; g++) {
              let j = g;
              o !== 1 && (j *= o), y !== 1 && (j = (j - 128) * y + 128), p[g] = Math.max(0, Math.min(255, Math.floor(j))), T[g] = g * v, C[g] = g * (1 - v);
            }
            u.font = `bold ${d.fontSize}px "JetBrains Mono", "Fira Code", Courier, monospace`, u.textAlign = "center", u.textBaseline = "middle";
            let L = "";
            const E = x.length, q = d.colorMode, $ = (g, j, H) => {
              const ue = Math.min(255, g >> 4 << 4), A = Math.min(255, j >> 4 << 4), _e = Math.min(255, H >> 4 << 4), be = ue >> 4 << 8 | A >> 4 << 4 | _e >> 4;
              let ne = ie.current.get(be);
              return ne || (ne = `rgb(${ue},${A},${_e})`, ie.current.set(be, ne)), ne;
            };
            for (let g = 0; g < e; g++) {
              const j = g * B + B / 2;
              for (let H = 0; H < r; H++) {
                const ue = (g * r + H) * 4, A = i[ue], _e = i[ue + 1], be = i[ue + 2], ne = p[A], Ee = p[_e], me = p[be];
                let xe = ne, ge = Ee, ye = me;
                if (v !== 1) {
                  const h = ne * 77 + Ee * 150 + me * 29 >> 8;
                  xe = Math.max(0, Math.min(255, Math.floor(T[ne] + C[h]))), ge = Math.max(0, Math.min(255, Math.floor(T[Ee] + C[h]))), ye = Math.max(0, Math.min(255, Math.floor(T[me] + C[h])));
                }
                const fe = xe * 77 + ge * 150 + ye * 29 >> 8, Ce = fe * E >> 8, ve = x[Ce] || x[E - 1];
                if (ve === " ")
                  continue;
                let Z = "#FFFFFF";
                if (q === "rgb")
                  Z = $(xe, ge, ye);
                else if (q === "green") {
                  const h = Math.max(0, Math.min(255, 50 + (fe * 205 >> 8)));
                  Z = $(0, h, 30);
                } else if (q === "amber") {
                  const h = Math.max(0, Math.min(255, fe));
                  Z = $(h, Math.max(0, Math.min(255, h * 166 >> 8)), 0);
                } else if (q === "mono") {
                  const h = Math.max(0, Math.min(255, fe));
                  Z = $(h, h, h);
                } else if (q === "cyberpunk") {
                  const h = fe / 255 * 0.6 + g / e * 0.4, Te = Math.max(0, Math.min(255, Math.floor(0 * (1 - h) + 255 * h))), Re = Math.max(0, Math.min(255, Math.floor(240 * (1 - h) + 10 * h))), Y = Math.max(0, Math.min(255, Math.floor(255 * (1 - h) + 160 * h)));
                  Z = $(Te, Re, Y);
                }
                Z !== L && (u.fillStyle = Z, L = Z), u.fillText(ve, H * N + N / 2, j);
              }
            }
          }
        }
        ee && ee();
      }
    }, t = requestAnimationFrame(() => {
      m();
    });
    return () => cancelAnimationFrame(t);
  }, [a, d, te]), /* @__PURE__ */ f(
    "canvas",
    {
      id: "ascii-image-display-canvas",
      ref: I,
      className: `absolute inset-0 w-full h-full pointer-events-none select-none bg-transparent ${_}`
    }
  );
}, et = We(({
  fontSize: a = 7,
  colorMode: d = "rgb",
  densityPreset: _ = "standard",
  customDensity: he = "",
  brightness: ee = 1.15,
  contrast: te = 1.1,
  saturation: I = 1.25,
  pdhThreshold: k = 18,
  className: G = "",
  imageClassName: X = "",
  canvasClassName: S = "",
  asciiOpacity: W = 1,
  imageOpacity: ce = 0,
  onHover: F,
  onClick: K,
  src: re,
  alt: V = "",
  crossOrigin: U = "anonymous",
  style: J,
  onLoad: z,
  ...ie
}, le) => {
  const Q = l(null), P = l(null);
  Ve(le, () => Q.current);
  const [oe, D] = de(16 / 9), [m, t] = de(!1), [w, c] = de(!1), [O, N] = de(0), r = {
    fontSize: a,
    colorMode: d,
    densityPreset: _,
    customDensity: he,
    brightness: ee,
    contrast: te,
    saturation: I,
    enableDeltaRendering: !1,
    pdhThreshold: k,
    asciiOpacity: W,
    videoOpacity: ce
  }, e = (s) => {
    const b = s.currentTarget;
    b.naturalWidth && b.naturalHeight && D(b.naturalWidth / b.naturalHeight), t(!0), N((R) => R + 1), z && z(s);
  }, u = () => {
    c(!0);
  };
  return ae(() => {
    const s = Q.current;
    s && s.complete && s.naturalWidth > 0 && (D(s.naturalWidth / s.naturalHeight), t(!0), N((b) => b + 1));
  }, []), /* @__PURE__ */ se(
    "div",
    {
      ref: P,
      onMouseEnter: () => F == null ? void 0 : F(!0),
      onMouseLeave: () => F == null ? void 0 : F(!1),
      onClick: K,
      className: `relative overflow-hidden bg-[#050505] border border-white/10 group select-none transition-all duration-300 flex items-center justify-center ${G}`,
      style: {
        aspectRatio: `${oe}`,
        width: "100%",
        ...J
      },
      children: [
        /* @__PURE__ */ f(
          "img",
          {
            ref: Q,
            src: re,
            alt: V,
            crossOrigin: U,
            onLoad: e,
            style: { opacity: w ? ce : 0 },
            className: `absolute inset-0 w-full h-full object-cover select-none bg-black transition-opacity duration-300 pointer-events-none ${X}`,
            ...ie
          }
        ),
        m && /* @__PURE__ */ f(
          "div",
          {
            className: `absolute inset-0 w-full h-full pointer-events-none select-none transition-opacity duration-300 ${S}`,
            style: { opacity: w ? W : 0 },
            children: /* @__PURE__ */ f(
              Ze,
              {
                imageElement: Q.current,
                settings: r,
                triggerRender: O,
                onFirstRender: u
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
