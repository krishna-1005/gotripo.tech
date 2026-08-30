import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { 
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, 
  Download, Loader2, FileText, Smartphone, Monitor
} from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { ItineraryPDF } from './ItineraryPDF';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Set up worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: any;
}

export const PDFViewerModal = ({ isOpen, onClose, plan }: PDFViewerModalProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // Responsive scaling
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setScale(0.5);
      } else {
        setScale(1.0);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isOpen && plan && !pdfBlobUrl) {
      generatePDF();
    }
  }, [isOpen, plan]);

  const generatePDF = async () => {
    setGenerating(true);
    
    try {
      // Use @react-pdf/renderer to generate a high-quality PDF
      const blob = await pdf(<ItineraryPDF plan={plan} />).toBlob();
      const url = URL.createObjectURL(blob);
      setPdfBlobUrl(url);
    } catch (error) {
      console.error("PDF Generation Error:", error);
    } finally {
      setGenerating(false);
    }
  };

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  const changePage = (offset: number) => {
    setPageNumber(prev => {
      const next = prev + offset;
      if (next < 1 || (numPages && next > numPages)) return prev;
      return next;
    });
  };

  const downloadPdf = () => {
    if (pdfBlobUrl) {
      const link = document.createElement('a');
      link.href = pdfBlobUrl;
      link.download = `${plan?.destination || 'Trip'}_Itinerary.pdf`;
      link.click();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[95vw] lg:max-w-5xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-zinc-900 border-zinc-800 rounded-2xl sm:rounded-3xl">
          <DialogHeader className="p-4 sm:p-5 border-b border-zinc-800 flex flex-row items-center justify-between bg-zinc-900 text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="size-8 sm:size-10 rounded-xl bg-emerald-500/20 text-emerald-500 grid place-items-center">
                <FileText className="size-4 sm:size-5" />
              </div>
              <div>
                <DialogTitle className="text-white font-display text-base sm:text-lg">
                  {plan?.destination || 'Trip'} Guide
                </DialogTitle>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold hidden sm:block">
                  AI-Powered Itinerary
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex items-center bg-zinc-800/50 rounded-xl p-1 border border-zinc-700/50">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="size-8 text-zinc-400 hover:text-white hover:bg-zinc-700"
                  onClick={() => setScale(prev => Math.max(prev - 0.1, 0.4))}
                >
                  <ZoomOut className="size-4" />
                </Button>
                <span className="text-[11px] font-bold w-12 text-center text-zinc-400">
                  {Math.round(scale * 100)}%
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="size-8 text-zinc-400 hover:text-white hover:bg-zinc-700"
                  onClick={() => setScale(prev => Math.min(prev + 0.2, 2.0))}
                >
                  <ZoomIn className="size-4" />
                </Button>
              </div>

              <Button 
                variant="default" 
                size="sm" 
                disabled={generating || !pdfBlobUrl}
                className="h-9 sm:h-10 px-4 sm:px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/20 border-none transition-all active:scale-95 disabled:opacity-50"
                onClick={downloadPdf}
              >
                <Download className="size-4 sm:mr-2" />
                <span className="hidden sm:inline">Download PDF</span>
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-auto bg-zinc-950/50 flex justify-center p-4 sm:p-10 scrollbar-hide relative">
            {generating ? (
              <div className="flex flex-col items-center justify-center text-zinc-400 animate-in fade-in duration-500">
                <div className="relative mb-6">
                  <div className="size-16 rounded-full border-4 border-emerald-500/10 border-t-emerald-500 animate-spin" />
                  <FileText className="size-6 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="font-display text-lg text-white">Rendering your Guide</p>
                <p className="text-sm text-zinc-500 mt-1 italic">Personalizing every detail...</p>
              </div>
            ) : pdfBlobUrl ? (
              <div className="shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-out">
                <Document
                  file={pdfBlobUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={<div className="h-full flex items-center"><Loader2 className="animate-spin text-emerald-500" /></div>}
                >
                  <Page 
                    pageNumber={pageNumber} 
                    scale={scale} 
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                    className="rounded-lg overflow-hidden bg-white"
                  />
                </Document>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-zinc-500">
                <Loader2 className="size-8 animate-spin mb-4" />
                <p>Waiting for generator...</p>
              </div>
            )}
          </div>

          <div className="p-4 sm:p-5 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 rounded-xl border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all disabled:opacity-30"
                  disabled={pageNumber <= 1}
                  onClick={() => changePage(-1)}
                >
                  <ChevronLeft className="size-5" />
                </Button>
                <span className="text-xs sm:text-sm font-bold text-zinc-400 min-w-[80px] text-center">
                  Page <span className="text-white">{pageNumber}</span> of {numPages || '--'}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 rounded-xl border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all disabled:opacity-30"
                  disabled={pageNumber >= (numPages || 1)}
                  onClick={() => changePage(1)}
                >
                  <ChevronRight className="size-5" />
                </Button>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-zinc-600">
               <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-800/30">
                 {scale < 0.8 ? <Smartphone className="size-3" /> : <Monitor className="size-3" />}
                 <span className="text-[10px] font-bold uppercase tracking-tighter">
                   {scale < 0.8 ? "Mobile Opt" : "Desktop Opt"}
                 </span>
               </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
