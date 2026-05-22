import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, FileText, CheckCircle2, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

import documentService from "../services/documentServices";

const ExamGeneratorPage = () => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [mode, setMode] = useState("mcq");
  const [uploading, setUploading] = useState(false);

  const [showCountModal, setShowCountModal] = useState(false);
  const [questionCount, setQuestionCount] = useState(10);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const onFilesChosen = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setSelectedFiles(files);
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleModeSelect = (selectedMode) => {
    if (selectedFiles.length === 0) {
      toast.error("Please upload at least one document first.");
      return;
    }
    setMode(selectedMode);
    setShowCountModal(true);
  };

  const handleContinue = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please upload at least one document first.");
      return;
    }

    try {
      setUploading(true);

      // Upload the first file for now
      // If you want to handle multiple files later, we can extend this
      const formData = new FormData();
      formData.append("file", selectedFiles[0]);
      formData.append("title", selectedFiles[0].name.replace(/\.[^/.]+$/, ""));

      const uploadRes = await documentService.uploadDocument(formData);

      const documentId =
        uploadRes?.data?._id ||
        uploadRes?._id ||
        uploadRes?.document?._id;

      if (!documentId) {
        throw new Error("Upload succeeded but no document ID was returned.");
      }

      setShowCountModal(false);

      const targetRoute =
        mode === "mcq" ? "/exam-generator/mcq" : "/exam-generator/written";

      navigate(targetRoute, {
        state: {
          documentId,
          questionCount: Number(questionCount),
          fileName: selectedFiles[0].name,
        },
      });
    } catch (error) {
      toast.error(error?.message || error?.error || "Failed to upload document.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Exam Generator
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
          Upload your document first, then choose whether you want MCQs or a written exam paper.
          The system will use the uploaded document automatically.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple={false}
        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
        onChange={onFilesChosen}
      />

      <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Step 1 — Add your document
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Upload one lecture note, slide deck, or past paper to generate questions from.
            </p>
          </div>

          <button
            onClick={openFilePicker}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 text-white text-sm font-semibold shadow-sm shadow-orange-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <UploadCloud size={18} strokeWidth={2.5} />
            Add Document
          </button>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Selected file
              </p>
              <button
                onClick={clearFiles}
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-red-500 transition-colors"
              >
                Clear
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {selectedFiles.map((f) => (
                <div
                  key={f.name + f.size}
                  className="flex items-center gap-3 rounded-xl border border-slate-200/70 dark:border-slate-700/70 bg-slate-50 dark:bg-slate-700/30 px-4 py-3"
                >
                  <FileText size={18} className="text-orange-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {f.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {(f.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-orange-500" strokeWidth={2.5} />
          </div>
          <div className="w-full">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Step 2 — Choose question type
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Click MCQ or Written Exam Paper to continue.
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleModeSelect("mcq")}
                className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                  mode === "mcq"
                    ? "border-orange-300 bg-orange-50 dark:bg-orange-500/10 text-orange-600"
                    : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/30"
                }`}
                disabled={selectedFiles.length === 0}
              >
                MCQ
              </button>

              <button
                type="button"
                onClick={() => handleModeSelect("exam")}
                className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                  mode === "exam"
                    ? "border-orange-300 bg-orange-50 dark:bg-orange-500/10 text-orange-600"
                    : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/30"
                }`}
                disabled={selectedFiles.length === 0}
              >
                Written Exam Paper
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCountModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              How many questions do you want?
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Enter the number of questions for the {mode === "mcq" ? "MCQ quiz" : "written exam paper"}.
            </p>

            <input
              type="number"
              min="1"
              max={mode === "mcq" ? "50" : "20"}
              value={questionCount}
              onChange={(e) => setQuestionCount(e.target.value)}
              className="mt-4 w-full h-12 px-4 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 outline-none focus:border-orange-400"
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCountModal(false)}
                disabled={uploading}
                className="flex-1 h-11 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleContinue}
                disabled={uploading}
                className="flex-1 h-11 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 transition-all disabled:opacity-60"
              >
                {uploading ? "Uploading..." : "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamGeneratorPage;