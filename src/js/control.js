import dat from 'dat.gui'
import {
  O2_AMBIENT_MAIN,
  O2_AMBIENT_INIT,
  O2_AMBIENT_CONFIG
} from './components/const'
import { getParameterByName } from './components/utils'
import forEach from 'lodash/forEach'

/* eslint-disable no-unused-vars */
const isLoop = getParameterByName('loop')
const isShowController = getParameterByName('controller')
// console.log(isShowController, isLoop)

class OtherConfig {
  constructor () {
    this.message = 'Snow-无交互'
    this.backgroundColor = '#2f85dc'
    this.play = () => {
      window[O2_AMBIENT_MAIN] && window[O2_AMBIENT_MAIN].toggle()
    }
  }
}

class Control {
  constructor () {
    this.config = window[O2_AMBIENT_CONFIG]
    this.otherConfig = new OtherConfig()
    this.initBaseGUI()
    this.initTextureGUI()
    Control.setBackgroundColor(this.otherConfig.backgroundColor)
  }

  initBaseGUI () {
    const config = this.config
    const otherConfig = this.otherConfig
    const gui = new dat.GUI()
    gui.add(otherConfig, 'message').name('配置面板')
    gui.add(otherConfig, 'play').name('播放 / 暂停')
    gui.add(config, 'particleNumber', 3, 30, 1).name('粒子数量').onFinishChange(val => {
      window[O2_AMBIENT_INIT]()
    })
    gui.addColor(otherConfig, 'backgroundColor').name('背景色(仅演示)').onFinishChange(val => {
      Control.setBackgroundColor(val)
    })
    /* gui.add(config, 'maxRadius', 4, 10, 1).name('粒子最大半径').onFinishChange(val => {
      window[O2_AMBIENT_INIT]()
    }) */
    this.gui = gui
    this.setGUIzIndex(2)
  }

  initTextureGUI () {
    const gui = this.gui
    const textures = this.config.textures
    const texturesFolder = gui.addFolder('纹理')
    let index = 0
    forEach(textures, (texture, key) => {
      const textureController = texturesFolder.add(textures, key).name(`纹理${index++}`)
      textureController.onFinishChange(val => {
        window[O2_AMBIENT_INIT]()
      })
    })
    texturesFolder.open()

    this.texturesFolder = texturesFolder
  }

  setGUIzIndex (zIndex) {
    this.gui.domElement.parentElement.style.zIndex = zIndex
  }

  static setBackgroundColor (color) {
    document.body.style.backgroundColor = color
  }
}

if (isShowController) {
  /* eslint-disable no-new */
  new Control()
}
