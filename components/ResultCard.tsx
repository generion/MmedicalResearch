
import React, { useState } from 'react';
import { ProcessedFileResult } from '../types';
import { CheckCircle, AlertCircle, Loader2, Clock, User, Stethoscope, Eye, X, Trash2, FileText } from 'lucide-react';

interface ResultCardProps {
  result: ProcessedFileResult;
  onDelete: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, onDelete }) => {
  const [showPreview, setShowPreview] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete();
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-white p-1.5 rounded-md border border-gray-200 shadow-sm shrink-0">
              <FileText className="w-5 h-5 text-teal-600" />
            </div>
            <span className="font-medium text-gray-700 truncate" title={result.fileName}>
              {result.fileName}
            </span>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-md transition-colors shrink-0"
              title="Dosyayı Görüntüle"
            >
              <Eye className="w-3.5 h-3.5" />
              Görüntüle
            </button>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {result.status === 'processing' && (
              <span className="flex items-center text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" /> İşleniyor
              </span>
            )}
            {result.status === 'success' && (
              <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-100">
                <CheckCircle className="w-3 h-3 mr-1" /> Tamamlandı
              </span>
            )}
            {result.status === 'error' && (
              <span className="flex items-center text-xs font-medium text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100">
                <AlertCircle className="w-3 h-3 mr-1" /> Hata
              </span>
            )}
            
            <div className="w-px h-4 bg-gray-300 mx-1"></div>

            <button 
              type="button"
              onClick={handleDeleteClick}
              className="flex items-center justify-center p-2 rounded-md text-red-500 hover:text-red-700 hover:bg-red-50 transition-all cursor-pointer border border-transparent hover:border-red-200"
              title="Dosyayı Sil"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4">
          {result.status === 'error' ? (
            <div className="text-red-500 text-sm bg-red-50 p-4 rounded-lg border border-red-100 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{result.errorMessage}</span>
            </div>
          ) : result.status === 'processing' ? (
             <div className="flex flex-col items-center justify-center py-8 text-gray-400 space-y-3">
               <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
               <p className="text-sm font-medium text-gray-500">Yapay zeka dökümanı analiz ediyor...</p>
             </div>
          ) : (
            <div className="space-y-6">
              {result.examinations.map((exam, idx) => (
                <div key={idx} className="relative pl-4 border-l-2 border-teal-200 hover:border-teal-400 transition-colors">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-teal-400 shadow-sm"></div>
                  
                  {/* Header Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                     <div className="flex flex-col">
                        <span className="text-gray-400 text-xs flex items-center gap-1 mb-1"><User className="w-3 h-3"/> Yaş</span>
                        <span className="font-semibold text-gray-800">{exam.yas || '-'}</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-gray-400 text-xs flex items-center gap-1 mb-1"><Clock className="w-3 h-3"/> Saat</span>
                        <span className="font-semibold text-gray-800">{exam.muayeneSaati || '-'}</span>
                     </div>
                     <div className="flex flex-col col-span-2">
                        <span className="text-gray-400 text-xs flex items-center gap-1 mb-1"><Stethoscope className="w-3 h-3"/> Uzmanlık/Servis</span>
                        <span className="font-semibold text-gray-800">{exam.uzmanlikServis || '-'}</span>
                     </div>
                  </div>

                  {/* Complaint */}
                  <div className="bg-amber-50 p-3 rounded-md mb-4 border border-amber-100">
                    <span className="text-xs text-amber-600 block mb-1 font-medium uppercase tracking-wide">Şikayet</span>
                    <p className="text-gray-800 text-sm leading-relaxed">{exam.sikayet || 'Belirtilmemiş'}</p>
                  </div>

                  {/* Diagnoses Table */}
                  {exam.tanilar && exam.tanilar.length > 0 && (
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                      <table className="min-w-full text-left text-xs">
                        <thead className="bg-gray-100 text-gray-500 font-medium border-b border-gray-200">
                          <tr>
                            <th className="px-3 py-2 w-12 text-center">Sıra</th>
                            <th className="px-3 py-2 w-24">Tür</th>
                            <th className="px-3 py-2 w-32">Konu</th>
                            <th className="px-3 py-2">Tanı</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {exam.tanilar.map((tani, tIdx) => (
                            <tr key={tIdx} className="hover:bg-gray-50 transition-colors">
                              <td className="px-3 py-2 font-mono text-gray-500 text-center">{tani.sira}</td>
                              <td className="px-3 py-2 text-teal-700 font-medium">{tani.taniTuru}</td>
                              <td className="px-3 py-2 text-gray-600">{tani.konu}</td>
                              <td className="px-3 py-2 font-medium text-gray-900">{tani.taniAdi}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {(!exam.tanilar || exam.tanilar.length === 0) && (
                     <div className="text-xs text-gray-400 italic mt-2 px-2">Tanı bilgisi bulunamadı.</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* File Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                 <div className="bg-white p-1 rounded border border-gray-200">
                    <FileText className="w-4 h-4 text-teal-600" />
                 </div>
                 <h3 className="font-semibold text-gray-800 truncate max-w-md" title={result.fileName}>{result.fileName}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="p-2 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-6 bg-gray-100 overflow-hidden relative flex items-center justify-center">
              {result.mimeType.startsWith('image/') ? (
                <img
                  src={result.fileUrl}
                  alt={result.fileName}
                  className="max-w-full max-h-full object-contain shadow-md rounded"
                />
              ) : result.mimeType === 'application/pdf' ? (
                <iframe
                  src={result.fileUrl}
                  title={result.fileName}
                  className="w-full h-full bg-white shadow-md rounded border border-gray-200"
                />
              ) : (
                <div className="text-center text-gray-500 bg-white p-8 rounded-lg shadow-sm">
                  <AlertCircle className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p>Bu dosya formatı önizlenemiyor.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResultCard;
