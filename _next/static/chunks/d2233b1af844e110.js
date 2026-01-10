(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,52683,e=>{"use strict";var r=e.i(43476),t=e.i(71645);function a(){let e=(0,t.useRef)(null);return(0,t.useEffect)(()=>{let r=e.current;if(!r)return;let t=`
uniform mat4 uProjection;
uniform mat4 uModelview;
uniform vec3 uResolution;
uniform vec3 uOffset;
uniform vec3 uDOF;
uniform vec3 uFade;

attribute vec3 aPosition;
attribute vec3 aEuler;
attribute vec2 aMisc;

varying vec3 pposition;
varying float psize;
varying float palpha;
varying float pdist;

varying vec3 normX;
varying vec3 normY;
varying vec3 normZ;
varying vec3 normal;

varying float diffuse;
varying float specular;
varying float rstop;
varying float distancefade;

void main(void) {
    vec4 pos = uModelview * vec4(aPosition + uOffset, 1.0);
    gl_Position = uProjection * pos;
    gl_PointSize = aMisc.x * uProjection[1][1] / -pos.z * uResolution.y * 0.5;

    pposition = pos.xyz;
    psize = aMisc.x;
    pdist = length(pos.xyz);
    palpha = smoothstep(0.0, 1.0, (pdist - 0.1) / uFade.z);

    vec3 elrsn = sin(aEuler);
    vec3 elrcs = cos(aEuler);
    mat3 rotx = mat3(
        1.0, 0.0, 0.0,
        0.0, elrcs.x, elrsn.x,
        0.0, -elrsn.x, elrcs.x
    );
    mat3 roty = mat3(
        elrcs.y, 0.0, -elrsn.y,
        0.0, 1.0, 0.0,
        elrsn.y, 0.0, elrcs.y
    );
    mat3 rotz = mat3(
        elrcs.z, elrsn.z, 0.0,
        -elrsn.z, elrcs.z, 0.0,
        0.0, 0.0, 1.0
    );
    mat3 rotmat = rotx * roty * rotz;
    normal = rotmat[2];

    mat3 trrotm = mat3(
        rotmat[0][0], rotmat[1][0], rotmat[2][0],
        rotmat[0][1], rotmat[1][1], rotmat[2][1],
        rotmat[0][2], rotmat[1][2], rotmat[2][2]
    );
    normX = trrotm[0];
    normY = trrotm[1];
    normZ = trrotm[2];

    const vec3 lit = vec3(0.6917144638660746, 0.6917144638660746, -0.20751433915982237);

    float tmpdfs = dot(lit, normal);
    if(tmpdfs < 0.0) {
        normal = -normal;
        tmpdfs = dot(lit, normal);
    }
    diffuse = 0.4 + tmpdfs;

    vec3 eyev = normalize(-pos.xyz);
    if(dot(eyev, normal) > 0.0) {
        vec3 hv = normalize(eyev + lit);
        specular = pow(max(dot(hv, normal), 0.0), 20.0);
    }
    else {
        specular = 0.0;
    }

    rstop = clamp((abs(pdist - uDOF.x) - uDOF.y) / uDOF.z, 0.0, 1.0);
    rstop = pow(rstop, 0.5);
    distancefade = min(1.0, exp((uFade.x - pdist) * 0.69315 / uFade.y));
}
`,a=`
#ifdef GL_ES
precision highp float;
#endif

uniform vec3 uDOF;
uniform vec3 uFade;

const vec3 fadeCol = vec3(0.08, 0.03, 0.06);

varying vec3 pposition;
varying float psize;
varying float palpha;
varying float pdist;

varying vec3 normX;
varying vec3 normY;
varying vec3 normZ;
varying vec3 normal;

varying float diffuse;
varying float specular;
varying float rstop;
varying float distancefade;

float ellipse(vec2 p, vec2 o, vec2 r) {
    vec2 lp = (p - o) / r;
    return length(lp) - 1.0;
}

void main(void) {
    vec3 p = vec3(gl_PointCoord - vec2(0.5, 0.5), 0.0) * 2.0;
    vec3 d = vec3(0.0, 0.0, -1.0);
    float nd = normZ.z;
    if(abs(nd) < 0.0001) discard;

    float np = dot(normZ, p);
    vec3 tp = p + d * np / nd;
    vec2 coord = vec2(dot(normX, tp), dot(normY, tp));

    const float flwrsn = 0.258819045102521;
    const float flwrcs = 0.965925826289068;
    mat2 flwrm = mat2(flwrcs, -flwrsn, flwrsn, flwrcs);
    vec2 flwrp = vec2(abs(coord.x), coord.y) * flwrm;

    float r;
    if(flwrp.x < 0.0) {
        r = ellipse(flwrp, vec2(0.065, 0.024) * 0.5, vec2(0.36, 0.96) * 0.5);
    }
    else {
        r = ellipse(flwrp, vec2(0.065, 0.024) * 0.5, vec2(0.58, 0.96) * 0.5);
    }

    if(r > rstop) discard;

    vec3 col = mix(vec3(1.0, 0.8, 0.75), vec3(1.0, 0.9, 0.87), r);
    float grady = mix(0.0, 1.0, pow(coord.y * 0.5 + 0.5, 0.35));
    col *= vec3(1.0, grady, grady);
    col *= mix(0.8, 1.0, pow(abs(coord.x), 0.3));
    col = col * diffuse + specular;

    col = mix(fadeCol, col, distancefade);

    float alpha = (rstop > 0.001)? (0.5 - r / (rstop * 2.0)) : 1.0;
    alpha = smoothstep(0.0, 1.0, alpha) * palpha;

    gl_FragColor = vec4(col * 0.5, alpha);
}
`,o=`
uniform vec3 uResolution;
attribute vec2 aPosition;

varying vec2 texCoord;
varying vec2 screenCoord;

void main(void) {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    texCoord = aPosition.xy * 0.5 + vec2(0.5, 0.5);
    screenCoord = aPosition.xy * vec2(uResolution.z, 1.0);
}
`,i=`
#ifdef GL_ES
precision highp float;
#endif

uniform vec2 uTimes;

varying vec2 texCoord;
varying vec2 screenCoord;

void main(void) {
    vec3 col;
    float c;
    vec2 tmpv = texCoord * vec2(0.8, 1.0) - vec2(0.95, 1.0);
    c = exp(-pow(length(tmpv) * 1.8, 2.0));
    col = mix(vec3(0.02, 0.0, 0.03), vec3(0.96, 0.98, 1.0) * 1.5, c);
    gl_FragColor = vec4(col * 0.5, 1.0);
}
`,n=`
#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D uSrc;
uniform vec2 uDelta;

varying vec2 texCoord;
varying vec2 screenCoord;

void main(void) {
    vec4 col = texture2D(uSrc, texCoord);
    gl_FragColor = vec4(col.rgb * 2.0 - vec3(0.5), 1.0);
}
`,l=`
#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D uSrc;
uniform vec2 uDelta;
uniform vec4 uBlurDir;

varying vec2 texCoord;
varying vec2 screenCoord;

void main(void) {
    vec4 col = texture2D(uSrc, texCoord);
    col = col + texture2D(uSrc, texCoord + uBlurDir.xy * uDelta);
    col = col + texture2D(uSrc, texCoord - uBlurDir.xy * uDelta);
    col = col + texture2D(uSrc, texCoord + (uBlurDir.xy + uBlurDir.zw) * uDelta);
    col = col + texture2D(uSrc, texCoord - (uBlurDir.xy + uBlurDir.zw) * uDelta);
    gl_FragColor = col / 5.0;
}
`,f=`
uniform vec3 uResolution;
attribute vec2 aPosition;
varying vec2 texCoord;
varying vec2 screenCoord;
void main(void) {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    texCoord = aPosition.xy * 0.5 + vec2(0.5, 0.5);
    screenCoord = aPosition.xy * vec2(uResolution.z, 1.0);
}
`,s=`
#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D uSrc;
uniform sampler2D uBloom;
uniform vec2 uDelta;
varying vec2 texCoord;
varying vec2 screenCoord;
void main(void) {
    vec4 srccol = texture2D(uSrc, texCoord) * 2.0;
    vec4 bloomcol = texture2D(uBloom, texCoord);
    vec4 col;
    col = srccol + bloomcol * (vec4(1.0) + srccol);
    col *= smoothstep(1.0, 0.0, pow(length((texCoord - vec2(0.5)) * 2.0), 1.2) * 0.5);
    col = pow(col, vec4(0.45454545454545));

    gl_FragColor = vec4(col.rgb, 1.0);
    gl_FragColor.a = 1.0;
}
`,u=function(e,r,t){return{x:e,y:r,z:t,array:null}},c=function(e,r,t){e.x=r.y*t.z-r.z*t.y,e.y=r.z*t.x-r.x*t.z,e.z=r.x*t.y-r.y*t.x},m=function(e){let r=e.x*e.x+e.y*e.y+e.z*e.z;r>1e-5&&(r=1/Math.sqrt(r),e.x*=r,e.y*=r,e.z*=r)},d=function(e){return e.array?(e.array[0]=e.x,e.array[1]=e.y,e.array[2]=e.z):e.array=new Float32Array([e.x,e.y,e.z]),e.array},h=function(){return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])},p=function(e,r,t,a,o){let i=a*Math.tan(t*Math.PI/180*.5)*2;e[0]=2*a/(i*r),e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=2*a/i,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=-(o+a)/(o-a),e[11]=-1,e[12]=0,e[13]=0,e[14]=-2*o*a/(o-a),e[15]=0},v=function(e,r,t,a){let o=u(r.x-t.x,r.y-t.y,r.z-t.z);m(o);let i=u(1,0,0);c(i,a,o),m(i);let n=u(1,0,0);c(n,o,i),m(n),e[0]=i.x,e[1]=n.x,e[2]=o.x,e[3]=0,e[4]=i.y,e[5]=n.y,e[6]=o.y,e[7]=0,e[8]=i.z,e[9]=n.z,e[10]=o.z,e[11]=0,e[12]=-(r.x*e[0]+r.y*e[4]+r.z*e[8]),e[13]=-(r.x*e[1]+r.y*e[5]+r.z*e[9]),e[14]=-(r.x*e[2]+r.y*e[6]+r.z*e[10]),e[15]=1},y={start:new Date,prev:new Date,delta:0,elapsed:0},g=null,x={width:0,height:0,aspect:1,array:new Float32Array(3),halfWidth:0,halfHeight:0,halfArray:new Float32Array(3),pointSize:{min:0,max:0},mainRT:null,wFullRT0:null,wFullRT1:null,wHalfRT0:null,wHalfRT1:null,setSize:function(e,r){x.width=e,x.height=r,x.aspect=x.width/x.height,x.array[0]=x.width,x.array[1]=x.height,x.array[2]=x.aspect,x.halfWidth=Math.floor(e/2),x.halfHeight=Math.floor(r/2),x.halfArray[0]=x.halfWidth,x.halfArray[1]=x.halfHeight,x.halfArray[2]=x.halfWidth/x.halfHeight}},R={angle:60,nearfar:new Float32Array([.1,100]),matrix:h()},E={position:u(0,0,100),lookat:u(0,0,0),up:u(0,1,0),dof:u(10,4,8),matrix:h()};class T{velocity=[0,0,0];rotation=[0,0,0];position=[0,0,0];euler=[0,0,0];size=1;alpha=1;zkey=0;setVelocity(e,r,t){this.velocity[0]=e,this.velocity[1]=r,this.velocity[2]=t}setRotation(e,r,t){this.rotation[0]=e,this.rotation[1]=r,this.rotation[2]=t}setPosition(e,r,t){this.position[0]=e,this.position[1]=r,this.position[2]=t}setEulerAngles(e,r,t){this.euler[0]=e,this.euler[1]=r,this.euler[2]=t}setSize(e){this.size=e}update(e){this.position[0]+=this.velocity[0]*e,this.position[1]+=this.velocity[1]*e,this.position[2]+=this.velocity[2]*e,this.euler[0]+=this.rotation[0]*e,this.euler[1]+=this.rotation[1]*e,this.euler[2]+=this.rotation[2]*e}}let F={program:null,offset:new Float32Array([0,0,0]),fader:u(0,10,0),numFlowers:1600,particles:[],dataArray:null,positionArrayOffset:0,eulerArrayOffset:0,miscArrayOffset:0,buffer:null,area:u(20,20,20)},A={sceneBg:null,mkBrightBuf:null,dirBlur:null,finalComp:null},w=!1,B=!0;function b(e){g&&(g.deleteFramebuffer(e.frameBuffer),g.deleteRenderbuffer(e.renderBuffer),g.deleteTexture(e.texture))}function D(e,r){if(!g)return null;let t={width:e,height:r,sizeArray:new Float32Array([e,r,e/r]),dtxArray:new Float32Array([1/e,1/r]),frameBuffer:g.createFramebuffer(),renderBuffer:g.createRenderbuffer(),texture:g.createTexture()};return g.bindTexture(g.TEXTURE_2D,t.texture),g.texImage2D(g.TEXTURE_2D,0,g.RGBA,e,r,0,g.RGBA,g.UNSIGNED_BYTE,null),g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_S,g.CLAMP_TO_EDGE),g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_T,g.CLAMP_TO_EDGE),g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MAG_FILTER,g.LINEAR),g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.LINEAR),g.bindFramebuffer(g.FRAMEBUFFER,t.frameBuffer),g.framebufferTexture2D(g.FRAMEBUFFER,g.COLOR_ATTACHMENT0,g.TEXTURE_2D,t.texture,0),g.bindRenderbuffer(g.RENDERBUFFER,t.renderBuffer),g.renderbufferStorage(g.RENDERBUFFER,g.DEPTH_COMPONENT16,e,r),g.framebufferRenderbuffer(g.FRAMEBUFFER,g.DEPTH_ATTACHMENT,g.RENDERBUFFER,t.renderBuffer),g.bindTexture(g.TEXTURE_2D,null),g.bindRenderbuffer(g.RENDERBUFFER,null),g.bindFramebuffer(g.FRAMEBUFFER,null),t}function _(e,r){if(!g)return null;let t=g.createShader(e);if(!t)return null;if(g.shaderSource(t,r),g.compileShader(t),!g.getShaderParameter(t,g.COMPILE_STATUS)){let e=g.getShaderInfoLog(t);return g.deleteShader(t),console.error(e),null}return t}function z(e,r,t,a){if(!g)return null;let o=_(g.VERTEX_SHADER,e),i=_(g.FRAGMENT_SHADER,r);if(null==o||null==i)return null;let n=g.createProgram();if(!n)return null;if(g.attachShader(n,o),g.attachShader(n,i),g.deleteShader(o),g.deleteShader(i),g.linkProgram(n),!g.getProgramParameter(n,g.LINK_STATUS))return console.error(g.getProgramInfoLog(n)),null;n.uniforms={};for(let e=0;e<t.length;e++)n.uniforms[t[e]]=g.getUniformLocation(n,t[e]);n.attributes={};for(let e=0;e<a.length;e++){let r=a[e];n.attributes[r]=g.getAttribLocation(n,r)}return n}function P(e){if(g)for(let r in g.useProgram(e),e.attributes)g.enableVertexAttribArray(e.attributes[r])}function C(e){if(g){for(let r in e.attributes)g.disableVertexAttribArray(e.attributes[r]);g.useProgram(null)}}function S(e,r,t,a){if(!g)return null;let o=["uResolution","uSrc","uDelta"];t&&(o=o.concat(t));let i=["aPosition"];a&&(i=i.concat(a));let n=z(e,r,o,i);if(!n)return null;P(n);let l=new Float32Array([-1,-1,1,-1,-1,1,1,1]),f=g.createBuffer();return g.bindBuffer(g.ARRAY_BUFFER,f),g.bufferData(g.ARRAY_BUFFER,l,g.STATIC_DRAW),g.bindBuffer(g.ARRAY_BUFFER,null),C(n),{program:n,dataArray:l,buffer:f}}function M(e,r){if(!g)return;let t=e.program;P(t),g.uniform3fv(t.uniforms.uResolution,x.array),null!=r&&(g.uniform2fv(t.uniforms.uDelta,r.dtxArray),g.uniform1i(t.uniforms.uSrc,0),g.activeTexture(g.TEXTURE0),g.bindTexture(g.TEXTURE_2D,r.texture))}function O(e){g&&(g.bindBuffer(g.ARRAY_BUFFER,e.buffer),g.vertexAttribPointer(e.program.attributes.aPosition,2,g.FLOAT,!1,0,0),g.drawArrays(g.TRIANGLE_STRIP,0,4))}function U(e){C(e.program)}function H(){!function(){F.area=u(20,20,20),F.area.x=F.area.y*x.aspect,F.fader.x=10,F.fader.y=F.area.z,F.fader.z=.1;let e=2*Math.PI,r=u(0,0,0),t=function(){return 2*Math.random()-1};for(let a=0;a<F.numFlowers;a++){let o=F.particles[a];r.x=.3*t()+.8,r.y=.2*t()-1,r.z=.3*t()+.5,m(r);let i=2+ +Math.random();o.setVelocity(r.x*i,r.y*i,r.z*i),o.setRotation(t()*e*.5,t()*e*.5,t()*e*.5),o.setPosition(t()*F.area.x,t()*F.area.y,t()*F.area.z),o.setEulerAngles(Math.random()*Math.PI*2,Math.random()*Math.PI*2,Math.random()*Math.PI*2),o.setSize(.9+.1*Math.random())}}(),E.position.z=F.area.z+R.nearfar[0],R.angle=180*Math.atan2(F.area.y,E.position.z+F.area.z)/Math.PI*2,p(R.matrix,x.aspect,R.angle,R.nearfar[0],R.nearfar[1])}function I(){g&&(x.setSize(g.canvas.width,g.canvas.height),g.clearColor(.2,.2,.5,1),g.viewport(0,0,x.width,x.height),x.mainRT&&b(x.mainRT),x.wFullRT0&&b(x.wFullRT0),x.wFullRT1&&b(x.wFullRT1),x.wHalfRT0&&b(x.wHalfRT0),x.wHalfRT1&&b(x.wHalfRT1),x.mainRT=D(x.width,x.height),x.wFullRT0=D(x.width,x.height),x.wFullRT1=D(x.width,x.height),x.wHalfRT0=D(x.halfWidth,x.halfHeight),x.wHalfRT1=D(x.halfWidth,x.halfHeight))}function L(e){let r=document.body,t=document.documentElement,a=Math.max(r.clientWidth,r.scrollWidth,t.scrollWidth,t.clientWidth),o=Math.max(r.clientHeight,r.scrollHeight,t.scrollHeight,t.clientHeight);e.width=a,e.height=o}function N(){r&&(L(r),I(),w&&H())}try{L(r),g=r.getContext("experimental-webgl")||r.getContext("webgl")}catch(e){console.error("WebGL not supported.",e);return}return g?(window.addEventListener("resize",N),I(),A.sceneBg=S(o,i,["uTimes"],null),A.mkBrightBuf=S(o,n,null,null),A.dirBlur=S(o,l,["uBlurDir"],null),A.finalComp=S(f,s,["uBloom"],null),function(){if(!g)return;let e=g.getParameter(g.ALIASED_POINT_SIZE_RANGE);if(x.pointSize={min:e[0],max:e[1]},F.program=z(t,a,["uProjection","uModelview","uResolution","uOffset","uDOF","uFade"],["aPosition","aEuler","aMisc"]),F.program){P(F.program),F.offset=new Float32Array([0,0,0]),F.fader=u(0,10,0),F.numFlowers=1600,F.particles=Array(F.numFlowers),F.dataArray=new Float32Array(8*F.numFlowers),F.positionArrayOffset=0,F.eulerArrayOffset=3*F.numFlowers,F.miscArrayOffset=6*F.numFlowers,F.buffer=g.createBuffer(),g.bindBuffer(g.ARRAY_BUFFER,F.buffer),g.bufferData(g.ARRAY_BUFFER,F.dataArray,g.DYNAMIC_DRAW),g.bindBuffer(g.ARRAY_BUFFER,null),C(F.program);for(let e=0;e<F.numFlowers;e++)F.particles[e]=new T}}(),w=!0,H(),y.start=new Date,y.prev=y.start,!function e(){let r=new Date;y.elapsed=(r.getTime()-y.start.getTime())/1e3,y.delta=(r.getTime()-y.prev.getTime())/1e3,y.prev=r,B&&requestAnimationFrame(e),g&&x.mainRT&&(v(E.matrix,E.position,E.lookat,E.up),g.enable(g.DEPTH_TEST),g.bindFramebuffer(g.FRAMEBUFFER,x.mainRT.frameBuffer),g.viewport(0,0,x.mainRT.width,x.mainRT.height),g.clearColor(.005,0,.05,0),g.clear(g.COLOR_BUFFER_BIT|g.DEPTH_BUFFER_BIT),g&&A.sceneBg&&(g.disable(g.DEPTH_TEST),M(A.sceneBg,null),g.uniform2f(A.sceneBg.program.uniforms.uTimes,y.elapsed,y.delta),O(A.sceneBg),U(A.sceneBg),g.enable(g.DEPTH_TEST)),function(){if(!g||!F.program||!F.dataArray)return;let e=2*Math.PI,r=function(e,r,t){Math.abs(e.position[r])-.5*e.size>t&&(e.position[r]>0?e.position[r]-=2*t:e.position[r]+=2*t)},t=function(r,t){r.euler[t]=r.euler[t]%e,r.euler[t]<0&&(r.euler[t]+=e)};for(let e=0;e<F.numFlowers;e++){let a=F.particles[e];a.update(y.delta),r(a,0,F.area.x),r(a,1,F.area.y),r(a,2,F.area.z),t(a,0),t(a,1),t(a,2),a.alpha=1,a.zkey=E.matrix[2]*a.position[0]+E.matrix[6]*a.position[1]+E.matrix[10]*a.position[2]+E.matrix[14]}F.particles.sort(function(e,r){return e.zkey-r.zkey});let a=F.positionArrayOffset,o=F.eulerArrayOffset,i=F.miscArrayOffset;for(let e=0;e<F.numFlowers;e++){let r=F.particles[e];F.dataArray[a]=r.position[0],F.dataArray[a+1]=r.position[1],F.dataArray[a+2]=r.position[2],a+=3,F.dataArray[o]=r.euler[0],F.dataArray[o+1]=r.euler[1],F.dataArray[o+2]=r.euler[2],o+=3,F.dataArray[i]=r.size,F.dataArray[i+1]=r.alpha,i+=2}g.enable(g.BLEND),g.blendFunc(g.SRC_ALPHA,g.ONE_MINUS_SRC_ALPHA);let n=F.program;P(n),g.uniformMatrix4fv(n.uniforms.uProjection,!1,R.matrix),g.uniformMatrix4fv(n.uniforms.uModelview,!1,E.matrix),g.uniform3fv(n.uniforms.uResolution,x.array),g.uniform3fv(n.uniforms.uDOF,d(E.dof)),g.uniform3fv(n.uniforms.uFade,d(F.fader)),g.bindBuffer(g.ARRAY_BUFFER,F.buffer),g.bufferData(g.ARRAY_BUFFER,F.dataArray,g.DYNAMIC_DRAW),g.vertexAttribPointer(n.attributes.aPosition,3,g.FLOAT,!1,0,F.positionArrayOffset*Float32Array.BYTES_PER_ELEMENT),g.vertexAttribPointer(n.attributes.aEuler,3,g.FLOAT,!1,0,F.eulerArrayOffset*Float32Array.BYTES_PER_ELEMENT),g.vertexAttribPointer(n.attributes.aMisc,2,g.FLOAT,!1,0,F.miscArrayOffset*Float32Array.BYTES_PER_ELEMENT);for(let e=1;e<2;e++){let r=-2*e;F.offset[0]=-1*F.area.x,F.offset[1]=-1*F.area.y,F.offset[2]=F.area.z*r,g.uniform3fv(n.uniforms.uOffset,F.offset),g.drawArrays(g.POINTS,0,F.numFlowers),F.offset[0]=-1*F.area.x,F.offset[1]=+F.area.y,F.offset[2]=F.area.z*r,g.uniform3fv(n.uniforms.uOffset,F.offset),g.drawArrays(g.POINTS,0,F.numFlowers),F.offset[0]=+F.area.x,F.offset[1]=-1*F.area.y,F.offset[2]=F.area.z*r,g.uniform3fv(n.uniforms.uOffset,F.offset),g.drawArrays(g.POINTS,0,F.numFlowers),F.offset[0]=+F.area.x,F.offset[1]=+F.area.y,F.offset[2]=F.area.z*r,g.uniform3fv(n.uniforms.uOffset,F.offset),g.drawArrays(g.POINTS,0,F.numFlowers)}F.offset[0]=0,F.offset[1]=0,F.offset[2]=0,g.uniform3fv(n.uniforms.uOffset,F.offset),g.drawArrays(g.POINTS,0,F.numFlowers),g.bindBuffer(g.ARRAY_BUFFER,null),C(n),g.enable(g.DEPTH_TEST),g.disable(g.BLEND)}(),function(){if(!g||!A.mkBrightBuf||!A.dirBlur||!A.finalComp||!x.mainRT||!x.wHalfRT0||!x.wHalfRT1)return;g.disable(g.DEPTH_TEST);let e=function(e,r){g&&(g.bindFramebuffer(g.FRAMEBUFFER,e.frameBuffer),g.viewport(0,0,e.width,e.height),r&&(g.clearColor(0,0,0,0),g.clear(g.COLOR_BUFFER_BIT|g.DEPTH_BUFFER_BIT)))};e(x.wHalfRT0,!0),M(A.mkBrightBuf,x.mainRT),O(A.mkBrightBuf),U(A.mkBrightBuf);for(let r=0;r<2;r++){let t=1.5+ +r,a=2+ +r;e(x.wHalfRT1,!0),M(A.dirBlur,x.wHalfRT0),g.uniform4f(A.dirBlur.program.uniforms.uBlurDir,t,0,a,0),O(A.dirBlur),U(A.dirBlur),e(x.wHalfRT0,!0),M(A.dirBlur,x.wHalfRT1),g.uniform4f(A.dirBlur.program.uniforms.uBlurDir,0,t,0,a),O(A.dirBlur),U(A.dirBlur)}g.bindFramebuffer(g.FRAMEBUFFER,null),g.viewport(0,0,x.width,x.height),g.clear(g.COLOR_BUFFER_BIT|g.DEPTH_BUFFER_BIT),M(A.finalComp,x.mainRT),g.uniform1i(A.finalComp.program.uniforms.uBloom,1),g.activeTexture(g.TEXTURE1),g.bindTexture(g.TEXTURE_2D,x.wHalfRT0.texture),O(A.finalComp),U(A.finalComp),g.enable(g.DEPTH_TEST)}())}(),()=>{B=!1,window.removeEventListener("resize",N)}):void console.error("WebGL not supported.")},[]),(0,r.jsx)("canvas",{ref:e,id:"sakura",style:{zIndex:2,position:"fixed",left:0,top:0,height:"100vh",width:"100vw",padding:0,margin:0}})}let o="Facebook",i=[{text:"点我购买脸书白号",href:"https://shop.zmfaka.cn/shop/24XZCD9E"},{text:"点我购买脸书白号",href:"https://shop.zmfaka.cn/shop/24XZCD9E"},{text:"点我购买脸书白号",href:"https://shop.zmfaka.cn/shop/24XZCD9E"},{text:"点我购买脸书白号",href:"https://shop.zmfaka.cn/shop/24XZCD9E"},{text:"点我购买脸书白号",href:"https://shop.zmfaka.cn/shop/24XZCD9E"},{text:"点我购买脸书白号",href:"https://shop.zmfaka.cn/shop/24XZCD9E"}],n=[{name:"QQ",icon:"/images/svg/qq.svg",href:"https://shop.zmfaka.cn/shop/24XZCD9E"},{name:"Mail",icon:"/images/svg/mail.svg",href:"https://shop.zmfaka.cn/shop/24XZCD9E"},{name:"Github",icon:"/images/svg/github.svg",href:"https://shop.zmfaka.cn/shop/24XZCD9E"},{name:"Gitee",icon:"/images/svg/gitee.svg",href:"https://shop.zmfaka.cn/shop/24XZCD9E"}];function l(){let[e,l]=(0,t.useState)(new Date().getFullYear());return(0,t.useEffect)(()=>{let e=setTimeout(()=>{document.body.classList.remove("is-preload")},100);return l(new Date().getFullYear()),()=>clearTimeout(e)},[]),(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{id:"wrapper",children:[(0,r.jsxs)("header",{id:"header",children:[(0,r.jsx)("div",{className:"icon",children:(0,r.jsx)("img",{src:"/images/favicon.ico",alt:o,title:o,className:"logo"})}),(0,r.jsx)("div",{className:"content",children:(0,r.jsxs)("div",{className:"inner",children:[(0,r.jsx)("h1",{children:o}),(0,r.jsx)("p",{children:"你顺手挽住火焰 化作漫天大雪"})]})}),(0,r.jsx)("nav",{children:(0,r.jsx)("ul",{children:i.map((e,t)=>(0,r.jsx)("li",{children:(0,r.jsx)("a",{target:"_blank",href:e.href,rel:"noopener noreferrer",children:e.text})},t))})})]}),(0,r.jsxs)("footer",{id:"footer",children:[(0,r.jsxs)("p",{className:"copyright",children:["Copyright © 2021 - ",e," ",o,(0,r.jsx)("br",{}),"All Rights Reserved"]}),(0,r.jsx)("p",{className:"copyright contact-icons",children:n.map((e,t)=>(0,r.jsx)("a",{target:"_blank",href:e.href,rel:"noopener noreferrer",children:(0,r.jsx)("img",{src:e.icon,width:"30",alt:e.name,title:e.name})},t))})]})]}),(0,r.jsx)(a,{})]})}e.s(["default",()=>l],52683)}]);