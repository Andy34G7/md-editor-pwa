import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css'; // Default highlight style
import './Preview.css';

interface PreviewProps {
    content: string;
    onScroll?: React.UIEventHandler<HTMLDivElement>;
}

export const Preview = React.forwardRef<HTMLDivElement, PreviewProps>(({ content, onScroll }, ref) => {
    return (
        <div ref={ref} className="preview-container markdown-body" onScroll={onScroll}>
            <Markdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
            >
                {content}
            </Markdown>
        </div>
    );
});
