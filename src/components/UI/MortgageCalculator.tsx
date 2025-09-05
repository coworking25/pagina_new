import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, Percent, Calendar } from 'lucide-react';

interface MortgageCalculatorProps {
  propertyPrice: number;
}

const MortgageCalculator: React.FC<MortgageCalculatorProps> = ({ propertyPrice }) => {
  const [downPayment, setDownPayment] = useState(propertyPrice * 0.3);
  const [interestRate, setInterestRate] = useState(12.5);
  const [loanTerm, setLoanTerm] = useState(15);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);

  useEffect(() => {
    calculateMortgage();
  }, [downPayment, interestRate, loanTerm, propertyPrice]);

  const calculateMortgage = () => {
    const principal = propertyPrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;

    if (principal <= 0 || monthlyRate <= 0 || numberOfPayments <= 0) {
      setMonthlyPayment(0);
      setTotalPayment(0);
      setTotalInterest(0);
      return;
    }

    const monthlyPaymentCalc = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                              (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const totalPaymentCalc = monthlyPaymentCalc * numberOfPayments;
    const totalInterestCalc = totalPaymentCalc - principal;

    setMonthlyPayment(monthlyPaymentCalc);
    setTotalPayment(totalPaymentCalc);
    setTotalInterest(totalInterestCalc);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const downPaymentPercentage = (downPayment / propertyPrice) * 100;

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Calculator className="w-5 h-5 text-green-600" />
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
          Calculadora de Hipoteca
        </h4>
      </div>

      <div className="space-y-4">
        {/* Cuota Inicial */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cuota Inicial ({downPaymentPercentage.toFixed(1)}%)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <input
            type="range"
            min={propertyPrice * 0.1}
            max={propertyPrice * 0.5}
            value={downPayment}
            onChange={(e) => setDownPayment(Number(e.target.value))}
            className="w-full mt-2"
          />
        </div>

        {/* Tasa de Interés */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tasa de Interés Anual (%)
          </label>
          <div className="relative">
            <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Plazo del Préstamo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Plazo del Préstamo (años)
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={loanTerm}
              onChange={(e) => setLoanTerm(Number(e.target.value))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value={5}>5 años</option>
              <option value={10}>10 años</option>
              <option value={15}>15 años</option>
              <option value={20}>20 años</option>
              <option value={25}>25 años</option>
              <option value={30}>30 años</option>
            </select>
          </div>
        </div>

        {/* Resultados */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Pago Mensual:</span>
            <span className="font-semibold text-lg text-green-600 dark:text-green-400">
              {formatCurrency(monthlyPayment)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Pago Total:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(totalPayment + downPayment)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Intereses:</span>
            <span className="font-medium text-red-600 dark:text-red-400">
              {formatCurrency(totalInterest)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MortgageCalculator;
