import React, { useState, useRef } from 'react';
import ExcelJS from 'exceljs';
import { Upload, FileSpreadsheet, AlertCircle, Check, X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Property } from '../types';

interface PropertyCSVImportProps {
  onImportSuccess: () => void;
  onClose: () => void;
}

export default function PropertyCSVImport({ onImportSuccess, onClose }: PropertyCSVImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setSuccessCount(0);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      
      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        setError('El archivo no contiene hojas de cálculo.');
        return;
      }

      const jsonData: any[] = [];
      const headers: string[] = [];

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) {
          // Headers
          row.eachCell((cell, colNumber) => {
            headers[colNumber] = cell.value?.toString() || '';
          });
        } else {
          // Data
          const rowData: any = {};
          row.eachCell((cell, colNumber) => {
            const header = headers[colNumber];
            if (header) {
              rowData[header] = cell.value;
            }
          });
          jsonData.push(rowData);
        }
      });
      
      if (jsonData.length === 0) {
        setError('El archivo está vacío o no tiene un formato válido.');
        return;
      }

      setPreviewData(jsonData.slice(0, 5)); // Preview first 5 rows
    } catch (err) {
      console.error('Error parsing file:', err);
      setError('Error al leer el archivo. Asegúrate de que sea un CSV o Excel válido.');
    }
  };

  const processImport = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setError(null);
    let importedCount = 0;
    let errors = [];

    try {
      const buffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];

      const jsonData: any[] = [];
      const headers: string[] = [];

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) {
          row.eachCell((cell, colNumber) => {
            headers[colNumber] = cell.value?.toString() || '';
          });
        } else {
          const rowData: any = {};
          row.eachCell((cell, colNumber) => {
            const header = headers[colNumber];
            if (header) {
              // Handle rich text or formulas if necessary, for now simple value
              rowData[header] = cell.value;
            }
          });
          jsonData.push(rowData);
        }
      });

      for (const row of jsonData) {
        try {
          // Map fields - try to be flexible with column names
          const propertyData: Partial<Property> = {
            title: row['Title'] || row['Titulo'] || row['title'] || 'Sin Título',
            code: row['Code'] || row['Codigo'] || row['code'] || '',
            availability_type: (row['Availability'] || row['Disponibilidad'] || row['availability_type'] || 'sale').toString().toLowerCase(),
            sale_price: Number(row['Sale Price'] || row['Precio Venta'] || row['sale_price']) || 0,
            rent_price: Number(row['Rent Price'] || row['Precio Arriendo'] || row['rent_price']) || 0,
            bedrooms: Number(row['Bedrooms'] || row['Habitaciones'] || row['bedrooms']) || 0,
            bathrooms: Number(row['Bathrooms'] || row['Baños'] || row['bathrooms']) || 0,
            area: Number(row['Area'] || row['area']) || 0,
            location: row['Location'] || row['Ubicacion'] || row['location'] || '',
            estrato: Number(row['Estrato'] || row['estrato']) || 0,
            type: (row['Type'] || row['Tipo'] || row['type'] || 'apartment').toString().toLowerCase(),
            status: (row['Status'] || row['Estado'] || row['status'] || 'available').toString().toLowerCase(),
            description: row['Description'] || row['Descripcion'] || row['description'] || '',
            amenities: (row['Amenities'] || row['Amenidades'] || row['amenities'] || '').toString().split(',').map((s: string) => s.trim()).filter(Boolean),
            featured: Boolean(row['Featured'] || row['Destacado'] || row['featured']),
            images: [], // Default empty
          };

          // Basic validation
          if (!propertyData.title) throw new Error('Falta el título');
          
          // Insert into Supabase
          const { error: insertError } = await supabase
            .from('properties')
            .insert([propertyData]);

          if (insertError) throw insertError;
          
          importedCount++;
        } catch (err: any) {
          console.error('Error importing row:', row, err);
          errors.push(`Fila con título "${row['Title'] || 'Desconocido'}": ${err.message}`);
        }
      }

      setSuccessCount(importedCount);
      if (errors.length > 0) {
        setError(`Se importaron ${importedCount} propiedades. Errores: ${errors.slice(0, 3).join(', ')}...`);
      } else {
        setTimeout(() => {
            onImportSuccess();
            onClose();
        }, 1500);
      }

    } catch (err: any) {
      setError(`Error general en la importación: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            Importar Propiedades (CSV/Excel)
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!file ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700">Haz clic para subir tu archivo</p>
              <p className="text-sm text-gray-500 mt-2">Soporta .csv, .xlsx, .xls</p>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setFile(null); setPreviewData([]); setError(null); }}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Cambiar archivo
                </button>
              </div>

              {previewData.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b text-sm font-medium text-gray-700">
                    Vista previa (primeras 5 filas)
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {Object.keys(previewData[0]).slice(0, 5).map((header) => (
                            <th key={header} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {previewData.map((row, idx) => (
                          <tr key={idx}>
                            {Object.values(row).slice(0, 5).map((val: any, i) => (
                              <td key={i} className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                {String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {successCount > 0 && (
                <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-3">
                  <Check className="w-5 h-5" />
                  <p className="font-medium">¡{successCount} propiedades importadas exitosamente!</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isUploading}
                >
                  Cancelar
                </button>
                <button
                  onClick={processImport}
                  disabled={isUploading || successCount > 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Importar Propiedades
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
