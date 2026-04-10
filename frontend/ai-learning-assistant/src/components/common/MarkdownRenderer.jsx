import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MarkdownRenderer = ({ content }) => {
    if (!content) return null;

    return (
        <div className="max-w-none text-sm leading-relaxed text-slate-800">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-3 text-slate-800 leading-tight" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-xl font-semibold mt-5 mb-2 text-slate-800 leading-snug" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mt-4 mb-2 text-slate-700" {...props} />,
                    h4: ({ node, ...props }) => <h4 className="text-base font-semibold mt-3 mb-1 text-slate-700" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-3 leading-6 text-slate-700" {...props} />,
                    a: ({ node, ...props }) => <a className="text-orange-500 underline underline-offset-2 hover:text-orange-700 transition-colors" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc list-outside pl-5 mb-3 space-y-1 text-slate-700" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal list-outside pl-5 mb-3 space-y-1 text-slate-700" {...props} />,
                    li: ({ node, ...props }) => <li className="leading-6" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-semibold text-slate-800" {...props} />,
                    em: ({ node, ...props }) => <em className="italic text-slate-600" {...props} />,
                    blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-orange-300 bg-orange-50 pl-4 pr-2 py-1 my-3 rounded-r-lg italic text-slate-600" {...props} />,
                    code: ({ node, inline, className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                            <SyntaxHighlighter
                                style={dracula}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                            >
                                {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                        ) : (
                            <code className="bg-orange-100 text-orange-700 rounded px-1.5 py-0.5 text-xs font-mono" {...props}>
                                {children}
                            </code>
                        );
                    },
                    pre: ({ node, ...props }) => <pre className="my-3 rounded-xl overflow-x-auto" {...props} />
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;