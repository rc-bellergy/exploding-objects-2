// Rebuild https://github.com/akella/ExplodingObjects/blob/master/src/icosahedron.js

import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils'
import fragment from './shader/fragment.glsl'
import vertex from './shader/vertexIco.glsl'

function getRandomAxis () {
  return new THREE.Vector3(
    Math.random() - 0.5,
    Math.random() - 0.5,
    Math.random() - 0.5
  ).normalize()
}

function getCentroid (geometry) {
  const ar = geometry.attributes.position.array
  const len = ar.length
  let x = 0
  let y = 0
  let z = 0
  for (let i = 0; i < len; i = i + 3) {
    x += ar[i]
    y += ar[i + 1]
    z += ar[i + 2]
  }
  return { x: (3 * x) / len, y: (3 * y) / len, z: (3 * z) / len }
}

export class Exploder {
  constructor(inverted, options) {
    this.scene = new THREE.Scene()

    this.inverted = inverted || false
    // this.container = document.getElementById(selector)
    this.container = document.body

    this.onLoad = options.onLoad
    // this.onClick = options.onClick

    // this.surfaceColor = options.surface
    // this.insideColor = options.inside
    this.backgroundColor = options.background
    this.surfaceColor = new THREE.Color(parseInt('0x' + options.surface))
    this.insideColor = new THREE.Color(parseInt('0x' + options.inside))

    this.raycaster = new THREE.Raycaster()
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: this.backgroundColor === 'transparent'
    })
    if (this.backgroundColor === 'transparent') {
      this.renderer.setClearColor(0x000000, 0)
    } else {
      this.backgroundColor = parseInt('0x' + this.backgroundColor, 16)
      this.renderer.setClearColor(this.backgroundColor, 1)
    }

    this.renderer.setPixelRatio(window.devicePixelRatio)

    this.width = window.innerWidth
    this.height = window.innerHeight
    this.mouseX = 0
    this.mouseY = 0
    this.targetmouseX = 0
    this.targetmouseY = 0
    this.renderer.setSize(this.width, this.height)
    this.container.appendChild(this.renderer.domElement)

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    )

    this.camera.position.set(0, 0, 7)
    this.time = 0
    this.loader = new GLTFLoader().setPath('models/')
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('lib/draco/')
    this.loader.setDRACOLoader(dracoLoader)

    this.setupResize()

    this.setupcubeTexture()
    this.resize()
    this.addObjects()
    this.animate()
    this.load()
    this.settings()
  }

  load () {
    const that = this
    const i = 0
    let parent
    const pos = new THREE.Vector3(0, 0, 0)
    const poses = []
    this.voron = []

    this.loader.load(
      'ico-more.glb',
      function (gltf) {
        gltf.scene.traverse(function (child) {
          if (child.name === 'Voronoi_Fracture') {
            that.obj = child
            if (child.children[0].children.length > 2) {
              child.children.forEach(f => {
                f.children.forEach(m => {
                  that.voron.push(m.clone())
                })
              })
            } else {
              child.children.forEach(m => {
                that.voron.push(m.clone())
              })
            }
          }
        })

        that.geoms = []
        that.geoms1 = []
        let j = 0
        that.voron = that.voron.filter(v => {
          if (v.isMesh) return false
          else {
            j++
            const vtempo = that.processSurface(v, j)

            if (that.inverted) {
              that.geoms1.push(vtempo.surface)
              that.geoms.push(vtempo.volume)
            } else {
              that.geoms.push(vtempo.surface)
              that.geoms1.push(vtempo.volume)
            }

            return true
          }
        })

        const s = BufferGeometryUtils.mergeBufferGeometries(
          that.geoms,
          false
        )

        that.mesh = new THREE.Mesh(s, that.material)
        that.scene.add(that.mesh)

        const s1 = BufferGeometryUtils.mergeBufferGeometries(
          that.geoms1,
          false
        )
        that.mesh1 = new THREE.Mesh(s1, that.material1)
        that.scene.add(that.mesh1)
        that.onLoad()
      },
      undefined,
      function (e) {
        console.error(e)
      }
    )
  }

  processSurface (v, j) {
    const c = v.position
    let vtemp, vtemp1
    vtemp = v.children[0].geometry.clone()
    vtemp = vtemp.applyMatrix4(
      new THREE.Matrix4().makeTranslation(c.x, c.y, c.z)
    )
    vtemp1 = v.children[1].geometry
    vtemp1 = vtemp1
      .clone()
      .applyMatrix4(new THREE.Matrix4().makeTranslation(c.x, c.y, c.z))

    const len = v.children[0].geometry.attributes.position.array.length / 3
    const len1 = v.children[1].geometry.attributes.position.array.length / 3
    //  id
    const offset = new Array(len).fill(j / 100)
    vtemp.setAttribute(
      'offset',
      new THREE.BufferAttribute(new Float32Array(offset), 1)
    )

    const offset1 = new Array(len1).fill(j / 100)
    vtemp1.setAttribute(
      'offset',
      new THREE.BufferAttribute(new Float32Array(offset1), 1)
    )

    // axis
    const axis = getRandomAxis()
    const axes = new Array(len * 3).fill(0)
    const axes1 = new Array(len1 * 3).fill(0)
    for (let i = 0; i < len * 3; i = i + 3) {
      axes[i] = axis.x
      axes[i + 1] = axis.y
      axes[i + 2] = axis.z
    }
    vtemp.setAttribute(
      'axis',
      new THREE.BufferAttribute(new Float32Array(axes), 3)
    )
    for (let i = 0; i < len1 * 3; i = i + 3) {
      axes1[i] = axis.x
      axes1[i + 1] = axis.y
      axes1[i + 2] = axis.z
    }
    vtemp1.setAttribute(
      'axis',
      new THREE.BufferAttribute(new Float32Array(axes1), 3)
    )

    const centroidVector = getCentroid(vtemp)
    const centroid = new Array(len * 3).fill(0)
    const centroid1 = new Array(len1 * 3).fill(0)
    for (let i = 0; i < len * 3; i = i + 3) {
      centroid[i] = centroidVector.x
      centroid[i + 1] = centroidVector.y
      centroid[i + 2] = centroidVector.z
    }
    for (let i = 0; i < len1 * 3; i = i + 3) {
      centroid1[i] = centroidVector.x
      centroid1[i + 1] = centroidVector.y
      centroid1[i + 2] = centroidVector.z
    }
    vtemp.setAttribute(
      'center',
      new THREE.BufferAttribute(new Float32Array(centroid), 3)
    )
    vtemp1.setAttribute(
      'center',
      new THREE.BufferAttribute(new Float32Array(centroid1), 3)
    )

    return { surface: vtemp, volume: vtemp1 }
  }

  setupResize () {
    window.addEventListener('resize', this.resize.bind(this))
  }

  resize () {
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.renderer.setSize(this.width, this.height)
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()
  }

  setupcubeTexture () {
    const that = this
    const path = 'models/env/sky/'
    const format = '.jpg'
    const urls1 = [
      path + 'px' + format,
      path + 'nx' + format,
      path + 'py' + format,
      path + 'ny' + format,
      path + 'pz' + format,
      path + 'nz' + format
    ]
    this.textureCube = new THREE.CubeTextureLoader().load(urls1)
  }

  addObjects () {
    const that = this
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: '#extension GL_OES_standard_derivatives : enable'
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: 'f', value: 0.0 },
        progress: { type: 'f', value: 0.0 },
        inside: { type: 'f', value: 0.0 },
        surfaceColor: { type: 'v3', value: this.surfaceColor },
        insideColor: { type: 'v3', value: this.insideColor },
        // matcap: { type: 't', value: new THREE.TextureLoader().load('img/matcap.jpg') },
        tCube: { value: that.textureCube },
        pixels: {
          type: 'v2',
          value: new THREE.Vector2(window.innerWidth, window.innerHeight)
        },
        uvRate1: {
          value: new THREE.Vector2(1, 1)
        }
      },
      vertexShader: vertex,
      fragmentShader: fragment
    })

    this.material1 = this.material.clone()
    this.material1.uniforms.inside.value = 1
  }

  animate () {
    this.time += 0.05
    this.material.uniforms.progress.value = Math.abs(this.settings.progress)
    this.material1.uniforms.progress.value = Math.abs(this.settings.progress)
    requestAnimationFrame(this.animate.bind(this))
    this.render()
  }

  settings () {
    const that = this
    this.settings = {
      progress: 0
    }
  }

  render () {
    this.renderer.render(this.scene, this.camera)
  }
}
