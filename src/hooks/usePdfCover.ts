import { useEffect, useState } from 'react';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.js';
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.js?url';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

const coverCache = new Map<string, string>();

export function usePdfCover(pdfPath: string) {
  const [cover, setCover] = useState<string | null>(coverCache.get(pdfPath) || null);

  useEffect(() => {
    if (coverCache.has(pdfPath)) {
      setCover(coverCache.get(pdfPath)!);
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        const loadingTask = pdfjs.getDocument(pdfPath);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.2 }); // adjust scale for thumbnails
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: context, viewport }).promise;
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        if (!cancelled) {
          coverCache.set(pdfPath, dataUrl);
          setCover(dataUrl);
        }
      } catch (err) {
        console.warn('Failed to render PDF cover for', pdfPath, err);
        setCover(null);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [pdfPath]);

  return cover;
}
