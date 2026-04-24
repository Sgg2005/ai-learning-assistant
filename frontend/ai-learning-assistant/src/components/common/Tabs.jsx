import React from 'react'

const Tabs = ({ tabs, activeTab, setActiveTab }) => {
    return (
        <div className="w-full">
            <div className="border-b border-slate-200 dark:border-slate-700">
                <nav className="flex gap-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`relative pb-4 px-6 text-sm font-semibold transition-all duration-200 ${
                                activeTab === tab.name
                                    ? 'text-orange-500'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                            }`}
                        >
                            <span className="relative z-10">{tab.label}</span>
                            {activeTab === tab.name && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full" />
                            )}
                            {activeTab === tab.name && (
                                <div className="absolute inset-0 bg-orange-50 dark:bg-orange-500/10 rounded-t-lg opacity-50" />
                            )}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="mt-4">
                {tabs.map((tab) => {
                    if (tab.name === activeTab) {
                        return (
                            <div key={tab.name} className="w-full">
                                {tab.content}
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    );
};

export default Tabs;