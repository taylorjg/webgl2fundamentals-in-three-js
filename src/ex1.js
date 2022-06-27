import * as THREE from 'three'
import Stats from 'stats.js'
import objectVertexShader from './object-vertex-shader.glsl'
import objectFragmentShader from './object-fragment-shader.glsl'
import quadVertexShader from './quad-vertex-shader.glsl'
import quadFragmentShaderColor from './quad-fragment-shader-color.glsl'
import quadFragmentShaderDepth from './quad-fragment-shader-depth.glsl'
import structureBufferVertexShader from './structure-buffer-vertex-shader.glsl'
import structureBufferFragmentShader from './structure-buffer-fragment-shader.glsl'

const searchParams = new URLSearchParams(location.search)

const WINDOW_SIZE = 250
const USE_ANIMATION_LOOP = Boolean(searchParams.has('loop'))

const makeStructureBufferMaterial = () => {
  return new THREE.ShaderMaterial({
    vertexShader: structureBufferVertexShader,
    fragmentShader: structureBufferFragmentShader,
  })
}

const makeObjectMaterial = color => {
  return new THREE.ShaderMaterial({
    vertexShader: objectVertexShader,
    fragmentShader: objectFragmentShader,
    uniforms: {
      color: { value: new THREE.Color(color) }
    }
  })
}

const makeObject = (scene, color, size, z) => {
  const width = size
  const height = size
  const geometry = new THREE.PlaneBufferGeometry(width, height)
  const material = makeObjectMaterial(color)
  const mesh = new THREE.Mesh(geometry, material)
  mesh.translateZ(z)
  scene.add(mesh)
}

const createObject1 = scene => {
  return makeObject(scene, "DeepPink", 20, 1)
}

const createObject2 = scene => {
  return makeObject(scene, "MediumVioletRed", 4, 2)
}

const createObject3 = scene => {
  return makeObject(scene, "PaleVioletRed", 2, 3)
}

const createObjects = scene => {
  createObject1(scene)
  createObject2(scene)
  createObject3(scene)
}

const main = () => {
  const W = WINDOW_SIZE
  const H = WINDOW_SIZE
  const DPR = window.devicePixelRatio

  // renders to offscreen canvas
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(W, H)
  renderer.setPixelRatio(DPR)

  const mainScene = new THREE.Scene()
  const mainCamera = new THREE.PerspectiveCamera(45, W / H, 0.1, 50)
  mainCamera.position.set(-5, -3, 8)
  mainCamera.lookAt(0, 0, 3)

  createObjects(mainScene)

  const renderTarget = new THREE.WebGLRenderTarget(W * DPR, H * DPR)
  renderTarget.depthTexture = new THREE.DepthTexture()

  const structureBuffer = new THREE.WebGLRenderTarget(W * DPR, H * DPR)
  structureBuffer.texture.type = THREE.HalfFloatType

  const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

  const makePostScene = quadMaterial => {
    const quadWidth = postCamera.right - postCamera.left
    const quadHeight = postCamera.top - postCamera.bottom
    const quadGemoetry = new THREE.PlaneBufferGeometry(quadWidth, quadHeight)
    const quadMesh = new THREE.Mesh(quadGemoetry, quadMaterial)
    const postScene = new THREE.Scene()
    postScene.add(quadMesh)
    return postScene
  }

  const quadColorMaterial = new THREE.ShaderMaterial({
    vertexShader: quadVertexShader,
    fragmentShader: quadFragmentShaderColor,
    uniforms: {
      tDiffuse: { value: renderTarget.texture }
    }
  })

  const quadDepthMaterial = new THREE.ShaderMaterial({
    vertexShader: quadVertexShader,
    fragmentShader: quadFragmentShaderDepth,
    uniforms: {
      tDepth: { value: renderTarget.depthTexture },
      cameraNear: { value: mainCamera.near },
      cameraFar: { value: mainCamera.far }
    }
  })

  const quadStructureBufferMaterial = new THREE.ShaderMaterial({
    vertexShader: quadVertexShader,
    fragmentShader: quadFragmentShaderColor,
    uniforms: {
      tDiffuse: { value: structureBuffer.texture }
    }
  })

  const postSceneColor = makePostScene(quadColorMaterial)
  const postSceneDepth = makePostScene(quadDepthMaterial)
  const postSceneStructureBuffer = makePostScene(quadStructureBufferMaterial)

  const initCanvas = id => {
    const canvas = document.getElementById(id)
    canvas.style.width = `${W}px`
    canvas.style.height = `${H}px`
    canvas.width = W * DPR
    canvas.height = H * DPR
    return canvas.getContext('2d')
  }

  const canvasContext1 = initCanvas('canvas1')
  const canvasContext2 = initCanvas('canvas2')
  const canvasContext3 = initCanvas('canvas3')
  const canvasContext4 = initCanvas('canvas4')

  const structureBufferMaterial = makeStructureBufferMaterial()

  const makeRender = maybeStats => () => {
    const savedMaterialsMap = new Map()

    mainScene.traverse(object => {
      if (object.material) {
        savedMaterialsMap.set(object, object.material)
        object.material = structureBufferMaterial
      }
    })

    renderer.setRenderTarget(structureBuffer)
    renderer.render(mainScene, mainCamera)

    mainScene.traverse(object => {
      if (savedMaterialsMap.has(object)) {
        object.material = savedMaterialsMap.get(object)
      }
    })

    renderer.setRenderTarget(renderTarget)
    renderer.render(mainScene, mainCamera)

    renderer.setRenderTarget(null)
    renderer.render(mainScene, mainCamera)
    canvasContext1.drawImage(renderer.domElement, 0, 0)

    renderer.render(postSceneColor, postCamera)
    canvasContext2.drawImage(renderer.domElement, 0, 0)

    renderer.render(postSceneDepth, postCamera)
    canvasContext3.drawImage(renderer.domElement, 0, 0)

    renderer.render(postSceneStructureBuffer, postCamera)
    canvasContext4.drawImage(renderer.domElement, 0, 0)

    maybeStats?.update()
  }

  const makeStats = () => {
    const stats = new Stats()
    document.body.appendChild(stats.dom)
    stats.dom.style.left = 'unset'
    stats.dom.style.top = '.5rem'
    stats.dom.style.right = '.5rem'
    return stats
  }

  const dumpImageData = canvasContext => {
    const canvas = canvasContext.canvas
    const label = canvas.id
    const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height)
    console.log(`${label} imageData:`, imageData)
    const uniqueValues = Array.from(new Set(imageData.data).values())
    console.log(`${label} unique values:`, uniqueValues)
  }

  if (USE_ANIMATION_LOOP) {
    const stats = makeStats()
    const render = makeRender(stats)
    renderer.setAnimationLoop(render)
  } else {
    const render = makeRender()
    render()
    dumpImageData(canvasContext1)
    dumpImageData(canvasContext2)
    dumpImageData(canvasContext3)
    dumpImageData(canvasContext4)
  }
}

main()
