import React, { useState } from 'react';
import toast from 'react-hot-toast';
import documentService from '../../services/documentServices';
import { Save, StickyNote } from 'lucide-react';

const NotesTab = ({ documentId, initialNotes }) => {
    const [notes, setNotes] = useState(initialNotes || '');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await documentService.updateNotes(documentId, notes);
            toast.success('Notes saved successfully');
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            toast.error('Failed to save notes');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <StickyNote className="w-5 h-5 text-orange-500" strokeWidth={2} />
                    <h3 className="text-lg font-semibold text-slate-800">My Notes</h3>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 text-white text-sm font-medium shadow-md shadow-orange-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all"
                >
                    <Save className="w-4 h-4" strokeWidth={2.5} />
                    {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Notes'}
                </button>
            </div>
            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write your notes here... Jot down key points, summaries, or anything you want to remember about this document."
                className="w-full h-[60vh] px-4 py-3 rounded-2xl bg-orange-50 border border-orange-100 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-orange-300 resize-none transition-all leading-relaxed"
            />
            <p className="text-xs text-slate-400 mt-2 text-right">{notes.length} characters</p>
        </div>
    );
};

export default NotesTab;