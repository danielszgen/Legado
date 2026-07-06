/**
 * Genera el sillón Venus estilizado siguiendo la referencia real
 * `web/assets/ref/venus.png` (Moher Venus): tela gris perla, respaldo alto
 * reclinado con cabezal integrado, brazos redondeados tipo pala y base
 * giratoria de aspa metálica negra de 5 radios.
 *
 * Exporta GLB binario a `web/assets/3d/models/venus.glb` + copia en
 * `public/assets/3d/models/`. Cuando exista el modelo real, basta con
 * sustituir ambos archivos (la app normaliza escala y centrado sola).
 *
 * Uso: npm run generate:model
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as THREE from 'three'
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

// GLTFExporter usa FileReader para ensamblar el GLB; polyfill mínimo en Node.
if (typeof globalThis.FileReader === 'undefined') {
  globalThis.FileReader = class {
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((ab) => {
        this.result = ab
        this.onloadend?.({ target: this })
        this.onload?.({ target: this })
      })
    }
    readAsDataURL(blob) {
      blob.arrayBuffer().then((ab) => {
        this.result = `data:${blob.type || 'application/octet-stream'};base64,${Buffer.from(ab).toString('base64')}`
        this.onloadend?.({ target: this })
        this.onload?.({ target: this })
      })
    }
  }
}

const here = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(here, '..')
const OUTPUTS = [
  path.resolve(projectRoot, '../../assets/3d/models/venus.glb'),
  path.resolve(projectRoot, 'public/assets/3d/models/venus.glb'),
]

// ————— materiales (ref: venus.png — tela gris perla, base negra mate) —————
const tela = new THREE.MeshStandardMaterial({ color: 0xc9c1b6, roughness: 0.93, metalness: 0 })
const telaSombra = new THREE.MeshStandardMaterial({ color: 0xbab1a5, roughness: 0.95, metalness: 0 })
const metalNegro = new THREE.MeshStandardMaterial({ color: 0x161616, roughness: 0.45, metalness: 0.65 })

function mesh(name, geometry, material, { pos = [0, 0, 0], rot = [0, 0, 0] } = {}) {
  const m = new THREE.Mesh(geometry, material)
  m.name = name
  m.position.set(...pos)
  m.rotation.set(...rot)
  return m
}

// ————— sillón (frente hacia +Z, apoyado en y=0, medidas en metros) —————
const chair = new THREE.Group()
chair.name = 'Venus'

// Base giratoria: aspa de 5 radios en metal negro + columna central
const base = new THREE.Group()
base.name = 'SwivelBase'
base.add(mesh('BaseHub', new THREE.CylinderGeometry(0.05, 0.06, 0.05, 24), metalNegro, { pos: [0, 0.035, 0] }))
base.add(mesh('BaseColumn', new THREE.CylinderGeometry(0.032, 0.04, 0.2, 20), metalNegro, { pos: [0, 0.15, 0] }))
for (let i = 0; i < 5; i++) {
  const angle = (i / 5) * Math.PI * 2
  const spoke = mesh('BaseSpoke' + i, new THREE.BoxGeometry(0.055, 0.022, 0.33), metalNegro, {
    pos: [Math.sin(angle) * 0.175, 0.018, Math.cos(angle) * 0.175],
    rot: [0, angle, 0],
  })
  base.add(spoke)
  base.add(
    mesh('BaseFoot' + i, new THREE.CylinderGeometry(0.024, 0.028, 0.018, 16), metalNegro, {
      pos: [Math.sin(angle) * 0.33, 0.01, Math.cos(angle) * 0.33],
    }),
  )
}
chair.add(base)

// Casco inferior del asiento (tapizado, cuelga sobre la base)
chair.add(mesh('SeatShell', new RoundedBoxGeometry(0.56, 0.2, 0.6, 5, 0.08), telaSombra, { pos: [0, 0.34, 0.02] }))

// Cojín de asiento, tucked entre los brazos, borde frontal redondeado
chair.add(mesh('SeatCushion', new RoundedBoxGeometry(0.52, 0.16, 0.58, 5, 0.07), tela, { pos: [0, 0.46, 0.05] }))

// Respaldo alto, ligeramente reclinado
chair.add(mesh('Backrest', new RoundedBoxGeometry(0.58, 0.74, 0.17, 5, 0.075), tela, { pos: [0, 0.76, -0.24], rot: [-0.17, 0, 0] }))

// Cabezal integrado (panel superior con costura, algo adelantado)
chair.add(mesh('Headrest', new RoundedBoxGeometry(0.55, 0.27, 0.16, 5, 0.07), tela, { pos: [0, 1.09, -0.28], rot: [-0.3, 0, 0] }))

// Cojín lumbar suave
chair.add(mesh('Lumbar', new RoundedBoxGeometry(0.48, 0.3, 0.1, 4, 0.05), telaSombra, { pos: [0, 0.58, -0.14], rot: [-0.14, 0, 0] }))

// Brazos tipo pala: paneles altos redondeados, con ligera apertura hacia fuera
for (const side of [-1, 1]) {
  chair.add(
    mesh(side < 0 ? 'ArmLeft' : 'ArmRight', new RoundedBoxGeometry(0.13, 0.5, 0.68, 5, 0.065), tela, {
      pos: [side * 0.345, 0.44, 0.02],
      rot: [-0.04, 0, side * -0.045],
    }),
  )
}

// ————— export —————
const scene = new THREE.Scene()
scene.add(chair)

const box = new THREE.Box3().setFromObject(chair)
const size = new THREE.Vector3()
box.getSize(size)
console.log(`[generate-venus-glb] dimensiones: ${size.x.toFixed(2)} × ${size.y.toFixed(2)} × ${size.z.toFixed(2)} m`)

new GLTFExporter().parse(
  scene,
  (result) => {
    const buffer = Buffer.from(result)
    for (const out of OUTPUTS) {
      fs.mkdirSync(path.dirname(out), { recursive: true })
      fs.writeFileSync(out, buffer)
      console.log(`[generate-venus-glb] escrito ${out} (${(buffer.length / 1024).toFixed(1)} KB)`)
    }
  },
  (err) => {
    console.error('[generate-venus-glb] error:', err)
    process.exitCode = 1
  },
  { binary: true },
)
