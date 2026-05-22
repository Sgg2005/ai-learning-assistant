import React, { useEffect, useState } from "react";
import { FileText, Sparkles, Loader2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import aiService from "../services/aiService";

const WrittenExamGeneratorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [generating, setGenerating] = useState(false);
  const [generatedPaper, setGeneratedPaper] = useState("");
  const [paperType, setPaperType] = useState("subparts");

  const documentId = location.state?.documentId;
  const questionCount = location.state?.questionCount || 5;
  const fileName = location.state?.fileName || "Uploaded document";

  useEffect(() => {
    if (!documentId) {
      toast.error("No document found. Please upload a document first.");
      navigate("/exam-generator");
    }
  }, [documentId, navigate]);

  const handleGenerate = async () => {
    try {
      setGenerating(true);

      const result = await aiService.generateWrittenExamPaper({
        documentId,
        questionCount: Number(questionCount),
        paperType,
      });

      const paperText =
        typeof result === "string"
          ? result
          : result?.questions ||
            result?.data?.questions ||
            result?.data?.plan ||
            result?.data ||
            "";

      if (!paperText || (Array.isArray(paperText) && paperText.length === 0)) {
        throw new Error("No written exam paper was returned.");
      }

      setGeneratedPaper(
        typeof paperText === "string" ? paperText : JSON.stringify(paperText, null, 2)
      );
      toast.success("Written exam paper generated successfully.");
    } catch (error) {
      toast.error(
        error?.message || error?.error || "Failed to generate written exam paper."
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Written Exam Paper Generator
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
          Generate a written exam paper from the uploaded document:{" "}
          <span className="font-semibold">{fileName}</span>
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-orange-500" />
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Questions: {questionCount}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This will generate a written exam paper automatically from the uploaded content.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Paper Type
          </label>
          <select
            value={paperType}
            onChange={(e) => setPaperType(e.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="subparts">1(a), 1(b), 1(c) style</option>
            <option value="short-answer">Short answer questions</option>
            <option value="essay">Essay style questions</option>
            <option value="mixed">Mixed format</option>
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="mt-6 w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 text-white text-sm font-semibold shadow-sm shadow-orange-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all"
        >
          {generating ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={18} strokeWidth={2.5} />
              Generate Written Exam Paper
            </>
          )}
        </button>
      </div>

      {generatedPaper && (
        <div className="mt-6 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Generated Written Exam Paper
          </h3>
          <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 leading-7">
            {generatedPaper}
          </pre>
        </div>
      )}
    </div>
  );
};

export default WrittenExamGeneratorPage;