import * as THREE from "three"
import { range } from "./utils"

const main = () => {
  const container = document.getElementById("container")
  const width = container.clientWidth
  const height = container.clientHeight

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setClearColor(0xffffff, 1.0)
  renderer.setSize(width, height)
  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

  const points = [
    [-0.1, 0.4],
    [-0.1, -0.4],
    [0.1, -0.4],
    [0.1, -0.4],
    [-0.1, 0.4],
    [0.1, 0.4],
    [0.4, -0.1],
    [-0.4, -0.1],
    [-0.4, 0.1],
    [-0.4, 0.1],
    [0.4, -0.1],
    [0.4, 0.1]
  ]

  const colors = [
    1, 0, 0, // red
    0, 1, 0, // green
    0, 0, 1, // blue
    1, 0, 1, // magenta
    0, 1, 1, // cyan
  ]

  const geometry = new THREE.BufferGeometry()
  geometry.setFromPoints(points.map(([x, y]) => ({ x, y })))

  const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })

  const numInstances = 5;
  const mesh = new THREE.InstancedMesh(geometry, material, numInstances)
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(colors), 3)
  scene.add(mesh)

  console.log("mesh.instanceMatrix.usage:", mesh.instanceMatrix.usage)
  console.log("mesh.instanceColor.usage:", mesh.instanceColor.usage)

  const render = (time) => {
    time *= 0.001
    range(numInstances).forEach(ndx => {
      const matrix = new THREE.Matrix4()
      const translation = new THREE.Matrix4().makeTranslation(-0.5 + ndx * 0.25, 0, 0)
      const rotationZ = new THREE.Matrix4().makeRotationZ(time * (0.1 + 0.1 * ndx))
      matrix
        .multiply(translation)
        .multiply(rotationZ)
      mesh.setMatrixAt(ndx, matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
    renderer.render(scene, camera)
    requestAnimationFrame(render)
  }

  requestAnimationFrame(render)
}

main()
