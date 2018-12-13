import debounce from 'lodash/debounce'
import { getRandom, getRandomInt, getDevicePixelRatio, degToRad } from './utils'
import { O2_AMBIENT_CLASSNAME } from './const'

class Snow {
  durCounter = 0
  timestamp = 0
  isStopAdding = false

  constructor ({
    width = window.innerWidth,
    height = window.innerHeight,
    parent = document.body,
    fps = 30,
    textures = [],
    particleNumber = 25,
    className = O2_AMBIENT_CLASSNAME,
    maxRadius = 5,
    duration = 0
  }) {
    this.devicePixelRatio = getDevicePixelRatio()
    this.width = width * this.devicePixelRatio
    this.height = height * this.devicePixelRatio
    this.FPS = fps
    this.textures = textures
    this.className = className
    this.parent = parent
    this.isPaused = false
    this.PARTICLE_NUMBER = particleNumber
    this.maxRadius = maxRadius
    this.maxSpeed = 3
    this.duration = duration

    this.initFPS()
    this.initTexture()
    this.initDOM()
    this.addParticles()
    this.bindEvents()
    this.play()
  }

  initDOM () {
    const canvas = document.createElement('canvas')
    const devicePixelRatio = this.devicePixelRatio
    canvas.style.position = 'fixed'
    canvas.style.left = '0'
    canvas.style.top = '0'
    canvas.style.width = `${this.width / devicePixelRatio}px`
    canvas.style.height = `${this.height / devicePixelRatio}px`
    canvas.style.zIndex = -1
    canvas.style.pointerEvents = 'none'
    canvas.className = this.className
    canvas.width = this.width
    canvas.height = this.height
    this.parent.appendChild(canvas)
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
  }

  initFPS () {
    this.INTERVAL = 1000 / this.FPS
    this.nextTime = Date.now()
    this.startTime = this.nextTime
  }

  initTexture () {
    this.isTexture = this.textures.length > 0
    this.draw = this.drawDefault
    this.maxRadius = 5
    if (this.isTexture) {
      this.setTexureCache()
      this.draw = this.drawTexture
    }
  }

  setTexureCache () {
    this.offCanvas = document.createElement('canvas')
    this.offCtx = this.offCanvas.getContext('2d')
    this.offWidth = 0
    this.offHeight = 0
    let maxSize = 0
    this.textures.forEach((img, index) => {
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

  bindEvents () {
    this.windowResizeHandleSelf = debounce(this.windowResizeHandle.bind(this), 300)
    window.addEventListener('resize', this.windowResizeHandleSelf, false)
  }

  unbindEvents () {
    window.removeEventListener('resize', this.windowResizeHandleSelf, false)
  }

  windowResizeHandle (e) {
    const devicePixelRatio = this.devicePixelRatio

    this.width = window.innerWidth * devicePixelRatio
    this.height = window.innerHeight * devicePixelRatio
    this.canvas.width = this.width
    this.canvas.height = this.height
    this.canvas.style.width = `${this.width / devicePixelRatio}px`
    this.canvas.style.height = `${this.height / devicePixelRatio}px`
  }

  addParticles () {
    const particles = []
    const maxRadius = this.maxRadius
    const maxSpeed = this.maxSpeed

    for (let i = 0; i < this.PARTICLE_NUMBER; i++) {
      const imgIndex = getRandomInt(0, this.textures.length - 1)
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
    this.particles = particles
  }

  drawTexture () {
    const ctx = this.ctx
    this.particles.forEach(particle => {
      const size = this.imgsSize[particle.imgIndex]
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

  drawDefault () {
    const ctx = this.ctx
    this.particles.forEach((particle, index) => {
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.r, 0, 2 * Math.PI, true)
      ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`
      ctx.fill()
    })
  }

  play () {
    this.isPaused = false
    cancelAnimationFrame(this.rafId)
    this.loop()
  }

  pause () {
    this.isPaused = true
  }

  stop () {
    cancelAnimationFrame(this.rafId)
    this.pause()
  }

  toggle () {
    this.isPaused
      ? this.play()
      : this.pause()
  }

  loop (ts) {
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
    if (this.duration && this.durCounter >= this.duration) this.isStopAdding = true
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
        if (particle.y - (particle.r * 2) >= 0 && particle.y < this.height) {
          isSnowInViewport = true
        }
      })
      if (!isSnowInViewport) cancelAnimationFrame(this.rafId)
    }
  }

  destory () {
    this.stop()
    this.unbindEvents()
    this.parent.removeChild(this.canvas)
  }
}

export default Snow
