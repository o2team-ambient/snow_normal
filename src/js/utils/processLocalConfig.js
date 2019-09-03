export default function (configKeyVal, configKey, guiName) {
  if (!configKeyVal) return

  const localData = JSON.parse(localStorage.getItem(`${guiName || document.location.href}.gui`))

  if (!localData) return { remembered: {} }

  if (localData.preset) {
    localData.preset = configKey
  }

  localStorage.setItem(`${guiName || document.location.href}.gui`, JSON.stringify(localData))

  return localData
}