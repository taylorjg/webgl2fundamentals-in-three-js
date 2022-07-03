import * as THREE from "three"

const range = n => Array.from(Array(n).keys())

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
    [1, 0, 0, 1,],  // red
    [0, 1, 0, 1,],  // green
    [0, 0, 1, 1,],  // blue
    [1, 0, 1, 1,],  // magenta
    [0, 1, 1, 1,],  // cyan
  ]

  const geometry = new THREE.BufferGeometry()
  geometry.setFromPoints(points.map(([x, y]) => ({ x, y })))

  const numInstances = 5;
  const meshes = range(numInstances).map(ndx => {
    const color = new THREE.Color(...colors[ndx])
    const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    return mesh
  })

  const render = (time) => {
    time *= 0.001
    meshes.forEach((mesh, ndx) => {
      mesh.position.set(-0.5 + ndx * 0.25, 0, 0)
      mesh.rotation.z = time * (0.1 + 0.1 * ndx)
    })
    renderer.render(scene, camera)
    requestAnimationFrame(render)
  }

  requestAnimationFrame(render)
}

main()
