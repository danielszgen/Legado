import { useEffect, useRef, useState } from 'react'

interface TinyWorldProps {
  src: string
  className?: string
  /** Segundos por vuelta completa */
  secondsPerTurn?: number
}

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`

/* Proyección polar tipo «tiny planet» (insta360): el suelo del salón queda en
   el centro del disco y el techo en el borde; la imagen envuelve los 360°
   con espejado (onda triangular) para que no haya costura. */
const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform float uTime;

const float PI = 3.141592653589793;

void main() {
  vec2 p = vUv;
  float r = length(p);
  if (r > 1.0) { gl_FragColor = vec4(0.0); return; }

  float angle = atan(p.y, p.x) + uTime;
  // dos copias espejadas alrededor del círculo → sin costura
  float u = angle / PI; // rango 2 por vuelta
  float mu = 1.0 - abs(mod(u, 2.0) - 1.0);
  // centro = suelo, borde = techo; pow abre el centro
  float v = pow(r, 0.74);

  vec3 color = texture2D(uTex, vec2(mu, v)).rgb;

  // etalonaje cálido + penumbra hacia el borde + centro levemente arropado
  color *= vec3(1.05, 0.97, 0.88);
  color *= 1.0 - 0.4 * smoothstep(0.78, 1.0, r);
  color *= 0.72 + 0.28 * smoothstep(0.0, 0.3, r);

  float alpha = smoothstep(1.0, 0.985, r);
  gl_FragColor = vec4(color * alpha, alpha);
}
`

/**
 * «Mundo redondo» insta360: proyecta el salón en un disco estereográfico que
 * gira despacio. WebGL plano (sin dependencias); si el contexto falla, cae a
 * la imagen recortada en círculo. Respeta prefers-reduced-motion (estático).
 */
export function TinyWorld({ src, className, secondsPerTurn = 85 }: TinyWorldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { alpha: true, antialias: true })
    if (!gl) {
      setFailed(true)
      return
    }

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      return shader
    }
    const program = gl.createProgram()!
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setFailed(true)
      return
    }
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(program, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(program, 'uTime')
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    // placeholder 1px mientras carga la imagen
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([11, 10, 8, 255]))

    let raf = 0
    let running = true
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const speed = (2 * Math.PI) / (secondsPerTurn * 1000)

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const size = canvas.clientWidth
      if (canvas.width !== size * dpr) {
        canvas.width = size * dpr
        canvas.height = size * dpr
        gl.viewport(0, 0, canvas.width, canvas.height)
      }
    }

    const draw = (now: number) => {
      if (!running) return
      resize()
      gl.uniform1f(uTime, now * speed)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      if (!reduced) raf = requestAnimationFrame(draw)
    }

    const image = new Image()
    image.onload = () => {
      if (!running) return
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      // NPOT en WebGL1: clamp + lineal, sin mipmaps (el espejado va en el shader)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      raf = requestAnimationFrame(draw)
    }
    image.onerror = () => setFailed(true)
    image.src = src

    return () => {
      running = false
      cancelAnimationFrame(raf)
      gl.deleteTexture(texture)
      gl.deleteProgram(program)
      gl.deleteBuffer(buffer)
    }
  }, [src, secondsPerTurn])

  if (failed) {
    return (
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className={`rounded-full object-cover ${className ?? ''}`}
      />
    )
  }

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
