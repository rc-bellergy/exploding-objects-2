/* Example of adding "Exploder" object */

import { Exploder } from './exploder.js'
import { WEBGL } from 'three/examples/jsm/WebGL.js'
import Stats from 'three/examples/jsm/libs/stats.module.js'

// Check browser support WEBGL
if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
  console.error('The File APIs are not fully supported in this browser.')
} else if (!WEBGL.isWebGLAvailable()) {
  console.error('WebGL is not supported in this browser.')
}

const elementId = 'container' // the Exploder object will be rendered to this HTML element
const options = { // config the Exploder object options
  surface: '999999',
  inside: 'aa0000',
  background: '333333',
  inverted: false, // inverted the surface and inside colours
  onLoad: () => {
    // start the demo animation when loaded
    let step = 1
    let rot = 0
    const animate = () => {
      stats.begin() // update stats

      if (exploder.settings.progress > 2) {
        step = -1
      } else {
        if (exploder.settings.progress < 0) {
          step = 1
        }
      }
      rot += 0.01
      exploder.settings.progress += step * 0.01
      exploder.scene.rotation.y = rot
      exploder.scene.rotation.z = rot

      stats.end() // update stats
      requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }
}
const exploder = new Exploder(elementId, options)
console.log(exploder)

// add the stats UI
const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)
