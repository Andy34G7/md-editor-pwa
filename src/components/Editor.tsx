import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { EditorView } from '@codemirror/view';
import './Editor.css';

interface EditorProps {
    value: string;
    onChange: (value: string) => void;
    fontSize?: number;
    fontFamily?: string;
    hideLineNumbers?: boolean;
    onScroll?: (scrollTop: number, scrollHeight: number, clientHeight: number) => void;
    cmRef?: React.RefObject<any>;
    isDark?: boolean;
}

export const Editor: React.FC<EditorProps> = ({
    value,
    onChange,
    fontSize = 16,
    fontFamily,
    hideLineNumbers = false,
    onScroll,
    cmRef,
    isDark = true
}) => {
    // Custom theme extension to apply font styles only (layout moved to CSS)
    const fontTheme = EditorView.theme({
        "&": {
            fontSize: `${fontSize}px`,
            fontFamily: fontFamily || 'inherit',
        },
        ".cm-scroller": {
            fontFamily: fontFamily || 'inherit',
        },
        ".cm-gutters": {
            display: hideLineNumbers ? "none" : "flex",
            backgroundColor: "var(--bg-secondary)",
        }
    });

    // Scroll listener extension
    const scrollListener = React.useMemo(() => EditorView.domEventHandlers({
        scroll: (view) => {
            // Check if scroll is coming from user interaction or sync
            // We use simple check for now
            if (onScroll) {
                const { scrollTop, scrollHeight, clientHeight } = (view.target as HTMLElement);
                onScroll(scrollTop, scrollHeight, clientHeight);
            }
        }
    }), [onScroll]);

    return (
        <div className="editor-wrapper" style={{ height: '100%', overflow: 'hidden' }}>
            <CodeMirror
                ref={cmRef}
                value={value}
                height="100%"
                extensions={[
                    markdown({ base: markdownLanguage, codeLanguages: languages }),
                    fontTheme,
                    scrollListener,
                    EditorView.lineWrapping
                ]}
                onChange={onChange}
                theme={isDark ? 'dark' : 'light'}
                className="editor-container"
                basicSetup={{
                    lineNumbers: !hideLineNumbers,
                    foldGutter: !hideLineNumbers,
                    highlightActiveLine: false,
                }}
            />
        </div>
    );
};
