import snow1 from './img/snow-01.png'
import snow2 from './img/snow-02.png'
import snow3 from './img/snow-03.png'
import snow4 from './img/snow-04.png'

import { O2_AMBIENT_CONFIG } from './js/utils/const'

window[O2_AMBIENT_CONFIG] = {
  particleNumber: 60,
  textures: {
    texture1: snow1,
    texture2: snow2,
    texture3: snow3,
    texture4: snow3,
    texture5: snow3,
    texture6: snow3,
    texture7: snow3,
    texture8: snow4
  },
  duration: 0,
  endCallback: () => {
    console.log('雪花落完了')
  }
}
