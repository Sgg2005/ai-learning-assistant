import React from "react";
import {X} from "lucide-react";

const Modal = ({isOpen, onClose, title, children}) => {
  if(!isOpen) return null;

  return <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
     <div className="relative w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        ></div>

        <div className="relative bg-white rounded-2xl shadow-xl border border-orange-100 flex flex-col overflow-hidden">
            <button
               onClick={onClose}
               className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-orange-50 transition-all"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>

            <div className="px-6 py-4 border-b border-orange-100 shrink-0">
                <h3 className="text-base font-semibold text-slate-800 pr-8">
                    {title}
                </h3>
            </div>

            <div className="overflow-y-auto px-6 py-5 flex-1">{children}</div>
        </div>
        </div>
        </div>
};

export default Modal