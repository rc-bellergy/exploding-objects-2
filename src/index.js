import { Exploder } from './exploder.js'

const elementId = 'container'
const inverted = false // inverted the surface and inside colours
const options = {
  surface: '999999',
  inside: 'aa0000',
  background: '333333',
  onLoad: () => {
    // start the demo animation when loaded
    console.log('loaded')
    let step = 1
    let rot = 0
    const animate = () => {
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
      requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }
}
const exploder = new Exploder(elementId, inverted, options)
console.log(exploder)
