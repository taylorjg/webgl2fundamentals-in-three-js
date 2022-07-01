import * as THREE from "three"
import * as dat from "dat.gui"

const main = () => {
  const container = document.getElementById("container")
  const width = container.clientWidth
  const height = container.clientHeight

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setClearColor(0xffffff, 1.0)
  renderer.setSize(width, height)
  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  scene.translateY(height)
  scene.scale.y = -1

  const camera = new THREE.OrthographicCamera(0, width, height, 0, 0, 1)

  const points = [
    [-150, -100],
    [150, -100],
    [-150, 100],
    // NOTE: change the winding order of the second triangle to prevent it from being culled
    [150, 100],
    [-150, 100],
    [150, -100]
  ]

  const r1 = Math.random()
  const g1 = Math.random()
  const b1 = Math.random()
  const r2 = Math.random()
  const g2 = Math.random()
  const b2 = Math.random()

  const colors = [
    r1, g1, b1, 1,
    r1, g1, b1, 1,
    r1, g1, b1, 1,
    r2, g2, b2, 1,
    r2, g2, b2, 1,
    r2, g2, b2, 1
  ]

  const geometry = new THREE.BufferGeometry()
  geometry.setFromPoints(points.map(([x, y]) => ({ x, y })))
  geometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(colors), 4))
  const material = new THREE.MeshBasicMaterial({ vertexColors: true })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.x = 200
  mesh.position.y = 150
  mesh.rotation.z = THREE.MathUtils.degToRad(0)
  mesh.scale.x = 1
  mesh.scale.y = 1
  scene.add(mesh)

  const render = () => {
    renderer.render(scene, camera)
  }

  const updatePosition = index =>
    value => {
      mesh.position.setComponent(index, value)
      render()
    }

  const updateAngle = value => {
    const x = mesh.rotation.x
    const y = mesh.rotation.y
    const z = THREE.MathUtils.degToRad(value)
    mesh.rotation.set(x, y, z)
    render()
  }

  const updateScale = index =>
    value => {
      mesh.scale.setComponent(index, value)
      render()
    }

  const params = {
    "x": mesh.position.x,
    "y": mesh.position.y,
    "angle": THREE.MathUtils.radToDeg(mesh.rotation.z),
    "scaleX": mesh.scale.x,
    "scaleY": mesh.scale.y,
  }

  const gui = new dat.GUI()
  gui.add(params, "x", 0, width, 1).onChange(updatePosition(0))
  gui.add(params, "y", 0, height, 1).onChange(updatePosition(1))
  gui.add(params, "angle", 0, 360, 1).onChange(updateAngle)
  gui.add(params, "scaleX", -5, 5, 0.01).onChange(updateScale(0))
  gui.add(params, "scaleY", -5, 5, 0.01).onChange(updateScale(1))
  gui.open()

  render()
}

main()
