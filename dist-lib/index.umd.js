(function(ie,l){typeof exports=="object"&&typeof module<"u"?l(exports,require("react/jsx-runtime"),require("react")):typeof define=="function"&&define.amd?define(["exports","react/jsx-runtime","react"],l):(ie=typeof globalThis<"u"?globalThis:ie||self,l(ie.ReactAsciiMedia={},ie.jsxRuntime,ie.React))})(this,(function(ie,l,r){"use strict";const We=({videoElement:i,videoSrc:d,settings:_,className:fe="",onDimensionsUpdate:Z})=>{const ee=r.useRef(null),I=r.useRef(null),k=r.useRef(null),G=r.useRef(null),X=r.useRef(null),D=r.useRef(null),W=r.useRef(null),ae=r.useRef(-1),j=r.useRef(null),K=r.useRef({}),te=r.useRef(-1),V=r.useRef(null),M=r.useRef(0),J=r.useRef(!1),q=r.useRef(!1),re=r.useRef(d),ce=r.useRef(null),se=r.useRef(!0),S=r.useRef(8),oe=r.useRef(6),F=r.useRef(null),m=r.useRef(null),t=r.useRef(null),b=r.useRef(new Map),s=r.useRef(new Uint8Array(256)),N=r.useRef(new Float32Array(256)),B=r.useRef(new Float32Array(256)),P=()=>{if(_.customDensity)return _.customDensity.split("");switch(_.densityPreset){case"blocks":return[" ","░","▒","▓","█"];case"binary":return[" ","0","1"];case"matrix":return[" ","•","▰","▱","▲","▼","◄","►","◈","▣","▤","▥","▦","▧","▨","▩","█"];case"detailed":return" .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$".split("");case"math":return" +-\\/*=%()<>[]{}#&@".split("");case"braille":return[" ","⠁","⠃","⠇","⡇","⣇","⣧","⣷","⣿"];case"stars":return[" ",".","*","+","✦","★","✵","✹","✺"];case"cards":return[" ","♣","♦","♥","♠"];case"alphanumeric":return" 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");case"standard":default:return" .:-=+*#%@".split("")}},x=(o,e)=>(F.current?(F.current.width!==o||F.current.height!==e)&&(F.current.width=o,F.current.height=e):(F.current=document.createElement("canvas"),F.current.width=o,F.current.height=e,m.current=F.current.getContext("2d",{willReadFrequently:!1})),{canvas:F.current,ctx:m.current});return r.useEffect(()=>{const o=ee.current;if(!o)return;let e=null;try{e=o.getContext("webgl",{alpha:!0,depth:!1,antialias:!1,preserveDrawingBuffer:!0})||o.getContext("experimental-webgl",{alpha:!0,depth:!1,antialias:!1,preserveDrawingBuffer:!0})}catch(T){console.warn("WebGL initialization failed, falling back to 2D Canvas.",T)}if(!e){t.current=o.getContext("2d");return}I.current=e;const u=`
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
    `,U=(T,y)=>{const L=e.createShader(y);return L?(e.shaderSource(L,T),e.compileShader(L),e.getShaderParameter(L,e.COMPILE_STATUS)?L:(console.error("Shader compilation error:",e.getShaderInfoLog(L)),e.deleteShader(L),null)):null},R=U(u,e.VERTEX_SHADER),n=U(f,e.FRAGMENT_SHADER);if(!R||!n)return;const c=e.createProgram();if(!c)return;if(e.attachShader(c,R),e.attachShader(c,n),e.linkProgram(c),!e.getProgramParameter(c,e.LINK_STATUS)){console.error("Shader program linking error:",e.getProgramInfoLog(c));return}k.current=c,K.current={u_video_texture:e.getUniformLocation(c,"u_video_texture"),u_prev_video_texture:e.getUniformLocation(c,"u_prev_video_texture"),u_atlas_texture:e.getUniformLocation(c,"u_atlas_texture"),u_cols:e.getUniformLocation(c,"u_cols"),u_rows:e.getUniformLocation(c,"u_rows"),u_char_count:e.getUniformLocation(c,"u_char_count"),u_brightness:e.getUniformLocation(c,"u_brightness"),u_contrast:e.getUniformLocation(c,"u_contrast"),u_saturation:e.getUniformLocation(c,"u_saturation"),u_color_mode:e.getUniformLocation(c,"u_color_mode"),u_use_sequence:e.getUniformLocation(c,"u_use_sequence"),u_transition_progress:e.getUniformLocation(c,"u_transition_progress"),u_has_prev_texture:e.getUniformLocation(c,"u_has_prev_texture")},te.current=e.getAttribLocation(c,"a_position");const a=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,a),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),e.STATIC_DRAW),G.current=a;const w=e.createTexture();e.bindTexture(e.TEXTURE_2D,w),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),X.current=w;const v=e.createTexture();e.bindTexture(e.TEXTURE_2D,v),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),D.current=v;const p=e.createTexture();return e.bindTexture(e.TEXTURE_2D,p),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),V.current=p,()=>{const T=I.current;T&&(G.current&&T.deleteBuffer(G.current),X.current&&T.deleteTexture(X.current),D.current&&T.deleteTexture(D.current),V.current&&T.deleteTexture(V.current),k.current&&T.deleteProgram(k.current)),I.current=null,t.current=null}},[]),r.useEffect(()=>{ce.current=null,se.current=!0;const o=I.current,e=ee.current;if(!e)return;const u=_.fontSize*.6,f=_.fontSize,U=P();if(o&&D.current){const c=U.length,a=48,w=Math.ceil(a*.6),v=document.createElement("canvas");v.width=c*w,v.height=a;const p=v.getContext("2d");if(p){p.clearRect(0,0,v.width,v.height),p.fillStyle="#FFFFFF",p.textAlign="center",p.textBaseline="middle",p.font=`bold ${a}px "Fira Code", "Courier New", Courier, monospace`;for(let T=0;T<c;T++){const y=U[T],L=T*w+w/2,E=a/2;p.fillText(y,L,E)}o.activeTexture(o.TEXTURE1),o.bindTexture(o.TEXTURE_2D,D.current),o.pixelStorei(o.UNPACK_FLIP_Y_WEBGL,0),o.texImage2D(o.TEXTURE_2D,0,o.RGBA,o.RGBA,o.UNSIGNED_BYTE,v),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MIN_FILTER,o.LINEAR),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MAG_FILTER,o.LINEAR)}}t.current&&b.current.clear();const R=()=>{const c=e.getBoundingClientRect(),a=Math.min(1.5,window.devicePixelRatio||1),w=Math.floor(c.width)||(i==null?void 0:i.videoWidth)||640,v=Math.floor(c.height)||(i==null?void 0:i.videoHeight)||360;e.width=w*a,e.height=v*a,S.current=Math.max(8,Math.floor(e.width/u)),oe.current=Math.max(6,Math.floor(e.height/f)),o&&o.viewport(0,0,e.width,e.height),Z&&Z(w,v)};R();const n=new ResizeObserver(()=>{R()});return n.observe(e),W.current=n,()=>{n.disconnect()}},[i,_]),r.useEffect(()=>{if(d!==re.current){const o=I.current;if(o&&V.current&&i&&i.readyState>=2)try{o.activeTexture(o.TEXTURE2),o.bindTexture(o.TEXTURE_2D,V.current),o.pixelStorei(o.UNPACK_FLIP_Y_WEBGL,1),o.texImage2D(o.TEXTURE_2D,0,o.RGBA,o.RGBA,o.UNSIGNED_BYTE,i),q.current=!0,J.current=!1}catch(e){console.warn("Failed to capture old video frame for transition:",e)}re.current=d}},[d,i]),r.useEffect(()=>{if(!i)return;let o=!0,e=null;const u=(n,c,a)=>{const w=Math.min(255,n>>4<<4),v=Math.min(255,c>>4<<4),p=Math.min(255,a>>4<<4),T=w>>4<<8|v>>4<<4|p>>4;let y=b.current.get(T);return y||(y=`rgb(${w},${v},${p})`,b.current.set(T,y)),y},f=()=>{if(!o)return;const n=ee.current;if(!n)return;const c=i.currentTime;if(c===ae.current&&!i.paused&&!J.current&&!q.current)return;ae.current=c;const a=I.current,w=k.current,v=_.fontSize*.6,p=_.fontSize,T=P(),y=S.current,L=oe.current;if(a&&w&&X.current&&G.current){a.viewport(0,0,n.width,n.height),a.clearColor(0,0,0,0),a.clear(a.COLOR_BUFFER_BIT),a.useProgram(w),i.readyState>=2&&(a.activeTexture(a.TEXTURE0),a.bindTexture(a.TEXTURE_2D,X.current),a.pixelStorei(a.UNPACK_FLIP_Y_WEBGL,1),a.texImage2D(a.TEXTURE_2D,0,a.RGBA,a.RGBA,a.UNSIGNED_BYTE,i));let E=1,O=0;if(q.current)i.readyState>=2?(q.current=!1,J.current=!0,M.current=performance.now(),E=0,O=1):(E=0,O=1);else if(J.current){const H=performance.now()-M.current;E=Math.min(1,H/800),O=1,E>=1&&(J.current=!1,O=0)}O===1&&V.current&&(a.activeTexture(a.TEXTURE2),a.bindTexture(a.TEXTURE_2D,V.current)),a.activeTexture(a.TEXTURE1),a.bindTexture(a.TEXTURE_2D,D.current);let Y=0;_.colorMode==="green"?Y=1:_.colorMode==="amber"?Y=2:_.colorMode==="mono"?Y=3:_.colorMode==="cyberpunk"&&(Y=4);const g=K.current;a.uniform1i(g.u_video_texture||null,0),a.uniform1i(g.u_prev_video_texture||null,2),a.uniform1i(g.u_atlas_texture||null,1),a.uniform1f(g.u_cols||null,y),a.uniform1f(g.u_rows||null,L),a.uniform1f(g.u_char_count||null,T.length),a.uniform1f(g.u_brightness||null,_.brightness),a.uniform1f(g.u_contrast||null,_.contrast),a.uniform1f(g.u_saturation||null,_.saturation),a.uniform1i(g.u_color_mode||null,Y),a.uniform1i(g.u_use_sequence||null,_.customDensity?1:0),a.uniform1f(g.u_transition_progress||null,E),a.uniform1i(g.u_has_prev_texture||null,O);const $=te.current;$!==-1&&(a.enableVertexAttribArray($),a.bindBuffer(a.ARRAY_BUFFER,G.current),a.vertexAttribPointer($,2,a.FLOAT,!1,0,0)),a.drawArrays(a.TRIANGLES,0,6)}else{const E=t.current;if(E){const O=n.width,Y=n.height,{ctx:g}=x(y,L);if(g){g.drawImage(i,0,0,y,L);const H=g.getImageData(0,0,y,L).data,le=y*L*4,A=ce.current,de=!A||A.length!==le||se.current||!_.enableDeltaRendering;de&&(E.fillStyle="#010101",E.fillRect(0,0,O,Y),_.enableDeltaRendering&&(ce.current=new Uint8Array(H)),se.current=!1);const Re=_.brightness,ne=_.contrast,pe=_.saturation,he=s.current,_e=N.current,me=B.current;for(let h=0;h<256;h++){let ge=h;Re!==1&&(ge*=Re),ne!==1&&(ge=(ge-128)*ne+128),he[h]=Math.max(0,Math.min(255,Math.floor(ge))),_e[h]=h*pe,me[h]=h*(1-pe)}let be=`bold ${_.fontSize}px "JetBrains Mono", "Fira Code", Courier, monospace`;E.font=be,E.textAlign="center",E.textBaseline="middle";let ue="";const we=T.length,xe=_.colorMode,Q=!!_.customDensity;for(let h=0;h<L;h++){const ge=h*p+p/2;for(let ve=0;ve<y;ve++){const z=(h*y+ve)*4,ye=H[z],Ce=H[z+1],Me=H[z+2];if(!de&&_.enableDeltaRendering&&A){const C=A[z],Pe=A[z+1],Ie=A[z+2];if(Math.abs(ye-C)+Math.abs(Ce-Pe)+Math.abs(Me-Ie)<_.pdhThreshold)continue}de||(E.fillStyle="#010101",E.fillRect(ve*v-.2,h*p-.2,v+.4,p+.4),ue="#010101");const Ue=he[ye],Le=he[Ce],Se=he[Me];let Ae=Ue,Fe=Le,De=Se;if(pe!==1){const C=Ue*77+Le*150+Se*29>>8;Ae=Math.max(0,Math.min(255,Math.floor(_e[Ue]+me[C]))),Fe=Math.max(0,Math.min(255,Math.floor(_e[Le]+me[C]))),De=Math.max(0,Math.min(255,Math.floor(_e[Se]+me[C])))}const Ee=Ae*77+Fe*150+De*29>>8,$e=Q?(h*y+ve)%we:Ee*we>>8,ke=T[$e]||T[we-1];if(ke===" "){_.enableDeltaRendering&&A&&(A[z]=ye,A[z+1]=Ce,A[z+2]=Me);continue}Q?E.globalAlpha=Ee/255:E.globalAlpha=1;let Te="#FFFFFF";if(xe==="rgb")Te=u(Ae,Fe,De);else if(xe==="green"){const C=Math.max(0,Math.min(255,50+(Ee*205>>8)));Te=u(0,C,30)}else if(xe==="amber"){const C=Math.max(0,Math.min(255,Ee));Te=u(C,Math.max(0,Math.min(255,C*166>>8)),0)}else if(xe==="mono"){const C=Math.max(0,Math.min(255,Ee));Te=u(C,C,C)}else if(xe==="cyberpunk"){const C=Ee/255*.6+h/L*.4,Pe=Math.max(0,Math.min(255,Math.floor(0*(1-C)+255*C))),Ie=Math.max(0,Math.min(255,Math.floor(240*(1-C)+10*C))),Ge=Math.max(0,Math.min(255,Math.floor(255*(1-C)+160*C)));Te=u(Pe,Ie,Ge)}Te!==ue&&(E.fillStyle=Te,ue=Te);const He=ve*v+v/2,je=ge;E.fillText(ke,He,je),_.enableDeltaRendering&&A&&(A[z]=ye,A[z+1]=Ce,A[z+2]=Me)}}Q&&(E.globalAlpha=1)}}}};(()=>{if("requestVideoFrameCallback"in i){const n=()=>{f(),o&&(e=i.requestVideoFrameCallback(n))};e=i.requestVideoFrameCallback(n)}else{const n=()=>{f(),o&&(j.current=requestAnimationFrame(n))};j.current=requestAnimationFrame(n)}})(),f();const R=()=>{f()};return i.addEventListener("seeked",R),()=>{o=!1,i.removeEventListener("seeked",R),e!==null&&"cancelVideoFrameCallback"in i&&i.cancelVideoFrameCallback(e),j.current!==null&&cancelAnimationFrame(j.current)}},[i,_]),l.jsx("canvas",{id:"ascii-display-canvas",ref:ee,className:`absolute inset-0 w-full h-full pointer-events-none select-none bg-transparent ${fe}`})},Xe=({className:i="w-4 h-4",fill:d="none"})=>l.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:d,stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",className:i,children:l.jsx("polygon",{points:"6 3 20 12 6 21 6 3"})}),Ve=({className:i="w-4 h-4",fill:d="none"})=>l.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:d,stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",className:i,children:[l.jsx("rect",{x:"14",y:"4",width:"4",height:"16",rx:"1"}),l.jsx("rect",{x:"6",y:"4",width:"4",height:"16",rx:"1"})]}),Oe=({className:i="w-4 h-4"})=>l.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",className:i,children:[l.jsx("polygon",{points:"11 5 6 9 2 9 2 15 6 15 11 19 11 5"}),l.jsx("path",{d:"M15.54 8.46a5 5 0 0 1 0 7.07"}),l.jsx("path",{d:"M19.07 4.93a10 10 0 0 1 0 14.14"})]}),ze=({className:i="w-4 h-4"})=>l.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",className:i,children:[l.jsx("polygon",{points:"11 5 6 9 2 9 2 15 6 15 11 19 11 5"}),l.jsx("line",{x1:"22",y1:"9",x2:"16",y2:"15"}),l.jsx("line",{x1:"16",y1:"9",x2:"22",y2:"15"})]}),qe=({className:i="w-4 h-4"})=>l.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",className:i,children:[l.jsx("polyline",{points:"15 3 21 3 21 9"}),l.jsx("polyline",{points:"9 21 3 21 3 15"}),l.jsx("line",{x1:"21",y1:"3",x2:"14",y2:"10"}),l.jsx("line",{x1:"3",y1:"21",x2:"10",y2:"14"})]}),Ne=r.forwardRef(({fontSize:i=7,colorMode:d="rgb",densityPreset:_="standard",customDensity:fe="",brightness:Z=1.15,contrast:ee=1.1,saturation:I=1.25,pdhThreshold:k=18,className:G="",videoClassName:X="",canvasClassName:D="",asciiOpacity:W=1,videoOpacity:ae=0,customControls:j=!1,src:K,autoPlay:te,loop:V,muted:M,playsInline:J=!0,crossOrigin:q="anonymous",style:re,...ce},se)=>{const S=r.useRef(null),oe=r.useRef(null);r.useImperativeHandle(se,()=>S.current);const F={fontSize:i,colorMode:d,densityPreset:_,customDensity:fe,brightness:Z,contrast:ee,saturation:I,enableDeltaRendering:!0,pdhThreshold:k,asciiOpacity:W,videoOpacity:ae},[m,t]=r.useState(!1),[b,s]=r.useState(!!M),[N,B]=r.useState(0),[P,x]=r.useState(16/9),[o,e]=r.useState(!1);r.useEffect(()=>{const n=S.current;if(!n)return;const c=()=>t(!0),a=()=>t(!1),w=()=>s(n.muted),v=()=>{n.duration&&B(n.currentTime/n.duration*100)},p=()=>{n.videoWidth&&n.videoHeight&&x(n.videoWidth/n.videoHeight)};return n.addEventListener("play",c),n.addEventListener("pause",a),n.addEventListener("volumechange",w),n.addEventListener("timeupdate",v),n.addEventListener("loadedmetadata",p),t(!n.paused),s(n.muted),()=>{n.removeEventListener("play",c),n.removeEventListener("pause",a),n.removeEventListener("volumechange",w),n.removeEventListener("timeupdate",v),n.removeEventListener("loadedmetadata",p)}},[]),r.useEffect(()=>{const n=S.current;n&&K&&(n.src=K,n.load(),te&&n.play().catch(()=>{}))},[K,te]),r.useEffect(()=>{const n=S.current;n&&(n.muted=!!M,s(!!M))},[M]);const u=()=>{const n=S.current;n&&(n.paused?n.play().catch(()=>{}):n.pause())},f=n=>{n.stopPropagation();const c=S.current;c&&(c.muted=!c.muted,s(c.muted))},U=n=>{n.stopPropagation();const c=S.current;if(!c||!c.duration)return;const a=n.currentTarget.getBoundingClientRect(),v=(n.clientX-a.left)/a.width;c.currentTime=v*c.duration},R=n=>{n.stopPropagation(),oe.current&&(document.fullscreenElement?document.exitFullscreen().catch(()=>{}):oe.current.requestFullscreen().catch(()=>{}))};return l.jsxs("div",{ref:oe,onMouseEnter:()=>e(!0),onMouseLeave:()=>e(!1),className:`relative rounded-xl overflow-hidden bg-[#050505] border border-white/10 group select-none transition-all duration-300 flex items-center justify-center ${G}`,style:{aspectRatio:`${P}`,width:"100%",...re},children:[l.jsx("video",{ref:S,crossOrigin:q,playsInline:J,loop:V,autoPlay:te,muted:b,style:{opacity:ae},className:`absolute inset-0 w-full h-full object-cover select-none bg-black transition-opacity duration-300 pointer-events-none ${X}`,...ce}),l.jsx("div",{className:`absolute inset-0 w-full h-full pointer-events-none select-none transition-opacity duration-300 ${D}`,style:{opacity:W},children:l.jsx(We,{videoElement:S.current,videoSrc:K,settings:F})}),j?l.jsxs(l.Fragment,{children:[l.jsx("div",{onClick:u,className:"absolute inset-0 z-10 cursor-pointer flex items-center justify-center bg-black/0 active:bg-black/10 transition-colors"}),!m&&l.jsx("div",{onClick:u,className:"absolute z-20 w-14 h-14 rounded-full border border-white/25 flex items-center justify-center backdrop-blur-md shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer",style:{backgroundColor:"rgba(18,18,18,0.9)",color:"#00FF94"},children:l.jsx(Xe,{className:"w-5 h-5 stroke-none translate-x-[2px]",fill:"currentColor"})}),l.jsxs("div",{className:`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex flex-col gap-3 transition-opacity duration-300 z-20 ${o||!m?"opacity-100":"opacity-0 pointer-events-none"}`,children:[l.jsx("div",{onClick:U,className:"w-full h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer relative group/progress transition-all hover:h-2",children:l.jsx("div",{className:"absolute top-0 left-0 bottom-0 rounded-full shadow-[0_0_8px_rgba(0,255,148,0.6)]",style:{width:`${N}%`,backgroundColor:"#00FF94"}})}),l.jsxs("div",{className:"flex items-center justify-between",children:[l.jsxs("div",{className:"flex items-center gap-3",children:[l.jsx("button",{type:"button",onClick:u,className:"p-1.5 rounded-md hover:bg-white/10 text-white transition-colors",children:m?l.jsx(Ve,{className:"w-4 h-4 fill-white",fill:"currentColor"}):l.jsx(Xe,{className:"w-4 h-4 stroke-none",fill:"#00FF94"})}),l.jsx("button",{type:"button",onClick:f,className:"p-1.5 rounded-md hover:bg-white/10 text-white transition-colors",children:b?l.jsx(ze,{className:"w-4 h-4"}):l.jsx(Oe,{className:"w-4 h-4"})})]}),l.jsx("div",{className:"flex items-center gap-3",children:l.jsx("button",{type:"button",onClick:R,className:"p-1.5 rounded-md hover:bg-white/10 text-white transition-colors",children:l.jsx(qe,{className:"w-4 h-4"})})})]})]})]}):!j&&ce.controls&&l.jsx("div",{className:"absolute bottom-2 right-2 z-20 bg-black/60 px-2 py-1 rounded border border-white/10 text-[9px] font-mono text-white/60",children:"*Use customControls prop for styled overlay controls"})]})});Ne.displayName="CodeVideo";const Ye=({imageElement:i,settings:d,className:_="",onDimensionsUpdate:fe,onFirstRender:Z,triggerRender:ee=0})=>{const I=r.useRef(null),k=r.useRef(null),G=r.useRef(null),X=r.useRef(null),D=r.useRef(null),W=r.useRef(null),ae=r.useRef(null),j=r.useRef({}),K=r.useRef(-1),te=r.useRef(8),V=r.useRef(6),M=r.useRef(null),J=r.useRef(null),q=r.useRef(null),re=r.useRef(new Map),ce=r.useRef(new Uint8Array(256)),se=r.useRef(new Float32Array(256)),S=r.useRef(new Float32Array(256)),oe=()=>{if(d.customDensity)return d.customDensity.split("");switch(d.densityPreset){case"blocks":return[" ","░","▒","▓","█"];case"binary":return[" ","0","1"];case"matrix":return[" ","•","▰","▱","▲","▼","◄","►","◈","▣","▤","▥","▦","▧","▨","▩","█"];case"detailed":return" .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$".split("");case"math":return" +-\\/*=%()<>[]{}#&@".split("");case"braille":return[" ","⠁","⠃","⠇","⡇","⣇","⣧","⣷","⣿"];case"stars":return[" ",".","*","+","✦","★","✵","✹","✺"];case"cards":return[" ","♣","♦","♥","♠"];case"alphanumeric":return" 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");case"standard":default:return" .:-=+*#%@".split("")}},F=(m,t)=>(M.current?(M.current.width!==m||M.current.height!==t)&&(M.current.width=m,M.current.height=t):(M.current=document.createElement("canvas"),M.current.width=m,M.current.height=t,J.current=M.current.getContext("2d",{willReadFrequently:!1})),{canvas:M.current,ctx:J.current});return r.useEffect(()=>{const m=I.current;if(!m)return;let t=null;try{t=m.getContext("webgl",{alpha:!1,depth:!1,antialias:!1,preserveDrawingBuffer:!0})||m.getContext("experimental-webgl",{alpha:!1,depth:!1,antialias:!1,preserveDrawingBuffer:!0})}catch(f){console.warn("WebGL initialization failed, falling back to 2D Canvas.",f)}if(!t){q.current=m.getContext("2d");return}k.current=t;const b=`
      attribute vec2 a_position;
      varying vec2 v_texCoord;

      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `,s=`
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
    `,N=(f,U)=>{const R=t.createShader(U);return R?(t.shaderSource(R,f),t.compileShader(R),t.getShaderParameter(R,t.COMPILE_STATUS)?R:(console.error("Shader compilation error:",t.getShaderInfoLog(R)),t.deleteShader(R),null)):null},B=N(b,t.VERTEX_SHADER),P=N(s,t.FRAGMENT_SHADER);if(!B||!P)return;const x=t.createProgram();if(!x)return;if(t.attachShader(x,B),t.attachShader(x,P),t.linkProgram(x),!t.getProgramParameter(x,t.LINK_STATUS)){console.error("Shader program linking error:",t.getProgramInfoLog(x));return}G.current=x,j.current={u_video_texture:t.getUniformLocation(x,"u_video_texture"),u_atlas_texture:t.getUniformLocation(x,"u_atlas_texture"),u_cols:t.getUniformLocation(x,"u_cols"),u_rows:t.getUniformLocation(x,"u_rows"),u_char_count:t.getUniformLocation(x,"u_char_count"),u_brightness:t.getUniformLocation(x,"u_brightness"),u_contrast:t.getUniformLocation(x,"u_contrast"),u_saturation:t.getUniformLocation(x,"u_saturation"),u_color_mode:t.getUniformLocation(x,"u_color_mode"),u_use_sequence:t.getUniformLocation(x,"u_use_sequence")},K.current=t.getAttribLocation(x,"a_position");const o=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,o),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),t.STATIC_DRAW),X.current=o;const e=t.createTexture();t.bindTexture(t.TEXTURE_2D,e),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST),D.current=e;const u=t.createTexture();return t.bindTexture(t.TEXTURE_2D,u),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST),W.current=u,()=>{const f=k.current;f&&(X.current&&f.deleteBuffer(X.current),D.current&&f.deleteTexture(D.current),W.current&&f.deleteTexture(W.current),G.current&&f.deleteProgram(G.current)),k.current=null,q.current=null}},[]),r.useEffect(()=>{const m=k.current,t=I.current;if(!t)return;const b=d.fontSize*.6,s=d.fontSize,N=oe();if(m&&W.current){const x=N.length,o=document.createElement("canvas");o.width=Math.ceil(x*b),o.height=Math.ceil(s);const e=o.getContext("2d");if(e){e.clearRect(0,0,o.width,o.height),e.fillStyle="#FFFFFF",e.font=`bold ${d.fontSize}px "JetBrains Mono", "Fira Code", Courier, monospace`,e.textAlign="center",e.textBaseline="middle";for(let u=0;u<x;u++){const f=N[u],U=u*b+b/2,R=s/2;e.fillText(f,U,R)}m.activeTexture(m.TEXTURE1),m.bindTexture(m.TEXTURE_2D,W.current),m.pixelStorei(m.UNPACK_FLIP_Y_WEBGL,0),m.texImage2D(m.TEXTURE_2D,0,m.RGBA,m.RGBA,m.UNSIGNED_BYTE,o)}}q.current&&re.current.clear();const B=()=>{const x=t.getBoundingClientRect(),o=Math.min(1.5,window.devicePixelRatio||1),e=Math.floor(x.width)||(i==null?void 0:i.naturalWidth)||640,u=Math.floor(x.height)||(i==null?void 0:i.naturalHeight)||360;t.width=e*o,t.height=u*o,te.current=Math.max(8,Math.floor(t.width/b)),V.current=Math.max(6,Math.floor(t.height/s)),m&&m.viewport(0,0,t.width,t.height),fe&&fe(e,u)};B();const P=new ResizeObserver(()=>{B()});return P.observe(t),ae.current=P,()=>{P.disconnect()}},[i,d,ee]),r.useEffect(()=>{if(!i||!i.complete||i.naturalHeight===0)return;const m=()=>{const b=I.current;if(!b)return;const s=k.current,N=G.current,B=d.fontSize*.6,P=d.fontSize,x=oe(),o=te.current,e=V.current;if(s&&N&&D.current&&X.current){s.viewport(0,0,b.width,b.height),s.clearColor(.0196,.0196,.0196,1),s.clear(s.COLOR_BUFFER_BIT),s.useProgram(N),s.activeTexture(s.TEXTURE0),s.bindTexture(s.TEXTURE_2D,D.current),s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,1),s.texImage2D(s.TEXTURE_2D,0,s.RGBA,s.RGBA,s.UNSIGNED_BYTE,i),s.activeTexture(s.TEXTURE1),s.bindTexture(s.TEXTURE_2D,W.current);let u=0;d.colorMode==="green"?u=1:d.colorMode==="amber"?u=2:d.colorMode==="mono"?u=3:d.colorMode==="cyberpunk"&&(u=4);const f=j.current;s.uniform1i(f.u_video_texture||null,0),s.uniform1i(f.u_atlas_texture||null,1),s.uniform1f(f.u_cols||null,o),s.uniform1f(f.u_rows||null,e),s.uniform1f(f.u_char_count||null,x.length),s.uniform1f(f.u_brightness||null,d.brightness),s.uniform1f(f.u_contrast||null,d.contrast),s.uniform1f(f.u_saturation||null,d.saturation),s.uniform1i(f.u_color_mode||null,u),s.uniform1i(f.u_use_sequence||null,d.customDensity?1:0);const U=K.current;U!==-1&&(s.enableVertexAttribArray(U),s.bindBuffer(s.ARRAY_BUFFER,X.current),s.vertexAttribPointer(U,2,s.FLOAT,!1,0,0)),s.drawArrays(s.TRIANGLES,0,6),Z&&Z()}else{const u=q.current;if(u){const f=b.width,U=b.height,{ctx:R}=F(o,e);if(R){R.drawImage(i,0,0,o,e);const c=R.getImageData(0,0,o,e).data;u.fillStyle="#010101",u.fillRect(0,0,f,U);const a=d.brightness,w=d.contrast,v=d.saturation,p=ce.current,T=se.current,y=S.current;for(let g=0;g<256;g++){let $=g;a!==1&&($*=a),w!==1&&($=($-128)*w+128),p[g]=Math.max(0,Math.min(255,Math.floor($))),T[g]=g*v,y[g]=g*(1-v)}u.font=`bold ${d.fontSize}px "JetBrains Mono", "Fira Code", Courier, monospace`,u.textAlign="center",u.textBaseline="middle";let L="";const E=x.length,O=d.colorMode,Y=(g,$,H)=>{const le=Math.min(255,g>>4<<4),A=Math.min(255,$>>4<<4),de=Math.min(255,H>>4<<4),Re=le>>4<<8|A>>4<<4|de>>4;let ne=re.current.get(Re);return ne||(ne=`rgb(${le},${A},${de})`,re.current.set(Re,ne)),ne};for(let g=0;g<e;g++){const $=g*P+P/2;for(let H=0;H<o;H++){const le=(g*o+H)*4,A=c[le],de=c[le+1],Re=c[le+2],ne=p[A],pe=p[de],he=p[Re];let _e=ne,me=pe,be=he;if(v!==1){const h=ne*77+pe*150+he*29>>8;_e=Math.max(0,Math.min(255,Math.floor(T[ne]+y[h]))),me=Math.max(0,Math.min(255,Math.floor(T[pe]+y[h]))),be=Math.max(0,Math.min(255,Math.floor(T[he]+y[h])))}const ue=_e*77+me*150+be*29>>8,we=ue*E>>8,xe=x[we]||x[E-1];if(xe===" ")continue;let Q="#FFFFFF";if(O==="rgb")Q=Y(_e,me,be);else if(O==="green"){const h=Math.max(0,Math.min(255,50+(ue*205>>8)));Q=Y(0,h,30)}else if(O==="amber"){const h=Math.max(0,Math.min(255,ue));Q=Y(h,Math.max(0,Math.min(255,h*166>>8)),0)}else if(O==="mono"){const h=Math.max(0,Math.min(255,ue));Q=Y(h,h,h)}else if(O==="cyberpunk"){const h=ue/255*.6+g/e*.4,ge=Math.max(0,Math.min(255,Math.floor(0*(1-h)+255*h))),ve=Math.max(0,Math.min(255,Math.floor(240*(1-h)+10*h))),z=Math.max(0,Math.min(255,Math.floor(255*(1-h)+160*h)));Q=Y(ge,ve,z)}Q!==L&&(u.fillStyle=Q,L=Q),u.fillText(xe,H*B+B/2,$)}}}}Z&&Z()}},t=requestAnimationFrame(()=>{m()});return()=>cancelAnimationFrame(t)},[i,d,ee]),l.jsx("canvas",{id:"ascii-image-display-canvas",ref:I,className:`absolute inset-0 w-full h-full pointer-events-none select-none bg-transparent ${_}`})},Be=r.forwardRef(({fontSize:i=7,colorMode:d="rgb",densityPreset:_="standard",customDensity:fe="",brightness:Z=1.15,contrast:ee=1.1,saturation:I=1.25,pdhThreshold:k=18,className:G="",imageClassName:X="",canvasClassName:D="",asciiOpacity:W=1,imageOpacity:ae=0,hoverFontSize:j=2,hoverSaturation:K=1,rounded:te=!1,src:V,alt:M="",crossOrigin:J="anonymous",style:q,onLoad:re,...ce},se)=>{const S=r.useRef(null),oe=r.useRef(null);r.useImperativeHandle(se,()=>S.current);const[F,m]=r.useState(!1),[t,b]=r.useState(16/9),[s,N]=r.useState(!1),[B,P]=r.useState(!1),[x,o]=r.useState(0),f={fontSize:F?j:i,colorMode:d,densityPreset:_,customDensity:fe,brightness:Z,contrast:ee,saturation:F?K:I,enableDeltaRendering:!1,pdhThreshold:k,asciiOpacity:W,videoOpacity:ae},U=n=>{const c=n.currentTarget;c.naturalWidth&&c.naturalHeight&&b(c.naturalWidth/c.naturalHeight),N(!0),o(a=>a+1),re&&re(n)},R=()=>{P(!0)};return r.useEffect(()=>{const n=S.current;n&&n.complete&&n.naturalWidth>0&&(b(n.naturalWidth/n.naturalHeight),N(!0),o(c=>c+1))},[]),l.jsxs("div",{ref:oe,onMouseEnter:()=>m(!0),onMouseLeave:()=>m(!1),className:`relative overflow-hidden bg-[#050505] border border-white/10 group select-none transition-all duration-300 flex items-center justify-center ${te?"rounded-xl":""} ${G}`,style:{aspectRatio:`${t}`,width:"100%",...q},children:[l.jsx("img",{ref:S,src:V,alt:M,crossOrigin:J,onLoad:U,style:{opacity:B?ae:0},className:`absolute inset-0 w-full h-full object-cover select-none bg-black transition-opacity duration-300 pointer-events-none ${X}`,...ce}),s&&l.jsx("div",{className:`absolute inset-0 w-full h-full pointer-events-none select-none transition-opacity duration-300 ${D}`,style:{opacity:B?W:0},children:l.jsx(Ye,{imageElement:S.current,settings:f,triggerRender:x,onFirstRender:R})})]})});Be.displayName="CodeImage",ie.CodeImage=Be,ie.CodeVideo=Ne,Object.defineProperty(ie,Symbol.toStringTag,{value:"Module"})}));
//# sourceMappingURL=index.umd.js.map
