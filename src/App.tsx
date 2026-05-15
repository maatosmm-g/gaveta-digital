import { useState, useEffect } from 'react';
import React, { useState } from 'react';
import { ExternalLink, Tag, Calendar, Trash2, Globe, Lock, BarChart2, X, History, MousePointer2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { doc, deleteDoc, updateDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { getCategoryColor, getCategoryIcon } from '../lib/ui';
import { nanoid } from 'nanoid';

interface NotebookCardProps {
  notebook: {
    id: string;
    name: string;
    description: string;
    category: string;
    tags: string[];
    driveUrl: string;
    createdAt: any;
    isPublic?: boolean;
    shareId?: string;
    views?: number;
  };
  isSharedView?: boolean;
}

export const NotebookCard: React.FC<NotebookCardProps> = ({ notebook, isSharedView = false }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  
  const date = notebook.createdAt?.toDate?.()?.toLocaleDateString() || 'Recente';
  const accentColor = getCategoryColor(notebook.category || 'Geral');

  const fetchLogs = async () => {
    setLoadingLogs(true);
    setShowLogs(true);
    try {
      const q = query(
        collection(db, 'access_logs'),
        where('notebookId', '==', notebook.id),
        orderBy('accessedAt', 'desc'),
        limit(20)
      );
      const snapshot = await getDocs(q);
      setLogs(snapshot.docs.map(d => d.data()));
    } catch (err) {
      console.error("Erro ao buscar logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleting(true);
    try {
      const docRef = doc(db, 'notebooks', notebook.id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Erro ao excluir notebook:", error);
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="bg-white/80 backdrop-blur-sm border border-[#1a1a1a]/10 p-7 rounded-2xl flex flex-col h-full group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#5A5A40]/20"
      >
        {/* Efeito futurista de brilho no hover */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-[#5A5A40]/0 via-[#5A5A40]/10 to-[#5A5A40]/0"
          initial={{ x: "-100%" }}
          animate={{ x: isHovered ? "100%" : "-100%" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
        
        {/* Barra de categoria com efeito neon */}
        <div 
          className="absolute top-0 left-0 w-full h-1 rounded-t-2xl transition-all duration-300"
          style={{ 
            backgroundColor: accentColor,
            boxShadow: isHovered ? `0 0 10px ${accentColor}` : 'none'
          }}
        />
        
        <div className="flex justify-between items-start mb-6 relative z-10">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full"
            style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
          >
            {getCategoryIcon(notebook.category || 'Geral')}
            <span className="ml-1">{notebook.category || 'Sem Categoria'}</span>
          </motion.div>
          
          {!isSharedView && (
            <div className="flex gap-2 relative">
              {showConfirm ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1 bg-red-50 p-1 rounded-full border border-red-200"
                >
                  <button 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-[9px] uppercase font-bold text-red-600 px-3 py-1 rounded-full hover:bg-red-600 hover:text-white transition-colors"
                  >
                    {isDeleting ? '...' : 'Confirmar'}
                  </button>
                  <button 
                    onClick={(e) => { e.preventDefault(); setShowConfirm(false); }}
                    className="text-[9px] uppercase font-bold text-gray-400 px-2 py-1 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    X
                  </button>
                </motion.div>
              ) : (
                <>
                  {notebook.isPublic && (
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      className="p-2 bg-[#F5F5F0] rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-green-500 hover:text-white text-green-600/70"
                    >
                      <Globe size={14} />
                    </motion.button>
                  )}
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    onClick={fetchLogs}
                    className="p-2 bg-[#F5F5F0] rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-[#5A5A40] hover:text-white"
                  >
                    <BarChart2 size={14} />
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    onClick={(e) => { e.preventDefault(); setShowConfirm(true); }}
                    className="p-2 bg-[#F5F5F0] rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white text-red-500/70"
                  >
                    <Trash2 size={14} />
                  </motion.button>
                  <motion.a 
                    whileHover={{ scale: 1.1 }}
                    href={notebook.driveUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-[#F5F5F0] rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-[#1a1a1a] hover:text-white"
                  >
                    <ExternalLink size={14} />
                  </motion.a>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex-grow flex flex-col relative z-10">
          <motion.h3 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-light italic mb-4 leading-tight"
          >
            {notebook.name}
          </motion.h3>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="font-sans text-sm opacity-60 line-clamp-3 leading-relaxed mb-6"
          >
            {notebook.description}
          </motion.p>

          <div className="mt-auto space-y-5">
            <div className="flex flex-wrap gap-2">
              {notebook.tags?.slice(0, 4).map((tag: string, idx: number) => (
                <motion.span 
                  key={idx}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="text-[10px] bg-gradient-to-r from-[#F5F5F0] to-white px-2 py-1 rounded-full font-sans font-bold flex items-center gap-1 border border-[#1a1a1a]/10 shadow-sm"
                >
                  <Tag size={10} />
                  {tag}
                </motion.span>
              ))}
              {notebook.tags?.length > 4 && (
                <span className="text-[10px] text-gray-400 px-2 py-1">+{notebook.tags.length - 4}</span>
              )}
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-[#1a1a1a]/5">
              <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] font-bold opacity-40">
                <Calendar size={12} />
                {date}
              </div>
              {!isSharedView && notebook.isPublic && (
                <div className="flex items-center gap-1 text-[9px] font-bold text-[#5A5A40]">
                  <MousePointer2 size={10} />
                  <span>{notebook.views || 0} views</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modal de Logs com efeito futurista */}
      <AnimatePresence>
        {showLogs && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#1a1a1a]/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
            onClick={() => setShowLogs(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-[#1a1a1a]/10 flex justify-between items-center bg-gradient-to-r from-[#F5F5F0] to-white">
                <div>
                  <h4 className="text-xl italic">📊 Registro de Acessos</h4>
                  <p className="text-[9px] uppercase tracking-widest font-bold opacity-40 mt-1">{notebook.name}</p>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  onClick={() => setShowLogs(false)} 
                  className="p-2 hover:bg-[#1a1a1a]/10 rounded-full transition-all"
                >
                  <X size={20} />
                </motion.button>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-4">
                {loadingLogs ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-[#5A5A40] border-t-transparent rounded-full animate-spin mb-3" />
                    <p className="italic opacity-40">Buscando registros...</p>
                  </div>
                ) : logs.length > 0 ? (
                  logs.map((log, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 bg-gradient-to-r from-[#F5F5F0] to-white rounded-xl text-[11px] space-y-2 border border-[#1a1a1a]/5 shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold uppercase tracking-widest text-[#5A5A40]">
                          🕐 {log.accessedAt?.toDate?.()?.toLocaleString() || 'Agora'}
                        </span>
                        <MousePointer2 size={12} className="opacity-30" />
                      </div>
                      <div className="opacity-60 font-sans">
                        <p>📎 Referência: {log.referrer || 'direto'}</p>
                        <p className="truncate">🌐 Browser: {log.userAgent?.substring(0, 50)}...</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12 opacity-40 italic">
                    🔮 Nenhum acesso registrado ainda.
                  </div>
                )}
              </div>

              <div className="p-4 bg-gradient-to-r from-[#F5F5F0] to-white border-t border-[#1a1a1a]/10 text-center">
                <p className="text-[9px] uppercase tracking-widest font-bold opacity-40">✨ Últimos 20 acessos</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
// Adicione no topo dos imports:
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, FolderOpen } from 'lucide-react';

// Dentro do Dashboard, adicione:
const [isArchiving, setIsArchiving] = useState(false);
const [archivingMessage, setArchivingMessage] = useState('');

// Modifique a função de submit do AddNotebookForm para receber o efeito:
const handleAddSuccess = () => {
  setIsArchiving(true);
  setArchivingMessage('📦 Arquivando novo notebook...');
  setTimeout(() => {
    setIsArchiving(false);
    setIsAdding(false);
  }, 1500);
};

// No JSX, depois do header, adicione o efeito de arquivamento:
<AnimatePresence>
  {isArchiving && (
    <motion.div 
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#1a1a1a]/90 backdrop-blur-lg text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3"
    >
      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      <span className="text-sm font-medium">{archivingMessage}</span>
    </motion.div>
  )}
</AnimatePresence>

// Efeito de busca futurista - no input de busca:
<input 
  type="text" 
  placeholder="🔍 Buscar notebooks..." 
  value={searchTerm} 
  onChange={(e) => setSearchTerm(e.target.value)} 
  className="w-full bg-white/80 backdrop-blur-sm border border-[#1a1a1a]/20 p-3 rounded-xl focus:ring-2 focus:ring-[#5A5A40] focus:border-transparent transition-all duration-300 shadow-sm"
/>

// Efeito de resultado encontrado:
{filteredNotebooks.length === 0 && searchTerm && (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="col-span-full text-center py-20"
  >
    <div className="text-6xl mb-4">🔮</div>
    <p className="text-xl italic opacity-50">Nenhum notebook encontrado...</p>
    <p className="text-sm opacity-30 mt-2">Tente outra busca ou arquive novos códigos</p>
  </motion.div>
)}