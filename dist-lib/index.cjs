"use strict";Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"});const l=require("react/jsx-runtime"),o=require("react"),Ve=({videoElement:i,videoSrc:d,settings:_,className:ue="",onDimensionsUpdate:Z})=>{const ee=o.useRef(null),I=o.useRef(null),k=o.useRef(null),j=o.useRef(null),X=o.useRef(null),D=o.useRef(null),G=o.useRef(null),ae=o.useRef(-1),H=o.useRef(null),K=o.useRef({}),te=o.useRef(-1),W=o.useRef(null),M=o.useRef(0),J=o.useRef(!1),z=o.useRef(!1),re=o.useRef(d),ce=o.useRef(null),ie=o.useRef(!0),S=o.useRef(8),oe=o.useRef(6),F=o.useRef(null),m=o.useRef(null),t=o.useRef(null),b=o.useRef(new Map),s=o.useRef(new Uint8Array(256)),N=o.useRef(new Float32Array(256)),B=o.useRef(new Float32Array(256)),P=()=>{if(_.customDensity)return _.customDensity.split("");switch(_.densityPreset){case"blocks":return[" ","░","▒","▓","█"];case"binary":return[" ","0","1"];case"matrix":return[" ","•","▰","▱","▲","▼","◄","►","◈","▣","▤","▥","▦","▧","▨","▩","█"];case"detailed":return" .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$".split("");case"math":return" +-\\/*=%()<>[]{}#&@".split("");case"braille":return[" ","⠁","⠃","⠇","⡇","⣇","⣧","⣷","⣿"];case"stars":return[" ",".","*","+","✦","★","✵","✹","✺"];case"cards":return[" ","♣","♦","♥","♠"];case"alphanumeric":return" 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");case"standard":default:return" .:-=+*#%@".split("")}},x=(r,e)=>(F.current?(F.current.width!==r||F.current.height!==e)&&(F.current.width=r,F.current.height=e):(F.current=document.createElement("canvas"),F.current.width=r,F.current.height=e,m.current=F.current.getContext("2d",{willReadFrequently:!1})),{canvas:F.current,ctx:m.current});return o.useEffect(()=>{const r=ee.current;if(!r)return;let e=null;try{e=r.getContext("webgl",{alpha:!0,depth:!1,antialias:!1,preserveDrawingBuffer:!0})||r.getContext("experimental-webgl",{alpha:!0,depth:!1,antialias:!1,preserveDrawingBuffer:!0})}catch(R){console.warn("WebGL initialization failed, falling back to 2D Canvas.",R)}if(!e){t.current=r.getContext("2d");return}I.current=e;const u=`
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
    `,U=(R,y)=>{const L=e.createShader(y);return L?(e.shaderSource(L,R),e.compileShader(L),e.getShaderParameter(L,e.COMPILE_STATUS)?L:(console.error("Shader compilation error:",e.getShaderInfoLog(L)),e.deleteShader(L),null)):null},T=U(u,e.VERTEX_SHADER),n=U(f,e.FRAGMENT_SHADER);if(!T||!n)return;const c=e.createProgram();if(!c)return;if(e.attachShader(c,T),e.attachShader(c,n),e.linkProgram(c),!e.getProgramParameter(c,e.LINK_STATUS)){console.error("Shader program linking error:",e.getProgramInfoLog(c));return}k.current=c,K.current={u_video_texture:e.getUniformLocation(c,"u_video_texture"),u_prev_video_texture:e.getUniformLocation(c,"u_prev_video_texture"),u_atlas_texture:e.getUniformLocation(c,"u_atlas_texture"),u_cols:e.getUniformLocation(c,"u_cols"),u_rows:e.getUniformLocation(c,"u_rows"),u_char_count:e.getUniformLocation(c,"u_char_count"),u_brightness:e.getUniformLocation(c,"u_brightness"),u_contrast:e.getUniformLocation(c,"u_contrast"),u_saturation:e.getUniformLocation(c,"u_saturation"),u_color_mode:e.getUniformLocation(c,"u_color_mode"),u_use_sequence:e.getUniformLocation(c,"u_use_sequence"),u_transition_progress:e.getUniformLocation(c,"u_transition_progress"),u_has_prev_texture:e.getUniformLocation(c,"u_has_prev_texture")},te.current=e.getAttribLocation(c,"a_position");const a=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,a),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),e.STATIC_DRAW),j.current=a;const w=e.createTexture();e.bindTexture(e.TEXTURE_2D,w),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),X.current=w;const v=e.createTexture();e.bindTexture(e.TEXTURE_2D,v),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),D.current=v;const p=e.createTexture();return e.bindTexture(e.TEXTURE_2D,p),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),W.current=p,()=>{const R=I.current;R&&(j.current&&R.deleteBuffer(j.current),X.current&&R.deleteTexture(X.current),D.current&&R.deleteTexture(D.current),W.current&&R.deleteTexture(W.current),k.current&&R.deleteProgram(k.current)),I.current=null,t.current=null}},[]),o.useEffect(()=>{ce.current=null,ie.current=!0;const r=I.current,e=ee.current;if(!e)return;const u=_.fontSize*.6,f=_.fontSize,U=P();if(r&&D.current){const c=U.length,a=48,w=Math.ceil(a*.6),v=document.createElement("canvas");v.width=c*w,v.height=a;const p=v.getContext("2d");if(p){p.clearRect(0,0,v.width,v.height),p.fillStyle="#FFFFFF",p.textAlign="center",p.textBaseline="middle",p.font=`bold ${a}px "Fira Code", "Courier New", Courier, monospace`;for(let R=0;R<c;R++){const y=U[R],L=R*w+w/2,E=a/2;p.fillText(y,L,E)}r.activeTexture(r.TEXTURE1),r.bindTexture(r.TEXTURE_2D,D.current),r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,0),r.texImage2D(r.TEXTURE_2D,0,r.RGBA,r.RGBA,r.UNSIGNED_BYTE,v),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,r.LINEAR),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MAG_FILTER,r.LINEAR)}}t.current&&b.current.clear();const T=()=>{const c=e.getBoundingClientRect(),a=Math.min(1.5,window.devicePixelRatio||1),w=Math.floor(c.width)||(i==null?void 0:i.videoWidth)||640,v=Math.floor(c.height)||(i==null?void 0:i.videoHeight)||360;e.width=w*a,e.height=v*a,S.current=Math.max(8,Math.floor(e.width/u)),oe.current=Math.max(6,Math.floor(e.height/f)),r&&r.viewport(0,0,e.width,e.height),Z&&Z(w,v)};T();const n=new ResizeObserver(()=>{T()});return n.observe(e),G.current=n,()=>{n.disconnect()}},[i,_]),o.useEffect(()=>{if(d!==re.current){const r=I.current;if(r&&W.current&&i&&i.readyState>=2)try{r.activeTexture(r.TEXTURE2),r.bindTexture(r.TEXTURE_2D,W.current),r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,1),r.texImage2D(r.TEXTURE_2D,0,r.RGBA,r.RGBA,r.UNSIGNED_BYTE,i),z.current=!0,J.current=!1}catch(e){console.warn("Failed to capture old video frame for transition:",e)}re.current=d}},[d,i]),o.useEffect(()=>{if(!i)return;let r=!0,e=null;const u=(n,c,a)=>{const w=Math.min(255,n>>4<<4),v=Math.min(255,c>>4<<4),p=Math.min(255,a>>4<<4),R=w>>4<<8|v>>4<<4|p>>4;let y=b.current.get(R);return y||(y=`rgb(${w},${v},${p})`,b.current.set(R,y)),y},f=()=>{if(!r)return;const n=ee.current;if(!n)return;const c=i.currentTime;if(c===ae.current&&!i.paused&&!J.current&&!z.current)return;ae.current=c;const a=I.current,w=k.current,v=_.fontSize*.6,p=_.fontSize,R=P(),y=S.current,L=oe.current;if(a&&w&&X.current&&j.current){a.viewport(0,0,n.width,n.height),a.clearColor(0,0,0,0),a.clear(a.COLOR_BUFFER_BIT),a.useProgram(w),i.readyState>=2&&(a.activeTexture(a.TEXTURE0),a.bindTexture(a.TEXTURE_2D,X.current),a.pixelStorei(a.UNPACK_FLIP_Y_WEBGL,1),a.texImage2D(a.TEXTURE_2D,0,a.RGBA,a.RGBA,a.UNSIGNED_BYTE,i));let E=1,V=0;if(z.current)i.readyState>=2?(z.current=!1,J.current=!0,M.current=performance.now(),E=0,V=1):(E=0,V=1);else if(J.current){const $=performance.now()-M.current;E=Math.min(1,$/800),V=1,E>=1&&(J.current=!1,V=0)}V===1&&W.current&&(a.activeTexture(a.TEXTURE2),a.bindTexture(a.TEXTURE_2D,W.current)),a.activeTexture(a.TEXTURE1),a.bindTexture(a.TEXTURE_2D,D.current);let q=0;_.colorMode==="green"?q=1:_.colorMode==="amber"?q=2:_.colorMode==="mono"?q=3:_.colorMode==="cyberpunk"&&(q=4);const g=K.current;a.uniform1i(g.u_video_texture||null,0),a.uniform1i(g.u_prev_video_texture||null,2),a.uniform1i(g.u_atlas_texture||null,1),a.uniform1f(g.u_cols||null,y),a.uniform1f(g.u_rows||null,L),a.uniform1f(g.u_char_count||null,R.length),a.uniform1f(g.u_brightness||null,_.brightness),a.uniform1f(g.u_contrast||null,_.contrast),a.uniform1f(g.u_saturation||null,_.saturation),a.uniform1i(g.u_color_mode||null,q),a.uniform1i(g.u_use_sequence||null,_.customDensity?1:0),a.uniform1f(g.u_transition_progress||null,E),a.uniform1i(g.u_has_prev_texture||null,V);const Y=te.current;Y!==-1&&(a.enableVertexAttribArray(Y),a.bindBuffer(a.ARRAY_BUFFER,j.current),a.vertexAttribPointer(Y,2,a.FLOAT,!1,0,0)),a.drawArrays(a.TRIANGLES,0,6)}else{const E=t.current;if(E){const V=n.width,q=n.height,{ctx:g}=x(y,L);if(g){g.drawImage(i,0,0,y,L);const $=g.getImageData(0,0,y,L).data,se=y*L*4,A=ce.current,fe=!A||A.length!==se||ie.current||!_.enableDeltaRendering;fe&&(E.fillStyle="#010101",E.fillRect(0,0,V,q),_.enableDeltaRendering&&(ce.current=new Uint8Array($)),ie.current=!1);const Re=_.brightness,ne=_.contrast,Te=_.saturation,de=s.current,he=N.current,_e=B.current;for(let h=0;h<256;h++){let xe=h;Re!==1&&(xe*=Re),ne!==1&&(xe=(xe-128)*ne+128),de[h]=Math.max(0,Math.min(255,Math.floor(xe))),he[h]=h*Te,_e[h]=h*(1-Te)}let Ee=`bold ${_.fontSize}px "JetBrains Mono", "Fira Code", Courier, monospace`;E.font=Ee,E.textAlign="center",E.textBaseline="middle";let le="";const be=R.length,me=_.colorMode,Q=!!_.customDensity;for(let h=0;h<L;h++){const xe=h*p+p/2;for(let ge=0;ge<y;ge++){const O=(h*y+ge)*4,we=$[O],ye=$[O+1],Ce=$[O+2];if(!fe&&_.enableDeltaRendering&&A){const C=A[O],De=A[O+1],Pe=A[O+2];if(Math.abs(we-C)+Math.abs(ye-De)+Math.abs(Ce-Pe)<_.pdhThreshold)continue}fe||(E.fillStyle="#010101",E.fillRect(ge*v-.2,h*p-.2,v+.4,p+.4),le="#010101");const Me=de[we],Ue=de[ye],Le=de[Ce];let Se=Me,Ae=Ue,Fe=Le;if(Te!==1){const C=Me*77+Ue*150+Le*29>>8;Se=Math.max(0,Math.min(255,Math.floor(he[Me]+_e[C]))),Ae=Math.max(0,Math.min(255,Math.floor(he[Ue]+_e[C]))),Fe=Math.max(0,Math.min(255,Math.floor(he[Le]+_e[C])))}const pe=Se*77+Ae*150+Fe*29>>8,je=Q?(h*y+ge)%be:pe*be>>8,Ie=R[je]||R[be-1];if(Ie===" "){_.enableDeltaRendering&&A&&(A[O]=we,A[O+1]=ye,A[O+2]=Ce);continue}Q?E.globalAlpha=pe/255:E.globalAlpha=1;let ve="#FFFFFF";if(me==="rgb")ve=u(Se,Ae,Fe);else if(me==="green"){const C=Math.max(0,Math.min(255,50+(pe*205>>8)));ve=u(0,C,30)}else if(me==="amber"){const C=Math.max(0,Math.min(255,pe));ve=u(C,Math.max(0,Math.min(255,C*166>>8)),0)}else if(me==="mono"){const C=Math.max(0,Math.min(255,pe));ve=u(C,C,C)}else if(me==="cyberpunk"){const C=pe/255*.6+h/L*.4,De=Math.max(0,Math.min(255,Math.floor(0*(1-C)+255*C))),Pe=Math.max(0,Math.min(255,Math.floor(240*(1-C)+10*C))),Xe=Math.max(0,Math.min(255,Math.floor(255*(1-C)+160*C)));ve=u(De,Pe,Xe)}ve!==le&&(E.fillStyle=ve,le=ve);const Ge=ge*v+v/2,We=xe;E.fillText(Ie,Ge,We),_.enableDeltaRendering&&A&&(A[O]=we,A[O+1]=ye,A[O+2]=Ce)}}Q&&(E.globalAlpha=1)}}}};(()=>{if("requestVideoFrameCallback"in i){const n=()=>{f(),r&&(e=i.requestVideoFrameCallback(n))};e=i.requestVideoFrameCallback(n)}else{const n=()=>{f(),r&&(H.current=requestAnimationFrame(n))};H.current=requestAnimationFrame(n)}})(),f();const T=()=>{f()};return i.addEventListener("seeked",T),()=>{r=!1,i.removeEventListener("seeked",T),e!==null&&"cancelVideoFrameCallback"in i&&i.cancelVideoFrameCallback(e),H.current!==null&&cancelAnimationFrame(H.current)}},[i,_]),l.jsx("canvas",{id:"ascii-display-canvas",ref:ee,className:`absolute inset-0 w-full h-full pointer-events-none select-none bg-transparent ${ue}`})},Ne=({className:i="w-4 h-4",fill:d="none"})=>l.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:d,stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",className:i,children:l.jsx("polygon",{points:"6 3 20 12 6 21 6 3"})}),Oe=({className:i="w-4 h-4",fill:d="none"})=>l.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:d,stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",className:i,children:[l.jsx("rect",{x:"14",y:"4",width:"4",height:"16",rx:"1"}),l.jsx("rect",{x:"6",y:"4",width:"4",height:"16",rx:"1"})]}),ze=({className:i="w-4 h-4"})=>l.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",className:i,children:[l.jsx("polygon",{points:"11 5 6 9 2 9 2 15 6 15 11 19 11 5"}),l.jsx("path",{d:"M15.54 8.46a5 5 0 0 1 0 7.07"}),l.jsx("path",{d:"M19.07 4.93a10 10 0 0 1 0 14.14"})]}),qe=({className:i="w-4 h-4"})=>l.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",className:i,children:[l.jsx("polygon",{points:"11 5 6 9 2 9 2 15 6 15 11 19 11 5"}),l.jsx("line",{x1:"22",y1:"9",x2:"16",y2:"15"}),l.jsx("line",{x1:"16",y1:"9",x2:"22",y2:"15"})]}),Ye=({className:i="w-4 h-4"})=>l.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",className:i,children:[l.jsx("polyline",{points:"15 3 21 3 21 9"}),l.jsx("polyline",{points:"9 21 3 21 3 15"}),l.jsx("line",{x1:"21",y1:"3",x2:"14",y2:"10"}),l.jsx("line",{x1:"3",y1:"21",x2:"10",y2:"14"})]}),Be=o.forwardRef(({fontSize:i=7,colorMode:d="rgb",densityPreset:_="standard",customDensity:ue="",brightness:Z=1.15,contrast:ee=1.1,saturation:I=1.25,pdhThreshold:k=18,className:j="",videoClassName:X="",canvasClassName:D="",asciiOpacity:G=1,videoOpacity:ae=0,customControls:H=!1,src:K,autoPlay:te,loop:W,muted:M,playsInline:J=!0,crossOrigin:z="anonymous",style:re,...ce},ie)=>{const S=o.useRef(null),oe=o.useRef(null);o.useImperativeHandle(ie,()=>S.current);const F={fontSize:i,colorMode:d,densityPreset:_,customDensity:ue,brightness:Z,contrast:ee,saturation:I,enableDeltaRendering:!0,pdhThreshold:k,asciiOpacity:G,videoOpacity:ae},[m,t]=o.useState(!1),[b,s]=o.useState(!!M),[N,B]=o.useState(0),[P,x]=o.useState(16/9),[r,e]=o.useState(!1);o.useEffect(()=>{const n=S.current;if(!n)return;const c=()=>t(!0),a=()=>t(!1),w=()=>s(n.muted),v=()=>{n.duration&&B(n.currentTime/n.duration*100)},p=()=>{n.videoWidth&&n.videoHeight&&x(n.videoWidth/n.videoHeight)};return n.addEventListener("play",c),n.addEventListener("pause",a),n.addEventListener("volumechange",w),n.addEventListener("timeupdate",v),n.addEventListener("loadedmetadata",p),t(!n.paused),s(n.muted),()=>{n.removeEventListener("play",c),n.removeEventListener("pause",a),n.removeEventListener("volumechange",w),n.removeEventListener("timeupdate",v),n.removeEventListener("loadedmetadata",p)}},[]),o.useEffect(()=>{const n=S.current;n&&K&&(n.src=K,n.load(),te&&n.play().catch(()=>{}))},[K,te]),o.useEffect(()=>{const n=S.current;n&&(n.muted=!!M,s(!!M))},[M]);const u=()=>{const n=S.current;n&&(n.paused?n.play().catch(()=>{}):n.pause())},f=n=>{n.stopPropagation();const c=S.current;c&&(c.muted=!c.muted,s(c.muted))},U=n=>{n.stopPropagation();const c=S.current;if(!c||!c.duration)return;const a=n.currentTarget.getBoundingClientRect(),v=(n.clientX-a.left)/a.width;c.currentTime=v*c.duration},T=n=>{n.stopPropagation(),oe.current&&(document.fullscreenElement?document.exitFullscreen().catch(()=>{}):oe.current.requestFullscreen().catch(()=>{}))};return l.jsxs("div",{ref:oe,onMouseEnter:()=>e(!0),onMouseLeave:()=>e(!1),className:`relative rounded-xl overflow-hidden bg-[#050505] border border-white/10 group select-none transition-all duration-300 flex items-center justify-center ${j}`,style:{aspectRatio:`${P}`,width:"100%",...re},children:[l.jsx("video",{ref:S,crossOrigin:z,playsInline:J,loop:W,autoPlay:te,muted:b,style:{opacity:ae},className:`absolute inset-0 w-full h-full object-cover select-none bg-black transition-opacity duration-300 pointer-events-none ${X}`,...ce}),l.jsx("div",{className:`absolute inset-0 w-full h-full pointer-events-none select-none transition-opacity duration-300 ${D}`,style:{opacity:G},children:l.jsx(Ve,{videoElement:S.current,videoSrc:K,settings:F})}),H?l.jsxs(l.Fragment,{children:[l.jsx("div",{onClick:u,className:"absolute inset-0 z-10 cursor-pointer flex items-center justify-center bg-black/0 active:bg-black/10 transition-colors"}),!m&&l.jsx("div",{onClick:u,className:"absolute z-20 w-14 h-14 rounded-full border border-white/25 flex items-center justify-center backdrop-blur-md shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer",style:{backgroundColor:"rgba(18,18,18,0.9)",color:"#00FF94"},children:l.jsx(Ne,{className:"w-5 h-5 stroke-none translate-x-[2px]",fill:"currentColor"})}),l.jsxs("div",{className:`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex flex-col gap-3 transition-opacity duration-300 z-20 ${r||!m?"opacity-100":"opacity-0 pointer-events-none"}`,children:[l.jsx("div",{onClick:U,className:"w-full h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer relative group/progress transition-all hover:h-2",children:l.jsx("div",{className:"absolute top-0 left-0 bottom-0 rounded-full shadow-[0_0_8px_rgba(0,255,148,0.6)]",style:{width:`${N}%`,backgroundColor:"#00FF94"}})}),l.jsxs("div",{className:"flex items-center justify-between",children:[l.jsxs("div",{className:"flex items-center gap-3",children:[l.jsx("button",{type:"button",onClick:u,className:"p-1.5 rounded-md hover:bg-white/10 text-white transition-colors",children:m?l.jsx(Oe,{className:"w-4 h-4 fill-white",fill:"currentColor"}):l.jsx(Ne,{className:"w-4 h-4 stroke-none",fill:"#00FF94"})}),l.jsx("button",{type:"button",onClick:f,className:"p-1.5 rounded-md hover:bg-white/10 text-white transition-colors",children:b?l.jsx(qe,{className:"w-4 h-4"}):l.jsx(ze,{className:"w-4 h-4"})})]}),l.jsx("div",{className:"flex items-center gap-3",children:l.jsx("button",{type:"button",onClick:T,className:"p-1.5 rounded-md hover:bg-white/10 text-white transition-colors",children:l.jsx(Ye,{className:"w-4 h-4"})})})]})]})]}):!H&&ce.controls&&l.jsx("div",{className:"absolute bottom-2 right-2 z-20 bg-black/60 px-2 py-1 rounded border border-white/10 text-[9px] font-mono text-white/60",children:"*Use customControls prop for styled overlay controls"})]})});Be.displayName="CodeVideo";const $e=({imageElement:i,settings:d,className:_="",onDimensionsUpdate:ue,onFirstRender:Z,triggerRender:ee=0})=>{const I=o.useRef(null),k=o.useRef(null),j=o.useRef(null),X=o.useRef(null),D=o.useRef(null),G=o.useRef(null),ae=o.useRef(null),H=o.useRef({}),K=o.useRef(-1),te=o.useRef(8),W=o.useRef(6),M=o.useRef(null),J=o.useRef(null),z=o.useRef(null),re=o.useRef(new Map),ce=o.useRef(new Uint8Array(256)),ie=o.useRef(new Float32Array(256)),S=o.useRef(new Float32Array(256)),oe=()=>{if(d.customDensity)return d.customDensity.split("");switch(d.densityPreset){case"blocks":return[" ","░","▒","▓","█"];case"binary":return[" ","0","1"];case"matrix":return[" ","•","▰","▱","▲","▼","◄","►","◈","▣","▤","▥","▦","▧","▨","▩","█"];case"detailed":return" .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$".split("");case"math":return" +-\\/*=%()<>[]{}#&@".split("");case"braille":return[" ","⠁","⠃","⠇","⡇","⣇","⣧","⣷","⣿"];case"stars":return[" ",".","*","+","✦","★","✵","✹","✺"];case"cards":return[" ","♣","♦","♥","♠"];case"alphanumeric":return" 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");case"standard":default:return" .:-=+*#%@".split("")}},F=(m,t)=>(M.current?(M.current.width!==m||M.current.height!==t)&&(M.current.width=m,M.current.height=t):(M.current=document.createElement("canvas"),M.current.width=m,M.current.height=t,J.current=M.current.getContext("2d",{willReadFrequently:!1})),{canvas:M.current,ctx:J.current});return o.useEffect(()=>{const m=I.current;if(!m)return;let t=null;try{t=m.getContext("webgl",{alpha:!1,depth:!1,antialias:!1,preserveDrawingBuffer:!0})||m.getContext("experimental-webgl",{alpha:!1,depth:!1,antialias:!1,preserveDrawingBuffer:!0})}catch(f){console.warn("WebGL initialization failed, falling back to 2D Canvas.",f)}if(!t){z.current=m.getContext("2d");return}k.current=t;const b=`
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
    `,N=(f,U)=>{const T=t.createShader(U);return T?(t.shaderSource(T,f),t.compileShader(T),t.getShaderParameter(T,t.COMPILE_STATUS)?T:(console.error("Shader compilation error:",t.getShaderInfoLog(T)),t.deleteShader(T),null)):null},B=N(b,t.VERTEX_SHADER),P=N(s,t.FRAGMENT_SHADER);if(!B||!P)return;const x=t.createProgram();if(!x)return;if(t.attachShader(x,B),t.attachShader(x,P),t.linkProgram(x),!t.getProgramParameter(x,t.LINK_STATUS)){console.error("Shader program linking error:",t.getProgramInfoLog(x));return}j.current=x,H.current={u_video_texture:t.getUniformLocation(x,"u_video_texture"),u_atlas_texture:t.getUniformLocation(x,"u_atlas_texture"),u_cols:t.getUniformLocation(x,"u_cols"),u_rows:t.getUniformLocation(x,"u_rows"),u_char_count:t.getUniformLocation(x,"u_char_count"),u_brightness:t.getUniformLocation(x,"u_brightness"),u_contrast:t.getUniformLocation(x,"u_contrast"),u_saturation:t.getUniformLocation(x,"u_saturation"),u_color_mode:t.getUniformLocation(x,"u_color_mode"),u_use_sequence:t.getUniformLocation(x,"u_use_sequence")},K.current=t.getAttribLocation(x,"a_position");const r=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,r),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),t.STATIC_DRAW),X.current=r;const e=t.createTexture();t.bindTexture(t.TEXTURE_2D,e),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST),D.current=e;const u=t.createTexture();return t.bindTexture(t.TEXTURE_2D,u),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST),G.current=u,()=>{const f=k.current;f&&(X.current&&f.deleteBuffer(X.current),D.current&&f.deleteTexture(D.current),G.current&&f.deleteTexture(G.current),j.current&&f.deleteProgram(j.current)),k.current=null,z.current=null}},[]),o.useEffect(()=>{const m=k.current,t=I.current;if(!t)return;const b=d.fontSize*.6,s=d.fontSize,N=oe();if(m&&G.current){const x=N.length,r=document.createElement("canvas");r.width=Math.ceil(x*b),r.height=Math.ceil(s);const e=r.getContext("2d");if(e){e.clearRect(0,0,r.width,r.height),e.fillStyle="#FFFFFF",e.font=`bold ${d.fontSize}px "JetBrains Mono", "Fira Code", Courier, monospace`,e.textAlign="center",e.textBaseline="middle";for(let u=0;u<x;u++){const f=N[u],U=u*b+b/2,T=s/2;e.fillText(f,U,T)}m.activeTexture(m.TEXTURE1),m.bindTexture(m.TEXTURE_2D,G.current),m.pixelStorei(m.UNPACK_FLIP_Y_WEBGL,0),m.texImage2D(m.TEXTURE_2D,0,m.RGBA,m.RGBA,m.UNSIGNED_BYTE,r)}}z.current&&re.current.clear();const B=()=>{const x=t.getBoundingClientRect(),r=Math.min(1.5,window.devicePixelRatio||1),e=Math.floor(x.width)||(i==null?void 0:i.naturalWidth)||640,u=Math.floor(x.height)||(i==null?void 0:i.naturalHeight)||360;t.width=e*r,t.height=u*r,te.current=Math.max(8,Math.floor(t.width/b)),W.current=Math.max(6,Math.floor(t.height/s)),m&&m.viewport(0,0,t.width,t.height),ue&&ue(e,u)};B();const P=new ResizeObserver(()=>{B()});return P.observe(t),ae.current=P,()=>{P.disconnect()}},[i,d,ee]),o.useEffect(()=>{if(!i||!i.complete||i.naturalHeight===0)return;const m=()=>{const b=I.current;if(!b)return;const s=k.current,N=j.current,B=d.fontSize*.6,P=d.fontSize,x=oe(),r=te.current,e=W.current;if(s&&N&&D.current&&X.current){s.viewport(0,0,b.width,b.height),s.clearColor(.0196,.0196,.0196,1),s.clear(s.COLOR_BUFFER_BIT),s.useProgram(N),s.activeTexture(s.TEXTURE0),s.bindTexture(s.TEXTURE_2D,D.current),s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,1),s.texImage2D(s.TEXTURE_2D,0,s.RGBA,s.RGBA,s.UNSIGNED_BYTE,i),s.activeTexture(s.TEXTURE1),s.bindTexture(s.TEXTURE_2D,G.current);let u=0;d.colorMode==="green"?u=1:d.colorMode==="amber"?u=2:d.colorMode==="mono"?u=3:d.colorMode==="cyberpunk"&&(u=4);const f=H.current;s.uniform1i(f.u_video_texture||null,0),s.uniform1i(f.u_atlas_texture||null,1),s.uniform1f(f.u_cols||null,r),s.uniform1f(f.u_rows||null,e),s.uniform1f(f.u_char_count||null,x.length),s.uniform1f(f.u_brightness||null,d.brightness),s.uniform1f(f.u_contrast||null,d.contrast),s.uniform1f(f.u_saturation||null,d.saturation),s.uniform1i(f.u_color_mode||null,u),s.uniform1i(f.u_use_sequence||null,d.customDensity?1:0);const U=K.current;U!==-1&&(s.enableVertexAttribArray(U),s.bindBuffer(s.ARRAY_BUFFER,X.current),s.vertexAttribPointer(U,2,s.FLOAT,!1,0,0)),s.drawArrays(s.TRIANGLES,0,6),Z&&Z()}else{const u=z.current;if(u){const f=b.width,U=b.height,{ctx:T}=F(r,e);if(T){T.drawImage(i,0,0,r,e);const c=T.getImageData(0,0,r,e).data;u.fillStyle="#010101",u.fillRect(0,0,f,U);const a=d.brightness,w=d.contrast,v=d.saturation,p=ce.current,R=ie.current,y=S.current;for(let g=0;g<256;g++){let Y=g;a!==1&&(Y*=a),w!==1&&(Y=(Y-128)*w+128),p[g]=Math.max(0,Math.min(255,Math.floor(Y))),R[g]=g*v,y[g]=g*(1-v)}u.font=`bold ${d.fontSize}px "JetBrains Mono", "Fira Code", Courier, monospace`,u.textAlign="center",u.textBaseline="middle";let L="";const E=x.length,V=d.colorMode,q=(g,Y,$)=>{const se=Math.min(255,g>>4<<4),A=Math.min(255,Y>>4<<4),fe=Math.min(255,$>>4<<4),Re=se>>4<<8|A>>4<<4|fe>>4;let ne=re.current.get(Re);return ne||(ne=`rgb(${se},${A},${fe})`,re.current.set(Re,ne)),ne};for(let g=0;g<e;g++){const Y=g*P+P/2;for(let $=0;$<r;$++){const se=(g*r+$)*4,A=c[se],fe=c[se+1],Re=c[se+2],ne=p[A],Te=p[fe],de=p[Re];let he=ne,_e=Te,Ee=de;if(v!==1){const h=ne*77+Te*150+de*29>>8;he=Math.max(0,Math.min(255,Math.floor(R[ne]+y[h]))),_e=Math.max(0,Math.min(255,Math.floor(R[Te]+y[h]))),Ee=Math.max(0,Math.min(255,Math.floor(R[de]+y[h])))}const le=he*77+_e*150+Ee*29>>8,be=le*E>>8,me=x[be]||x[E-1];if(me===" ")continue;let Q="#FFFFFF";if(V==="rgb")Q=q(he,_e,Ee);else if(V==="green"){const h=Math.max(0,Math.min(255,50+(le*205>>8)));Q=q(0,h,30)}else if(V==="amber"){const h=Math.max(0,Math.min(255,le));Q=q(h,Math.max(0,Math.min(255,h*166>>8)),0)}else if(V==="mono"){const h=Math.max(0,Math.min(255,le));Q=q(h,h,h)}else if(V==="cyberpunk"){const h=le/255*.6+g/e*.4,xe=Math.max(0,Math.min(255,Math.floor(0*(1-h)+255*h))),ge=Math.max(0,Math.min(255,Math.floor(240*(1-h)+10*h))),O=Math.max(0,Math.min(255,Math.floor(255*(1-h)+160*h)));Q=q(xe,ge,O)}Q!==L&&(u.fillStyle=Q,L=Q),u.fillText(me,$*B+B/2,Y)}}}}Z&&Z()}},t=requestAnimationFrame(()=>{m()});return()=>cancelAnimationFrame(t)},[i,d,ee]),l.jsx("canvas",{id:"ascii-image-display-canvas",ref:I,className:`absolute inset-0 w-full h-full pointer-events-none select-none bg-transparent ${_}`})},ke=o.forwardRef(({fontSize:i=7,colorMode:d="rgb",densityPreset:_="standard",customDensity:ue="",brightness:Z=1.15,contrast:ee=1.1,saturation:I=1.25,pdhThreshold:k=18,className:j="",imageClassName:X="",canvasClassName:D="",asciiOpacity:G=1,imageOpacity:ae=0,hoverFontSize:H=2,hoverSaturation:K=1,rounded:te=!1,src:W,alt:M="",crossOrigin:J="anonymous",style:z,onLoad:re,...ce},ie)=>{const S=o.useRef(null),oe=o.useRef(null);o.useImperativeHandle(ie,()=>S.current);const[F,m]=o.useState(!1),[t,b]=o.useState(16/9),[s,N]=o.useState(!1),[B,P]=o.useState(!1),[x,r]=o.useState(0),f={fontSize:F?H:i,colorMode:d,densityPreset:_,customDensity:ue,brightness:Z,contrast:ee,saturation:F?K:I,enableDeltaRendering:!1,pdhThreshold:k,asciiOpacity:G,videoOpacity:ae},U=n=>{const c=n.currentTarget;c.naturalWidth&&c.naturalHeight&&b(c.naturalWidth/c.naturalHeight),N(!0),r(a=>a+1),re&&re(n)},T=()=>{P(!0)};return o.useEffect(()=>{const n=S.current;n&&n.complete&&n.naturalWidth>0&&(b(n.naturalWidth/n.naturalHeight),N(!0),r(c=>c+1))},[]),l.jsxs("div",{ref:oe,onMouseEnter:()=>m(!0),onMouseLeave:()=>m(!1),className:`relative overflow-hidden bg-[#050505] border border-white/10 group select-none transition-all duration-300 flex items-center justify-center ${te?"rounded-xl":""} ${j}`,style:{aspectRatio:`${t}`,width:"100%",...z},children:[l.jsx("img",{ref:S,src:W,alt:M,crossOrigin:J,onLoad:U,style:{opacity:B?ae:0},className:`absolute inset-0 w-full h-full object-cover select-none bg-black transition-opacity duration-300 pointer-events-none ${X}`,...ce}),s&&l.jsx("div",{className:`absolute inset-0 w-full h-full pointer-events-none select-none transition-opacity duration-300 ${D}`,style:{opacity:B?G:0},children:l.jsx($e,{imageElement:S.current,settings:f,triggerRender:x,onFirstRender:T})})]})});ke.displayName="CodeImage";exports.CodeImage=ke;exports.CodeVideo=Be;
//# sourceMappingURL=index.cjs.map
