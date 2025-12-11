import * as XLSX from 'xlsx';
import { Examination, FlattenedRow, ProcessedFileResult } from '../types';

export const exportToExcel = (results: ProcessedFileResult[]) => {
  const flattenedData: FlattenedRow[] = [];

  results.forEach((fileResult) => {
    if (fileResult.status !== 'success') return;

    fileResult.examinations.forEach((exam) => {
      // If there are diagnoses, create a row for each diagnosis
      if (exam.tanilar && exam.tanilar.length > 0) {
        exam.tanilar.forEach((diagnosis) => {
          flattenedData.push({
            DosyaAdi: fileResult.fileName,
            Yas: exam.yas,
            MuayeneSaati: exam.muayeneSaati,
            UzmanlikServis: exam.uzmanlikServis,
            Sikayet: exam.sikayet,
            TaniSira: diagnosis.sira,
            TaniKonu: diagnosis.konu,
            TaniTuru: diagnosis.taniTuru,
            TaniAdi: diagnosis.taniAdi,
          });
        });
      } else {
        // If no diagnoses, still add the exam info
        flattenedData.push({
          DosyaAdi: fileResult.fileName,
          Yas: exam.yas,
          MuayeneSaati: exam.muayeneSaati,
          UzmanlikServis: exam.uzmanlikServis,
          Sikayet: exam.sikayet,
          TaniSira: '',
          TaniKonu: '',
          TaniTuru: '',
          TaniAdi: '',
        });
      }
    });
  });

  const worksheet = XLSX.utils.json_to_sheet(flattenedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Tıbbi Kayıtlar");

  // Adjust column widths automatically
  const wscols = [
    { wch: 20 }, // Dosya Adi
    { wch: 10 }, // Yas
    { wch: 15 }, // Saat
    { wch: 30 }, // Uzmanlik
    { wch: 40 }, // Sikayet
    { wch: 10 }, // Sira
    { wch: 15 }, // Konu
    { wch: 15 }, // Tur
    { wch: 40 }, // Tani Adi
  ];
  worksheet['!cols'] = wscols;

  XLSX.writeFile(workbook, "Tibbi_Analiz_Raporu.xlsx");
};