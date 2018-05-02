import Snow from './components/snow'
import './components/modernizr'
import './components/raf'
import {
  O2_AMBIENT_CONFIG,
  O2_AMBIENT_INIT,
  O2_AMBIENT_MAIN
} from './components/const'

let snow = null

function initAmbient () {
  try {
    if (snow) {
      snow.destory()
      snow = null
    }
    const config = window[O2_AMBIENT_CONFIG]
    snow = new Snow({
      particleNumber: config.particleNumber,
      maxRadius: config.maxRadius
    })
    window[O2_AMBIENT_MAIN] = snow
  } catch (err) {
    console.log(err)
  }
}

window[O2_AMBIENT_INIT] = initAmbient

if (window.Modernizr.requestanimationframe) {
  initAmbient()
}
