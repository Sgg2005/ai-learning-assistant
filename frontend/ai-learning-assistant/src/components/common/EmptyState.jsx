import React from 'react'
import { FileText, Plus } from 'lucide-react'

const EmptyState = ({ onActionClick, title, description, buttonText }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-orange-400" strokeWidth={2} />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">{description}</p>
        {buttonText && onActionClick && (
            <button
                onClick={onActionClick}
                className="relative flex items-center gap-2 py-2.5 px-5 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 text-white text-sm font-medium shadow-md shadow-orange-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
                <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" strokeWidth={2.5} />
                    {buttonText}
                </span>
                <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
            </button>
        )}
    </div>
  )
}

export default EmptyState