// import snow1 from './img/snow-01.png'
// import snow2 from './img/snow-02.png'
// import snow3 from './img/snow-03.png'
// import snow4 from './img/snow-04.png'

const snow1 = '//storage.jd.com/o2images/snow-01.png'
const snow2 = '//storage.jd.com/o2images/snow-02.png'
const snow3 = '//storage.jd.com/o2images/snow-03.png'
const snow4 = '//storage.jd.com/o2images/snow-04.png'

import { O2_AMBIENT_CONFIG } from './js/utils/const'

window[O2_AMBIENT_CONFIG] = {
  particleNumber: 60,
  textures: [
    snow1,
    snow2,
    snow3,
    snow3,
    snow3,
    snow3,
    snow3,
    snow4
  ],
  duration: 0,
  endCallback: encodeURI((() => {
    console.log('雪花落完了')
  }).toString())
}
