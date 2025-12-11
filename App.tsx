
import React, { useState, useCallback, useEffect } from 'react';
import { Download, Trash2, FileSpreadsheet, Search, X } from 'lucide-react';
import FileUploader from './components/FileUploader';
import ResultCard from './components/ResultCard';
import { analyzeMedicalDocument } from './services/geminiService';
import { exportToExcel } from './services/excelService';
import { ProcessedFileResult } from './types';

function App() {
  const [results, setResults] = useState<ProcessedFileResult[]>([]);
  const [isProcessingGlobal, setIsProcessingGlobal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const processFiles = useCallback(async (files: File[]) => {
    setIsProcessingGlobal(true);

    // Create results with unique IDs immediately
    const newResults: ProcessedFileResult[] = files.map(file => ({
      id: Math.random().toString(36).substring(2, 15) + Date.now().toString(36),
      fileName: file.name,
      fileUrl: URL.createObjectURL(file), // Create a local URL for preview
      mimeType: file.type,
      examinations: [],
      status: 'processing'
    }));

    // Add placeholders immediately to UI
    setResults(prev => [...prev, ...newResults]);

    // Process files
    const promises = files.map(async (file, index) => {
      const id = newResults[index].id;
      try {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => {
             const result = reader.result as string;
             // Remove Data URL prefix to get raw base64
             const base64 = result.split(',')[1];
             resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const base64 = await base64Promise;
        const examinations = await analyzeMedicalDocument(base64, file.type);

        return {
          id,
          fileName: file.name,
          examinations: examinations,
          status: 'success' as const
        };

      } catch (error) {
        return {
          id,
          fileName: file.name,
          examinations: [],
          status: 'error' as const,
          errorMessage: error instanceof Error ? error.message : "Bilinmeyen hata"
        };
      }
    });

    const completedResults = await Promise.all(promises);

    setResults(prev => {
        const updated = [...prev];
        completedResults.forEach(comp => {
            const idx = updated.findIndex(r => r.id === comp.id);
            if (idx !== -1) {
                // Preserve the fileUrl and mimeType from the initial object
                updated[idx] = { 
                  ...updated[idx],
                  ...comp, // Merge the results (examinations, status)
                  fileUrl: updated[idx].fileUrl,
                  mimeType: updated[idx].mimeType
                };
            }
        });
        return updated;
    });

    setIsProcessingGlobal(false);
  }, []);

  // Filter Logic needs to be defined before handlers that use it
  const filteredResults = results.filter(result => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    
    // Check filename
    if (result.fileName.toLowerCase().includes(query)) return true;
    
    // Check examinations content
    return result.examinations.some(exam => {
      return (
        (exam.yas && exam.yas.toLowerCase().includes(query)) ||
        (exam.muayeneSaati && exam.muayeneSaati.toLowerCase().includes(query)) ||
        (exam.uzmanlikServis && exam.uzmanlikServis.toLowerCase().includes(query)) ||
        (exam.sikayet && exam.sikayet.toLowerCase().includes(query)) ||
        (exam.tanilar && exam.tanilar.some(tani => 
          (tani.taniAdi && tani.taniAdi.toLowerCase().includes(query)) ||
          (tani.konu && tani.konu.toLowerCase().includes(query)) ||
          (tani.taniTuru && tani.taniTuru.toLowerCase().includes(query)) ||
          (tani.sira && tani.sira.toLowerCase().includes(query))
        ))
      );
    });
  });

  const handleClearAll = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    
    if (results.length === 0) return;

    if (window.confirm("Tüm dosyaları silmek istediğinize emin misiniz?")) {
      // Clean up memory by revoking object URLs
      results.forEach(result => {
        if (result.fileUrl) {
          URL.revokeObjectURL(result.fileUrl);
        }
      });
      setResults([]);
      setSearchQuery(""); // Clear search as well
    }
  };

  const handleDeleteFiltered = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    
    if (filteredResults.length === 0) return;

    if (window.confirm(`Arama sonuçlarındaki ${filteredResults.length} adet dosyayı silmek istediğinize emin misiniz?`)) {
      const idsToRemove = new Set(filteredResults.map(r => r.id));
      
      // Clean up memory for removed items
      filteredResults.forEach(result => {
        if (result.fileUrl) {
          URL.revokeObjectURL(result.fileUrl);
        }
      });

      setResults(prev => prev.filter(r => !idsToRemove.has(r.id)));
    }
  };

  const handleDeleteResult = (id: string, fileName: string) => {
    if (window.confirm(`${fileName} dosyasını silmek istediğinize emin misiniz?`)) {
      setResults(prev => {
        // Find the item to clean up its URL
        const itemToRemove = prev.find(r => r.id === id);
        if (itemToRemove && itemToRemove.fileUrl) {
          URL.revokeObjectURL(itemToRemove.fileUrl);
        }
        // Return new state without this item
        return prev.filter(r => r.id !== id);
      });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      results.forEach(result => {
        if (result.fileUrl) {
          URL.revokeObjectURL(result.fileUrl);
        }
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleExport = () => {
    if (results.some(r => r.status === 'success')) {
      exportToExcel(results);
    }
  };

  const successCount = results.filter(r => r.status === 'success').length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-teal-600 p-2 rounded-lg shadow-sm">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Medical Research</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:inline">AI Destekli Tıbbi Analiz</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Intro / Upload Section */}
        <section className="space-y-4">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-gray-900">Dosya Yükleme</h2>
            <p className="text-gray-600 mt-1">
              Sağlık raporlarını (PDF, JPEG, PNG) yükleyin. Sistem otomatik olarak verileri ayrıştırıp Excel'e hazırlar.
            </p>
          </div>
          
          <FileUploader 
            onFilesSelected={processFiles} 
            disabled={false} 
          />
        </section>

        {/* Results Section */}
        {results.length > 0 && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="sticky top-20 bg-gray-50/95 backdrop-blur py-4 z-20 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between border-b border-transparent md:border-gray-200/50">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 whitespace-nowrap">
                  Analiz Sonuçları 
                  <span className="text-sm font-normal text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                      {filteredResults.length} / {results.length}
                  </span>
                </h2>
                
                {/* Search Bar */}
                <div className="relative group w-full md:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 sm:text-sm transition-all shadow-sm"
                    placeholder="Dosya, tanı veya hasta ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button 
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                {searchQuery ? (
                  <button 
                    type="button"
                    onClick={handleDeleteFiltered}
                    disabled={filteredResults.length === 0}
                    className={`px-4 py-2 text-sm font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-sm
                      ${filteredResults.length === 0 
                        ? 'text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed' 
                        : 'text-red-600 bg-white border-red-200 hover:bg-red-50'
                      }
                    `}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Sonuçları Sil</span>
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={handleClearAll}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Tümünü Temizle</span>
                  </button>
                )}
                
                <button 
                  type="button"
                  onClick={handleExport}
                  disabled={successCount === 0}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all flex items-center gap-2 shadow-sm whitespace-nowrap
                    ${successCount > 0 
                        ? 'bg-teal-600 hover:bg-teal-700' 
                        : 'bg-gray-400 cursor-not-allowed'}
                  `}
                >
                  <Download className="w-4 h-4" />
                  Excel ({successCount})
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {filteredResults.length > 0 ? (
                filteredResults.map((result) => (
                  <ResultCard 
                    key={result.id} // Use stable unique ID for key
                    result={result} 
                    onDelete={() => handleDeleteResult(result.id, result.fileName)}
                  />
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200 border-dashed">
                  <Search className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Sonuç bulunamadı</h3>
                  <p className="mt-1 text-sm text-gray-500">"{searchQuery}" araması ile eşleşen kayıt yok.</p>
                  <button 
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="mt-4 text-sm font-medium text-teal-600 hover:text-teal-500 underline"
                  >
                    Filtreyi temizle
                  </button>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
