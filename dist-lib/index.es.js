import { jsx as f, jsxs as ie, Fragment as Ye } from "react/jsx-runtime";
import { useRef as i, useEffect as ae, forwardRef as We, useImperativeHandle as Ve, useState as ue } from "react";
const $e = ({
  videoElement: a,
  videoSrc: d,
  settings: h,
  className: fe = "",
  onDimensionsUpdate: le
}) => {
  const O = i(null), X = i(null), q = i(null), B = i(null), k = i(null), P = i(null), se = i(null), Z = i(-1), H = i(null), j = i({}), ee = i(-1), M = i(null), K = i(0), G = i(!1), Y = i(!1), de = i(d), ce = i(null), J = i(!0), I = i(8), te = i(6), u = i(null), t = i(null), p = i(null), c = i(/* @__PURE__ */ new Map()), D = i(new Uint8Array(256)), W = i(new Float32Array(256)), N = i(new Float32Array(256)), _ = () => {
    if (h.customDensity)
      return h.customDensity.split("");
    switch (h.densityPreset) {
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
  }, b = (r, e) => (u.current ? (u.current.width !== r || u.current.height !== e) && (u.current.width = r, u.current.height = e) : (u.current = document.createElement("canvas"), u.current.width = r, u.current.height = e, t.current = u.current.getContext("2d", {
    willReadFrequently: !1
  })), {
    canvas: u.current,
    ctx: t.current
  });
  return ae(() => {
    const r = O.current;
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
    } catch (x) {
      console.warn("WebGL initialization failed, falling back to 2D Canvas.", x);
    }
    if (!e) {
      p.current = r.getContext("2d");
      return;
    }
    X.current = e;
    const s = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;

      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `, g = `
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
    `, E = (x, L) => {
      const F = e.createShader(L);
      return F ? (e.shaderSource(F, x), e.compileShader(F), e.getShaderParameter(F, e.COMPILE_STATUS) ? F : (console.error("Shader compilation error:", e.getShaderInfoLog(F)), e.deleteShader(F), null)) : null;
    }, re = E(s, e.VERTEX_SHADER), o = E(g, e.FRAGMENT_SHADER);
    if (!re || !o) return;
    const l = e.createProgram();
    if (!l) return;
    if (e.attachShader(l, re), e.attachShader(l, o), e.linkProgram(l), !e.getProgramParameter(l, e.LINK_STATUS)) {
      console.error("Shader program linking error:", e.getProgramInfoLog(l));
      return;
    }
    q.current = l, j.current = {
      u_video_texture: e.getUniformLocation(l, "u_video_texture"),
      u_prev_video_texture: e.getUniformLocation(l, "u_prev_video_texture"),
      u_atlas_texture: e.getUniformLocation(l, "u_atlas_texture"),
      u_cols: e.getUniformLocation(l, "u_cols"),
      u_rows: e.getUniformLocation(l, "u_rows"),
      u_char_count: e.getUniformLocation(l, "u_char_count"),
      u_brightness: e.getUniformLocation(l, "u_brightness"),
      u_contrast: e.getUniformLocation(l, "u_contrast"),
      u_saturation: e.getUniformLocation(l, "u_saturation"),
      u_color_mode: e.getUniformLocation(l, "u_color_mode"),
      u_use_sequence: e.getUniformLocation(l, "u_use_sequence"),
      u_transition_progress: e.getUniformLocation(l, "u_transition_progress"),
      u_has_prev_texture: e.getUniformLocation(l, "u_has_prev_texture")
    }, ee.current = e.getAttribLocation(l, "a_position");
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
    ), B.current = n;
    const y = e.createTexture();
    e.bindTexture(e.TEXTURE_2D, y), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.NEAREST), k.current = y;
    const m = e.createTexture();
    e.bindTexture(e.TEXTURE_2D, m), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.NEAREST), P.current = m;
    const T = e.createTexture();
    return e.bindTexture(e.TEXTURE_2D, T), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.NEAREST), M.current = T, () => {
      const x = X.current;
      x && (B.current && x.deleteBuffer(B.current), k.current && x.deleteTexture(k.current), P.current && x.deleteTexture(P.current), M.current && x.deleteTexture(M.current), q.current && x.deleteProgram(q.current)), X.current = null, p.current = null;
    };
  }, []), ae(() => {
    ce.current = null, J.current = !0;
    const r = X.current, e = O.current;
    if (!e) return;
    const s = h.fontSize * 0.6, g = h.fontSize, E = _();
    if (r && P.current) {
      const l = E.length, n = 48, y = Math.ceil(n * 0.6), m = document.createElement("canvas");
      m.width = l * y, m.height = n;
      const T = m.getContext("2d");
      if (T) {
        T.clearRect(0, 0, m.width, m.height), T.fillStyle = "#FFFFFF", T.textAlign = "center", T.textBaseline = "middle", T.font = `bold ${n}px "Fira Code", "Courier New", Courier, monospace`;
        for (let x = 0; x < l; x++) {
          const L = E[x], F = x * y + y / 2, v = n / 2;
          T.fillText(L, F, v);
        }
        r.activeTexture(r.TEXTURE1), r.bindTexture(r.TEXTURE_2D, P.current), r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL, 0), r.texImage2D(r.TEXTURE_2D, 0, r.RGBA, r.RGBA, r.UNSIGNED_BYTE, m), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_MIN_FILTER, r.LINEAR), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_MAG_FILTER, r.LINEAR);
      }
    }
    p.current && c.current.clear();
    const re = () => {
      const l = e.getBoundingClientRect(), n = Math.min(1.5, window.devicePixelRatio || 1), y = Math.floor(l.width) || (a == null ? void 0 : a.videoWidth) || 640, m = Math.floor(l.height) || (a == null ? void 0 : a.videoHeight) || 360;
      e.width = y * n, e.height = m * n, I.current = Math.max(8, Math.floor(e.width / s)), te.current = Math.max(6, Math.floor(e.height / g)), r && r.viewport(0, 0, e.width, e.height), le && le(y, m);
    };
    re();
    const o = new ResizeObserver(() => {
      re();
    });
    return o.observe(e), se.current = o, () => {
      o.disconnect();
    };
  }, [a, h]), ae(() => {
    if (d !== de.current) {
      const r = X.current;
      if (r && M.current && a && a.readyState >= 2)
        try {
          r.activeTexture(r.TEXTURE2), r.bindTexture(r.TEXTURE_2D, M.current), r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL, 1), r.texImage2D(r.TEXTURE_2D, 0, r.RGBA, r.RGBA, r.UNSIGNED_BYTE, a), Y.current = !0, G.current = !1;
        } catch (e) {
          console.warn("Failed to capture old video frame for transition:", e);
        }
      de.current = d;
    }
  }, [d, a]), ae(() => {
    if (!a) return;
    let r = !0, e = null;
    const s = (o, l, n) => {
      const y = Math.min(255, o >> 4 << 4), m = Math.min(255, l >> 4 << 4), T = Math.min(255, n >> 4 << 4), x = y >> 4 << 8 | m >> 4 << 4 | T >> 4;
      let L = c.current.get(x);
      return L || (L = `rgb(${y},${m},${T})`, c.current.set(x, L)), L;
    }, g = () => {
      if (!r) return;
      const o = O.current;
      if (!o) return;
      const l = a.currentTime;
      if (l === Z.current && !a.paused && !G.current && !Y.current)
        return;
      Z.current = l;
      const n = X.current, y = q.current, m = h.fontSize * 0.6, T = h.fontSize, x = _(), L = I.current, F = te.current;
      if (n && y && k.current && B.current) {
        n.viewport(0, 0, o.width, o.height), n.clearColor(0, 0, 0, 0), n.clear(n.COLOR_BUFFER_BIT), n.useProgram(y), a.readyState >= 2 && (n.activeTexture(n.TEXTURE0), n.bindTexture(n.TEXTURE_2D, k.current), n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL, 1), n.texImage2D(n.TEXTURE_2D, 0, n.RGBA, n.RGBA, n.UNSIGNED_BYTE, a));
        let v = 1, V = 0;
        if (Y.current)
          a.readyState >= 2 ? (Y.current = !1, G.current = !0, K.current = performance.now(), v = 0, V = 1) : (v = 0, V = 1);
        else if (G.current) {
          const $ = performance.now() - K.current;
          v = Math.min(1, $ / 800), V = 1, v >= 1 && (G.current = !1, V = 0);
        }
        V === 1 && M.current && (n.activeTexture(n.TEXTURE2), n.bindTexture(n.TEXTURE_2D, M.current)), n.activeTexture(n.TEXTURE1), n.bindTexture(n.TEXTURE_2D, P.current);
        let w = 0;
        h.colorMode === "green" ? w = 1 : h.colorMode === "amber" ? w = 2 : h.colorMode === "mono" ? w = 3 : h.colorMode === "cyberpunk" && (w = 4);
        const R = j.current;
        n.uniform1i(R.u_video_texture || null, 0), n.uniform1i(R.u_prev_video_texture || null, 2), n.uniform1i(R.u_atlas_texture || null, 1), n.uniform1f(R.u_cols || null, L), n.uniform1f(R.u_rows || null, F), n.uniform1f(R.u_char_count || null, x.length), n.uniform1f(R.u_brightness || null, h.brightness), n.uniform1f(R.u_contrast || null, h.contrast), n.uniform1f(R.u_saturation || null, h.saturation), n.uniform1i(R.u_color_mode || null, w), n.uniform1i(R.u_use_sequence || null, h.customDensity ? 1 : 0), n.uniform1f(R.u_transition_progress || null, v), n.uniform1i(R.u_has_prev_texture || null, V);
        const oe = ee.current;
        oe !== -1 && (n.enableVertexAttribArray(oe), n.bindBuffer(n.ARRAY_BUFFER, B.current), n.vertexAttribPointer(oe, 2, n.FLOAT, !1, 0, 0)), n.drawArrays(n.TRIANGLES, 0, 6);
      } else {
        const v = p.current;
        if (v) {
          const V = o.width, w = o.height, { ctx: R } = b(L, F);
          if (R) {
            R.drawImage(a, 0, 0, L, F);
            const $ = R.getImageData(0, 0, L, F).data, Re = L * F * 4, A = ce.current, he = !A || A.length !== Re || J.current || !h.enableDeltaRendering;
            he && (v.fillStyle = "#010101", v.fillRect(0, 0, V, w), h.enableDeltaRendering && (ce.current = new Uint8Array($)), J.current = !1);
            const ne = h.brightness, Ee = h.contrast, pe = h.saturation, _e = D.current, me = W.current, xe = N.current;
            for (let S = 0; S < 256; S++) {
              let ge = S;
              ne !== 1 && (ge *= ne), Ee !== 1 && (ge = (ge - 128) * Ee + 128), _e[S] = Math.max(0, Math.min(255, Math.floor(ge))), me[S] = S * pe, xe[S] = S * (1 - pe);
            }
            let be = `bold ${h.fontSize}px "JetBrains Mono", "Fira Code", Courier, monospace`;
            v.font = be, v.textAlign = "center", v.textBaseline = "middle";
            let Ce = "";
            const we = x.length, z = h.colorMode, C = !!h.customDensity;
            for (let S = 0; S < F; S++) {
              const ge = S * T + T / 2;
              for (let ve = 0; ve < L; ve++) {
                const Q = (S * L + ve) * 4, Me = $[Q], Ue = $[Q + 1], Le = $[Q + 2];
                if (!he && h.enableDeltaRendering && A) {
                  const U = A[Q], Xe = A[Q + 1], Ne = A[Q + 2];
                  if (Math.abs(Me - U) + Math.abs(Ue - Xe) + Math.abs(Le - Ne) < h.pdhThreshold)
                    continue;
                }
                he || (v.fillStyle = "#010101", v.fillRect(ve * m - 0.2, S * T - 0.2, m + 0.4, T + 0.4), Ce = "#010101");
                const Fe = _e[Me], Ae = _e[Ue], De = _e[Le];
                let Se = Fe, Pe = Ae, Ie = De;
                if (pe !== 1) {
                  const U = Fe * 77 + Ae * 150 + De * 29 >> 8;
                  Se = Math.max(0, Math.min(255, Math.floor(me[Fe] + xe[U]))), Pe = Math.max(0, Math.min(255, Math.floor(me[Ae] + xe[U]))), Ie = Math.max(0, Math.min(255, Math.floor(me[De] + xe[U])));
                }
                const ye = Se * 77 + Pe * 150 + Ie * 29 >> 8, ze = C ? (S * L + ve) % we : ye * we >> 8, Be = x[ze] || x[we - 1];
                if (Be === " ") {
                  h.enableDeltaRendering && A && (A[Q] = Me, A[Q + 1] = Ue, A[Q + 2] = Le);
                  continue;
                }
                C ? v.globalAlpha = ye / 255 : v.globalAlpha = 1;
                let Te = "#FFFFFF";
                if (z === "rgb")
                  Te = s(Se, Pe, Ie);
                else if (z === "green") {
                  const U = Math.max(0, Math.min(255, 50 + (ye * 205 >> 8)));
                  Te = s(0, U, 30);
                } else if (z === "amber") {
                  const U = Math.max(0, Math.min(255, ye));
                  Te = s(U, Math.max(0, Math.min(255, U * 166 >> 8)), 0);
                } else if (z === "mono") {
                  const U = Math.max(0, Math.min(255, ye));
                  Te = s(U, U, U);
                } else if (z === "cyberpunk") {
                  const U = ye / 255 * 0.6 + S / F * 0.4, Xe = Math.max(0, Math.min(255, Math.floor(0 * (1 - U) + 255 * U))), Ne = Math.max(0, Math.min(255, Math.floor(240 * (1 - U) + 10 * U))), ke = Math.max(0, Math.min(255, Math.floor(255 * (1 - U) + 160 * U)));
                  Te = s(Xe, Ne, ke);
                }
                Te !== Ce && (v.fillStyle = Te, Ce = Te);
                const Oe = ve * m + m / 2, qe = ge;
                v.fillText(Be, Oe, qe), h.enableDeltaRendering && A && (A[Q] = Me, A[Q + 1] = Ue, A[Q + 2] = Le);
              }
            }
            C && (v.globalAlpha = 1);
          }
        }
      }
    };
    (() => {
      if ("requestVideoFrameCallback" in a) {
        const o = () => {
          g(), r && (e = a.requestVideoFrameCallback(o));
        };
        e = a.requestVideoFrameCallback(o);
      } else {
        const o = () => {
          g(), r && (H.current = requestAnimationFrame(o));
        };
        H.current = requestAnimationFrame(o);
      }
    })(), g();
    const re = () => {
      g();
    };
    return a.addEventListener("seeked", re), () => {
      r = !1, a.removeEventListener("seeked", re), e !== null && "cancelVideoFrameCallback" in a && a.cancelVideoFrameCallback(e), H.current !== null && cancelAnimationFrame(H.current);
    };
  }, [a, h]), /* @__PURE__ */ f(
    "canvas",
    {
      id: "ascii-display-canvas",
      ref: O,
      className: `absolute inset-0 w-full h-full pointer-events-none select-none bg-transparent ${fe}`
    }
  );
}, Ge = ({ className: a = "w-4 h-4", fill: d = "none" }) => /* @__PURE__ */ f("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: d, stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: a, children: /* @__PURE__ */ f("polygon", { points: "6 3 20 12 6 21 6 3" }) }), He = ({ className: a = "w-4 h-4", fill: d = "none" }) => /* @__PURE__ */ ie("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: d, stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: a, children: [
  /* @__PURE__ */ f("rect", { x: "14", y: "4", width: "4", height: "16", rx: "1" }),
  /* @__PURE__ */ f("rect", { x: "6", y: "4", width: "4", height: "16", rx: "1" })
] }), je = ({ className: a = "w-4 h-4" }) => /* @__PURE__ */ ie("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: a, children: [
  /* @__PURE__ */ f("polygon", { points: "11 5 6 9 2 9 2 15 6 15 11 19 11 5" }),
  /* @__PURE__ */ f("path", { d: "M15.54 8.46a5 5 0 0 1 0 7.07" }),
  /* @__PURE__ */ f("path", { d: "M19.07 4.93a10 10 0 0 1 0 14.14" })
] }), Ke = ({ className: a = "w-4 h-4" }) => /* @__PURE__ */ ie("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: a, children: [
  /* @__PURE__ */ f("polygon", { points: "11 5 6 9 2 9 2 15 6 15 11 19 11 5" }),
  /* @__PURE__ */ f("line", { x1: "22", y1: "9", x2: "16", y2: "15" }),
  /* @__PURE__ */ f("line", { x1: "16", y1: "9", x2: "22", y2: "15" })
] }), Je = ({ className: a = "w-4 h-4" }) => /* @__PURE__ */ ie("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: a, children: [
  /* @__PURE__ */ f("polyline", { points: "15 3 21 3 21 9" }),
  /* @__PURE__ */ f("polyline", { points: "9 21 3 21 3 15" }),
  /* @__PURE__ */ f("line", { x1: "21", y1: "3", x2: "14", y2: "10" }),
  /* @__PURE__ */ f("line", { x1: "3", y1: "21", x2: "10", y2: "14" })
] }), Qe = We(({
  fontSize: a = 7,
  colorMode: d = "rgb",
  densityPreset: h = "standard",
  customDensity: fe = "",
  brightness: le = 1.15,
  contrast: O = 1.1,
  saturation: X = 1.25,
  pdhThreshold: q = 18,
  className: B = "",
  videoClassName: k = "",
  canvasClassName: P = "",
  asciiOpacity: se = 1,
  videoOpacity: Z = 0,
  customControls: H = !1,
  src: j,
  autoPlay: ee,
  loop: M,
  muted: K,
  playsInline: G = !0,
  crossOrigin: Y = "anonymous",
  style: de,
  ...ce
}, J) => {
  const I = i(null), te = i(null);
  Ve(J, () => I.current);
  const u = {
    fontSize: a,
    colorMode: d,
    densityPreset: h,
    customDensity: fe,
    brightness: le,
    contrast: O,
    saturation: X,
    enableDeltaRendering: !0,
    pdhThreshold: q,
    asciiOpacity: se,
    videoOpacity: Z
  }, [t, p] = ue(!1), [c, D] = ue(!!K), [W, N] = ue(0), [_, b] = ue(16 / 9), [r, e] = ue(!1);
  ae(() => {
    const o = I.current;
    if (!o) return;
    const l = () => p(!0), n = () => p(!1), y = () => D(o.muted), m = () => {
      o.duration && N(o.currentTime / o.duration * 100);
    }, T = () => {
      o.videoWidth && o.videoHeight && b(o.videoWidth / o.videoHeight);
    };
    return o.addEventListener("play", l), o.addEventListener("pause", n), o.addEventListener("volumechange", y), o.addEventListener("timeupdate", m), o.addEventListener("loadedmetadata", T), p(!o.paused), D(o.muted), () => {
      o.removeEventListener("play", l), o.removeEventListener("pause", n), o.removeEventListener("volumechange", y), o.removeEventListener("timeupdate", m), o.removeEventListener("loadedmetadata", T);
    };
  }, []), ae(() => {
    const o = I.current;
    o && j && (o.src = j, o.load(), ee && o.play().catch(() => {
    }));
  }, [j, ee]), ae(() => {
    const o = I.current;
    o && (o.muted = !!K, D(!!K));
  }, [K]);
  const s = () => {
    const o = I.current;
    o && (o.paused ? o.play().catch(() => {
    }) : o.pause());
  }, g = (o) => {
    o.stopPropagation();
    const l = I.current;
    l && (l.muted = !l.muted, D(l.muted));
  }, E = (o) => {
    o.stopPropagation();
    const l = I.current;
    if (!l || !l.duration) return;
    const n = o.currentTarget.getBoundingClientRect(), m = (o.clientX - n.left) / n.width;
    l.currentTime = m * l.duration;
  }, re = (o) => {
    o.stopPropagation(), te.current && (document.fullscreenElement ? document.exitFullscreen().catch(() => {
    }) : te.current.requestFullscreen().catch(() => {
    }));
  };
  return /* @__PURE__ */ ie(
    "div",
    {
      ref: te,
      onMouseEnter: () => e(!0),
      onMouseLeave: () => e(!1),
      className: `relative rounded-xl overflow-hidden bg-[#050505] border border-white/10 group select-none transition-all duration-300 flex items-center justify-center ${B}`,
      style: {
        aspectRatio: `${_}`,
        width: "100%",
        ...de
      },
      children: [
        /* @__PURE__ */ f(
          "video",
          {
            ref: I,
            crossOrigin: Y,
            playsInline: G,
            loop: M,
            autoPlay: ee,
            muted: c,
            style: { opacity: Z },
            className: `absolute inset-0 w-full h-full object-cover select-none bg-black transition-opacity duration-300 pointer-events-none ${k}`,
            ...ce
          }
        ),
        /* @__PURE__ */ f(
          "div",
          {
            className: `absolute inset-0 w-full h-full pointer-events-none select-none transition-opacity duration-300 ${P}`,
            style: { opacity: se },
            children: /* @__PURE__ */ f(
              $e,
              {
                videoElement: I.current,
                videoSrc: j,
                settings: u
              }
            )
          }
        ),
        H ? /* @__PURE__ */ ie(Ye, { children: [
          /* @__PURE__ */ f(
            "div",
            {
              onClick: s,
              className: "absolute inset-0 z-10 cursor-pointer flex items-center justify-center bg-black/0 active:bg-black/10 transition-colors"
            }
          ),
          !t && /* @__PURE__ */ f(
            "div",
            {
              onClick: s,
              className: "absolute z-20 w-14 h-14 rounded-full border border-white/25 flex items-center justify-center backdrop-blur-md shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer",
              style: { backgroundColor: "rgba(18,18,18,0.9)", color: "#00FF94" },
              children: /* @__PURE__ */ f(Ge, { className: "w-5 h-5 stroke-none translate-x-[2px]", fill: "currentColor" })
            }
          ),
          /* @__PURE__ */ ie(
            "div",
            {
              className: `absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex flex-col gap-3 transition-opacity duration-300 z-20 ${r || !t ? "opacity-100" : "opacity-0 pointer-events-none"}`,
              children: [
                /* @__PURE__ */ f(
                  "div",
                  {
                    onClick: E,
                    className: "w-full h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer relative group/progress transition-all hover:h-2",
                    children: /* @__PURE__ */ f(
                      "div",
                      {
                        className: "absolute top-0 left-0 bottom-0 rounded-full shadow-[0_0_8px_rgba(0,255,148,0.6)]",
                        style: { width: `${W}%`, backgroundColor: "#00FF94" }
                      }
                    )
                  }
                ),
                /* @__PURE__ */ ie("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ ie("div", { className: "flex items-center gap-3", children: [
                    /* @__PURE__ */ f(
                      "button",
                      {
                        type: "button",
                        onClick: s,
                        className: "p-1.5 rounded-md hover:bg-white/10 text-white transition-colors",
                        children: t ? /* @__PURE__ */ f(He, { className: "w-4 h-4 fill-white", fill: "currentColor" }) : /* @__PURE__ */ f(Ge, { className: "w-4 h-4 stroke-none", fill: "#00FF94" })
                      }
                    ),
                    /* @__PURE__ */ f(
                      "button",
                      {
                        type: "button",
                        onClick: g,
                        className: "p-1.5 rounded-md hover:bg-white/10 text-white transition-colors",
                        children: c ? /* @__PURE__ */ f(Ke, { className: "w-4 h-4" }) : /* @__PURE__ */ f(je, { className: "w-4 h-4" })
                      }
                    )
                  ] }),
                  /* @__PURE__ */ f("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ f(
                    "button",
                    {
                      type: "button",
                      onClick: re,
                      className: "p-1.5 rounded-md hover:bg-white/10 text-white transition-colors",
                      children: /* @__PURE__ */ f(Je, { className: "w-4 h-4" })
                    }
                  ) })
                ] })
              ]
            }
          )
        ] }) : !H && ce.controls && /* @__PURE__ */ f("div", { className: "absolute bottom-2 right-2 z-20 bg-black/60 px-2 py-1 rounded border border-white/10 text-[9px] font-mono text-white/60", children: "*Use customControls prop for styled overlay controls" })
      ]
    }
  );
});
Qe.displayName = "CodeVideo";
const Ze = ({
  imageElement: a,
  settings: d,
  className: h = "",
  onDimensionsUpdate: fe,
  triggerRender: le = 0
}) => {
  const O = i(null), X = i(null), q = i(null), B = i(null), k = i(null), P = i(null), se = i(null), Z = i({}), H = i(-1), j = i(8), ee = i(6), M = i(null), K = i(null), G = i(null), Y = i(/* @__PURE__ */ new Map()), de = i(new Uint8Array(256)), ce = i(new Float32Array(256)), J = i(new Float32Array(256)), I = () => {
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
  }, te = (u, t) => (M.current ? (M.current.width !== u || M.current.height !== t) && (M.current.width = u, M.current.height = t) : (M.current = document.createElement("canvas"), M.current.width = u, M.current.height = t, K.current = M.current.getContext("2d", {
    willReadFrequently: !1
  })), {
    canvas: M.current,
    ctx: K.current
  });
  return ae(() => {
    const u = O.current;
    if (!u) return;
    let t = null;
    try {
      t = u.getContext("webgl", {
        alpha: !1,
        depth: !1,
        antialias: !1,
        preserveDrawingBuffer: !0
      }) || u.getContext("experimental-webgl", {
        alpha: !1,
        depth: !1,
        antialias: !1,
        preserveDrawingBuffer: !0
      });
    } catch (s) {
      console.warn("WebGL initialization failed, falling back to 2D Canvas.", s);
    }
    if (!t) {
      G.current = u.getContext("2d");
      return;
    }
    X.current = t;
    const p = `
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
    `, D = (s, g) => {
      const E = t.createShader(g);
      return E ? (t.shaderSource(E, s), t.compileShader(E), t.getShaderParameter(E, t.COMPILE_STATUS) ? E : (console.error("Shader compilation error:", t.getShaderInfoLog(E)), t.deleteShader(E), null)) : null;
    }, W = D(p, t.VERTEX_SHADER), N = D(c, t.FRAGMENT_SHADER);
    if (!W || !N) return;
    const _ = t.createProgram();
    if (!_) return;
    if (t.attachShader(_, W), t.attachShader(_, N), t.linkProgram(_), !t.getProgramParameter(_, t.LINK_STATUS)) {
      console.error("Shader program linking error:", t.getProgramInfoLog(_));
      return;
    }
    q.current = _, Z.current = {
      u_video_texture: t.getUniformLocation(_, "u_video_texture"),
      u_atlas_texture: t.getUniformLocation(_, "u_atlas_texture"),
      u_cols: t.getUniformLocation(_, "u_cols"),
      u_rows: t.getUniformLocation(_, "u_rows"),
      u_char_count: t.getUniformLocation(_, "u_char_count"),
      u_brightness: t.getUniformLocation(_, "u_brightness"),
      u_contrast: t.getUniformLocation(_, "u_contrast"),
      u_saturation: t.getUniformLocation(_, "u_saturation"),
      u_color_mode: t.getUniformLocation(_, "u_color_mode"),
      u_use_sequence: t.getUniformLocation(_, "u_use_sequence")
    }, H.current = t.getAttribLocation(_, "a_position");
    const b = t.createBuffer();
    t.bindBuffer(t.ARRAY_BUFFER, b), t.bufferData(
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
    ), B.current = b;
    const r = t.createTexture();
    t.bindTexture(t.TEXTURE_2D, r), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_S, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_T, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.NEAREST), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, t.NEAREST), k.current = r;
    const e = t.createTexture();
    return t.bindTexture(t.TEXTURE_2D, e), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_S, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_T, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.NEAREST), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, t.NEAREST), P.current = e, () => {
      const s = X.current;
      s && (B.current && s.deleteBuffer(B.current), k.current && s.deleteTexture(k.current), P.current && s.deleteTexture(P.current), q.current && s.deleteProgram(q.current)), X.current = null, G.current = null;
    };
  }, []), ae(() => {
    const u = X.current, t = O.current;
    if (!t) return;
    const p = d.fontSize * 0.6, c = d.fontSize, D = I();
    if (u && P.current) {
      const _ = D.length, b = document.createElement("canvas");
      b.width = Math.ceil(_ * p), b.height = Math.ceil(c);
      const r = b.getContext("2d");
      if (r) {
        r.clearRect(0, 0, b.width, b.height), r.fillStyle = "#FFFFFF", r.font = `bold ${d.fontSize}px "JetBrains Mono", "Fira Code", Courier, monospace`, r.textAlign = "center", r.textBaseline = "middle";
        for (let e = 0; e < _; e++) {
          const s = D[e], g = e * p + p / 2, E = c / 2;
          r.fillText(s, g, E);
        }
        u.activeTexture(u.TEXTURE1), u.bindTexture(u.TEXTURE_2D, P.current), u.pixelStorei(u.UNPACK_FLIP_Y_WEBGL, 0), u.texImage2D(u.TEXTURE_2D, 0, u.RGBA, u.RGBA, u.UNSIGNED_BYTE, b);
      }
    }
    G.current && Y.current.clear();
    const W = () => {
      const _ = t.getBoundingClientRect(), b = Math.min(1.5, window.devicePixelRatio || 1), r = Math.floor(_.width) || (a == null ? void 0 : a.naturalWidth) || 640, e = Math.floor(_.height) || (a == null ? void 0 : a.naturalHeight) || 360;
      t.width = r * b, t.height = e * b, j.current = Math.max(8, Math.floor(t.width / p)), ee.current = Math.max(6, Math.floor(t.height / c)), u && u.viewport(0, 0, t.width, t.height), fe && fe(r, e);
    };
    W();
    const N = new ResizeObserver(() => {
      W();
    });
    return N.observe(t), se.current = N, () => {
      N.disconnect();
    };
  }, [a, d, le]), ae(() => {
    if (!a || !a.complete || a.naturalHeight === 0) return;
    const u = () => {
      const p = O.current;
      if (!p) return;
      const c = X.current, D = q.current, W = d.fontSize * 0.6, N = d.fontSize, _ = I(), b = j.current, r = ee.current;
      if (c && D && k.current && B.current) {
        c.viewport(0, 0, p.width, p.height), c.clearColor(0.0196, 0.0196, 0.0196, 1), c.clear(c.COLOR_BUFFER_BIT), c.useProgram(D), c.activeTexture(c.TEXTURE0), c.bindTexture(c.TEXTURE_2D, k.current), c.pixelStorei(c.UNPACK_FLIP_Y_WEBGL, 1), c.texImage2D(c.TEXTURE_2D, 0, c.RGBA, c.RGBA, c.UNSIGNED_BYTE, a), c.activeTexture(c.TEXTURE1), c.bindTexture(c.TEXTURE_2D, P.current);
        let e = 0;
        d.colorMode === "green" ? e = 1 : d.colorMode === "amber" ? e = 2 : d.colorMode === "mono" ? e = 3 : d.colorMode === "cyberpunk" && (e = 4);
        const s = Z.current;
        c.uniform1i(s.u_video_texture || null, 0), c.uniform1i(s.u_atlas_texture || null, 1), c.uniform1f(s.u_cols || null, b), c.uniform1f(s.u_rows || null, r), c.uniform1f(s.u_char_count || null, _.length), c.uniform1f(s.u_brightness || null, d.brightness), c.uniform1f(s.u_contrast || null, d.contrast), c.uniform1f(s.u_saturation || null, d.saturation), c.uniform1i(s.u_color_mode || null, e), c.uniform1i(s.u_use_sequence || null, d.customDensity ? 1 : 0);
        const g = H.current;
        g !== -1 && (c.enableVertexAttribArray(g), c.bindBuffer(c.ARRAY_BUFFER, B.current), c.vertexAttribPointer(g, 2, c.FLOAT, !1, 0, 0)), c.drawArrays(c.TRIANGLES, 0, 6);
      } else {
        const e = G.current;
        if (e) {
          const s = p.width, g = p.height, { ctx: E } = te(b, r);
          if (E) {
            E.drawImage(a, 0, 0, b, r);
            const o = E.getImageData(0, 0, b, r).data;
            e.fillStyle = "#010101", e.fillRect(0, 0, s, g);
            const l = d.brightness, n = d.contrast, y = d.saturation, m = de.current, T = ce.current, x = J.current;
            for (let w = 0; w < 256; w++) {
              let R = w;
              l !== 1 && (R *= l), n !== 1 && (R = (R - 128) * n + 128), m[w] = Math.max(0, Math.min(255, Math.floor(R))), T[w] = w * y, x[w] = w * (1 - y);
            }
            e.font = `bold ${d.fontSize}px "JetBrains Mono", "Fira Code", Courier, monospace`, e.textAlign = "center", e.textBaseline = "middle";
            let L = "";
            const F = _.length, v = d.colorMode, V = (w, R, oe) => {
              const $ = Math.min(255, w >> 4 << 4), Re = Math.min(255, R >> 4 << 4), A = Math.min(255, oe >> 4 << 4), he = $ >> 4 << 8 | Re >> 4 << 4 | A >> 4;
              let ne = Y.current.get(he);
              return ne || (ne = `rgb(${$},${Re},${A})`, Y.current.set(he, ne)), ne;
            };
            for (let w = 0; w < r; w++) {
              const R = w * N + N / 2;
              for (let oe = 0; oe < b; oe++) {
                const $ = (w * b + oe) * 4, Re = o[$], A = o[$ + 1], he = o[$ + 2], ne = m[Re], Ee = m[A], pe = m[he];
                let _e = ne, me = Ee, xe = pe;
                if (y !== 1) {
                  const C = ne * 77 + Ee * 150 + pe * 29 >> 8;
                  _e = Math.max(0, Math.min(255, Math.floor(T[ne] + x[C]))), me = Math.max(0, Math.min(255, Math.floor(T[Ee] + x[C]))), xe = Math.max(0, Math.min(255, Math.floor(T[pe] + x[C])));
                }
                const be = _e * 77 + me * 150 + xe * 29 >> 8, Ce = be * F >> 8, we = _[Ce] || _[F - 1];
                if (we === " ")
                  continue;
                let z = "#FFFFFF";
                if (v === "rgb")
                  z = V(_e, me, xe);
                else if (v === "green") {
                  const C = Math.max(0, Math.min(255, 50 + (be * 205 >> 8)));
                  z = V(0, C, 30);
                } else if (v === "amber") {
                  const C = Math.max(0, Math.min(255, be));
                  z = V(C, Math.max(0, Math.min(255, C * 166 >> 8)), 0);
                } else if (v === "mono") {
                  const C = Math.max(0, Math.min(255, be));
                  z = V(C, C, C);
                } else if (v === "cyberpunk") {
                  const C = be / 255 * 0.6 + w / r * 0.4, S = Math.max(0, Math.min(255, Math.floor(0 * (1 - C) + 255 * C))), ge = Math.max(0, Math.min(255, Math.floor(240 * (1 - C) + 10 * C))), ve = Math.max(0, Math.min(255, Math.floor(255 * (1 - C) + 160 * C)));
                  z = V(S, ge, ve);
                }
                z !== L && (e.fillStyle = z, L = z), e.fillText(we, oe * W + W / 2, R);
              }
            }
          }
        }
      }
    }, t = requestAnimationFrame(() => {
      u();
    });
    return () => cancelAnimationFrame(t);
  }, [a, d, le]), /* @__PURE__ */ f(
    "canvas",
    {
      id: "ascii-image-display-canvas",
      ref: O,
      className: `absolute inset-0 w-full h-full pointer-events-none select-none bg-transparent ${h}`
    }
  );
}, et = We(({
  fontSize: a = 7,
  colorMode: d = "rgb",
  densityPreset: h = "standard",
  customDensity: fe = "",
  brightness: le = 1.15,
  contrast: O = 1.1,
  saturation: X = 1.25,
  pdhThreshold: q = 18,
  className: B = "",
  imageClassName: k = "",
  canvasClassName: P = "",
  asciiOpacity: se = 1,
  imageOpacity: Z = 0,
  hoverFontSize: H = 2,
  hoverSaturation: j = 1,
  src: ee,
  alt: M = "",
  crossOrigin: K = "anonymous",
  style: G,
  onLoad: Y,
  ...de
}, ce) => {
  const J = i(null), I = i(null);
  Ve(ce, () => J.current);
  const [te, u] = ue(!1), [t, p] = ue(16 / 9), [c, D] = ue(!1), [W, N] = ue(0), r = {
    fontSize: te ? H : a,
    colorMode: d,
    densityPreset: h,
    customDensity: fe,
    brightness: le,
    contrast: O,
    saturation: te ? j : X,
    enableDeltaRendering: !1,
    pdhThreshold: q,
    asciiOpacity: se,
    videoOpacity: Z
  }, e = (s) => {
    const g = s.currentTarget;
    g.naturalWidth && g.naturalHeight && p(g.naturalWidth / g.naturalHeight), D(!0), N((E) => E + 1), Y && Y(s);
  };
  return ae(() => {
    const s = J.current;
    s && s.complete && s.naturalWidth > 0 && (p(s.naturalWidth / s.naturalHeight), D(!0), N((g) => g + 1));
  }, []), /* @__PURE__ */ ie(
    "div",
    {
      ref: I,
      onMouseEnter: () => u(!0),
      onMouseLeave: () => u(!1),
      className: `relative rounded-xl overflow-hidden bg-[#050505] border border-white/10 group select-none transition-all duration-300 flex items-center justify-center ${B}`,
      style: {
        aspectRatio: `${t}`,
        width: "100%",
        ...G
      },
      children: [
        /* @__PURE__ */ f(
          "img",
          {
            ref: J,
            src: ee,
            alt: M,
            crossOrigin: K,
            onLoad: e,
            style: { opacity: Z },
            className: `absolute inset-0 w-full h-full object-cover select-none bg-black transition-opacity duration-300 pointer-events-none ${k}`,
            ...de
          }
        ),
        c && /* @__PURE__ */ f(
          "div",
          {
            className: `absolute inset-0 w-full h-full pointer-events-none select-none transition-opacity duration-300 ${P}`,
            style: { opacity: se },
            children: /* @__PURE__ */ f(
              Ze,
              {
                imageElement: J.current,
                settings: r,
                triggerRender: W
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
