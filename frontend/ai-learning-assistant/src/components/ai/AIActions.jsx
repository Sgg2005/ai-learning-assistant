import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Sparkles, BookOpen, Lightbulb } from "lucide-react";
import aiService from "../../services/aiService";
import toast from "react-hot-toast";
import MarkdownRenderer from "../common/MarkdownRenderer";
import Modal from "../common/Modal";

const AIActions = () => {
  const { id: documentId } = useParams();
  const [loadingAction, setLoadingAction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [concept, setConcept] = useState("");

  const handleGenerateSummary = async () => {
    setLoadingAction("summary");
    try {
      const { summary } = await aiService.generateSummary(documentId);
      setModalTitle("Document Summary");
      setModalContent(summary);
      setIsModalOpen(true);
    } catch (error) {
      toast.error("Failed to generate summary");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExplainConcept = async (e) => {
    e.preventDefault();
    if (!concept.trim()) {
      toast.error("Please enter a concept to explain");
      return;
    }

    setLoadingAction("explain");
    try {
      const { explanation } = await aiService.explainConcept(documentId, concept);
      setModalTitle(`Explanation of "${concept}"`);
      setModalContent(explanation);
      setIsModalOpen(true);
      setConcept("");
    } catch (error) {
      toast.error("Failed to explain concept");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-orange-100 dark:border-slate-700">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-md shadow-orange-200 shrink-0">
            <Sparkles className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">AI Actions</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Powered by advanced AI technology</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-800 border border-orange-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col gap-4 hover:shadow-md hover:border-orange-200 dark:hover:border-orange-500/40 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-orange-500" strokeWidth={2} />
              </div>
              <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100">Generate Summary</h4>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Get a concise summary of the document's key points and insights.
            </p>
            <button
              onClick={handleGenerateSummary}
              disabled={loadingAction === "summary"}
              className="mt-auto w-full py-2.5 px-4 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 text-white text-sm font-medium shadow-sm shadow-orange-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loadingAction === "summary" ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Loading...
                </span>
              ) : "Summarize"}
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-orange-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col gap-4 hover:shadow-md hover:border-orange-200 dark:hover:border-orange-500/40 transition-all">
            <form onSubmit={handleExplainConcept} className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-5 h-5 text-orange-500" strokeWidth={2} />
                </div>
                <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100">Explain a Concept</h4>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Enter a topic or concept from the document that you find challenging, and get a clear explanation.
              </p>
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder="e.g. Quantum Entanglement"
                  className="w-full px-4 py-2.5 rounded-xl bg-orange-50 dark:bg-slate-700/50 border border-orange-100 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-500/40 transition-all"
                  disabled={loadingAction === "explain"}
                />
                <button
                  type="submit"
                  disabled={loadingAction === "explain" || !concept.trim()}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 text-white text-sm font-medium shadow-sm shadow-orange-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loadingAction === "explain" ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </span>
                  ) : "Explain"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle}>
        <div className="max-h-[65vh] overflow-y-auto pr-1">
          <div className="prose prose-sm max-w-none prose-slate dark:prose-invert">
            <div className="text-slate-800 dark:text-slate-100 [&_*]:!text-inherit">
              <MarkdownRenderer content={modalContent} />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AIActions;