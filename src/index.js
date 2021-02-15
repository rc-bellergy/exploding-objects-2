import { Exploder } from './exploder.js'

const options = {
  surface: '999999',
  inside: 'aa0000',
  background: '333333',
  onLoad: () => {
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
      exploder.settings.progress += step * 0.005
      exploder.scene.rotation.y = rot
      exploder.scene.rotation.z = rot
      requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }
}
const inverted = false
const exploder = new Exploder(inverted, options)
console.log(exploder)

