import { O2_AMBIENT_CONFIG } from '../utils/const'

export default {
  ...window[O2_AMBIENT_CONFIG],
  particleNumber: 25,
  textures: [
    '//storage.jd.com/ambient/6c5b2329f0d87fe6.png',
    '//storage.jd.com/ambient/73ee4afd184658f3.png',
    '//storage.jd.com/ambient/ccfc4ed75e7944b6.png'
  ],
  duration: 20,
  speed: 6
}