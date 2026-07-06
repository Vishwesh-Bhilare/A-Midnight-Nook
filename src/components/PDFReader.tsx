import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.js'
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.js?url'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

type Book = { pdf: string; title: string }

export default function PDFReader({ book, onClose }: { book: Book; onClose: () => void }) {
  const [pdfDoc, setPdfDoc] = useState<pdfjs.PDFDocumentProxy | null>(null)
  const [pageNum, setPageNum] = useState(1)
  const [numPages, setNumPages] = useState(0)
  const [scale, setScale] = useState(1.2)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const loadingTask = pdfjs.getDocument(book.pdf)
        const doc = await loadingTask.promise
        setPdfDoc(doc)
        setNumPages(doc.numPages)
        setPageNum(1)
      } catch (err) {
        console.error('Failed to load PDF', err)
      }
    }
    load()
  }, [book.pdf])

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return
    const render = async () => {
      const page = await pdfDoc.getPage(pageNum)
      const viewport = page.getViewport({ scale })
      const canvas = canvasRef.current!
      const context = canvas.getContext('2d')!
      canvas.width = viewport.width
      canvas.height = viewport.height
      await page.render({ canvasContext: context, viewport }).promise
    }
    render()
  }, [pdfDoc, pageNum, scale])

  const goPrev = () => setPageNum(p => Math.max(1, p - 1))
  const goNext = () => setPageNum(p => Math.min(numPages, p + 1))
  const zoomIn = () => setScale(s => Math.min(3, s + 0.2))
  const zoomOut = () => setScale(s => Math.max(0.6, s - 0.2))

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [numPages])

  return (
    <motion.div
      className="pdf-reader-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="pdf-reader-modal"
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        <div className="pdf-reader-header">
          <button className="pdf-reader-close" onClick={onClose}><X size={20} /></button>
          <span className="pdf-reader-title">{book.title}</span>
          <div className="pdf-reader-controls">
            <button onClick={zoomOut}><ZoomOut size={18} /></button>
            <span className="pdf-reader-zoom">{Math.round(scale * 100)}%</span>
            <button onClick={zoomIn}><ZoomIn size={18} /></button>
          </div>
        </div>

        <div className="pdf-reader-body" ref={containerRef}>
          <canvas ref={canvasRef} />
        </div>

        <div className="pdf-reader-footer">
          <button onClick={goPrev} disabled={pageNum <= 1}><ChevronLeft size={20} /></button>
          <span>{pageNum} / {numPages}</span>
          <button onClick={goNext} disabled={pageNum >= numPages}><ChevronRight size={20} /></button>
        </div>
      </motion.div>
    </motion.div>
  )
}
