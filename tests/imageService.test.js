import { describe, expect, it } from 'vitest'
import {
  dataUrlByteLength,
  MAX_SOURCE_IMAGE_BYTES,
  MAX_STORED_IMAGE_BYTES,
  validateImageFile,
  validateStoredImage,
} from '../src/services/imageService.js'

describe('tratamento de fotos das doações', () => {
  it('aceita JPG, PNG e WebP dentro do limite de origem', () => {
    expect(() => validateImageFile({ type: 'image/jpeg', size: 1024 })).not.toThrow()
    expect(() => validateImageFile({ type: 'image/png', size: 1024 })).not.toThrow()
    expect(() => validateImageFile({ type: 'image/webp', size: 1024 })).not.toThrow()
  })

  it('recusa formatos não permitidos e arquivos acima de 8 MB', () => {
    expect(() => validateImageFile({ type: 'image/gif', size: 1024 })).toThrow('JPG, PNG ou WebP')
    expect(() => validateImageFile({ type: 'image/jpeg', size: MAX_SOURCE_IMAGE_BYTES + 1 })).toThrow('8 MB')
  })

  it('calcula o tamanho do conteúdo base64 e aceita uma imagem pequena', () => {
    const image = 'data:image/jpeg;base64,YQ=='
    expect(dataUrlByteLength(image)).toBe(1)
    expect(validateStoredImage(image)).toBe(image)
  })

  it('recusa dados inválidos ou maiores que o limite persistido', () => {
    expect(() => validateStoredImage('https://exemplo.com/foto.jpg')).toThrow('inválida')
    const oversized = `data:image/jpeg;base64,${'A'.repeat(Math.ceil((MAX_STORED_IMAGE_BYTES + 1) * 4 / 3))}`
    expect(() => validateStoredImage(oversized)).toThrow('muito grande')
  })
})
