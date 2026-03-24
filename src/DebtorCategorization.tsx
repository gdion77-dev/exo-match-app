import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Briefcase, Landmark, FileText, 
  ChevronRight, ChevronLeft, Info, ShieldCheck
} from 'lucide-react';

type Step = 1 | 2 | 3 | 4;

export default function DebtorCategorization() {
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState({
    fullName: '',
    afm: '',
    familyStatus: 'single',
    dependents: 0,
    annualIncome: '',
    totalAssetsValue: '',
    primaryResidenceValue: '',
    publicDebts: '',
    bankDebts: '',
    privateDebts: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4) as Step);
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1) as Step);

  const calculateCategory = () => {
    const income = parseFloat(formData.annualIncome) || 0;
    const assets = parseFloat(formData.totalAssetsValue) || 0;
    
    if (income < 10000 && assets < 50000) return 'Ευάλωτος Οφειλέτης';
    if (income < 30000 && assets < 150000) return 'Ενδιάμεση Κατηγορία';
    return 'Υψηλή Δυνατότητα Αποπληρωμής';
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8 relative">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 rounded-full -z-10"></div>
      <div 
        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 rounded-full -z-10 transition-all duration-500"
        style={{ width: `${((step - 1) / 3) * 100}%` }}
      ></div>
      
      {[
        { num: 1, icon: User, label: 'Στοιχεία' },
        { num: 2, icon: Briefcase, label: 'Οικονομικά' },
        { num: 3, icon: Landmark, label: 'Οφειλές' },
        { num: 4, icon: FileText, label: 'Αποτέλεσμα' }
      ].map((s) => (
        <div key={s.num} className="flex flex-col items-center gap-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
            step >= s.num 
              ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/30' 
              : 'bg-white border-slate-200 text-slate-400'
          }`}>
            <s.icon className="w-5 h-5" />
          </div>
          <span className={`text-xs font-medium hidden sm:block ${step >= s.num ? 'text-blue-900' : 'text-slate-400'}`}>
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Κατηγοριοποίηση Οφειλετών
          </h1>
          <p className="text-slate-500 font-medium">
            Σύμφωνα με τον Ν. 5264/2025
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-10">
          {renderStepIndicator()}

          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Βασικά Στοιχεία</h2>
                    <p className="text-sm text-slate-500">Συμπληρώστε τα προσωπικά στοιχεία του οφειλέτη.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Ονοματεπώνυμο</label>
                      <input 
                        type="text" name="fullName" value={formData.fullName} onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
                        placeholder="π.χ. Ιωάννης Παπαδόπουλος"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Α.Φ.Μ.</label>
                      <input 
                        type="text" name="afm" value={formData.afm} onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
                        placeholder="9-ψήφιος αριθμός"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Οικογενειακή Κατάσταση</label>
                      <select 
                        name="familyStatus" value={formData.familyStatus} onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
                      >
                        <option value="single">Άγαμος/η</option>
                        <option value="married">Έγγαμος/η</option>
                        <option value="divorced">Διαζευγμένος/η</option>
                        <option value="widowed">Χήρος/α</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Προστατευόμενα Μέλη</label>
                      <input 
                        type="number" name="dependents" min="0" value={formData.dependents} onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Οικονομικά Δεδομένα</h2>
                    <p className="text-sm text-slate-500">Εισοδήματα και περιουσιακή κατάσταση.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Ετήσιο Οικογενειακό Εισόδημα (€)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">€</span>
                        <input 
                          type="number" name="annualIncome" value={formData.annualIncome} onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Συνολική Αξία Ακίνητης Περιουσίας (€)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">€</span>
                        <input 
                          type="number" name="totalAssetsValue" value={formData.totalAssetsValue} onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Αξία Κύριας Κατοικίας (€)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">€</span>
                        <input 
                          type="number" name="primaryResidenceValue" value={formData.primaryResidenceValue} onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
                          placeholder="0.00"
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <Info className="w-3 h-3" /> Αφήστε κενό αν δεν υφίσταται κύρια κατοικία.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Υφιστάμενες Οφειλές</h2>
                    <p className="text-sm text-slate-500">Κατανομή οφειλών ανά κατηγορία πιστωτή.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Οφειλές προς Δημόσιο / ΕΦΚΑ (€)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">€</span>
                        <input 
                          type="number" name="publicDebts" value={formData.publicDebts} onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Οφειλές προς Τράπεζες / Funds (€)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">€</span>
                        <input 
                          type="number" name="bankDebts" value={formData.bankDebts} onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Λοιπές Ιδιωτικές Οφειλές (€)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">€</span>
                        <input 
                          type="number" name="privateDebts" value={formData.privateDebts} onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-8 text-center py-8"
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mb-4">
                    <ShieldCheck className="w-10 h-10" />
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Αποτέλεσμα Κατηγοριοποίησης</h2>
                    <p className="text-slate-500">Βάσει των κριτηρίων του Ν. 5264/2025</p>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 inline-block w-full max-w-md">
                    <div className="text-sm text-slate-500 font-medium mb-1">Κατηγορία Οφειλέτη</div>
                    <div className="text-2xl font-bold text-blue-700">{calculateCategory()}</div>
                    
                    <div className="mt-6 pt-6 border-t border-slate-200 text-left space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Ονοματεπώνυμο:</span>
                        <span className="font-medium text-slate-900">{formData.fullName || '-'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Α.Φ.Μ.:</span>
                        <span className="font-medium text-slate-900">{formData.afm || '-'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Συνολικό Χρέος:</span>
                        <span className="font-medium text-slate-900">
                          €{((parseFloat(formData.publicDebts)||0) + (parseFloat(formData.bankDebts)||0) + (parseFloat(formData.privateDebts)||0)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4 pt-4">
                    <button 
                      onClick={() => setStep(1)}
                      className="px-6 py-3 rounded-xl font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                      Νέα Αξιολόγηση
                    </button>
                    <button className="px-6 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Εξαγωγή PDF
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          {step < 4 && (
            <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={prevStep}
                disabled={step === 1}
                className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                  step === 1 
                    ? 'text-slate-300 cursor-not-allowed' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ChevronLeft className="w-5 h-5" /> Πίσω
              </button>
              
              <button
                onClick={nextStep}
                className="px-8 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
              >
                {step === 3 ? 'Υπολογισμός' : 'Επόμενο'} <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
