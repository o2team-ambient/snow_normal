import debounce from 'lodash/debounce'
import Preloader from 'preloader.js'
import {
  getRandom,
  getRandomInt,
  getDevicePixelRatio,
  degToRad
} from '../utils/util'
import {
  O2_AMBIENT_CLASSNAME,
  O2_AMBIENT_CONFIG,
} from '../utils/const'
import AmbientBase from './ambient-base'
import values from 'lodash/values'
import map from 'lodash/map'
import filter from 'lodash/filter'
import trim from 'lodash/trim'

class Snow extends AmbientBase {
  constructor() {
    super()
    this.devicePixelRatio = getDevicePixelRatio()
    this.isInited = false
    this.reset()
    this.initFPS()
    this.initDOM()
    this.bindEvents()
    this.init()
  }

  init() {
    this.isInited = true
    this.create()
  }

  async create() {
    this.isTexture = this.texturesURL.length > 0
    if (this.isTexture) {
      this.preloader = await this.preloadTextures(this.texturesURL)
      console.log(this.preloader)
      this.textures = map(this.texturesURL, url => {
        return this.preloader.get(url)
      })
      this.setTexureCache()
      this.draw = this.drawTexture
    } else {
      this.draw = this.drawDefault
      this.maxRadius = 5
    }
    this.addParticles()
    this.play()
  }

  reset() {
    this.isPaused = false
    this.durCounter = 0
    this.timestamp = 0
    this.isStopAdding = false
    this.width = window.innerWidth * this.devicePixelRatio
    this.height = window.innerHeight * this.devicePixelRatio
    this.parent = document.querySelector('.o2team_ambient_main')
    this.FPS = 30
    this.texturesURL = values(filter(window[O2_AMBIENT_CONFIG].textures, texture => {
      return trim(texture).length !== 0
    }))
    this.particleNumber = window[O2_AMBIENT_CONFIG].particleNumber
    this.maxRadius = window[O2_AMBIENT_CONFIG].maxRadius
    this.maxSpeed = window[O2_AMBIENT_CONFIG].speed
    this.className = O2_AMBIENT_CLASSNAME
    this.isInited && this.create()
  }

  preloadTextures(textures) {
    const preloader = new Preloader({
      resources: textures,
      concurrency: 4
    })
    preloader.start()
    return new Promise((resolve, reject) => {
      preloader.addCompletionListener(() => {
        if (this.texturesURL.length !== preloader.length || !preloader.resourceMap[this.texturesURL[0]]) return
        resolve(preloader)
      })
    })
  }

  setTexureCache() {
    this.offCanvas = document.createElement('canvas')
    this.offCtx = this.offCanvas.getContext('2d')
    this.offWidth = 0
    this.offHeight = 0
    let maxSize = 0
    this.textures.forEach((img, index) => {
      if (!img) return
      this.offWidth += img.width
      this.offHeight = Math.max(img.height, this.offHeight || 0)
      maxSize = Math.max(this.offHeight, img.width)
    })
    this.maxRadius = maxSize
    this.offCanvas.width = this.offWidth
    this.offCanvas.height = this.offHeight

    let x = 0
    const y = 0
    this.imgsSize = []
    this.textures.forEach((img, index) => {
      if (!img) return
      this.imgsSize.push({
        x,
        y,
        width: img.width,
        height: img.height
      })
      this.offCtx.drawImage(img, x, y, img.width, img.height)
      x += img.width
    })
  }

  bindEvents() {
    this.windowResizeHandleSelf = debounce(this.windowResizeHandle.bind(this), 300)
    window.addEventListener('resize', this.windowResizeHandleSelf, false)
  }

  unbindEvents() {
    window.removeEventListener('resize', this.windowResizeHandleSelf, false)
  }

  windowResizeHandle(e) {
    const devicePixelRatio = this.devicePixelRatio

    this.width = window.innerWidth * devicePixelRatio
    this.height = window.innerHeight * devicePixelRatio
    this.canvas.width = this.width
    this.canvas.height = this.height
    this.canvas.style.width = `${this.width / devicePixelRatio}px`
    this.canvas.style.height = `${this.height / devicePixelRatio}px`
  }

  addParticles() {
    const particles = []
    const maxRadius = this.maxRadius
    const maxSpeed = this.maxSpeed

    for (let i = 0; i < this.particleNumber; i++) {
      const imgIndex = getRandomInt(0, this.textures.length - 1)

      if (this.imgsSize[imgIndex]) {
        const radius = (this.isTexture ? this.imgsSize[imgIndex].width : getRandom(2, maxRadius)) * (this.devicePixelRatio / 2)
        particles.push({
          x: getRandomInt(0, this.width),
          y: getRandomInt(0, -this.height),
          r: radius,
          a: getRandom(0, Math.PI),
          rotate: getRandomInt(-360, 360),
          offsetX: getRandom(0, 1),
          aStep: 0.01,
          opacity: radius / maxRadius,
          speed: (radius / maxRadius) * maxSpeed,
          imgIndex,
        })
      }
    }
    this.particles = particles
  }

  drawTexture() {
    const ctx = this.ctx
    this.particles.forEach(particle => {
      const size = this.imgsSize[particle.imgIndex]
      if (!size) return
      const width = size.width
      const height = size.height
      ctx.save()
      ctx.translate(particle.x + (width / 2), particle.y + (height / 2))
      ctx.rotate(degToRad(particle.rotate))
      ctx.drawImage(
        this.offCanvas,
        size.x, size.y, width, height,
        (-width / 2), (-height / 2), particle.r, particle.r
      )
      ctx.restore()
    })
  }

  drawDefault() {
    const ctx = this.ctx
    this.particles.forEach((particle, index) => {
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.r, 0, 2 * Math.PI, true)
      ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`
      ctx.fill()
    })
  }

  loop(ts) {
    this.rafId = requestAnimationFrame(this.loop.bind(this))
    if (this.isPaused) return
    if (!this.timestamp) this.timestamp = ts

    const now = Date.now()
    const elapsed = now - this.nextTime
    const clockcounter = now - this.timestamp
    
    if (clockcounter >= 1000) {
      this.timestamp = now
      this.durCounter += 1
    }
    if (window[O2_AMBIENT_CONFIG].duration && this.durCounter >= window[O2_AMBIENT_CONFIG].duration) this.isStopAdding = true
    if (elapsed > this.INTERVAL) {
      this.nextTime = now - (elapsed % this.INTERVAL)
      this.ctx.clearRect(0, 0, this.width, this.height)
      this.draw()

      let isSnowInViewport = !this.isStopAdding
      this.particles.forEach((particle, index) => {
        if (particle.y + (particle.r * 2) < 0 && this.isStopAdding) return
        particle.x += Math.cos(particle.a) * particle.offsetX
        particle.a += particle.aStep
        particle.y += particle.speed

        if (particle.y >= this.height && !this.isStopAdding) {
          particle.y = -this.maxRadius
          particle.x = getRandomInt(0, this.width)
        }
        if (particle.y + (particle.r * 2) >= 0 && particle.y < this.height) {
          isSnowInViewport = true
        }
      })
      if (!isSnowInViewport) {
        this.endCallback()
        cancelAnimationFrame(this.rafId)
      }
    }
  }

  endCallback () {
    const endCallback = window[O2_AMBIENT_CONFIG].endCallback
    typeof endCallback === 'function' && endCallback()
    if (typeof endCallback === 'string') {
      try {
        eval(`(${decodeURI(endCallback)})()`)
      } catch(e) {}
    }
  }
}

export default Snow
