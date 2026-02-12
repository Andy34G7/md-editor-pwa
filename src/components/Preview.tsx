import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css'; // Default highlight style
import './Preview.css';

interface PreviewProps {
    content: string;
}

export const Preview: React.FC<PreviewProps> = ({ content }) => {
    return (
        <div className="preview-container markdown-body">
            <Markdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
            >
                {content}
            </Markdown>
        </div>
    );
};
