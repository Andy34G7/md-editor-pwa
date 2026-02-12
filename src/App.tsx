import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { SplitPane } from './components/SplitPane';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { FilePicker } from './components/FilePicker';
import { useGoogleDrive, DriveFile } from './hooks/useGoogleDrive';

function App() {
    const {
        isSignedIn,
        currentUser,
        files,
        loading: driveLoading,
        login,
        logout,
        getFile,
        saveFile,
        createFile,
        refreshFiles
    } = useGoogleDrive();

    const [markdown, setMarkdown] = useState<string>('# Welcome to MD Editor\n\nSign in with Google to edit your markdown files.');
    const [currentFile, setCurrentFile] = useState<DriveFile | null>(null);
    const [showFilePicker, setShowFilePicker] = useState(false);
    const [isDark, setIsDark] = useState<boolean>(true);
    const [isDirty, setIsDirty] = useState(false);
    const [font, setFont] = useState('Inter, system-ui, sans-serif');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    useEffect(() => {
        document.documentElement.style.setProperty('--preview-font', font);
    }, [font]);

    useEffect(() => {
        if (isSignedIn && !currentFile) {
            setShowFilePicker(true);
        }
    }, [isSignedIn, currentFile]);

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
            } else {
                const name = prompt('Enter file name:', 'New Document.md');
                if (!name) return;
                const newFile = await createFile(name, markdown);
                // Add to file list/refresh?
                refreshFiles();
                setCurrentFile(newFile as any); // Type cast simplified
            }
            setIsDirty(false);
            alert('Saved successfully!');
        } catch (err) {
            console.error('Error saving', err);
            alert('Failed to save');
        }
    };

    const handleNewFile = () => {
        setCurrentFile(null);
        setMarkdown('# New Document\n\nRanked #1 editor in the world!');
        setShowFilePicker(false);
        setIsDirty(true); // Treat as dirty so save creates new
    };

    const handleLogout = () => {
        logout();
        setCurrentFile(null);
        setMarkdown('# Welcome to MD Editor\n\nSign in with Google to edit your markdown files.');
    };

    return (
        <>
            <Layout
                isDark={isDark}
                onToggleTheme={toggleTheme}
                onSave={handleSave}
                onLogin={login}
                onLogout={handleLogout}
                user={currentUser}
                fileName={currentFile ? currentFile.name : (isDirty ? 'Untitled*' : 'Welcome')}
                currentFont={font}
                onFontChange={setFont}
            >
                <SplitPane
                    left={
                        <Editor
                            value={markdown}
                            onChange={(val) => {
                                setMarkdown(val);
                                setIsDirty(true);
                            }}
                        />
                    }
                    right={
                        <Preview content={markdown} />
                    }
                />
            </Layout>

            {showFilePicker && isSignedIn && (
                <FilePicker
                    files={files}
                    onSelect={handleFileSelect}
                    onCancel={() => setShowFilePicker(false)}
                    onNewFile={handleNewFile}
                    isLoading={driveLoading}
                />
            )}
        </>
    );
}

export default App;
