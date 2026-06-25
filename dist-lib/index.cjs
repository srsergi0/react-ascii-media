"use strict";Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"});const l=require("react/jsx-runtime"),o=require("react"),Ve=({videoElement:c,videoSrc:d,settings:h,className:se="",onDimensionsUpdate:ce})=>{const O=o.useRef(null),X=o.useRef(null),z=o.useRef(null),B=o.useRef(null),k=o.useRef(null),P=o.useRef(null),ie=o.useRef(null),Z=o.useRef(-1),$=o.useRef(null),H=o.useRef({}),ee=o.useRef(-1),M=o.useRef(null),K=o.useRef(0),j=o.useRef(!1),q=o.useRef(!1),le=o.useRef(d),ae=o.useRef(null),J=o.useRef(!0),I=o.useRef(8),te=o.useRef(6),f=o.useRef(null),t=o.useRef(null),p=o.useRef(null),i=o.useRef(new Map),A=o.useRef(new Uint8Array(256)),G=o.useRef(new Float32Array(256)),N=o.useRef(new Float32Array(256)),_=()=>{if(h.customDensity)return h.customDensity.split("");switch(h.densityPreset){case"blocks":return[" ","░","▒","▓","█"];case"binary":return[" ","0","1"];case"matrix":return[" ","•","▰","▱","▲","▼","◄","►","◈","▣","▤","▥","▦","▧","▨","▩","█"];case"detailed":return" .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$".split("");case"math":return" +-\\/*=%()<>[]{}#&@".split("");case"braille":return[" ","⠁","⠃","⠇","⡇","⣇","⣧","⣷","⣿"];case"stars":return[" ",".","*","+","✦","★","✵","✹","✺"];case"cards":return[" ","♣","♦","♥","♠"];case"alphanumeric":return" 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");case"standard":default:return" .:-=+*#%@".split("")}},E=(r,e)=>(f.current?(f.current.width!==r||f.current.height!==e)&&(f.current.width=r,f.current.height=e):(f.current=document.createElement("canvas"),f.current.width=r,f.current.height=e,t.current=f.current.getContext("2d",{willReadFrequently:!1})),{canvas:f.current,ctx:t.current});return o.useEffect(()=>{const r=O.current;if(!r)return;let e=null;try{e=r.getContext("webgl",{alpha:!0,depth:!1,antialias:!1,preserveDrawingBuffer:!0})||r.getContext("experimental-webgl",{alpha:!0,depth:!1,antialias:!1,preserveDrawingBuffer:!0})}catch(x){console.warn("WebGL initialization failed, falling back to 2D Canvas.",x)}if(!e){p.current=r.getContext("2d");return}X.current=e;const u=`
      attribute vec2 a_position;
      varying vec2 v_texCoord;

      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `,g=`
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
    `,b=(x,L)=>{const S=e.createShader(L);return S?(e.shaderSource(S,x),e.compileShader(S),e.getShaderParameter(S,e.COMPILE_STATUS)?S:(console.error("Shader compilation error:",e.getShaderInfoLog(S)),e.deleteShader(S),null)):null},re=b(u,e.VERTEX_SHADER),n=b(g,e.FRAGMENT_SHADER);if(!re||!n)return;const s=e.createProgram();if(!s)return;if(e.attachShader(s,re),e.attachShader(s,n),e.linkProgram(s),!e.getProgramParameter(s,e.LINK_STATUS)){console.error("Shader program linking error:",e.getProgramInfoLog(s));return}z.current=s,H.current={u_video_texture:e.getUniformLocation(s,"u_video_texture"),u_prev_video_texture:e.getUniformLocation(s,"u_prev_video_texture"),u_atlas_texture:e.getUniformLocation(s,"u_atlas_texture"),u_cols:e.getUniformLocation(s,"u_cols"),u_rows:e.getUniformLocation(s,"u_rows"),u_char_count:e.getUniformLocation(s,"u_char_count"),u_brightness:e.getUniformLocation(s,"u_brightness"),u_contrast:e.getUniformLocation(s,"u_contrast"),u_saturation:e.getUniformLocation(s,"u_saturation"),u_color_mode:e.getUniformLocation(s,"u_color_mode"),u_use_sequence:e.getUniformLocation(s,"u_use_sequence"),u_transition_progress:e.getUniformLocation(s,"u_transition_progress"),u_has_prev_texture:e.getUniformLocation(s,"u_has_prev_texture")},ee.current=e.getAttribLocation(s,"a_position");const a=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,a),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),e.STATIC_DRAW),B.current=a;const y=e.createTexture();e.bindTexture(e.TEXTURE_2D,y),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),k.current=y;const m=e.createTexture();e.bindTexture(e.TEXTURE_2D,m),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),P.current=m;const v=e.createTexture();return e.bindTexture(e.TEXTURE_2D,v),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),M.current=v,()=>{const x=X.current;x&&(B.current&&x.deleteBuffer(B.current),k.current&&x.deleteTexture(k.current),P.current&&x.deleteTexture(P.current),M.current&&x.deleteTexture(M.current),z.current&&x.deleteProgram(z.current)),X.current=null,p.current=null}},[]),o.useEffect(()=>{ae.current=null,J.current=!0;const r=X.current,e=O.current;if(!e)return;const u=h.fontSize*.6,g=h.fontSize,b=_();if(r&&P.current){const s=b.length,a=48,y=Math.ceil(a*.6),m=document.createElement("canvas");m.width=s*y,m.height=a;const v=m.getContext("2d");if(v){v.clearRect(0,0,m.width,m.height),v.fillStyle="#FFFFFF",v.textAlign="center",v.textBaseline="middle",v.font=`bold ${a}px "Fira Code", "Courier New", Courier, monospace`;for(let x=0;x<s;x++){const L=b[x],S=x*y+y/2,R=a/2;v.fillText(L,S,R)}r.activeTexture(r.TEXTURE1),r.bindTexture(r.TEXTURE_2D,P.current),r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,0),r.texImage2D(r.TEXTURE_2D,0,r.RGBA,r.RGBA,r.UNSIGNED_BYTE,m),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,r.LINEAR),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MAG_FILTER,r.LINEAR)}}p.current&&i.current.clear();const re=()=>{const s=e.getBoundingClientRect(),a=Math.min(1.5,window.devicePixelRatio||1),y=Math.floor(s.width)||(c==null?void 0:c.videoWidth)||640,m=Math.floor(s.height)||(c==null?void 0:c.videoHeight)||360;e.width=y*a,e.height=m*a,I.current=Math.max(8,Math.floor(e.width/u)),te.current=Math.max(6,Math.floor(e.height/g)),r&&r.viewport(0,0,e.width,e.height),ce&&ce(y,m)};re();const n=new ResizeObserver(()=>{re()});return n.observe(e),ie.current=n,()=>{n.disconnect()}},[c,h]),o.useEffect(()=>{if(d!==le.current){const r=X.current;if(r&&M.current&&c&&c.readyState>=2)try{r.activeTexture(r.TEXTURE2),r.bindTexture(r.TEXTURE_2D,M.current),r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,1),r.texImage2D(r.TEXTURE_2D,0,r.RGBA,r.RGBA,r.UNSIGNED_BYTE,c),q.current=!0,j.current=!1}catch(e){console.warn("Failed to capture old video frame for transition:",e)}le.current=d}},[d,c]),o.useEffect(()=>{if(!c)return;let r=!0,e=null;const u=(n,s,a)=>{const y=Math.min(255,n>>4<<4),m=Math.min(255,s>>4<<4),v=Math.min(255,a>>4<<4),x=y>>4<<8|m>>4<<4|v>>4;let L=i.current.get(x);return L||(L=`rgb(${y},${m},${v})`,i.current.set(x,L)),L},g=()=>{if(!r)return;const n=O.current;if(!n)return;const s=c.currentTime;if(s===Z.current&&!c.paused&&!j.current&&!q.current)return;Z.current=s;const a=X.current,y=z.current,m=h.fontSize*.6,v=h.fontSize,x=_(),L=I.current,S=te.current;if(a&&y&&k.current&&B.current){a.viewport(0,0,n.width,n.height),a.clearColor(0,0,0,0),a.clear(a.COLOR_BUFFER_BIT),a.useProgram(y),c.readyState>=2&&(a.activeTexture(a.TEXTURE0),a.bindTexture(a.TEXTURE_2D,k.current),a.pixelStorei(a.UNPACK_FLIP_Y_WEBGL,1),a.texImage2D(a.TEXTURE_2D,0,a.RGBA,a.RGBA,a.UNSIGNED_BYTE,c));let R=1,W=0;if(q.current)c.readyState>=2?(q.current=!1,j.current=!0,K.current=performance.now(),R=0,W=1):(R=0,W=1);else if(j.current){const Y=performance.now()-K.current;R=Math.min(1,Y/800),W=1,R>=1&&(j.current=!1,W=0)}W===1&&M.current&&(a.activeTexture(a.TEXTURE2),a.bindTexture(a.TEXTURE_2D,M.current)),a.activeTexture(a.TEXTURE1),a.bindTexture(a.TEXTURE_2D,P.current);let w=0;h.colorMode==="green"?w=1:h.colorMode==="amber"?w=2:h.colorMode==="mono"?w=3:h.colorMode==="cyberpunk"&&(w=4);const T=H.current;a.uniform1i(T.u_video_texture||null,0),a.uniform1i(T.u_prev_video_texture||null,2),a.uniform1i(T.u_atlas_texture||null,1),a.uniform1f(T.u_cols||null,L),a.uniform1f(T.u_rows||null,S),a.uniform1f(T.u_char_count||null,x.length),a.uniform1f(T.u_brightness||null,h.brightness),a.uniform1f(T.u_contrast||null,h.contrast),a.uniform1f(T.u_saturation||null,h.saturation),a.uniform1i(T.u_color_mode||null,w),a.uniform1i(T.u_use_sequence||null,h.customDensity?1:0),a.uniform1f(T.u_transition_progress||null,R),a.uniform1i(T.u_has_prev_texture||null,W);const oe=ee.current;oe!==-1&&(a.enableVertexAttribArray(oe),a.bindBuffer(a.ARRAY_BUFFER,B.current),a.vertexAttribPointer(oe,2,a.FLOAT,!1,0,0)),a.drawArrays(a.TRIANGLES,0,6)}else{const R=p.current;if(R){const W=n.width,w=n.height,{ctx:T}=E(L,S);if(T){T.drawImage(c,0,0,L,S);const Y=T.getImageData(0,0,L,S).data,ge=L*S*4,F=ae.current,ue=!F||F.length!==ge||J.current||!h.enableDeltaRendering;ue&&(R.fillStyle="#010101",R.fillRect(0,0,W,w),h.enableDeltaRendering&&(ae.current=new Uint8Array(Y)),J.current=!1);const ne=h.brightness,Te=h.contrast,Re=h.saturation,fe=A.current,de=G.current,he=N.current;for(let D=0;D<256;D++){let _e=D;ne!==1&&(_e*=ne),Te!==1&&(_e=(_e-128)*Te+128),fe[D]=Math.max(0,Math.min(255,Math.floor(_e))),de[D]=D*Re,he[D]=D*(1-Re)}let ve=`bold ${h.fontSize}px "JetBrains Mono", "Fira Code", Courier, monospace`;R.font=ve,R.textAlign="center",R.textBaseline="middle";let be="";const pe=x.length,V=h.colorMode,C=!!h.customDensity;for(let D=0;D<S;D++){const _e=D*v+v/2;for(let me=0;me<L;me++){const Q=(D*L+me)*4,we=Y[Q],ye=Y[Q+1],Ce=Y[Q+2];if(!ue&&h.enableDeltaRendering&&F){const U=F[Q],De=F[Q+1],Pe=F[Q+2];if(Math.abs(we-U)+Math.abs(ye-De)+Math.abs(Ce-Pe)<h.pdhThreshold)continue}ue||(R.fillStyle="#010101",R.fillRect(me*m-.2,D*v-.2,m+.4,v+.4),be="#010101");const Me=fe[we],Ue=fe[ye],Le=fe[Ce];let Se=Me,Fe=Ue,Ae=Le;if(Re!==1){const U=Me*77+Ue*150+Le*29>>8;Se=Math.max(0,Math.min(255,Math.floor(de[Me]+he[U]))),Fe=Math.max(0,Math.min(255,Math.floor(de[Ue]+he[U]))),Ae=Math.max(0,Math.min(255,Math.floor(de[Le]+he[U])))}const Ee=Se*77+Fe*150+Ae*29>>8,je=C?(D*L+me)%pe:Ee*pe>>8,Ie=x[je]||x[pe-1];if(Ie===" "){h.enableDeltaRendering&&F&&(F[Q]=we,F[Q+1]=ye,F[Q+2]=Ce);continue}C?R.globalAlpha=Ee/255:R.globalAlpha=1;let xe="#FFFFFF";if(V==="rgb")xe=u(Se,Fe,Ae);else if(V==="green"){const U=Math.max(0,Math.min(255,50+(Ee*205>>8)));xe=u(0,U,30)}else if(V==="amber"){const U=Math.max(0,Math.min(255,Ee));xe=u(U,Math.max(0,Math.min(255,U*166>>8)),0)}else if(V==="mono"){const U=Math.max(0,Math.min(255,Ee));xe=u(U,U,U)}else if(V==="cyberpunk"){const U=Ee/255*.6+D/S*.4,De=Math.max(0,Math.min(255,Math.floor(0*(1-U)+255*U))),Pe=Math.max(0,Math.min(255,Math.floor(240*(1-U)+10*U))),Xe=Math.max(0,Math.min(255,Math.floor(255*(1-U)+160*U)));xe=u(De,Pe,Xe)}xe!==be&&(R.fillStyle=xe,be=xe);const Ge=me*m+m/2,We=_e;R.fillText(Ie,Ge,We),h.enableDeltaRendering&&F&&(F[Q]=we,F[Q+1]=ye,F[Q+2]=Ce)}}C&&(R.globalAlpha=1)}}}};(()=>{if("requestVideoFrameCallback"in c){const n=()=>{g(),r&&(e=c.requestVideoFrameCallback(n))};e=c.requestVideoFrameCallback(n)}else{const n=()=>{g(),r&&($.current=requestAnimationFrame(n))};$.current=requestAnimationFrame(n)}})(),g();const re=()=>{g()};return c.addEventListener("seeked",re),()=>{r=!1,c.removeEventListener("seeked",re),e!==null&&"cancelVideoFrameCallback"in c&&c.cancelVideoFrameCallback(e),$.current!==null&&cancelAnimationFrame($.current)}},[c,h]),l.jsx("canvas",{id:"ascii-display-canvas",ref:O,className:`absolute inset-0 w-full h-full pointer-events-none select-none bg-transparent ${se}`})},Ne=({className:c="w-4 h-4",fill:d="none"})=>l.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:d,stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",className:c,children:l.jsx("polygon",{points:"6 3 20 12 6 21 6 3"})}),Oe=({className:c="w-4 h-4",fill:d="none"})=>l.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:d,stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",className:c,children:[l.jsx("rect",{x:"14",y:"4",width:"4",height:"16",rx:"1"}),l.jsx("rect",{x:"6",y:"4",width:"4",height:"16",rx:"1"})]}),ze=({className:c="w-4 h-4"})=>l.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",className:c,children:[l.jsx("polygon",{points:"11 5 6 9 2 9 2 15 6 15 11 19 11 5"}),l.jsx("path",{d:"M15.54 8.46a5 5 0 0 1 0 7.07"}),l.jsx("path",{d:"M19.07 4.93a10 10 0 0 1 0 14.14"})]}),qe=({className:c="w-4 h-4"})=>l.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",className:c,children:[l.jsx("polygon",{points:"11 5 6 9 2 9 2 15 6 15 11 19 11 5"}),l.jsx("line",{x1:"22",y1:"9",x2:"16",y2:"15"}),l.jsx("line",{x1:"16",y1:"9",x2:"22",y2:"15"})]}),Ye=({className:c="w-4 h-4"})=>l.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",className:c,children:[l.jsx("polyline",{points:"15 3 21 3 21 9"}),l.jsx("polyline",{points:"9 21 3 21 3 15"}),l.jsx("line",{x1:"21",y1:"3",x2:"14",y2:"10"}),l.jsx("line",{x1:"3",y1:"21",x2:"10",y2:"14"})]}),Be=o.forwardRef(({fontSize:c=7,colorMode:d="rgb",densityPreset:h="standard",customDensity:se="",brightness:ce=1.15,contrast:O=1.1,saturation:X=1.25,pdhThreshold:z=18,className:B="",videoClassName:k="",canvasClassName:P="",asciiOpacity:ie=1,videoOpacity:Z=0,customControls:$=!1,src:H,autoPlay:ee,loop:M,muted:K,playsInline:j=!0,crossOrigin:q="anonymous",style:le,...ae},J)=>{const I=o.useRef(null),te=o.useRef(null);o.useImperativeHandle(J,()=>I.current);const f={fontSize:c,colorMode:d,densityPreset:h,customDensity:se,brightness:ce,contrast:O,saturation:X,enableDeltaRendering:!0,pdhThreshold:z,asciiOpacity:ie,videoOpacity:Z},[t,p]=o.useState(!1),[i,A]=o.useState(!!K),[G,N]=o.useState(0),[_,E]=o.useState(16/9),[r,e]=o.useState(!1);o.useEffect(()=>{const n=I.current;if(!n)return;const s=()=>p(!0),a=()=>p(!1),y=()=>A(n.muted),m=()=>{n.duration&&N(n.currentTime/n.duration*100)},v=()=>{n.videoWidth&&n.videoHeight&&E(n.videoWidth/n.videoHeight)};return n.addEventListener("play",s),n.addEventListener("pause",a),n.addEventListener("volumechange",y),n.addEventListener("timeupdate",m),n.addEventListener("loadedmetadata",v),p(!n.paused),A(n.muted),()=>{n.removeEventListener("play",s),n.removeEventListener("pause",a),n.removeEventListener("volumechange",y),n.removeEventListener("timeupdate",m),n.removeEventListener("loadedmetadata",v)}},[]),o.useEffect(()=>{const n=I.current;n&&H&&(n.src=H,n.load(),ee&&n.play().catch(()=>{}))},[H,ee]),o.useEffect(()=>{const n=I.current;n&&(n.muted=!!K,A(!!K))},[K]);const u=()=>{const n=I.current;n&&(n.paused?n.play().catch(()=>{}):n.pause())},g=n=>{n.stopPropagation();const s=I.current;s&&(s.muted=!s.muted,A(s.muted))},b=n=>{n.stopPropagation();const s=I.current;if(!s||!s.duration)return;const a=n.currentTarget.getBoundingClientRect(),m=(n.clientX-a.left)/a.width;s.currentTime=m*s.duration},re=n=>{n.stopPropagation(),te.current&&(document.fullscreenElement?document.exitFullscreen().catch(()=>{}):te.current.requestFullscreen().catch(()=>{}))};return l.jsxs("div",{ref:te,onMouseEnter:()=>e(!0),onMouseLeave:()=>e(!1),className:`relative rounded-xl overflow-hidden bg-[#050505] border border-white/10 group select-none transition-all duration-300 flex items-center justify-center ${B}`,style:{aspectRatio:`${_}`,width:"100%",...le},children:[l.jsx("video",{ref:I,crossOrigin:q,playsInline:j,loop:M,autoPlay:ee,muted:i,style:{opacity:Z},className:`absolute inset-0 w-full h-full object-cover select-none bg-black transition-opacity duration-300 pointer-events-none ${k}`,...ae}),l.jsx("div",{className:`absolute inset-0 w-full h-full pointer-events-none select-none transition-opacity duration-300 ${P}`,style:{opacity:ie},children:l.jsx(Ve,{videoElement:I.current,videoSrc:H,settings:f})}),$?l.jsxs(l.Fragment,{children:[l.jsx("div",{onClick:u,className:"absolute inset-0 z-10 cursor-pointer flex items-center justify-center bg-black/0 active:bg-black/10 transition-colors"}),!t&&l.jsx("div",{onClick:u,className:"absolute z-20 w-14 h-14 rounded-full border border-white/25 flex items-center justify-center backdrop-blur-md shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer",style:{backgroundColor:"rgba(18,18,18,0.9)",color:"#00FF94"},children:l.jsx(Ne,{className:"w-5 h-5 stroke-none translate-x-[2px]",fill:"currentColor"})}),l.jsxs("div",{className:`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex flex-col gap-3 transition-opacity duration-300 z-20 ${r||!t?"opacity-100":"opacity-0 pointer-events-none"}`,children:[l.jsx("div",{onClick:b,className:"w-full h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer relative group/progress transition-all hover:h-2",children:l.jsx("div",{className:"absolute top-0 left-0 bottom-0 rounded-full shadow-[0_0_8px_rgba(0,255,148,0.6)]",style:{width:`${G}%`,backgroundColor:"#00FF94"}})}),l.jsxs("div",{className:"flex items-center justify-between",children:[l.jsxs("div",{className:"flex items-center gap-3",children:[l.jsx("button",{type:"button",onClick:u,className:"p-1.5 rounded-md hover:bg-white/10 text-white transition-colors",children:t?l.jsx(Oe,{className:"w-4 h-4 fill-white",fill:"currentColor"}):l.jsx(Ne,{className:"w-4 h-4 stroke-none",fill:"#00FF94"})}),l.jsx("button",{type:"button",onClick:g,className:"p-1.5 rounded-md hover:bg-white/10 text-white transition-colors",children:i?l.jsx(qe,{className:"w-4 h-4"}):l.jsx(ze,{className:"w-4 h-4"})})]}),l.jsx("div",{className:"flex items-center gap-3",children:l.jsx("button",{type:"button",onClick:re,className:"p-1.5 rounded-md hover:bg-white/10 text-white transition-colors",children:l.jsx(Ye,{className:"w-4 h-4"})})})]})]})]}):!$&&ae.controls&&l.jsx("div",{className:"absolute bottom-2 right-2 z-20 bg-black/60 px-2 py-1 rounded border border-white/10 text-[9px] font-mono text-white/60",children:"*Use customControls prop for styled overlay controls"})]})});Be.displayName="CodeVideo";const $e=({imageElement:c,settings:d,className:h="",onDimensionsUpdate:se,triggerRender:ce=0})=>{const O=o.useRef(null),X=o.useRef(null),z=o.useRef(null),B=o.useRef(null),k=o.useRef(null),P=o.useRef(null),ie=o.useRef(null),Z=o.useRef({}),$=o.useRef(-1),H=o.useRef(8),ee=o.useRef(6),M=o.useRef(null),K=o.useRef(null),j=o.useRef(null),q=o.useRef(new Map),le=o.useRef(new Uint8Array(256)),ae=o.useRef(new Float32Array(256)),J=o.useRef(new Float32Array(256)),I=()=>{if(d.customDensity)return d.customDensity.split("");switch(d.densityPreset){case"blocks":return[" ","░","▒","▓","█"];case"binary":return[" ","0","1"];case"matrix":return[" ","•","▰","▱","▲","▼","◄","►","◈","▣","▤","▥","▦","▧","▨","▩","█"];case"detailed":return" .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$".split("");case"math":return" +-\\/*=%()<>[]{}#&@".split("");case"braille":return[" ","⠁","⠃","⠇","⡇","⣇","⣧","⣷","⣿"];case"stars":return[" ",".","*","+","✦","★","✵","✹","✺"];case"cards":return[" ","♣","♦","♥","♠"];case"alphanumeric":return" 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");case"standard":default:return" .:-=+*#%@".split("")}},te=(f,t)=>(M.current?(M.current.width!==f||M.current.height!==t)&&(M.current.width=f,M.current.height=t):(M.current=document.createElement("canvas"),M.current.width=f,M.current.height=t,K.current=M.current.getContext("2d",{willReadFrequently:!1})),{canvas:M.current,ctx:K.current});return o.useEffect(()=>{const f=O.current;if(!f)return;let t=null;try{t=f.getContext("webgl",{alpha:!1,depth:!1,antialias:!1,preserveDrawingBuffer:!0})||f.getContext("experimental-webgl",{alpha:!1,depth:!1,antialias:!1,preserveDrawingBuffer:!0})}catch(u){console.warn("WebGL initialization failed, falling back to 2D Canvas.",u)}if(!t){j.current=f.getContext("2d");return}X.current=t;const p=`
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
    `,A=(u,g)=>{const b=t.createShader(g);return b?(t.shaderSource(b,u),t.compileShader(b),t.getShaderParameter(b,t.COMPILE_STATUS)?b:(console.error("Shader compilation error:",t.getShaderInfoLog(b)),t.deleteShader(b),null)):null},G=A(p,t.VERTEX_SHADER),N=A(i,t.FRAGMENT_SHADER);if(!G||!N)return;const _=t.createProgram();if(!_)return;if(t.attachShader(_,G),t.attachShader(_,N),t.linkProgram(_),!t.getProgramParameter(_,t.LINK_STATUS)){console.error("Shader program linking error:",t.getProgramInfoLog(_));return}z.current=_,Z.current={u_video_texture:t.getUniformLocation(_,"u_video_texture"),u_atlas_texture:t.getUniformLocation(_,"u_atlas_texture"),u_cols:t.getUniformLocation(_,"u_cols"),u_rows:t.getUniformLocation(_,"u_rows"),u_char_count:t.getUniformLocation(_,"u_char_count"),u_brightness:t.getUniformLocation(_,"u_brightness"),u_contrast:t.getUniformLocation(_,"u_contrast"),u_saturation:t.getUniformLocation(_,"u_saturation"),u_color_mode:t.getUniformLocation(_,"u_color_mode"),u_use_sequence:t.getUniformLocation(_,"u_use_sequence")},$.current=t.getAttribLocation(_,"a_position");const E=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,E),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),t.STATIC_DRAW),B.current=E;const r=t.createTexture();t.bindTexture(t.TEXTURE_2D,r),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST),k.current=r;const e=t.createTexture();return t.bindTexture(t.TEXTURE_2D,e),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST),P.current=e,()=>{const u=X.current;u&&(B.current&&u.deleteBuffer(B.current),k.current&&u.deleteTexture(k.current),P.current&&u.deleteTexture(P.current),z.current&&u.deleteProgram(z.current)),X.current=null,j.current=null}},[]),o.useEffect(()=>{const f=X.current,t=O.current;if(!t)return;const p=d.fontSize*.6,i=d.fontSize,A=I();if(f&&P.current){const _=A.length,E=document.createElement("canvas");E.width=Math.ceil(_*p),E.height=Math.ceil(i);const r=E.getContext("2d");if(r){r.clearRect(0,0,E.width,E.height),r.fillStyle="#FFFFFF",r.font=`bold ${d.fontSize}px "JetBrains Mono", "Fira Code", Courier, monospace`,r.textAlign="center",r.textBaseline="middle";for(let e=0;e<_;e++){const u=A[e],g=e*p+p/2,b=i/2;r.fillText(u,g,b)}f.activeTexture(f.TEXTURE1),f.bindTexture(f.TEXTURE_2D,P.current),f.pixelStorei(f.UNPACK_FLIP_Y_WEBGL,0),f.texImage2D(f.TEXTURE_2D,0,f.RGBA,f.RGBA,f.UNSIGNED_BYTE,E)}}j.current&&q.current.clear();const G=()=>{const _=t.getBoundingClientRect(),E=Math.min(1.5,window.devicePixelRatio||1),r=Math.floor(_.width)||(c==null?void 0:c.naturalWidth)||640,e=Math.floor(_.height)||(c==null?void 0:c.naturalHeight)||360;t.width=r*E,t.height=e*E,H.current=Math.max(8,Math.floor(t.width/p)),ee.current=Math.max(6,Math.floor(t.height/i)),f&&f.viewport(0,0,t.width,t.height),se&&se(r,e)};G();const N=new ResizeObserver(()=>{G()});return N.observe(t),ie.current=N,()=>{N.disconnect()}},[c,d,ce]),o.useEffect(()=>{if(!c||!c.complete||c.naturalHeight===0)return;const f=()=>{const p=O.current;if(!p)return;const i=X.current,A=z.current,G=d.fontSize*.6,N=d.fontSize,_=I(),E=H.current,r=ee.current;if(i&&A&&k.current&&B.current){i.viewport(0,0,p.width,p.height),i.clearColor(.0196,.0196,.0196,1),i.clear(i.COLOR_BUFFER_BIT),i.useProgram(A),i.activeTexture(i.TEXTURE0),i.bindTexture(i.TEXTURE_2D,k.current),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,1),i.texImage2D(i.TEXTURE_2D,0,i.RGBA,i.RGBA,i.UNSIGNED_BYTE,c),i.activeTexture(i.TEXTURE1),i.bindTexture(i.TEXTURE_2D,P.current);let e=0;d.colorMode==="green"?e=1:d.colorMode==="amber"?e=2:d.colorMode==="mono"?e=3:d.colorMode==="cyberpunk"&&(e=4);const u=Z.current;i.uniform1i(u.u_video_texture||null,0),i.uniform1i(u.u_atlas_texture||null,1),i.uniform1f(u.u_cols||null,E),i.uniform1f(u.u_rows||null,r),i.uniform1f(u.u_char_count||null,_.length),i.uniform1f(u.u_brightness||null,d.brightness),i.uniform1f(u.u_contrast||null,d.contrast),i.uniform1f(u.u_saturation||null,d.saturation),i.uniform1i(u.u_color_mode||null,e),i.uniform1i(u.u_use_sequence||null,d.customDensity?1:0);const g=$.current;g!==-1&&(i.enableVertexAttribArray(g),i.bindBuffer(i.ARRAY_BUFFER,B.current),i.vertexAttribPointer(g,2,i.FLOAT,!1,0,0)),i.drawArrays(i.TRIANGLES,0,6)}else{const e=j.current;if(e){const u=p.width,g=p.height,{ctx:b}=te(E,r);if(b){b.drawImage(c,0,0,E,r);const n=b.getImageData(0,0,E,r).data;e.fillStyle="#010101",e.fillRect(0,0,u,g);const s=d.brightness,a=d.contrast,y=d.saturation,m=le.current,v=ae.current,x=J.current;for(let w=0;w<256;w++){let T=w;s!==1&&(T*=s),a!==1&&(T=(T-128)*a+128),m[w]=Math.max(0,Math.min(255,Math.floor(T))),v[w]=w*y,x[w]=w*(1-y)}e.font=`bold ${d.fontSize}px "JetBrains Mono", "Fira Code", Courier, monospace`,e.textAlign="center",e.textBaseline="middle";let L="";const S=_.length,R=d.colorMode,W=(w,T,oe)=>{const Y=Math.min(255,w>>4<<4),ge=Math.min(255,T>>4<<4),F=Math.min(255,oe>>4<<4),ue=Y>>4<<8|ge>>4<<4|F>>4;let ne=q.current.get(ue);return ne||(ne=`rgb(${Y},${ge},${F})`,q.current.set(ue,ne)),ne};for(let w=0;w<r;w++){const T=w*N+N/2;for(let oe=0;oe<E;oe++){const Y=(w*E+oe)*4,ge=n[Y],F=n[Y+1],ue=n[Y+2],ne=m[ge],Te=m[F],Re=m[ue];let fe=ne,de=Te,he=Re;if(y!==1){const C=ne*77+Te*150+Re*29>>8;fe=Math.max(0,Math.min(255,Math.floor(v[ne]+x[C]))),de=Math.max(0,Math.min(255,Math.floor(v[Te]+x[C]))),he=Math.max(0,Math.min(255,Math.floor(v[Re]+x[C])))}const ve=fe*77+de*150+he*29>>8,be=ve*S>>8,pe=_[be]||_[S-1];if(pe===" ")continue;let V="#FFFFFF";if(R==="rgb")V=W(fe,de,he);else if(R==="green"){const C=Math.max(0,Math.min(255,50+(ve*205>>8)));V=W(0,C,30)}else if(R==="amber"){const C=Math.max(0,Math.min(255,ve));V=W(C,Math.max(0,Math.min(255,C*166>>8)),0)}else if(R==="mono"){const C=Math.max(0,Math.min(255,ve));V=W(C,C,C)}else if(R==="cyberpunk"){const C=ve/255*.6+w/r*.4,D=Math.max(0,Math.min(255,Math.floor(0*(1-C)+255*C))),_e=Math.max(0,Math.min(255,Math.floor(240*(1-C)+10*C))),me=Math.max(0,Math.min(255,Math.floor(255*(1-C)+160*C)));V=W(D,_e,me)}V!==L&&(e.fillStyle=V,L=V),e.fillText(pe,oe*G+G/2,T)}}}}}},t=requestAnimationFrame(()=>{f()});return()=>cancelAnimationFrame(t)},[c,d,ce]),l.jsx("canvas",{id:"ascii-image-display-canvas",ref:O,className:`absolute inset-0 w-full h-full pointer-events-none select-none bg-transparent ${h}`})},ke=o.forwardRef(({fontSize:c=7,colorMode:d="rgb",densityPreset:h="standard",customDensity:se="",brightness:ce=1.15,contrast:O=1.1,saturation:X=1.25,pdhThreshold:z=18,className:B="",imageClassName:k="",canvasClassName:P="",asciiOpacity:ie=1,imageOpacity:Z=0,hoverFontSize:$=2,hoverSaturation:H=1,src:ee,alt:M="",crossOrigin:K,style:j,onLoad:q,...le},ae)=>{const J=o.useRef(null),I=o.useRef(null);o.useImperativeHandle(ae,()=>J.current);const[te,f]=o.useState(!1),[t,p]=o.useState(16/9),[i,A]=o.useState(!1),[G,N]=o.useState(0),r={fontSize:te?$:c,colorMode:d,densityPreset:h,customDensity:se,brightness:ce,contrast:O,saturation:te?H:X,enableDeltaRendering:!1,pdhThreshold:z,asciiOpacity:ie,videoOpacity:Z},e=u=>{const g=u.currentTarget;g.naturalWidth&&g.naturalHeight&&p(g.naturalWidth/g.naturalHeight),A(!0),N(b=>b+1),q&&q(u)};return o.useEffect(()=>{const u=J.current;u&&u.complete&&u.naturalWidth>0&&(p(u.naturalWidth/u.naturalHeight),A(!0),N(g=>g+1))},[]),l.jsxs("div",{ref:I,onMouseEnter:()=>f(!0),onMouseLeave:()=>f(!1),className:`relative rounded-xl overflow-hidden bg-[#050505] border border-white/10 group select-none transition-all duration-300 flex items-center justify-center ${B}`,style:{aspectRatio:`${t}`,width:"100%",...j},children:[l.jsx("img",{ref:J,src:ee,alt:M,crossOrigin:K,onLoad:e,style:{opacity:Z},className:`absolute inset-0 w-full h-full object-cover select-none bg-black transition-opacity duration-300 pointer-events-none ${k}`,...le}),i&&l.jsx("div",{className:`absolute inset-0 w-full h-full pointer-events-none select-none transition-opacity duration-300 ${P}`,style:{opacity:ie},children:l.jsx($e,{imageElement:J.current,settings:r,triggerRender:G})})]})});ke.displayName="CodeImage";exports.CodeImage=ke;exports.CodeVideo=Be;
//# sourceMappingURL=index.cjs.map
