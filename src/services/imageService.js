const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export const MAX_SOURCE_IMAGE_BYTES = 8 * 1024 * 1024
export const MAX_STORED_IMAGE_BYTES = 360_000

export function dataUrlByteLength(dataUrl = '') {
  const base64 = dataUrl.split(',')[1] || ''
  const padding = (base64.match(/=*$/) || [''])[0].length
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding)
}

export function validateImageFile(file) {
  if (!file) throw new Error('Selecione uma foto do item.')
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Use uma imagem JPG, PNG ou WebP.')
  }
  if (file.size > MAX_SOURCE_IMAGE_BYTES) {
    throw new Error('A foto original deve ter no máximo 8 MB.')
  }
}

export function validateStoredImage(dataUrl = '') {
  if (!dataUrl) return ''
  if (!/^data:image\/(jpeg|png|webp);base64,/i.test(dataUrl)) {
    throw new Error('A foto da doação é inválida.')
  }
  if (dataUrlByteLength(dataUrl) > MAX_STORED_IMAGE_BYTES) {
    throw new Error('A foto ficou muito grande. Escolha outra imagem.')
  }
  return dataUrl
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)
    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Não foi possível ler a foto selecionada.'))
    }
    image.src = objectUrl
  })
}

function renderJpeg(image, maxDimension, quality) {
  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
  const context = canvas.getContext('2d')
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', quality)
}

export async function prepareDonationImage(file) {
  validateImageFile(file)
  const image = await loadImage(file)
  const attempts = [
    [960, 0.8],
    [820, 0.72],
    [700, 0.64],
    [560, 0.58],
  ]

  for (const [maxDimension, quality] of attempts) {
    const dataUrl = renderJpeg(image, maxDimension, quality)
    if (dataUrlByteLength(dataUrl) <= MAX_STORED_IMAGE_BYTES) return dataUrl
  }

  throw new Error('Não foi possível reduzir a foto. Escolha uma imagem mais simples.')
}
