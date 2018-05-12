function getParameterByName (name, url) {
  if (!url) url = window.location.href
  /* eslint-disable no-useless-escape */
  name = name.replace(/[\[\]]/g, '\\$&')
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`)
  const results = regex.exec(url)
  if (!results) return null
  if (!results[2]) return ''
  return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

function getRandom (min, max) {
  return (Math.random() * (max - min)) + min
}

function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getDevicePixelRatio () {
  let result = 1
  if (window.devicePixelRatio) {
    result = window.devicePixelRatio >= 2 ? 2 : 1
  }
  return result
}

export {
  getParameterByName,
  getRandom,
  getRandomInt,
  getDevicePixelRatio
}
