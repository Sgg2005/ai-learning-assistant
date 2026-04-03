import React from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Trash2, BookOpen, BrainCircuit, Clock } from "lucide-react";
import moment from "moment";

const formatFileSize = (bytes) => {
  if (bytes === undefined || bytes === null) return "N/A";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const DocumentCard = ({ document, onDelete }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/documents/${document._id}`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(document);
  };

  return (
    <div
      className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-200 cursor-pointer relative group"
      onClick={handleNavigate}
    >
      {/* Header Section */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
            <FileText className="w-5 h-5 text-white" />
          </div>

          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors duration-200"
            aria-label="Delete document"
          >
            <Trash2 className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-slate-900 mb-2 truncate" title={document.title}>
          {document.title}
        </h3>

        {/* Document Info */}
        <div className="mb-4">
          {document.fileSize !== undefined && (
            <span className="text-xs text-slate-400">{formatFileSize(document.fileSize)}</span>
          )}
        </div>

        {/* Stats Section */}
        <div className="flex items-center gap-3 mb-2">
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-600"
            onClick={(e) => e.stopPropagation()}
          >
            <BookOpen className="w-3.5 h-3.5" strokeWidth={2} />
            <span className="text-xs font-medium">{document.flashcardsCount ?? 0} Flashcards</span>
          </div>

          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600"
            onClick={(e) => e.stopPropagation()}
          >
            <BrainCircuit className="w-3.5 h-3.5" strokeWidth={2} />
            <span className="text-xs font-medium">{document.quizCount ?? 0} Quizzes</span>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
          <span className="text-xs text-slate-400">
            Uploaded {moment(document.createdAt).fromNow()}
          </span>
        </div>
      </div>

      {/* Hover Indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-400 to-orange-500 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </div>
  );
};

export default DocumentCard;