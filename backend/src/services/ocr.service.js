import { createWorker } from 'tesseract.js'

/**
 * Validates whether a buffer contains valid PNG, JPEG, WEBP, or BMP header bytes
 */
function isValidImageBuffer(buffer) {
  if (!buffer || !Buffer.isBuffer(buffer) || buffer.length < 8) return false

  // PNG magic bytes: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return true
  }
  // JPEG magic bytes: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return true
  }
  // WEBP magic bytes: 52 49 46 46 (RIFF)
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
    return true
  }
  // BMP magic bytes: 42 4D
  if (buffer[0] === 0x42 && buffer[1] === 0x4d) {
    return true
  }

  return false
}

/**
 * Executes OCR on image buffer using Tesseract.js
 * @param {Buffer} fileBuffer - Document buffer
 * @param {string} mimeType - MIME type of file (e.g. image/png, application/pdf)
 * @returns {Promise<{ rawText: string, ocrConfidence: number, lines: Array<string> }>}
 */
export const runOCR = async (fileBuffer, mimeType = 'image/png') => {
  const startTime = Date.now()
  let worker = null

  try {
    // 1. Check if document is PDF or non-standard file
    if (!mimeType || mimeType === 'application/pdf' || !isValidImageBuffer(fileBuffer)) {
      console.log(`[OCR Service]: Document is non-raster image or PDF. Gracefully routing to Gemini Vision fallback.`)
      return {
        rawText: '',
        ocrConfidence: 0,
        lines: [],
        executionTimeMs: Date.now() - startTime,
      }
    }

    console.log(`[OCR Service]: Initializing Tesseract.js worker for ${mimeType}...`)
    worker = await createWorker('eng')

    // Attach error handler to worker thread to prevent uncaught WebAssembly worker crashes
    if (worker && worker.worker) {
      worker.worker.on('error', (err) => {
        console.warn('[OCR Service Worker Event Handled]:', err?.message || err)
      })
    }

    const ret = await Promise.race([
      worker.recognize(fileBuffer),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Tesseract timeout')), 15000)),
    ])

    await worker.terminate()
    worker = null

    const rawText = ret?.data?.text || ''
    const ocrConfidence = Math.round(ret?.data?.confidence || 0)
    const lines = rawText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0)

    console.log(`[OCR Service]: OCR extracted ${lines.length} lines with ${ocrConfidence}% average confidence in ${Date.now() - startTime}ms`)

    return {
      rawText,
      ocrConfidence,
      lines,
      executionTimeMs: Date.now() - startTime,
    }
  } catch (error) {
    console.warn('[OCR Service Graceful Fallback]: Tesseract.js execution failed:', error.message || error)
    if (worker) {
      try {
        await worker.terminate()
      } catch (e) {}
    }
    return {
      rawText: '',
      ocrConfidence: 0,
      lines: [],
      executionTimeMs: Date.now() - startTime,
    }
  }
}
