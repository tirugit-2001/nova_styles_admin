import { useEffect, useState } from "react";
import { OrderAPI } from "../config/api";
import { X, Download, Send } from "lucide-react";

interface InvoicePreviewProps {
  orderId: string;
  invoiceNumber: string;
  onClose: () => void;
  onDownload: () => void;
  onSend: () => void;
}

export function InvoicePreview({
  orderId,
  invoiceNumber,
  onClose,
  onDownload,
  onSend,
}: InvoicePreviewProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        const response = await OrderAPI.downloadInvoice(orderId);
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load invoice:", error);
        setLoading(false);
      }
    };

    loadInvoice();

    // Cleanup
    return () => {
      setPdfUrl((currentUrl) => {
        if (currentUrl) {
          window.URL.revokeObjectURL(currentUrl);
        }
        return null;
      });
    };
  }, [orderId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold">Invoice Preview</h2>
            <p className="text-sm text-gray-600">Invoice #{invoiceNumber}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onDownload}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={onSend}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Send className="w-4 h-4" />
              Send Email
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading invoice...</p>
              </div>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title="Invoice Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Failed to load invoice</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

