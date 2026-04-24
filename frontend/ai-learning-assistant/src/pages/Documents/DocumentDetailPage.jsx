import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import documentService from '../../services/documentServices';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Tabs from '../../components/common/Tabs';
import ChatInterface from '../../components/chat/ChatInterface';
import AIActions from '../../components/ai/AIActions';
import FlashcardManager from '../../components/flashcards/FlashcardManager';
import QuizManager from '../../components/quizzes/QuizManager';
import NotesTab from '../../components/documents/NotesTab';

const DocumentDetailPage = () => {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Content');

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      try {
        const data = await documentService.getDocumentById(id);
        setDocument(data?.data);
      } catch (error) {
        toast.error('Failed to load document details');
        console.error('Error fetching document details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentDetails();
  }, [id]);

  const getPdfUrl = () => {
    if (!document) return null;
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000";
    if (document.fileName) return `${apiBase}/uploads/documents/${document.fileName}`;
    if (document.filePath?.startsWith("http")) return document.filePath;
    if (document.filePath) return `${apiBase}${document.filePath.startsWith("/") ? "" : "/"}${document.filePath}`;
    return null;
  };

  const renderContent = () => {
    if (loading) return <Spinner />;

    if (!document?.filePath) {
      return <div className="text-center p-8 text-slate-600 dark:text-slate-400">PDF not available</div>;
    }

    const pdfUrl = getPdfUrl();

    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl overflow-hidden shadow-sm transition-colors duration-300">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-700">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Document Viewer</span>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors duration-200"
          >
            <ExternalLink size={16} />
            Open in new tab
          </a>
        </div>
        <div className="w-full h-[75vh]">
          <iframe
            src={pdfUrl}
            className="w-full h-full"
            title="PDF Viewer"
            frameBorder="0"
            style={{ colorScheme: 'light' }}
          />
        </div>
      </div>
    );
  };

  const tabs = [
    { name: 'Content', label: 'Content', content: renderContent() },
    { name: 'Chat', label: 'Chat', content: <ChatInterface /> },
    { name: 'AI Actions', label: 'AI Actions', content: <AIActions /> },
    { name: 'Flashcards', label: 'Flashcards', content: <FlashcardManager documentId={id} /> },
    { name: 'Quizzes', label: 'Quizzes', content: <QuizManager documentId={id} /> },
    { name: 'Notes', label: 'Notes', content: activeTab === 'Notes' ? <NotesTab documentId={id} initialNotes={document?.notes || ''} /> : null },
  ];

  if (loading) return <Spinner />;

  if (!document) {
    return <div className="text-center p-8 text-slate-600 dark:text-slate-400">Document not found</div>;
  }

  return (
    <div className="transition-colors duration-300">
      <div className="mb-4">
        <Link
          to="/documents"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Documents
        </Link>
      </div>
      <PageHeader title={document.title} />
      <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default DocumentDetailPage;