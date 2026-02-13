import { useState, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { SplitPane } from './components/SplitPane';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { FilePicker } from './components/FilePicker';
import { useGoogleDrive } from './hooks/useGoogleDrive';
import { DriveFile } from './services/google';

function App() {
    const {
        isSignedIn,
        currentUser,
        files,
        login,
        logout,
        getFile,
        saveFile,
        createFile,
        refreshFiles,
        renameFile,
        folderPath,
        navigateToFolder,
        navigateUp,
        openPicker,
        openFolderPicker
    } = useGoogleDrive();

    const [markdown, setMarkdown] = useState<string>('# Welcome to MD Editor\n\nSign in with Google to edit your markdown files.');
    // ... (skip lines)

    const [currentFile, setCurrentFile] = useState<DriveFile | null>(null);
    const [showFilePicker, setShowFilePicker] = useState(false);
    const [isDark, setIsDark] = useState<boolean>(true);
    const [isDirty, setIsDirty] = useState(false);
    const [font, setFont] = useState('Inter, system-ui, sans-serif');
    const [fontSize, setFontSize] = useState(16);
    const [showLineNumbers, setShowLineNumbers] = useState(true);
    const [showPreview, setShowPreview] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const cmRef = useRef<any>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const isScrolling = useRef<'editor' | 'preview' | null>(null);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    useEffect(() => {
        document.documentElement.style.setProperty('--preview-font', font);
        document.documentElement.style.setProperty('--preview-font-size', `${fontSize}px`);
    }, [font, fontSize]);

    // Sync Scrolling Logic
    const handleEditorScroll = (scrollTop: number, scrollHeight: number, clientHeight: number) => {
        // If preview is driving the scroll, ignore
        if (isScrolling.current === 'preview') return;

        isScrolling.current = 'editor';

        if (previewRef.current) {
            const ratio = scrollTop / (scrollHeight - clientHeight);
            const previewScrollTop = ratio * (previewRef.current.scrollHeight - previewRef.current.clientHeight);
            previewRef.current.scrollTop = previewScrollTop;
        }

        // Reset lock after a short delay
        if ((window as any).scrollTimeout) clearTimeout((window as any).scrollTimeout);
        (window as any).scrollTimeout = setTimeout(() => {
            isScrolling.current = null;
        }, 100);
    };

    const handlePreviewScroll = (e: React.UIEvent<HTMLDivElement>) => {
        // If editor is driving the scroll, ignore
        if (isScrolling.current === 'editor') return;

        isScrolling.current = 'preview';

        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

        if (cmRef.current?.view) {
            const editorScrollDOM = cmRef.current.view.scrollDOM;
            const ratio = scrollTop / (scrollHeight - clientHeight);
            const editorScrollTop = ratio * (editorScrollDOM.scrollHeight - editorScrollDOM.clientHeight);
            editorScrollDOM.scrollTop = editorScrollTop;
        }

        if ((window as any).scrollTimeout) clearTimeout((window as any).scrollTimeout);
        (window as any).scrollTimeout = setTimeout(() => {
            isScrolling.current = null;
        }, 100);
    };

    /*
    useEffect(() => {
        if (isSignedIn && !currentFile) {
            setShowFilePicker(true);
        }
    }, [isSignedIn, currentFile]);
    */

    const toggleTheme = () => setIsDark(!isDark);

    const handleFileSelect = async (file: DriveFile) => {
        try {
            setShowFilePicker(false);
            // Show loading state?
            const content = await getFile(file.id);
            setMarkdown(content as string);
            setCurrentFile(file);
            setIsDirty(false);
        } catch (err) {
            console.error('Error loading file', err);
            alert('Failed to load file');
            setShowFilePicker(true);
        }
    };

    const handleSave = async () => {
        if (!isSignedIn) return alert('Please sign in to save');

        try {
            if (currentFile) {
                await saveFile(currentFile.id, markdown);
                setIsDirty(false);
                alert('Saved successfully!');
            } else {
                // New File Flow: Select Folder -> Name -> Create
                openFolderPicker((folder: any) => {
                    const name = prompt('Enter file name:', 'New Document.md');
                    if (!name) return;

                    createFile(name, markdown, folder.id).then((newFile) => {
                        refreshFiles();
                        setCurrentFile(newFile as any);
                        setIsDirty(false);
                        alert('Saved successfully!');
                    }).catch(err => {
                        console.error('Error creating file', err);
                        alert('Failed to create file');
                    });
                });
            }
        } catch (err) {
            console.error('Error saving', err);
            alert('Failed to save');
        }
    };



    const handleLogout = () => {
        if (isSignedIn && !confirmUnsavedChanges()) return;
        logout();
        setCurrentFile(null);
        setMarkdown('# Welcome to MD Editor\n\nSign in with Google to edit your markdown files.');
    };

    const handleRename = async (newName: string) => {
        if (!currentFile || !isSignedIn) return;
        try {
            await renameFile(currentFile.id, newName); // Use destructured renameFile
            setCurrentFile({ ...currentFile, name: newName });
            refreshFiles(); // Refresh list to show new name
        } catch (err) {
            console.error('Failed to rename', err);
            alert('Failed to rename file');
        }
    };

    const handleDownload = () => {
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = currentFile ? currentFile.name : 'Untitled.md'; // Fallback logic
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handlePrint = () => {
        const content = previewRef.current?.innerHTML || '';
        if (!content) return alert('Nothing to print');

        const printWindow = window.open('', '_blank');
        if (!printWindow) return alert('Please allow popups to print');

        const title = currentFile ? currentFile.name.replace(/\.md$/i, '') : 'Document';

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown-light.min.css">
                <style>
                    body {
                        box-sizing: border-box;
                        min-width: 200px;
                        max-width: 980px;
                        margin: 0 auto;
                        padding: 45px;
                    }
                    @media (max-width: 767px) {
                        .markdown-body {
                            padding: 15px;
                        }
                    }
                    @media print {
                        body {
                            padding: 0;
                            margin: 0;
                        }
                        /* Hide things if needed */
                    }
                </style>
            </head>
            <body class="markdown-body">
                ${content}
                <script>
                    window.onload = function() {
                        setTimeout(() => {
                            window.print();
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const confirmUnsavedChanges = () => {
        if (isDirty) {
            return window.confirm('You have unsaved changes. Are you sure you want to discard them?');
        }
        return true;
    };

    const handleNew = () => {
        if (!confirmUnsavedChanges()) return;
        setCurrentFile(null);
        setMarkdown('');
        setIsDirty(false);
    };

    const handleOpen = () => {
        if (!isSignedIn) return;
        if (!confirmUnsavedChanges()) return;
        openPicker((file: any) => {
            handleFileSelect(file);
        });
    };

    return (
        <>
            <Layout
                isDark={isDark}
                onToggleTheme={toggleTheme}
                onSave={handleSave}
                onNew={handleNew}
                onOpen={handleOpen}
                onLogin={login}
                onLogout={handleLogout}
                user={currentUser}
                fileName={currentFile ? currentFile.name : 'Untitled.md'}
                currentFont={font}
                onFontChange={setFont}
                currentFontSize={fontSize}
                onFontSizeChange={setFontSize}
                onRename={isSignedIn && currentFile ? (newName) => handleRename(newName) : undefined}
                onDownload={handleDownload}
                onPrint={handlePrint}
                showLineNumbers={showLineNumbers}
                onToggleLineNumbers={() => setShowLineNumbers(!showLineNumbers)}
                showPreview={showPreview}
                onTogglePreview={() => setShowPreview(!showPreview)}
            >
                {
                    isMobile ? (
                        showPreview ? (
                            <Preview
                                ref={previewRef}
                                content={markdown}
                                onScroll={handlePreviewScroll}
                            />
                        ) : (
                            <Editor
                                value={markdown}
                                onChange={(val) => {
                                    setMarkdown(val);
                                    setIsDirty(true);
                                }}
                                fontSize={fontSize}
                                fontFamily={font}
                                hideLineNumbers={!showLineNumbers}
                                onScroll={handleEditorScroll}
                                cmRef={cmRef}
                                isDark={isDark}
                            />
                        )
                    ) : (
                        showPreview ? (
                            <SplitPane
                                left={
                                    <Editor
                                        value={markdown}
                                        onChange={(val) => {
                                            setMarkdown(val);
                                            setIsDirty(true);
                                        }}
                                        fontSize={fontSize}
                                        fontFamily={font}
                                        hideLineNumbers={!showLineNumbers}
                                        onScroll={handleEditorScroll}
                                        cmRef={cmRef}
                                        isDark={isDark}
                                    />
                                }
                                right={
                                    <Preview
                                        ref={previewRef}
                                        content={markdown}
                                        onScroll={handlePreviewScroll}
                                    />
                                }
                            />
                        ) : (
                            <Editor
                                value={markdown}
                                onChange={(val) => {
                                    setMarkdown(val);
                                    setIsDirty(true);
                                }}
                                fontSize={fontSize}
                                fontFamily={font}
                                hideLineNumbers={!showLineNumbers}
                                onScroll={handleEditorScroll}
                                cmRef={cmRef}
                                isDark={isDark}
                            />
                        )
                    )}
            </Layout >

            {showFilePicker && isSignedIn && (
                <FilePicker
                    files={files}
                    onSelect={handleFileSelect}
                    onCancel={() => currentFile && setShowFilePicker(false)}
                    currentPath={folderPath}
                    onNavigate={navigateToFolder}
                    onNavigateUp={navigateUp}
                    onCreate={async (name) => {
                        const newFile = await createFile(name, '');
                        refreshFiles();
                        setCurrentFile(newFile as any);
                        setShowFilePicker(false);
                        setMarkdown('');
                    }}
                />
            )}
        </>
    );
}

export default App;
