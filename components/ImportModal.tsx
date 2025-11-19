import React, { useState } from 'react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestFileUpload: () => void;
  onImportText: (text: string) => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onRequestFileUpload, onImportText }) => {
  const [jsonText, setJsonText] = useState('');
  const [activeTab, setActiveTab] = useState<'file' | 'text'>('file');

  if (!isOpen) return null;

  const handleTextSubmit = () => {
    if (jsonText.trim()) {
      onImportText(jsonText);
      setJsonText(''); 
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-[100]" onClick={onClose}>
      <div className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-600 shadow-2xl overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
        
        {/* Header / Tabs */}
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setActiveTab('file')}
            className={`flex-1 py-4 font-bold text-sm uppercase tracking-wider transition-colors ${activeTab === 'file' ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-750'}`}
          >
            📂 Arquivo
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-4 font-bold text-sm uppercase tracking-wider transition-colors ${activeTab === 'text' ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-750'}`}
          >
            📝 Texto (Colar)
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'file' ? (
            <div className="text-center space-y-6 py-4">
              <div className="p-4 bg-indigo-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto text-4xl">
                📂
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Importar Arquivo .JSON</h3>
                <p className="text-slate-400 text-sm">Selecione o arquivo de backup salvo no seu dispositivo.</p>
              </div>
              <button
                onClick={onRequestFileUpload}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-900/30 transition transform active:scale-95"
              >
                Selecionar Arquivo
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Colar Dados</h3>
                <p className="text-slate-400 text-xs mb-3">Cole o código JSON copiado de outro dispositivo abaixo.</p>
                <textarea
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  placeholder='Cole aqui o conteúdo do arquivo JSON...'
                  className="w-full h-40 bg-slate-900 border border-slate-600 rounded-xl p-3 text-xs font-mono text-green-400 focus:ring-2 focus:ring-indigo-500 outline-none resize-none placeholder-slate-600"
                />
              </div>
              <button
                onClick={handleTextSubmit}
                disabled={!jsonText.trim()}
                className="w-full bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:text-slate-400 text-white font-bold py-3 rounded-xl shadow-lg transition transform active:scale-95"
              >
                Importar Texto
              </button>
            </div>
          )}
        </div>

        <div className="bg-slate-900/50 p-4 border-t border-slate-700">
          <button onClick={onClose} className="w-full text-slate-400 hover:text-white font-semibold text-sm transition">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;