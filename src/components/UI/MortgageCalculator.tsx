import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, Percent, Calendar } from 'lucide-react';

interface MortgageCalculatorProps {
  propertyPrice?: number;
}

const MortgageCalculator: React.FC<MortgageCalculatorProps> = ({ propertyPrice: initialPrice }) => {
  const [propertyPrice, setPropertyPrice] = useState(initialPrice || 200000000);
  const [downPayment, setDownPayment] = useState(propertyPrice * 0.3);
  const [interestRate, setInterestRate] = useState(12.5);
  const [loanTerm, setLoanTerm] = useState(15);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);

  useEffect(() => {
    calculateMortgage();
  }, [downPayment, interestRate, loanTerm, propertyPrice]);

  useEffect(() => {
    if (initialPrice && initialPrice !== propertyPrice) {
      setPropertyPrice(initialPrice);
      setDownPayment(initialPrice * 0.3);
    }
  }, [initialPrice]);

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
    <div className="space-y-6">
      {/* Inputs Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Valor de la Propiedad */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
            <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
            Valor de la Propiedad
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              type="number"
              value={propertyPrice}
              onChange={(e) => {
                const newPrice = Number(e.target.value);
                setPropertyPrice(newPrice);
                const percentage = downPayment / propertyPrice;
                setDownPayment(newPrice * percentage);
              }}
              className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium transition-all"
              placeholder="200,000,000"
            />
          </div>
        </div>

        {/* Cuota Inicial */}
        <div className="space-y-2">
          <label className="flex items-center justify-between text-sm font-semibold text-gray-700 dark:text-gray-200">
            <span className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
              Cuota Inicial
            </span>
            <span className="text-green-600 dark:text-green-400 font-bold">{downPaymentPercentage.toFixed(1)}%</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium transition-all"
            />
          </div>
          <input
            type="range"
            min={propertyPrice * 0.1}
            max={propertyPrice * 0.5}
            value={downPayment}
            onChange={(e) => setDownPayment(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                       [&::-webkit-slider-thumb]:bg-green-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                       [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-green-600 
                       [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
          />
        </div>

        {/* Tasa de Interés */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
            <Percent className="w-4 h-4 text-green-600 dark:text-green-400" />
            Tasa de Interés Anual
          </label>
          <div className="relative">
            <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium transition-all"
              placeholder="12.5"
            />
          </div>
        </div>

        {/* Plazo del Préstamo */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
            <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
            Plazo del Préstamo
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={loanTerm}
              onChange={(e) => setLoanTerm(Number(e.target.value))}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium cursor-pointer transition-all"
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
      </div>

      {/* Resultados - Card destacada */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800 shadow-lg">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-green-600 dark:text-green-400" />
          Resumen de tu Hipoteca
        </h4>
        
        <div className="space-y-4">
          {/* Pago Mensual - Destacado */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Pago Mensual</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(monthlyPayment)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          {/* Otros detalles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Pago Total</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalPayment + downPayment)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Total Intereses</p>
              <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                {formatCurrency(totalInterest)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center italic">
        * Los valores son aproximados. Para información exacta, consulta con nuestros asesores.
      </p>
    </div>
  );
};

export default MortgageCalculator;
