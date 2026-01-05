import React from 'react';
import { Calendar, DollarSign, FileText } from 'lucide-react';
import { ClientWizardData } from '../ClientWizard';

interface Step3Props {
  formData: ClientWizardData;
  onChange: (data: Partial<ClientWizardData>) => void;
}

export default function Step3Documents({ formData, onChange }: Step3Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  const handleNestedChange = (section: 'contract_info', field: string, value: any) => {
    onChange({
      [section]: {
        ...formData[section],
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fecha Inicio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fecha de Inicio
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              value={formData.contract_info?.start_date || ''}
              onChange={(e) => handleNestedChange('contract_info', 'start_date', e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:text-white transition-colors"
            />
          </div>
        </div>

        {/* Fecha Fin */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fecha de Fin
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              value={formData.contract_info?.end_date || ''}
              onChange={(e) => handleNestedChange('contract_info', 'end_date', e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:text-white transition-colors"
            />
          </div>
        </div>

        {/* Depósito */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Depósito
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              value={formData.contract_info?.deposit_amount || ''}
              onChange={(e) => handleNestedChange('contract_info', 'deposit_amount', e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:text-white transition-colors"
              placeholder="0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
