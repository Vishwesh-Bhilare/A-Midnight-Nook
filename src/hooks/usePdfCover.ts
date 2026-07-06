import { useMemo } from 'react'

export function usePdfCover(pdfPath: string) {
  return useMemo(() => {
    if (!pdfPath) return null
    return null
  }, [pdfPath])
}
