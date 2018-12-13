import './utils/raf'
import {
  O2_AMBIENT_INIT,
  O2_AMBIENT_CONFIG,
  O2_AMBIENT_MAIN
} from './utils/const'
import Preloader from 'preloader.js'
import Snow from './utils/snow'
import './utils/modernizr'
import './utils/raf'
import values from 'lodash/values'

let snow = null

// 判断是否可点，被点中则隐藏
const wrapper = document.querySelector('.o2team_ambient_main')
wrapper.addEventListener('click', () => {
  wrapper.style.display = 'none'
})

// 初始化函数
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

// 初始化函数
window[O2_AMBIENT_INIT] = initAmbient

try {
  // 保证配置读取顺序
  let csi = setInterval(() => {
    if (!window[O2_AMBIENT_CONFIG]) return
    clearInterval(csi)
    initAmbient()
  }, 1000)
} catch (e) {
  console.log(e) 
}
