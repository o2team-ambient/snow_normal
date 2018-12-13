import Preloader from 'preloader.js'
import Snow from './components/snow'
import './components/modernizr'
import './components/raf'
import values from 'lodash/values'
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
    const texturesArr = values(config.textures).filter(texture => texture.trim() !== '')
    const preloader = new Preloader({
      resources: texturesArr,
      concurrency: 4
    })
    preloader.addCompletionListener(() => {
      snow = new Snow({
        textures: texturesArr.map(imgSrc => preloader.get(imgSrc)),
        particleNumber: config.particleNumber,
        duration: config.duration
      })
      window[O2_AMBIENT_MAIN] = snow
    })

    preloader.start()
  } catch (err) {
    console.log(err)
  }
}

window[O2_AMBIENT_INIT] = initAmbient

if (window.Modernizr.requestanimationframe && window.Modernizr.csspointerevents) {
  initAmbient()
}
