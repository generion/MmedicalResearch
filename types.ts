
export interface Diagnosis {
  sira: string;
  konu: string;
  taniTuru: string;
  taniAdi: string;
}

export interface Examination {
  yas: string;
  muayeneSaati: string;
  uzmanlikServis: string;
  sikayet: string;
  tanilar: Diagnosis[];
}

export interface ProcessedFileResult {
  id: string; // Unique identifier for the file entry
  fileName: string;
  fileUrl: string; // URL created via URL.createObjectURL
  mimeType: string;
  examinations: Examination[];
  status: 'pending' | 'processing' | 'success' | 'error';
  errorMessage?: string;
}

export interface FlattenedRow {
  DosyaAdi: string;
  Yas: string;
  MuayeneSaati: string;
  UzmanlikServis: string;
  Sikayet: string;
  TaniSira: string;
  TaniKonu: string;
  TaniTuru: string;
  TaniAdi: string;
}
