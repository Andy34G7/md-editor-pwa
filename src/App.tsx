import { useState, useEffect } from 'react';
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
        loading: driveLoading,
        login,
        logout,
        getFile,
        saveFile,
        createFile,
        refreshFiles,
        renameFile,
        folderPath,
        navigateToFolder,
        navigateUp
    } = useGoogleDrive();

    const [markdown, setMarkdown] = useState<string>('# Welcome to MD Editor\n\nSign in with Google to edit your markdown files.');
    // ... (skip lines)

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



    const handleLogout = () => {
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

    return (
        <>
            <Layout
                isDark={isDark}
                onToggleTheme={toggleTheme}
                onSave={handleSave}
                onLogin={login}
                onLogout={handleLogout}
                user={currentUser}
                fileName={currentFile ? currentFile.name : 'Untitled.md'}
                currentFont={font}
                onFontChange={setFont}
                onRename={isSignedIn && currentFile ? (newName) => handleRename(newName) : undefined}
                onDownload={handleDownload}
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
