import { motion } from 'framer-motion'
import { ExternalLink, X } from 'lucide-react'

type Book = { pdf: string; title: string }

export default function PDFReader({ book, onClose }: { book: Book; onClose: () => void }) {
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
          <button className="pdf-reader-close" onClick={onClose} aria-label="Close reader"><X size={20} /></button>
          <span className="pdf-reader-title">{book.title}</span>
          <a className="pdf-reader-open" href={book.pdf} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Open</a>
        </div>

        <div className="pdf-reader-body">
          <iframe title={book.title} src={book.pdf} />
        </div>
      </motion.div>
    </motion.div>
  )
}
