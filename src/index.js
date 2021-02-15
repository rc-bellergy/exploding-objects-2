import { Exploder } from './exploder.js'
import Stats from 'three/examples/jsm/libs/stats.module.js'

const elementId = 'container'
const inverted = false // inverted the surface and inside colours
const options = {
  surface: '999999',
  inside: 'aa0000',
  background: '333333',
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
const exploder = new Exploder(elementId, inverted, options)
console.log(exploder)

// add the stats UI
const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)
