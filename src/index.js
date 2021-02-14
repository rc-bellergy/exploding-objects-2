import { Exploder } from './exploder.js'

const options = {
  surface: '999999',
  inside: 'aa0000',
  background: '333333',
  onLoad: () => {
    console.log('loaded')
    let step = 0.005
    const animate = () => {
      if (exploder.settings.progress > 2) {
        step = -0.005
      } else {
        if (exploder.settings.progress < 0) {
          step = 0.005
        }
      }
      exploder.settings.progress += step
      exploder.scene.rotation.y = exploder.settings.progress
      exploder.scene.rotation.z = exploder.settings.progress
      requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }
}
const inverted = false
const exploder = new Exploder(inverted, options)
console.log(exploder)

