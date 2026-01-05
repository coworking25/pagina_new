import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Send, Trash2, MessageSquare, AlertCircle } from 'lucide-react';
import { 
  getPropertyInternalNotes, 
  createPropertyInternalNote, 
  deletePropertyInternalNote 
} from '../../lib/supabase';
import { supabase } from '../../lib/supabase';

interface InternalNote {
  id: number;
  property_id: number;
  content: string;
  created_by: string;
  created_at: string;
}

interface InternalNotesProps {
  propertyId: number;
}

export default function InternalNotes({ propertyId }: InternalNotesProps) {
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadNotes();
    checkUser();
  }, [propertyId]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUser(user.id);
      setIsAdmin(user.user_metadata?.role === 'admin');
    }
  };

  const loadNotes = async () => {
    setLoading(true);
    try {
      const data = await getPropertyInternalNotes(propertyId);
      setNotes(data);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSubmitting(true);
    try {
      await createPropertyInternalNote(propertyId, newNote.trim());
      setNewNote('');
      await loadNotes();
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Error al crear la nota');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (noteId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta nota?')) return;

    try {
      await deletePropertyInternalNote(noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Error al eliminar la nota');
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
        Notas Internas
        <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
          Privado
        </span>
      </h3>

      {/* Lista de Notas */}
      <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
        {loading ? (
          <div className="text-center py-4 text-gray-500">Cargando notas...</div>
        ) : notes.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">No hay notas internas aún.</p>
            <p className="text-xs text-gray-400 mt-1">Solo los asesores y administradores pueden ver esto.</p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 relative group">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {format(new Date(note.created_at), "d MMM yyyy, h:mm a", { locale: es })}
                </span>
                {(currentUser === note.created_by || isAdmin) && (
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Eliminar nota"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {note.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Escribe una nota interna..."
          className="w-full p-3 pr-12 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
          rows={2}
        />
        <button
          type="submit"
          disabled={submitting || !newNote.trim()}
          className="absolute bottom-2 right-2 p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
