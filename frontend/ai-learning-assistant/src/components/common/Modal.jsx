import React from "react";
import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close modal backdrop"
        className="fixed inset-0 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-4xl max-h-[85vh] flex flex-col rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl transition-colors duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          <X className="w-4 h-4" strokeWidth={2} />
        </button>

        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0 bg-slate-50 dark:bg-slate-800/70">
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-white pr-8">
            {title}
          </h3>
        </div>

        {/* IMPORTANT: enforce readable text colors inside modal body */}
        <div className="overflow-y-auto px-6 py-5 flex-1 text-slate-800 dark:text-slate-100">
          <div
            className="
              [&_p]:text-slate-700 dark:[&_p]:text-slate-100
              [&_li]:text-slate-700 dark:[&_li]:text-slate-200
              [&_ul]:list-disc [&_ul]:pl-6
              [&_ol]:list-decimal [&_ol]:pl-6
              [&_strong]:text-slate-900 dark:[&_strong]:text-white
              [&_h1]:text-slate-900 dark:[&_h1]:text-white
              [&_h2]:text-slate-900 dark:[&_h2]:text-white
              [&_h3]:text-slate-900 dark:[&_h3]:text-slate-100
              [&_code]:text-slate-900 dark:[&_code]:text-slate-100
              [&_code]:bg-slate-100 dark:[&_code]:bg-slate-800
              [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded
            "
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;