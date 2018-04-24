import debounce from 'lodash/debounce'
import { getRandom, getRandomInt } from './utils'
import { O2_AMBIENT_CLASSNAME } from './const'

class Snow {
  constructor ({
    width = window.innerWidth,
    height = window.innerHeight,
    parent = document.body,
    fps = 30,
    textures = [],
    particleNumber = 50,
    className = O2_AMBIENT_CLASSNAME,
    maxRadius = 5
  }) {
    this.width = width
    this.height = height
    this.FPS = fps
    this.textures = textures
    this.className = className
    this.parent = parent
    this.isPaused = false
    this.PARTICLE_NUMBER = particleNumber
    this.maxRadius = maxRadius
    this.maxSpeed = 3

    this.initFPS()
    this.initDOM()
    this.addParticles()
    this.draw = this.drawDefault
    this.play()
  }

  initDOM () {
    const canvas = document.createElement('canvas')
    canvas.className = this.className
    canvas.style.position = 'fixed'
    canvas.style.left = 0
    canvas.style.top = 0
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

  bindEvents () {
    this.windowResizeHandleSelf = debounce(this.windowResizeHandle.bind(this), 300)
    window.addEventListener('resize', this.windowResizeHandleSelf, false)
  }

  unbindEvents () {
    window.removeEventListener('resize', this.windowResizeHandleSelf, false)
  }

  addParticles () {
    const particles = []
    const maxRadius = this.maxRadius
    const maxSpeed = this.maxSpeed

    for (let i = 0; i < this.PARTICLE_NUMBER; i++) {
      const radius = getRandom(2, maxRadius)
      particles.push({
        x: getRandomInt(0, this.width),
        y: getRandomInt(0, this.height),
        r: radius,
        a: getRandom(0, Math.PI),
        offsetX: getRandom(0, 1),
        aStep: 0.01,
        opacity: radius / maxRadius,
        speed: (radius / maxRadius) * maxSpeed
      })
    }

    this.particles = particles
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

  loop () {
    this.rafId = requestAnimationFrame(this.loop.bind(this))
    if (this.isPaused) return

    const now = Date.now()
    const elapsed = now - this.nextTime

    if (elapsed > this.INTERVAL) {
      this.nextTime = now - (elapsed % this.INTERVAL)

      this.ctx.clearRect(0, 0, this.width, this.height)
      this.draw()
      this.particles.forEach((particle, index) => {
        particle.x += Math.cos(particle.a) * particle.offsetX
        particle.a += particle.aStep
        particle.y += particle.speed

        if (particle.y >= this.height) {
          particle.y = -particle.r
        }
      })
    }
  }

  destory () {
    this.stop()
    this.unbindEvents()
    this.parent.removeChild(this.canvas)
  }
}

export default Snow
