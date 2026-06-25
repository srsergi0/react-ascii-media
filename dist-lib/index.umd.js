(function(se,s){typeof exports=="object"&&typeof module<"u"?s(exports,require("react/jsx-runtime"),require("react")):typeof define=="function"&&define.amd?define(["exports","react/jsx-runtime","react"],s):(se=typeof globalThis<"u"?globalThis:se||self,s(se.ReactAsciiMedia={},se.jsxRuntime,se.React))})(this,(function(se,s,r){"use strict";const We=({videoElement:c,videoSrc:d,settings:m,className:fe="",onDimensionsUpdate:te})=>{const re=r.useRef(null),I=r.useRef(null),B=r.useRef(null),k=r.useRef(null),X=r.useRef(null),F=r.useRef(null),G=r.useRef(null),ae=r.useRef(-1),j=r.useRef(null),K=r.useRef({}),oe=r.useRef(-1),W=r.useRef(null),M=r.useRef(0),J=r.useRef(!1),V=r.useRef(!1),ce=r.useRef(d),ie=r.useRef(null),Q=r.useRef(!0),D=r.useRef(8),Z=r.useRef(6),A=r.useRef(null),x=r.useRef(null),t=r.useRef(null),y=r.useRef(new Map),i=r.useRef(new Uint8Array(256)),N=r.useRef(new Float32Array(256)),O=r.useRef(new Float32Array(256)),P=()=>{if(m.customDensity)return m.customDensity.split("");switch(m.densityPreset){case"blocks":return[" ","░","▒","▓","█"];case"binary":return[" ","0","1"];case"matrix":return[" ","•","▰","▱","▲","▼","◄","►","◈","▣","▤","▥","▦","▧","▨","▩","█"];case"detailed":return" .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$".split("");case"math":return" +-\\/*=%()<>[]{}#&@".split("");case"braille":return[" ","⠁","⠃","⠇","⡇","⣇","⣧","⣷","⣿"];case"stars":return[" ",".","*","+","✦","★","✵","✹","✺"];case"cards":return[" ","♣","♦","♥","♠"];case"alphanumeric":return" 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");case"standard":default:return" .:-=+*#%@".split("")}},h=(o,e)=>(A.current?(A.current.width!==o||A.current.height!==e)&&(A.current.width=o,A.current.height=e):(A.current=document.createElement("canvas"),A.current.width=o,A.current.height=e,x.current=A.current.getContext("2d",{willReadFrequently:!1})),{canvas:A.current,ctx:x.current});return r.useEffect(()=>{const o=re.current;if(!o)return;let e=null;try{e=o.getContext("webgl",{alpha:!0,depth:!1,antialias:!1,preserveDrawingBuffer:!0})||o.getContext("experimental-webgl",{alpha:!0,depth:!1,antialias:!1,preserveDrawingBuffer:!0})}catch(R){console.warn("WebGL initialization failed, falling back to 2D Canvas.",R)}if(!e){t.current=o.getContext("2d");return}I.current=e;const u=`
      attribute vec2 a_position;
      varying vec2 v_texCoord;

      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `,f=`
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
    `,U=(R,w)=>{const L=e.createShader(w);return L?(e.shaderSource(L,R),e.compileShader(L),e.getShaderParameter(L,e.COMPILE_STATUS)?L:(console.error("Shader compilation error:",e.getShaderInfoLog(L)),e.deleteShader(L),null)):null},v=U(u,e.VERTEX_SHADER),n=U(f,e.FRAGMENT_SHADER);if(!v||!n)return;const l=e.createProgram();if(!l)return;if(e.attachShader(l,v),e.attachShader(l,n),e.linkProgram(l),!e.getProgramParameter(l,e.LINK_STATUS)){console.error("Shader program linking error:",e.getProgramInfoLog(l));return}B.current=l,K.current={u_video_texture:e.getUniformLocation(l,"u_video_texture"),u_prev_video_texture:e.getUniformLocation(l,"u_prev_video_texture"),u_atlas_texture:e.getUniformLocation(l,"u_atlas_texture"),u_cols:e.getUniformLocation(l,"u_cols"),u_rows:e.getUniformLocation(l,"u_rows"),u_char_count:e.getUniformLocation(l,"u_char_count"),u_brightness:e.getUniformLocation(l,"u_brightness"),u_contrast:e.getUniformLocation(l,"u_contrast"),u_saturation:e.getUniformLocation(l,"u_saturation"),u_color_mode:e.getUniformLocation(l,"u_color_mode"),u_use_sequence:e.getUniformLocation(l,"u_use_sequence"),u_transition_progress:e.getUniformLocation(l,"u_transition_progress"),u_has_prev_texture:e.getUniformLocation(l,"u_has_prev_texture")},oe.current=e.getAttribLocation(l,"a_position");const a=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,a),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),e.STATIC_DRAW),k.current=a;const b=e.createTexture();e.bindTexture(e.TEXTURE_2D,b),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),X.current=b;const T=e.createTexture();e.bindTexture(e.TEXTURE_2D,T),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),F.current=T;const p=e.createTexture();return e.bindTexture(e.TEXTURE_2D,p),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),W.current=p,()=>{const R=I.current;R&&(k.current&&R.deleteBuffer(k.current),X.current&&R.deleteTexture(X.current),F.current&&R.deleteTexture(F.current),W.current&&R.deleteTexture(W.current),B.current&&R.deleteProgram(B.current)),I.current=null,t.current=null}},[]),r.useEffect(()=>{ie.current=null,Q.current=!0;const o=I.current,e=re.current;if(!e)return;const u=m.fontSize*.6,f=m.fontSize,U=P();if(o&&F.current){const l=U.length,a=48,b=Math.ceil(a*.6),T=document.createElement("canvas");T.width=l*b,T.height=a;const p=T.getContext("2d");if(p){p.clearRect(0,0,T.width,T.height),p.fillStyle="#FFFFFF",p.textAlign="center",p.textBaseline="middle",p.font=`bold ${a}px "Fira Code", "Courier New", Courier, monospace`;for(let R=0;R<l;R++){const w=U[R],L=R*b+b/2,E=a/2;p.fillText(w,L,E)}o.activeTexture(o.TEXTURE1),o.bindTexture(o.TEXTURE_2D,F.current),o.pixelStorei(o.UNPACK_FLIP_Y_WEBGL,0),o.texImage2D(o.TEXTURE_2D,0,o.RGBA,o.RGBA,o.UNSIGNED_BYTE,T),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MIN_FILTER,o.LINEAR),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MAG_FILTER,o.LINEAR)}}t.current&&y.current.clear();const v=()=>{const l=e.getBoundingClientRect(),a=Math.min(1.5,window.devicePixelRatio||1),b=Math.floor(l.width)||(c==null?void 0:c.videoWidth)||640,T=Math.floor(l.height)||(c==null?void 0:c.videoHeight)||360;e.width=b*a,e.height=T*a,D.current=Math.max(8,Math.floor(e.width/u)),Z.current=Math.max(6,Math.floor(e.height/f)),o&&o.viewport(0,0,e.width,e.height),te&&te(b,T)};v();const n=new ResizeObserver(()=>{v()});return n.observe(e),G.current=n,()=>{n.disconnect()}},[c,m]),r.useEffect(()=>{if(d!==ce.current){const o=I.current;if(o&&W.current&&c&&c.readyState>=2)try{o.activeTexture(o.TEXTURE2),o.bindTexture(o.TEXTURE_2D,W.current),o.pixelStorei(o.UNPACK_FLIP_Y_WEBGL,1),o.texImage2D(o.TEXTURE_2D,0,o.RGBA,o.RGBA,o.UNSIGNED_BYTE,c),V.current=!0,J.current=!1}catch(e){console.warn("Failed to capture old video frame for transition:",e)}ce.current=d}},[d,c]),r.useEffect(()=>{if(!c)return;let o=!0,e=null;const u=(n,l,a)=>{const b=Math.min(255,n>>4<<4),T=Math.min(255,l>>4<<4),p=Math.min(255,a>>4<<4),R=b>>4<<8|T>>4<<4|p>>4;let w=y.current.get(R);return w||(w=`rgb(${b},${T},${p})`,y.current.set(R,w)),w},f=()=>{if(!o)return;const n=re.current;if(!n)return;const l=c.currentTime;if(l===ae.current&&!c.paused&&!J.current&&!V.current)return;ae.current=l;const a=I.current,b=B.current,T=m.fontSize*.6,p=m.fontSize,R=P(),w=D.current,L=Z.current;if(a&&b&&X.current&&k.current){a.viewport(0,0,n.width,n.height),a.clearColor(0,0,0,0),a.clear(a.COLOR_BUFFER_BIT),a.useProgram(b),c.readyState>=2&&(a.activeTexture(a.TEXTURE0),a.bindTexture(a.TEXTURE_2D,X.current),a.pixelStorei(a.UNPACK_FLIP_Y_WEBGL,1),a.texImage2D(a.TEXTURE_2D,0,a.RGBA,a.RGBA,a.UNSIGNED_BYTE,c));let E=1,z=0;if(V.current)c.readyState>=2?(V.current=!1,J.current=!0,M.current=performance.now(),E=0,z=1):(E=0,z=1);else if(J.current){const H=performance.now()-M.current;E=Math.min(1,H/800),z=1,E>=1&&(J.current=!1,z=0)}z===1&&W.current&&(a.activeTexture(a.TEXTURE2),a.bindTexture(a.TEXTURE_2D,W.current)),a.activeTexture(a.TEXTURE1),a.bindTexture(a.TEXTURE_2D,F.current);let Y=0;m.colorMode==="green"?Y=1:m.colorMode==="amber"?Y=2:m.colorMode==="mono"?Y=3:m.colorMode==="cyberpunk"&&(Y=4);const g=K.current;a.uniform1i(g.u_video_texture||null,0),a.uniform1i(g.u_prev_video_texture||null,2),a.uniform1i(g.u_atlas_texture||null,1),a.uniform1f(g.u_cols||null,w),a.uniform1f(g.u_rows||null,L),a.uniform1f(g.u_char_count||null,R.length),a.uniform1f(g.u_brightness||null,m.brightness),a.uniform1f(g.u_contrast||null,m.contrast),a.uniform1f(g.u_saturation||null,m.saturation),a.uniform1i(g.u_color_mode||null,Y),a.uniform1i(g.u_use_sequence||null,m.customDensity?1:0),a.uniform1f(g.u_transition_progress||null,E),a.uniform1i(g.u_has_prev_texture||null,z);const $=oe.current;$!==-1&&(a.enableVertexAttribArray($),a.bindBuffer(a.ARRAY_BUFFER,k.current),a.vertexAttribPointer($,2,a.FLOAT,!1,0,0)),a.drawArrays(a.TRIANGLES,0,6)}else{const E=t.current;if(E){const z=n.width,Y=n.height,{ctx:g}=h(w,L);if(g){g.drawImage(c,0,0,w,L);const H=g.getImageData(0,0,w,L).data,le=w*L*4,S=ie.current,de=!S||S.length!==le||Q.current||!m.enableDeltaRendering;de&&(E.fillStyle="#010101",E.fillRect(0,0,z,Y),m.enableDeltaRendering&&(ie.current=new Uint8Array(H)),Q.current=!1);const Re=m.brightness,ne=m.contrast,pe=m.saturation,he=i.current,_e=N.current,me=O.current;for(let _=0;_<256;_++){let ge=_;Re!==1&&(ge*=Re),ne!==1&&(ge=(ge-128)*ne+128),he[_]=Math.max(0,Math.min(255,Math.floor(ge))),_e[_]=_*pe,me[_]=_*(1-pe)}let be=`bold ${m.fontSize}px "JetBrains Mono", "Fira Code", Courier, monospace`;E.font=be,E.textAlign="center",E.textBaseline="middle";let ue="";const we=R.length,xe=m.colorMode,ee=!!m.customDensity;for(let _=0;_<L;_++){const ge=_*p+p/2;for(let ve=0;ve<w;ve++){const q=(_*w+ve)*4,ye=H[q],Ce=H[q+1],Me=H[q+2];if(!de&&m.enableDeltaRendering&&S){const C=S[q],Pe=S[q+1],Ie=S[q+2];if(Math.abs(ye-C)+Math.abs(Ce-Pe)+Math.abs(Me-Ie)<m.pdhThreshold)continue}de||(E.fillStyle="#010101",E.fillRect(ve*T-.2,_*p-.2,T+.4,p+.4),ue="#010101");const Ue=he[ye],Le=he[Ce],Se=he[Me];let Ae=Ue,Fe=Le,De=Se;if(pe!==1){const C=Ue*77+Le*150+Se*29>>8;Ae=Math.max(0,Math.min(255,Math.floor(_e[Ue]+me[C]))),Fe=Math.max(0,Math.min(255,Math.floor(_e[Le]+me[C]))),De=Math.max(0,Math.min(255,Math.floor(_e[Se]+me[C])))}const Ee=Ae*77+Fe*150+De*29>>8,$e=ee?(_*w+ve)%we:Ee*we>>8,ke=R[$e]||R[we-1];if(ke===" "){m.enableDeltaRendering&&S&&(S[q]=ye,S[q+1]=Ce,S[q+2]=Me);continue}ee?E.globalAlpha=Ee/255:E.globalAlpha=1;let Te="#FFFFFF";if(xe==="rgb")Te=u(Ae,Fe,De);else if(xe==="green"){const C=Math.max(0,Math.min(255,50+(Ee*205>>8)));Te=u(0,C,30)}else if(xe==="amber"){const C=Math.max(0,Math.min(255,Ee));Te=u(C,Math.max(0,Math.min(255,C*166>>8)),0)}else if(xe==="mono"){const C=Math.max(0,Math.min(255,Ee));Te=u(C,C,C)}else if(xe==="cyberpunk"){const C=Ee/255*.6+_/L*.4,Pe=Math.max(0,Math.min(255,Math.floor(0*(1-C)+255*C))),Ie=Math.max(0,Math.min(255,Math.floor(240*(1-C)+10*C))),Ge=Math.max(0,Math.min(255,Math.floor(255*(1-C)+160*C)));Te=u(Pe,Ie,Ge)}Te!==ue&&(E.fillStyle=Te,ue=Te);const He=ve*T+T/2,je=ge;E.fillText(ke,He,je),m.enableDeltaRendering&&S&&(S[q]=ye,S[q+1]=Ce,S[q+2]=Me)}}ee&&(E.globalAlpha=1)}}}};(()=>{if("requestVideoFrameCallback"in c){const n=()=>{f(),o&&(e=c.requestVideoFrameCallback(n))};e=c.requestVideoFrameCallback(n)}else{const n=()=>{f(),o&&(j.current=requestAnimationFrame(n))};j.current=requestAnimationFrame(n)}})(),f();const v=()=>{f()};return c.addEventListener("seeked",v),()=>{o=!1,c.removeEventListener("seeked",v),e!==null&&"cancelVideoFrameCallback"in c&&c.cancelVideoFrameCallback(e),j.current!==null&&cancelAnimationFrame(j.current)}},[c,m]),s.jsx("canvas",{id:"ascii-display-canvas",ref:re,className:`absolute inset-0 w-full h-full pointer-events-none select-none bg-transparent ${fe}`})},Xe=({className:c="w-4 h-4",fill:d="none"})=>s.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:d,stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",className:c,children:s.jsx("polygon",{points:"6 3 20 12 6 21 6 3"})}),Ve=({className:c="w-4 h-4",fill:d="none"})=>s.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:d,stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",className:c,children:[s.jsx("rect",{x:"14",y:"4",width:"4",height:"16",rx:"1"}),s.jsx("rect",{x:"6",y:"4",width:"4",height:"16",rx:"1"})]}),Oe=({className:c="w-4 h-4"})=>s.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",className:c,children:[s.jsx("polygon",{points:"11 5 6 9 2 9 2 15 6 15 11 19 11 5"}),s.jsx("path",{d:"M15.54 8.46a5 5 0 0 1 0 7.07"}),s.jsx("path",{d:"M19.07 4.93a10 10 0 0 1 0 14.14"})]}),ze=({className:c="w-4 h-4"})=>s.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",className:c,children:[s.jsx("polygon",{points:"11 5 6 9 2 9 2 15 6 15 11 19 11 5"}),s.jsx("line",{x1:"22",y1:"9",x2:"16",y2:"15"}),s.jsx("line",{x1:"16",y1:"9",x2:"22",y2:"15"})]}),qe=({className:c="w-4 h-4"})=>s.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",className:c,children:[s.jsx("polyline",{points:"15 3 21 3 21 9"}),s.jsx("polyline",{points:"9 21 3 21 3 15"}),s.jsx("line",{x1:"21",y1:"3",x2:"14",y2:"10"}),s.jsx("line",{x1:"3",y1:"21",x2:"10",y2:"14"})]}),Ne=r.forwardRef(({fontSize:c=7,colorMode:d="rgb",densityPreset:m="standard",customDensity:fe="",brightness:te=1.15,contrast:re=1.1,saturation:I=1.25,pdhThreshold:B=18,className:k="",videoClassName:X="",canvasClassName:F="",asciiOpacity:G=1,videoOpacity:ae=0,customControls:j=!1,src:K,autoPlay:oe,loop:W,muted:M,playsInline:J=!0,crossOrigin:V="anonymous",style:ce,...ie},Q)=>{const D=r.useRef(null),Z=r.useRef(null);r.useImperativeHandle(Q,()=>D.current);const A={fontSize:c,colorMode:d,densityPreset:m,customDensity:fe,brightness:te,contrast:re,saturation:I,enableDeltaRendering:!0,pdhThreshold:B,asciiOpacity:G,videoOpacity:ae},[x,t]=r.useState(!1),[y,i]=r.useState(!!M),[N,O]=r.useState(0),[P,h]=r.useState(16/9),[o,e]=r.useState(!1);r.useEffect(()=>{const n=D.current;if(!n)return;const l=()=>t(!0),a=()=>t(!1),b=()=>i(n.muted),T=()=>{n.duration&&O(n.currentTime/n.duration*100)},p=()=>{n.videoWidth&&n.videoHeight&&h(n.videoWidth/n.videoHeight)};return n.addEventListener("play",l),n.addEventListener("pause",a),n.addEventListener("volumechange",b),n.addEventListener("timeupdate",T),n.addEventListener("loadedmetadata",p),t(!n.paused),i(n.muted),()=>{n.removeEventListener("play",l),n.removeEventListener("pause",a),n.removeEventListener("volumechange",b),n.removeEventListener("timeupdate",T),n.removeEventListener("loadedmetadata",p)}},[]),r.useEffect(()=>{const n=D.current;n&&K&&(n.src=K,n.load(),oe&&n.play().catch(()=>{}))},[K,oe]),r.useEffect(()=>{const n=D.current;n&&(n.muted=!!M,i(!!M))},[M]);const u=()=>{const n=D.current;n&&(n.paused?n.play().catch(()=>{}):n.pause())},f=n=>{n.stopPropagation();const l=D.current;l&&(l.muted=!l.muted,i(l.muted))},U=n=>{n.stopPropagation();const l=D.current;if(!l||!l.duration)return;const a=n.currentTarget.getBoundingClientRect(),T=(n.clientX-a.left)/a.width;l.currentTime=T*l.duration},v=n=>{n.stopPropagation(),Z.current&&(document.fullscreenElement?document.exitFullscreen().catch(()=>{}):Z.current.requestFullscreen().catch(()=>{}))};return s.jsxs("div",{ref:Z,onMouseEnter:()=>e(!0),onMouseLeave:()=>e(!1),className:`relative rounded-xl overflow-hidden bg-[#050505] border border-white/10 group select-none transition-all duration-300 flex items-center justify-center ${k}`,style:{aspectRatio:`${P}`,width:"100%",...ce},children:[s.jsx("video",{ref:D,crossOrigin:V,playsInline:J,loop:W,autoPlay:oe,muted:y,style:{opacity:ae},className:`absolute inset-0 w-full h-full object-cover select-none bg-black transition-opacity duration-300 pointer-events-none ${X}`,...ie}),s.jsx("div",{className:`absolute inset-0 w-full h-full pointer-events-none select-none transition-opacity duration-300 ${F}`,style:{opacity:G},children:s.jsx(We,{videoElement:D.current,videoSrc:K,settings:A})}),j?s.jsxs(s.Fragment,{children:[s.jsx("div",{onClick:u,className:"absolute inset-0 z-10 cursor-pointer flex items-center justify-center bg-black/0 active:bg-black/10 transition-colors"}),!x&&s.jsx("div",{onClick:u,className:"absolute z-20 w-14 h-14 rounded-full border border-white/25 flex items-center justify-center backdrop-blur-md shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer",style:{backgroundColor:"rgba(18,18,18,0.9)",color:"#00FF94"},children:s.jsx(Xe,{className:"w-5 h-5 stroke-none translate-x-[2px]",fill:"currentColor"})}),s.jsxs("div",{className:`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex flex-col gap-3 transition-opacity duration-300 z-20 ${o||!x?"opacity-100":"opacity-0 pointer-events-none"}`,children:[s.jsx("div",{onClick:U,className:"w-full h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer relative group/progress transition-all hover:h-2",children:s.jsx("div",{className:"absolute top-0 left-0 bottom-0 rounded-full shadow-[0_0_8px_rgba(0,255,148,0.6)]",style:{width:`${N}%`,backgroundColor:"#00FF94"}})}),s.jsxs("div",{className:"flex items-center justify-between",children:[s.jsxs("div",{className:"flex items-center gap-3",children:[s.jsx("button",{type:"button",onClick:u,className:"p-1.5 rounded-md hover:bg-white/10 text-white transition-colors",children:x?s.jsx(Ve,{className:"w-4 h-4 fill-white",fill:"currentColor"}):s.jsx(Xe,{className:"w-4 h-4 stroke-none",fill:"#00FF94"})}),s.jsx("button",{type:"button",onClick:f,className:"p-1.5 rounded-md hover:bg-white/10 text-white transition-colors",children:y?s.jsx(ze,{className:"w-4 h-4"}):s.jsx(Oe,{className:"w-4 h-4"})})]}),s.jsx("div",{className:"flex items-center gap-3",children:s.jsx("button",{type:"button",onClick:v,className:"p-1.5 rounded-md hover:bg-white/10 text-white transition-colors",children:s.jsx(qe,{className:"w-4 h-4"})})})]})]})]}):!j&&ie.controls&&s.jsx("div",{className:"absolute bottom-2 right-2 z-20 bg-black/60 px-2 py-1 rounded border border-white/10 text-[9px] font-mono text-white/60",children:"*Use customControls prop for styled overlay controls"})]})});Ne.displayName="CodeVideo";const Ye=({imageElement:c,settings:d,className:m="",onDimensionsUpdate:fe,onFirstRender:te,triggerRender:re=0})=>{const I=r.useRef(null),B=r.useRef(null),k=r.useRef(null),X=r.useRef(null),F=r.useRef(null),G=r.useRef(null),ae=r.useRef(null),j=r.useRef({}),K=r.useRef(-1),oe=r.useRef(8),W=r.useRef(6),M=r.useRef(null),J=r.useRef(null),V=r.useRef(null),ce=r.useRef(new Map),ie=r.useRef(new Uint8Array(256)),Q=r.useRef(new Float32Array(256)),D=r.useRef(new Float32Array(256)),Z=()=>{if(d.customDensity)return d.customDensity.split("");switch(d.densityPreset){case"blocks":return[" ","░","▒","▓","█"];case"binary":return[" ","0","1"];case"matrix":return[" ","•","▰","▱","▲","▼","◄","►","◈","▣","▤","▥","▦","▧","▨","▩","█"];case"detailed":return" .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$".split("");case"math":return" +-\\/*=%()<>[]{}#&@".split("");case"braille":return[" ","⠁","⠃","⠇","⡇","⣇","⣧","⣷","⣿"];case"stars":return[" ",".","*","+","✦","★","✵","✹","✺"];case"cards":return[" ","♣","♦","♥","♠"];case"alphanumeric":return" 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");case"standard":default:return" .:-=+*#%@".split("")}},A=(x,t)=>(M.current?(M.current.width!==x||M.current.height!==t)&&(M.current.width=x,M.current.height=t):(M.current=document.createElement("canvas"),M.current.width=x,M.current.height=t,J.current=M.current.getContext("2d",{willReadFrequently:!1})),{canvas:M.current,ctx:J.current});return r.useEffect(()=>{const x=I.current;if(!x)return;let t=null;try{t=x.getContext("webgl",{alpha:!1,depth:!1,antialias:!1,preserveDrawingBuffer:!0})||x.getContext("experimental-webgl",{alpha:!1,depth:!1,antialias:!1,preserveDrawingBuffer:!0})}catch(f){console.warn("WebGL initialization failed, falling back to 2D Canvas.",f)}if(!t){V.current=x.getContext("2d");return}B.current=t;const y=`
      attribute vec2 a_position;
      varying vec2 v_texCoord;

      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `,i=`
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
    `,N=(f,U)=>{const v=t.createShader(U);return v?(t.shaderSource(v,f),t.compileShader(v),t.getShaderParameter(v,t.COMPILE_STATUS)?v:(console.error("Shader compilation error:",t.getShaderInfoLog(v)),t.deleteShader(v),null)):null},O=N(y,t.VERTEX_SHADER),P=N(i,t.FRAGMENT_SHADER);if(!O||!P)return;const h=t.createProgram();if(!h)return;if(t.attachShader(h,O),t.attachShader(h,P),t.linkProgram(h),!t.getProgramParameter(h,t.LINK_STATUS)){console.error("Shader program linking error:",t.getProgramInfoLog(h));return}k.current=h,j.current={u_video_texture:t.getUniformLocation(h,"u_video_texture"),u_atlas_texture:t.getUniformLocation(h,"u_atlas_texture"),u_cols:t.getUniformLocation(h,"u_cols"),u_rows:t.getUniformLocation(h,"u_rows"),u_char_count:t.getUniformLocation(h,"u_char_count"),u_brightness:t.getUniformLocation(h,"u_brightness"),u_contrast:t.getUniformLocation(h,"u_contrast"),u_saturation:t.getUniformLocation(h,"u_saturation"),u_color_mode:t.getUniformLocation(h,"u_color_mode"),u_use_sequence:t.getUniformLocation(h,"u_use_sequence")},K.current=t.getAttribLocation(h,"a_position");const o=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,o),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),t.STATIC_DRAW),X.current=o;const e=t.createTexture();t.bindTexture(t.TEXTURE_2D,e),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST),F.current=e;const u=t.createTexture();return t.bindTexture(t.TEXTURE_2D,u),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST),G.current=u,()=>{const f=B.current;f&&(X.current&&f.deleteBuffer(X.current),F.current&&f.deleteTexture(F.current),G.current&&f.deleteTexture(G.current),k.current&&f.deleteProgram(k.current)),B.current=null,V.current=null}},[]),r.useEffect(()=>{const x=B.current,t=I.current;if(!t)return;const y=d.fontSize*.6,i=d.fontSize,N=Z();if(x&&G.current){const h=N.length,o=document.createElement("canvas");o.width=Math.ceil(h*y),o.height=Math.ceil(i);const e=o.getContext("2d");if(e){e.clearRect(0,0,o.width,o.height),e.fillStyle="#FFFFFF",e.font=`bold ${d.fontSize}px "JetBrains Mono", "Fira Code", Courier, monospace`,e.textAlign="center",e.textBaseline="middle";for(let u=0;u<h;u++){const f=N[u],U=u*y+y/2,v=i/2;e.fillText(f,U,v)}x.activeTexture(x.TEXTURE1),x.bindTexture(x.TEXTURE_2D,G.current),x.pixelStorei(x.UNPACK_FLIP_Y_WEBGL,0),x.texImage2D(x.TEXTURE_2D,0,x.RGBA,x.RGBA,x.UNSIGNED_BYTE,o)}}V.current&&ce.current.clear();const O=()=>{const h=t.getBoundingClientRect(),o=Math.min(1.5,window.devicePixelRatio||1),e=Math.floor(h.width)||(c==null?void 0:c.naturalWidth)||640,u=Math.floor(h.height)||(c==null?void 0:c.naturalHeight)||360;t.width=e*o,t.height=u*o,oe.current=Math.max(8,Math.floor(t.width/y)),W.current=Math.max(6,Math.floor(t.height/i)),x&&x.viewport(0,0,t.width,t.height),fe&&fe(e,u)};O();const P=new ResizeObserver(()=>{O()});return P.observe(t),ae.current=P,()=>{P.disconnect()}},[c,d,re]),r.useEffect(()=>{if(!c||!c.complete||c.naturalHeight===0)return;const x=()=>{const y=I.current;if(!y)return;const i=B.current,N=k.current,O=d.fontSize*.6,P=d.fontSize,h=Z(),o=oe.current,e=W.current;if(i&&N&&F.current&&X.current){i.viewport(0,0,y.width,y.height),i.clearColor(.0196,.0196,.0196,1),i.clear(i.COLOR_BUFFER_BIT),i.useProgram(N),i.activeTexture(i.TEXTURE0),i.bindTexture(i.TEXTURE_2D,F.current),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,1),i.texImage2D(i.TEXTURE_2D,0,i.RGBA,i.RGBA,i.UNSIGNED_BYTE,c),i.activeTexture(i.TEXTURE1),i.bindTexture(i.TEXTURE_2D,G.current);let u=0;d.colorMode==="green"?u=1:d.colorMode==="amber"?u=2:d.colorMode==="mono"?u=3:d.colorMode==="cyberpunk"&&(u=4);const f=j.current;i.uniform1i(f.u_video_texture||null,0),i.uniform1i(f.u_atlas_texture||null,1),i.uniform1f(f.u_cols||null,o),i.uniform1f(f.u_rows||null,e),i.uniform1f(f.u_char_count||null,h.length),i.uniform1f(f.u_brightness||null,d.brightness),i.uniform1f(f.u_contrast||null,d.contrast),i.uniform1f(f.u_saturation||null,d.saturation),i.uniform1i(f.u_color_mode||null,u),i.uniform1i(f.u_use_sequence||null,d.customDensity?1:0);const U=K.current;U!==-1&&(i.enableVertexAttribArray(U),i.bindBuffer(i.ARRAY_BUFFER,X.current),i.vertexAttribPointer(U,2,i.FLOAT,!1,0,0)),i.drawArrays(i.TRIANGLES,0,6),te&&te()}else{const u=V.current;if(u){const f=y.width,U=y.height,{ctx:v}=A(o,e);if(v){v.drawImage(c,0,0,o,e);const l=v.getImageData(0,0,o,e).data;u.fillStyle="#010101",u.fillRect(0,0,f,U);const a=d.brightness,b=d.contrast,T=d.saturation,p=ie.current,R=Q.current,w=D.current;for(let g=0;g<256;g++){let $=g;a!==1&&($*=a),b!==1&&($=($-128)*b+128),p[g]=Math.max(0,Math.min(255,Math.floor($))),R[g]=g*T,w[g]=g*(1-T)}u.font=`bold ${d.fontSize}px "JetBrains Mono", "Fira Code", Courier, monospace`,u.textAlign="center",u.textBaseline="middle";let L="";const E=h.length,z=d.colorMode,Y=(g,$,H)=>{const le=Math.min(255,g>>4<<4),S=Math.min(255,$>>4<<4),de=Math.min(255,H>>4<<4),Re=le>>4<<8|S>>4<<4|de>>4;let ne=ce.current.get(Re);return ne||(ne=`rgb(${le},${S},${de})`,ce.current.set(Re,ne)),ne};for(let g=0;g<e;g++){const $=g*P+P/2;for(let H=0;H<o;H++){const le=(g*o+H)*4,S=l[le],de=l[le+1],Re=l[le+2],ne=p[S],pe=p[de],he=p[Re];let _e=ne,me=pe,be=he;if(T!==1){const _=ne*77+pe*150+he*29>>8;_e=Math.max(0,Math.min(255,Math.floor(R[ne]+w[_]))),me=Math.max(0,Math.min(255,Math.floor(R[pe]+w[_]))),be=Math.max(0,Math.min(255,Math.floor(R[he]+w[_])))}const ue=_e*77+me*150+be*29>>8,we=ue*E>>8,xe=h[we]||h[E-1];if(xe===" ")continue;let ee="#FFFFFF";if(z==="rgb")ee=Y(_e,me,be);else if(z==="green"){const _=Math.max(0,Math.min(255,50+(ue*205>>8)));ee=Y(0,_,30)}else if(z==="amber"){const _=Math.max(0,Math.min(255,ue));ee=Y(_,Math.max(0,Math.min(255,_*166>>8)),0)}else if(z==="mono"){const _=Math.max(0,Math.min(255,ue));ee=Y(_,_,_)}else if(z==="cyberpunk"){const _=ue/255*.6+g/e*.4,ge=Math.max(0,Math.min(255,Math.floor(0*(1-_)+255*_))),ve=Math.max(0,Math.min(255,Math.floor(240*(1-_)+10*_))),q=Math.max(0,Math.min(255,Math.floor(255*(1-_)+160*_)));ee=Y(ge,ve,q)}ee!==L&&(u.fillStyle=ee,L=ee),u.fillText(xe,H*O+O/2,$)}}}}te&&te()}},t=requestAnimationFrame(()=>{x()});return()=>cancelAnimationFrame(t)},[c,d,re]),s.jsx("canvas",{id:"ascii-image-display-canvas",ref:I,className:`absolute inset-0 w-full h-full pointer-events-none select-none bg-transparent ${m}`})},Be=r.forwardRef(({fontSize:c=7,colorMode:d="rgb",densityPreset:m="standard",customDensity:fe="",brightness:te=1.15,contrast:re=1.1,saturation:I=1.25,pdhThreshold:B=18,className:k="",imageClassName:X="",canvasClassName:F="",asciiOpacity:G=1,imageOpacity:ae=0,hoverFontSize:j=2,hoverSaturation:K=1,src:oe,alt:W="",crossOrigin:M="anonymous",style:J,onLoad:V,...ce},ie)=>{const Q=r.useRef(null),D=r.useRef(null);r.useImperativeHandle(ie,()=>Q.current);const[Z,A]=r.useState(!1),[x,t]=r.useState(16/9),[y,i]=r.useState(!1),[N,O]=r.useState(!1),[P,h]=r.useState(0),u={fontSize:Z?j:c,colorMode:d,densityPreset:m,customDensity:fe,brightness:te,contrast:re,saturation:Z?K:I,enableDeltaRendering:!1,pdhThreshold:B,asciiOpacity:G,videoOpacity:ae},f=v=>{const n=v.currentTarget;n.naturalWidth&&n.naturalHeight&&t(n.naturalWidth/n.naturalHeight),i(!0),h(l=>l+1),V&&V(v)},U=()=>{O(!0)};return r.useEffect(()=>{const v=Q.current;v&&v.complete&&v.naturalWidth>0&&(t(v.naturalWidth/v.naturalHeight),i(!0),h(n=>n+1))},[]),s.jsxs("div",{ref:D,onMouseEnter:()=>A(!0),onMouseLeave:()=>A(!1),className:`relative rounded-xl overflow-hidden bg-[#050505] border border-white/10 group select-none transition-all duration-300 flex items-center justify-center ${k}`,style:{aspectRatio:`${x}`,width:"100%",...J},children:[s.jsx("img",{ref:Q,src:oe,alt:W,crossOrigin:M,onLoad:f,style:{opacity:N?ae:0},className:`absolute inset-0 w-full h-full object-cover select-none bg-black transition-opacity duration-300 pointer-events-none ${X}`,...ce}),y&&s.jsx("div",{className:`absolute inset-0 w-full h-full pointer-events-none select-none transition-opacity duration-300 ${F}`,style:{opacity:N?G:0},children:s.jsx(Ye,{imageElement:Q.current,settings:u,triggerRender:P,onFirstRender:U})})]})});Be.displayName="CodeImage",se.CodeImage=Be,se.CodeVideo=Ne,Object.defineProperty(se,Symbol.toStringTag,{value:"Module"})}));
//# sourceMappingURL=index.umd.js.map
