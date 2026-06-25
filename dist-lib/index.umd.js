(function(se,s){typeof exports=="object"&&typeof module<"u"?s(exports,require("react/jsx-runtime"),require("react")):typeof define=="function"&&define.amd?define(["exports","react/jsx-runtime","react"],s):(se=typeof globalThis<"u"?globalThis:se||self,s(se.ReactAsciiMedia={},se.jsxRuntime,se.React))})(this,(function(se,s,r){"use strict";const We=({videoElement:c,videoSrc:d,settings:_,className:fe="",onDimensionsUpdate:ee})=>{const te=r.useRef(null),I=r.useRef(null),k=r.useRef(null),G=r.useRef(null),X=r.useRef(null),D=r.useRef(null),W=r.useRef(null),ae=r.useRef(-1),A=r.useRef(null),K=r.useRef({}),re=r.useRef(-1),V=r.useRef(null),U=r.useRef(0),J=r.useRef(!1),O=r.useRef(!1),ce=r.useRef(d),ie=r.useRef(null),Q=r.useRef(!0),P=r.useRef(8),oe=r.useRef(6),F=r.useRef(null),m=r.useRef(null),t=r.useRef(null),w=r.useRef(new Map),i=r.useRef(new Uint8Array(256)),z=r.useRef(new Float32Array(256)),N=r.useRef(new Float32Array(256)),B=()=>{if(_.customDensity)return _.customDensity.split("");switch(_.densityPreset){case"blocks":return[" ","░","▒","▓","█"];case"binary":return[" ","0","1"];case"matrix":return[" ","•","▰","▱","▲","▼","◄","►","◈","▣","▤","▥","▦","▧","▨","▩","█"];case"detailed":return" .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$".split("");case"math":return" +-\\/*=%()<>[]{}#&@".split("");case"braille":return[" ","⠁","⠃","⠇","⡇","⣇","⣧","⣷","⣿"];case"stars":return[" ",".","*","+","✦","★","✵","✹","✺"];case"cards":return[" ","♣","♦","♥","♠"];case"alphanumeric":return" 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");case"standard":default:return" .:-=+*#%@".split("")}},x=(o,e)=>(F.current?(F.current.width!==o||F.current.height!==e)&&(F.current.width=o,F.current.height=e):(F.current=document.createElement("canvas"),F.current.width=o,F.current.height=e,m.current=F.current.getContext("2d",{willReadFrequently:!1})),{canvas:F.current,ctx:m.current});return r.useEffect(()=>{const o=te.current;if(!o)return;let e=null;try{e=o.getContext("webgl",{alpha:!0,depth:!1,antialias:!1,preserveDrawingBuffer:!0})||o.getContext("experimental-webgl",{alpha:!0,depth:!1,antialias:!1,preserveDrawingBuffer:!0})}catch(T){console.warn("WebGL initialization failed, falling back to 2D Canvas.",T)}if(!e){t.current=o.getContext("2d");return}I.current=e;const f=`
      attribute vec2 a_position;
      varying vec2 v_texCoord;

      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `,u=`
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
    `,E=(T,C)=>{const L=e.createShader(C);return L?(e.shaderSource(L,T),e.compileShader(L),e.getShaderParameter(L,e.COMPILE_STATUS)?L:(console.error("Shader compilation error:",e.getShaderInfoLog(L)),e.deleteShader(L),null)):null},R=E(f,e.VERTEX_SHADER),a=E(u,e.FRAGMENT_SHADER);if(!R||!a)return;const l=e.createProgram();if(!l)return;if(e.attachShader(l,R),e.attachShader(l,a),e.linkProgram(l),!e.getProgramParameter(l,e.LINK_STATUS)){console.error("Shader program linking error:",e.getProgramInfoLog(l));return}k.current=l,K.current={u_video_texture:e.getUniformLocation(l,"u_video_texture"),u_prev_video_texture:e.getUniformLocation(l,"u_prev_video_texture"),u_atlas_texture:e.getUniformLocation(l,"u_atlas_texture"),u_cols:e.getUniformLocation(l,"u_cols"),u_rows:e.getUniformLocation(l,"u_rows"),u_char_count:e.getUniformLocation(l,"u_char_count"),u_brightness:e.getUniformLocation(l,"u_brightness"),u_contrast:e.getUniformLocation(l,"u_contrast"),u_saturation:e.getUniformLocation(l,"u_saturation"),u_color_mode:e.getUniformLocation(l,"u_color_mode"),u_use_sequence:e.getUniformLocation(l,"u_use_sequence"),u_transition_progress:e.getUniformLocation(l,"u_transition_progress"),u_has_prev_texture:e.getUniformLocation(l,"u_has_prev_texture")},re.current=e.getAttribLocation(l,"a_position");const n=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,n),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),e.STATIC_DRAW),G.current=n;const y=e.createTexture();e.bindTexture(e.TEXTURE_2D,y),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),X.current=y;const v=e.createTexture();e.bindTexture(e.TEXTURE_2D,v),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),D.current=v;const p=e.createTexture();return e.bindTexture(e.TEXTURE_2D,p),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),V.current=p,()=>{const T=I.current;T&&(G.current&&T.deleteBuffer(G.current),X.current&&T.deleteTexture(X.current),D.current&&T.deleteTexture(D.current),V.current&&T.deleteTexture(V.current),k.current&&T.deleteProgram(k.current)),I.current=null,t.current=null}},[]),r.useEffect(()=>{ie.current=null,Q.current=!0;const o=I.current,e=te.current;if(!e)return;const f=_.fontSize*.6,u=_.fontSize,E=B();if(o&&D.current){const l=E.length,n=48,y=Math.ceil(n*.6),v=document.createElement("canvas");v.width=l*y,v.height=n;const p=v.getContext("2d");if(p){p.clearRect(0,0,v.width,v.height),p.fillStyle="#FFFFFF",p.textAlign="center",p.textBaseline="middle",p.font=`bold ${n}px "Fira Code", "Courier New", Courier, monospace`;for(let T=0;T<l;T++){const C=E[T],L=T*y+y/2,b=n/2;p.fillText(C,L,b)}o.activeTexture(o.TEXTURE1),o.bindTexture(o.TEXTURE_2D,D.current),o.pixelStorei(o.UNPACK_FLIP_Y_WEBGL,0),o.texImage2D(o.TEXTURE_2D,0,o.RGBA,o.RGBA,o.UNSIGNED_BYTE,v),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MIN_FILTER,o.LINEAR),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MAG_FILTER,o.LINEAR)}}t.current&&w.current.clear();const R=()=>{const l=e.getBoundingClientRect(),n=Math.min(1.5,window.devicePixelRatio||1),y=Math.floor(l.width)||(c==null?void 0:c.videoWidth)||640,v=Math.floor(l.height)||(c==null?void 0:c.videoHeight)||360;e.width=y*n,e.height=v*n,P.current=Math.max(8,Math.floor(e.width/f)),oe.current=Math.max(6,Math.floor(e.height/u)),o&&o.viewport(0,0,e.width,e.height),ee&&ee(y,v)};R();const a=new ResizeObserver(()=>{R()});return a.observe(e),W.current=a,()=>{a.disconnect()}},[c,_]),r.useEffect(()=>{if(d!==ce.current){const o=I.current;if(o&&V.current&&c&&c.readyState>=2)try{o.activeTexture(o.TEXTURE2),o.bindTexture(o.TEXTURE_2D,V.current),o.pixelStorei(o.UNPACK_FLIP_Y_WEBGL,1),o.texImage2D(o.TEXTURE_2D,0,o.RGBA,o.RGBA,o.UNSIGNED_BYTE,c),O.current=!0,J.current=!1}catch(e){console.warn("Failed to capture old video frame for transition:",e)}ce.current=d}},[d,c]),r.useEffect(()=>{if(!c)return;let o=!0,e=null;const f=(a,l,n)=>{const y=Math.min(255,a>>4<<4),v=Math.min(255,l>>4<<4),p=Math.min(255,n>>4<<4),T=y>>4<<8|v>>4<<4|p>>4;let C=w.current.get(T);return C||(C=`rgb(${y},${v},${p})`,w.current.set(T,C)),C},u=()=>{if(!o)return;const a=te.current;if(!a)return;const l=c.currentTime;if(l===ae.current&&!c.paused&&!J.current&&!O.current)return;ae.current=l;const n=I.current,y=k.current,v=_.fontSize*.6,p=_.fontSize,T=B(),C=P.current,L=oe.current;if(n&&y&&X.current&&G.current){n.viewport(0,0,a.width,a.height),n.clearColor(0,0,0,0),n.clear(n.COLOR_BUFFER_BIT),n.useProgram(y),c.readyState>=2&&(n.activeTexture(n.TEXTURE0),n.bindTexture(n.TEXTURE_2D,X.current),n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,1),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,n.RGBA,n.UNSIGNED_BYTE,c));let b=1,q=0;if(O.current)c.readyState>=2?(O.current=!1,J.current=!0,U.current=performance.now(),b=0,q=1):(b=0,q=1);else if(J.current){const H=performance.now()-U.current;b=Math.min(1,H/800),q=1,b>=1&&(J.current=!1,q=0)}q===1&&V.current&&(n.activeTexture(n.TEXTURE2),n.bindTexture(n.TEXTURE_2D,V.current)),n.activeTexture(n.TEXTURE1),n.bindTexture(n.TEXTURE_2D,D.current);let $=0;_.colorMode==="green"?$=1:_.colorMode==="amber"?$=2:_.colorMode==="mono"?$=3:_.colorMode==="cyberpunk"&&($=4);const g=K.current;n.uniform1i(g.u_video_texture||null,0),n.uniform1i(g.u_prev_video_texture||null,2),n.uniform1i(g.u_atlas_texture||null,1),n.uniform1f(g.u_cols||null,C),n.uniform1f(g.u_rows||null,L),n.uniform1f(g.u_char_count||null,T.length),n.uniform1f(g.u_brightness||null,_.brightness),n.uniform1f(g.u_contrast||null,_.contrast),n.uniform1f(g.u_saturation||null,_.saturation),n.uniform1i(g.u_color_mode||null,$),n.uniform1i(g.u_use_sequence||null,_.customDensity?1:0),n.uniform1f(g.u_transition_progress||null,b),n.uniform1i(g.u_has_prev_texture||null,q);const j=re.current;j!==-1&&(n.enableVertexAttribArray(j),n.bindBuffer(n.ARRAY_BUFFER,G.current),n.vertexAttribPointer(j,2,n.FLOAT,!1,0,0)),n.drawArrays(n.TRIANGLES,0,6)}else{const b=t.current;if(b){const q=a.width,$=a.height,{ctx:g}=x(C,L);if(g){g.drawImage(c,0,0,C,L);const H=g.getImageData(0,0,C,L).data,le=C*L*4,S=ie.current,de=!S||S.length!==le||Q.current||!_.enableDeltaRendering;de&&(b.fillStyle="#010101",b.fillRect(0,0,q,$),_.enableDeltaRendering&&(ie.current=new Uint8Array(H)),Q.current=!1);const Re=_.brightness,ne=_.contrast,pe=_.saturation,he=i.current,_e=z.current,me=N.current;for(let h=0;h<256;h++){let ge=h;Re!==1&&(ge*=Re),ne!==1&&(ge=(ge-128)*ne+128),he[h]=Math.max(0,Math.min(255,Math.floor(ge))),_e[h]=h*pe,me[h]=h*(1-pe)}let be=`bold ${_.fontSize}px "JetBrains Mono", "Fira Code", Courier, monospace`;b.font=be,b.textAlign="center",b.textBaseline="middle";let ue="";const we=T.length,xe=_.colorMode,Z=!!_.customDensity;for(let h=0;h<L;h++){const ge=h*p+p/2;for(let ve=0;ve<C;ve++){const Y=(h*C+ve)*4,ye=H[Y],Ce=H[Y+1],Me=H[Y+2];if(!de&&_.enableDeltaRendering&&S){const M=S[Y],Pe=S[Y+1],Ie=S[Y+2];if(Math.abs(ye-M)+Math.abs(Ce-Pe)+Math.abs(Me-Ie)<_.pdhThreshold)continue}de||(b.fillStyle="#010101",b.fillRect(ve*v-.2,h*p-.2,v+.4,p+.4),ue="#010101");const Ue=he[ye],Le=he[Ce],Se=he[Me];let Ae=Ue,Fe=Le,De=Se;if(pe!==1){const M=Ue*77+Le*150+Se*29>>8;Ae=Math.max(0,Math.min(255,Math.floor(_e[Ue]+me[M]))),Fe=Math.max(0,Math.min(255,Math.floor(_e[Le]+me[M]))),De=Math.max(0,Math.min(255,Math.floor(_e[Se]+me[M])))}const Ee=Ae*77+Fe*150+De*29>>8,$e=Z?(h*C+ve)%we:Ee*we>>8,ke=T[$e]||T[we-1];if(ke===" "){_.enableDeltaRendering&&S&&(S[Y]=ye,S[Y+1]=Ce,S[Y+2]=Me);continue}Z?b.globalAlpha=Ee/255:b.globalAlpha=1;let Te="#FFFFFF";if(xe==="rgb")Te=f(Ae,Fe,De);else if(xe==="green"){const M=Math.max(0,Math.min(255,50+(Ee*205>>8)));Te=f(0,M,30)}else if(xe==="amber"){const M=Math.max(0,Math.min(255,Ee));Te=f(M,Math.max(0,Math.min(255,M*166>>8)),0)}else if(xe==="mono"){const M=Math.max(0,Math.min(255,Ee));Te=f(M,M,M)}else if(xe==="cyberpunk"){const M=Ee/255*.6+h/L*.4,Pe=Math.max(0,Math.min(255,Math.floor(0*(1-M)+255*M))),Ie=Math.max(0,Math.min(255,Math.floor(240*(1-M)+10*M))),Ge=Math.max(0,Math.min(255,Math.floor(255*(1-M)+160*M)));Te=f(Pe,Ie,Ge)}Te!==ue&&(b.fillStyle=Te,ue=Te);const je=ve*v+v/2,He=ge;b.fillText(ke,je,He),_.enableDeltaRendering&&S&&(S[Y]=ye,S[Y+1]=Ce,S[Y+2]=Me)}}Z&&(b.globalAlpha=1)}}}};(()=>{if("requestVideoFrameCallback"in c){const a=()=>{u(),o&&(e=c.requestVideoFrameCallback(a))};e=c.requestVideoFrameCallback(a)}else{const a=()=>{u(),o&&(A.current=requestAnimationFrame(a))};A.current=requestAnimationFrame(a)}})(),u();const R=()=>{u()};return c.addEventListener("seeked",R),()=>{o=!1,c.removeEventListener("seeked",R),e!==null&&"cancelVideoFrameCallback"in c&&c.cancelVideoFrameCallback(e),A.current!==null&&cancelAnimationFrame(A.current)}},[c,_]),s.jsx("canvas",{id:"ascii-display-canvas",ref:te,className:`absolute inset-0 w-full h-full pointer-events-none select-none bg-transparent ${fe}`})},Xe=({className:c="w-4 h-4",fill:d="none"})=>s.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:d,stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",className:c,children:s.jsx("polygon",{points:"6 3 20 12 6 21 6 3"})}),Ve=({className:c="w-4 h-4",fill:d="none"})=>s.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:d,stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",className:c,children:[s.jsx("rect",{x:"14",y:"4",width:"4",height:"16",rx:"1"}),s.jsx("rect",{x:"6",y:"4",width:"4",height:"16",rx:"1"})]}),Oe=({className:c="w-4 h-4"})=>s.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",className:c,children:[s.jsx("polygon",{points:"11 5 6 9 2 9 2 15 6 15 11 19 11 5"}),s.jsx("path",{d:"M15.54 8.46a5 5 0 0 1 0 7.07"}),s.jsx("path",{d:"M19.07 4.93a10 10 0 0 1 0 14.14"})]}),ze=({className:c="w-4 h-4"})=>s.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",className:c,children:[s.jsx("polygon",{points:"11 5 6 9 2 9 2 15 6 15 11 19 11 5"}),s.jsx("line",{x1:"22",y1:"9",x2:"16",y2:"15"}),s.jsx("line",{x1:"16",y1:"9",x2:"22",y2:"15"})]}),qe=({className:c="w-4 h-4"})=>s.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",className:c,children:[s.jsx("polyline",{points:"15 3 21 3 21 9"}),s.jsx("polyline",{points:"9 21 3 21 3 15"}),s.jsx("line",{x1:"21",y1:"3",x2:"14",y2:"10"}),s.jsx("line",{x1:"3",y1:"21",x2:"10",y2:"14"})]}),Ne=r.forwardRef(({fontSize:c=7,colorMode:d="rgb",densityPreset:_="standard",customDensity:fe="",brightness:ee=1.15,contrast:te=1.1,saturation:I=1.25,pdhThreshold:k=18,className:G="",videoClassName:X="",canvasClassName:D="",asciiOpacity:W=1,videoOpacity:ae=0,customControls:A=!1,src:K,autoPlay:re,loop:V,muted:U,playsInline:J=!0,crossOrigin:O="anonymous",style:ce,...ie},Q)=>{const P=r.useRef(null),oe=r.useRef(null);r.useImperativeHandle(Q,()=>P.current);const F={fontSize:c,colorMode:d,densityPreset:_,customDensity:fe,brightness:ee,contrast:te,saturation:I,enableDeltaRendering:!0,pdhThreshold:k,asciiOpacity:W,videoOpacity:ae},[m,t]=r.useState(!1),[w,i]=r.useState(!!U),[z,N]=r.useState(0),[B,x]=r.useState(16/9),[o,e]=r.useState(!1);r.useEffect(()=>{const a=P.current;if(!a)return;const l=()=>t(!0),n=()=>t(!1),y=()=>i(a.muted),v=()=>{a.duration&&N(a.currentTime/a.duration*100)},p=()=>{a.videoWidth&&a.videoHeight&&x(a.videoWidth/a.videoHeight)};return a.addEventListener("play",l),a.addEventListener("pause",n),a.addEventListener("volumechange",y),a.addEventListener("timeupdate",v),a.addEventListener("loadedmetadata",p),t(!a.paused),i(a.muted),()=>{a.removeEventListener("play",l),a.removeEventListener("pause",n),a.removeEventListener("volumechange",y),a.removeEventListener("timeupdate",v),a.removeEventListener("loadedmetadata",p)}},[]),r.useEffect(()=>{const a=P.current;a&&K&&(a.src=K,a.load(),re&&a.play().catch(()=>{}))},[K,re]),r.useEffect(()=>{const a=P.current;a&&(a.muted=!!U,i(!!U))},[U]);const f=()=>{const a=P.current;a&&(a.paused?a.play().catch(()=>{}):a.pause())},u=a=>{a.stopPropagation();const l=P.current;l&&(l.muted=!l.muted,i(l.muted))},E=a=>{a.stopPropagation();const l=P.current;if(!l||!l.duration)return;const n=a.currentTarget.getBoundingClientRect(),v=(a.clientX-n.left)/n.width;l.currentTime=v*l.duration},R=a=>{a.stopPropagation(),oe.current&&(document.fullscreenElement?document.exitFullscreen().catch(()=>{}):oe.current.requestFullscreen().catch(()=>{}))};return s.jsxs("div",{ref:oe,onMouseEnter:()=>e(!0),onMouseLeave:()=>e(!1),className:`relative rounded-xl overflow-hidden bg-[#050505] border border-white/10 group select-none transition-all duration-300 flex items-center justify-center ${G}`,style:{aspectRatio:`${B}`,width:"100%",...ce},children:[s.jsx("video",{ref:P,crossOrigin:O,playsInline:J,loop:V,autoPlay:re,muted:w,style:{opacity:ae},className:`absolute inset-0 w-full h-full object-cover select-none bg-black transition-opacity duration-300 pointer-events-none ${X}`,...ie}),s.jsx("div",{className:`absolute inset-0 w-full h-full pointer-events-none select-none transition-opacity duration-300 ${D}`,style:{opacity:W},children:s.jsx(We,{videoElement:P.current,videoSrc:K,settings:F})}),A?s.jsxs(s.Fragment,{children:[s.jsx("div",{onClick:f,className:"absolute inset-0 z-10 cursor-pointer flex items-center justify-center bg-black/0 active:bg-black/10 transition-colors"}),!m&&s.jsx("div",{onClick:f,className:"absolute z-20 w-14 h-14 rounded-full border border-white/25 flex items-center justify-center backdrop-blur-md shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer",style:{backgroundColor:"rgba(18,18,18,0.9)",color:"#00FF94"},children:s.jsx(Xe,{className:"w-5 h-5 stroke-none translate-x-[2px]",fill:"currentColor"})}),s.jsxs("div",{className:`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex flex-col gap-3 transition-opacity duration-300 z-20 ${o||!m?"opacity-100":"opacity-0 pointer-events-none"}`,children:[s.jsx("div",{onClick:E,className:"w-full h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer relative group/progress transition-all hover:h-2",children:s.jsx("div",{className:"absolute top-0 left-0 bottom-0 rounded-full shadow-[0_0_8px_rgba(0,255,148,0.6)]",style:{width:`${z}%`,backgroundColor:"#00FF94"}})}),s.jsxs("div",{className:"flex items-center justify-between",children:[s.jsxs("div",{className:"flex items-center gap-3",children:[s.jsx("button",{type:"button",onClick:f,className:"p-1.5 rounded-md hover:bg-white/10 text-white transition-colors",children:m?s.jsx(Ve,{className:"w-4 h-4 fill-white",fill:"currentColor"}):s.jsx(Xe,{className:"w-4 h-4 stroke-none",fill:"#00FF94"})}),s.jsx("button",{type:"button",onClick:u,className:"p-1.5 rounded-md hover:bg-white/10 text-white transition-colors",children:w?s.jsx(ze,{className:"w-4 h-4"}):s.jsx(Oe,{className:"w-4 h-4"})})]}),s.jsx("div",{className:"flex items-center gap-3",children:s.jsx("button",{type:"button",onClick:R,className:"p-1.5 rounded-md hover:bg-white/10 text-white transition-colors",children:s.jsx(qe,{className:"w-4 h-4"})})})]})]})]}):!A&&ie.controls&&s.jsx("div",{className:"absolute bottom-2 right-2 z-20 bg-black/60 px-2 py-1 rounded border border-white/10 text-[9px] font-mono text-white/60",children:"*Use customControls prop for styled overlay controls"})]})});Ne.displayName="CodeVideo";const Ye=({imageElement:c,settings:d,className:_="",onDimensionsUpdate:fe,onFirstRender:ee,triggerRender:te=0})=>{const I=r.useRef(null),k=r.useRef(null),G=r.useRef(null),X=r.useRef(null),D=r.useRef(null),W=r.useRef(null),ae=r.useRef(null),A=r.useRef({}),K=r.useRef(-1),re=r.useRef(8),V=r.useRef(6),U=r.useRef(null),J=r.useRef(null),O=r.useRef(null),ce=r.useRef(new Map),ie=r.useRef(new Uint8Array(256)),Q=r.useRef(new Float32Array(256)),P=r.useRef(new Float32Array(256)),oe=()=>{if(d.customDensity)return d.customDensity.split("");switch(d.densityPreset){case"blocks":return[" ","░","▒","▓","█"];case"binary":return[" ","0","1"];case"matrix":return[" ","•","▰","▱","▲","▼","◄","►","◈","▣","▤","▥","▦","▧","▨","▩","█"];case"detailed":return" .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$".split("");case"math":return" +-\\/*=%()<>[]{}#&@".split("");case"braille":return[" ","⠁","⠃","⠇","⡇","⣇","⣧","⣷","⣿"];case"stars":return[" ",".","*","+","✦","★","✵","✹","✺"];case"cards":return[" ","♣","♦","♥","♠"];case"alphanumeric":return" 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");case"standard":default:return" .:-=+*#%@".split("")}},F=(m,t)=>(U.current?(U.current.width!==m||U.current.height!==t)&&(U.current.width=m,U.current.height=t):(U.current=document.createElement("canvas"),U.current.width=m,U.current.height=t,J.current=U.current.getContext("2d",{willReadFrequently:!1})),{canvas:U.current,ctx:J.current});return r.useEffect(()=>{const m=I.current;if(!m)return;let t=null;try{t=m.getContext("webgl",{alpha:!1,depth:!1,antialias:!1,preserveDrawingBuffer:!0})||m.getContext("experimental-webgl",{alpha:!1,depth:!1,antialias:!1,preserveDrawingBuffer:!0})}catch(u){console.warn("WebGL initialization failed, falling back to 2D Canvas.",u)}if(!t){O.current=m.getContext("2d");return}k.current=t;const w=`
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
    `,z=(u,E)=>{const R=t.createShader(E);return R?(t.shaderSource(R,u),t.compileShader(R),t.getShaderParameter(R,t.COMPILE_STATUS)?R:(console.error("Shader compilation error:",t.getShaderInfoLog(R)),t.deleteShader(R),null)):null},N=z(w,t.VERTEX_SHADER),B=z(i,t.FRAGMENT_SHADER);if(!N||!B)return;const x=t.createProgram();if(!x)return;if(t.attachShader(x,N),t.attachShader(x,B),t.linkProgram(x),!t.getProgramParameter(x,t.LINK_STATUS)){console.error("Shader program linking error:",t.getProgramInfoLog(x));return}G.current=x,A.current={u_video_texture:t.getUniformLocation(x,"u_video_texture"),u_atlas_texture:t.getUniformLocation(x,"u_atlas_texture"),u_cols:t.getUniformLocation(x,"u_cols"),u_rows:t.getUniformLocation(x,"u_rows"),u_char_count:t.getUniformLocation(x,"u_char_count"),u_brightness:t.getUniformLocation(x,"u_brightness"),u_contrast:t.getUniformLocation(x,"u_contrast"),u_saturation:t.getUniformLocation(x,"u_saturation"),u_color_mode:t.getUniformLocation(x,"u_color_mode"),u_use_sequence:t.getUniformLocation(x,"u_use_sequence")},K.current=t.getAttribLocation(x,"a_position");const o=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,o),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),t.STATIC_DRAW),X.current=o;const e=t.createTexture();t.bindTexture(t.TEXTURE_2D,e),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST),D.current=e;const f=t.createTexture();return t.bindTexture(t.TEXTURE_2D,f),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST),W.current=f,()=>{const u=k.current;u&&(X.current&&u.deleteBuffer(X.current),D.current&&u.deleteTexture(D.current),W.current&&u.deleteTexture(W.current),G.current&&u.deleteProgram(G.current)),k.current=null,O.current=null}},[]),r.useEffect(()=>{const m=k.current,t=I.current;if(!t)return;const w=d.fontSize*.6,i=d.fontSize,z=oe();if(m&&W.current){const x=z.length,o=document.createElement("canvas");o.width=Math.ceil(x*w),o.height=Math.ceil(i);const e=o.getContext("2d");if(e){e.clearRect(0,0,o.width,o.height),e.fillStyle="#FFFFFF",e.font=`bold ${d.fontSize}px "JetBrains Mono", "Fira Code", Courier, monospace`,e.textAlign="center",e.textBaseline="middle";for(let f=0;f<x;f++){const u=z[f],E=f*w+w/2,R=i/2;e.fillText(u,E,R)}m.activeTexture(m.TEXTURE1),m.bindTexture(m.TEXTURE_2D,W.current),m.pixelStorei(m.UNPACK_FLIP_Y_WEBGL,0),m.texImage2D(m.TEXTURE_2D,0,m.RGBA,m.RGBA,m.UNSIGNED_BYTE,o)}}O.current&&ce.current.clear();const N=()=>{const x=t.getBoundingClientRect(),o=Math.min(1.5,window.devicePixelRatio||1),e=Math.floor(x.width)||(c==null?void 0:c.naturalWidth)||640,f=Math.floor(x.height)||(c==null?void 0:c.naturalHeight)||360;t.width=e*o,t.height=f*o,re.current=Math.max(8,Math.floor(t.width/w)),V.current=Math.max(6,Math.floor(t.height/i)),m&&m.viewport(0,0,t.width,t.height),fe&&fe(e,f)};N();const B=new ResizeObserver(()=>{N()});return B.observe(t),ae.current=B,()=>{B.disconnect()}},[c,d,te]),r.useEffect(()=>{if(!c||!c.complete||c.naturalHeight===0)return;const m=()=>{const w=I.current;if(!w)return;const i=k.current,z=G.current,N=d.fontSize*.6,B=d.fontSize,x=oe(),o=re.current,e=V.current;if(i&&z&&D.current&&X.current){i.viewport(0,0,w.width,w.height),i.clearColor(.0196,.0196,.0196,1),i.clear(i.COLOR_BUFFER_BIT),i.useProgram(z),i.activeTexture(i.TEXTURE0),i.bindTexture(i.TEXTURE_2D,D.current),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,1),i.texImage2D(i.TEXTURE_2D,0,i.RGBA,i.RGBA,i.UNSIGNED_BYTE,c),i.activeTexture(i.TEXTURE1),i.bindTexture(i.TEXTURE_2D,W.current);let f=0;d.colorMode==="green"?f=1:d.colorMode==="amber"?f=2:d.colorMode==="mono"?f=3:d.colorMode==="cyberpunk"&&(f=4);const u=A.current;i.uniform1i(u.u_video_texture||null,0),i.uniform1i(u.u_atlas_texture||null,1),i.uniform1f(u.u_cols||null,o),i.uniform1f(u.u_rows||null,e),i.uniform1f(u.u_char_count||null,x.length),i.uniform1f(u.u_brightness||null,d.brightness),i.uniform1f(u.u_contrast||null,d.contrast),i.uniform1f(u.u_saturation||null,d.saturation),i.uniform1i(u.u_color_mode||null,f),i.uniform1i(u.u_use_sequence||null,d.customDensity?1:0);const E=K.current;E!==-1&&(i.enableVertexAttribArray(E),i.bindBuffer(i.ARRAY_BUFFER,X.current),i.vertexAttribPointer(E,2,i.FLOAT,!1,0,0)),i.drawArrays(i.TRIANGLES,0,6),ee&&ee()}else{const f=O.current;if(f){const u=w.width,E=w.height,{ctx:R}=F(o,e);if(R){R.drawImage(c,0,0,o,e);const l=R.getImageData(0,0,o,e).data;f.fillStyle="#010101",f.fillRect(0,0,u,E);const n=d.brightness,y=d.contrast,v=d.saturation,p=ie.current,T=Q.current,C=P.current;for(let g=0;g<256;g++){let j=g;n!==1&&(j*=n),y!==1&&(j=(j-128)*y+128),p[g]=Math.max(0,Math.min(255,Math.floor(j))),T[g]=g*v,C[g]=g*(1-v)}f.font=`bold ${d.fontSize}px "JetBrains Mono", "Fira Code", Courier, monospace`,f.textAlign="center",f.textBaseline="middle";let L="";const b=x.length,q=d.colorMode,$=(g,j,H)=>{const le=Math.min(255,g>>4<<4),S=Math.min(255,j>>4<<4),de=Math.min(255,H>>4<<4),Re=le>>4<<8|S>>4<<4|de>>4;let ne=ce.current.get(Re);return ne||(ne=`rgb(${le},${S},${de})`,ce.current.set(Re,ne)),ne};for(let g=0;g<e;g++){const j=g*B+B/2;for(let H=0;H<o;H++){const le=(g*o+H)*4,S=l[le],de=l[le+1],Re=l[le+2],ne=p[S],pe=p[de],he=p[Re];let _e=ne,me=pe,be=he;if(v!==1){const h=ne*77+pe*150+he*29>>8;_e=Math.max(0,Math.min(255,Math.floor(T[ne]+C[h]))),me=Math.max(0,Math.min(255,Math.floor(T[pe]+C[h]))),be=Math.max(0,Math.min(255,Math.floor(T[he]+C[h])))}const ue=_e*77+me*150+be*29>>8,we=ue*b>>8,xe=x[we]||x[b-1];if(xe===" ")continue;let Z="#FFFFFF";if(q==="rgb")Z=$(_e,me,be);else if(q==="green"){const h=Math.max(0,Math.min(255,50+(ue*205>>8)));Z=$(0,h,30)}else if(q==="amber"){const h=Math.max(0,Math.min(255,ue));Z=$(h,Math.max(0,Math.min(255,h*166>>8)),0)}else if(q==="mono"){const h=Math.max(0,Math.min(255,ue));Z=$(h,h,h)}else if(q==="cyberpunk"){const h=ue/255*.6+g/e*.4,ge=Math.max(0,Math.min(255,Math.floor(0*(1-h)+255*h))),ve=Math.max(0,Math.min(255,Math.floor(240*(1-h)+10*h))),Y=Math.max(0,Math.min(255,Math.floor(255*(1-h)+160*h)));Z=$(ge,ve,Y)}Z!==L&&(f.fillStyle=Z,L=Z),f.fillText(xe,H*N+N/2,j)}}}}ee&&ee()}},t=requestAnimationFrame(()=>{m()});return()=>cancelAnimationFrame(t)},[c,d,te]),s.jsx("canvas",{id:"ascii-image-display-canvas",ref:I,className:`absolute inset-0 w-full h-full pointer-events-none select-none bg-transparent ${_}`})},Be=r.forwardRef(({fontSize:c=7,colorMode:d="rgb",densityPreset:_="standard",customDensity:fe="",brightness:ee=1.15,contrast:te=1.1,saturation:I=1.25,pdhThreshold:k=18,className:G="",imageClassName:X="",canvasClassName:D="",asciiOpacity:W=1,imageOpacity:ae=0,onHover:A,onClick:K,src:re,alt:V="",crossOrigin:U="anonymous",style:J,onLoad:O,...ce},ie)=>{const Q=r.useRef(null),P=r.useRef(null);r.useImperativeHandle(ie,()=>Q.current);const[oe,F]=r.useState(16/9),[m,t]=r.useState(!1),[w,i]=r.useState(!1),[z,N]=r.useState(0),o={fontSize:c,colorMode:d,densityPreset:_,customDensity:fe,brightness:ee,contrast:te,saturation:I,enableDeltaRendering:!1,pdhThreshold:k,asciiOpacity:W,videoOpacity:ae},e=u=>{const E=u.currentTarget;E.naturalWidth&&E.naturalHeight&&F(E.naturalWidth/E.naturalHeight),t(!0),N(R=>R+1),O&&O(u)},f=()=>{i(!0)};return r.useEffect(()=>{const u=Q.current;u&&u.complete&&u.naturalWidth>0&&(F(u.naturalWidth/u.naturalHeight),t(!0),N(E=>E+1))},[]),s.jsxs("div",{ref:P,onMouseEnter:()=>A==null?void 0:A(!0),onMouseLeave:()=>A==null?void 0:A(!1),onClick:K,className:`relative overflow-hidden bg-[#050505] border border-white/10 group select-none transition-all duration-300 flex items-center justify-center ${G}`,style:{aspectRatio:`${oe}`,width:"100%",...J},children:[s.jsx("img",{ref:Q,src:re,alt:V,crossOrigin:U,onLoad:e,style:{opacity:w?ae:0},className:`absolute inset-0 w-full h-full object-cover select-none bg-black transition-opacity duration-300 pointer-events-none ${X}`,...ce}),m&&s.jsx("div",{className:`absolute inset-0 w-full h-full pointer-events-none select-none transition-opacity duration-300 ${D}`,style:{opacity:w?W:0},children:s.jsx(Ye,{imageElement:Q.current,settings:o,triggerRender:z,onFirstRender:f})})]})});Be.displayName="CodeImage",se.CodeImage=Be,se.CodeVideo=Ne,Object.defineProperty(se,Symbol.toStringTag,{value:"Module"})}));
//# sourceMappingURL=index.umd.js.map
