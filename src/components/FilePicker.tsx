import React, { useState } from 'react';
import { X, FileText, Folder, ArrowLeft, Plus } from 'lucide-react';
import { DriveFile } from '../services/google';
import './FilePicker.css';

interface FilePickerProps {
    files: DriveFile[];
    onSelect: (file: DriveFile) => void;
    onCancel: () => void;
    onCreate: (name: string) => void;
    currentPath?: { id: string, name: string }[];
    onNavigate?: (folderId: string, folderName: string) => void;
    onNavigateUp?: () => void;
}

export const FilePicker: React.FC<FilePickerProps> = ({
    files,
    onSelect,
    onCancel,
    onCreate,
    currentPath = [],
    onNavigate,
    onNavigateUp
}) => {
    const [newFileName, setNewFileName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (newFileName.trim()) {
            let name = newFileName.trim();
            if (!name.endsWith('.md')) name += '.md';
            onCreate(name);
        }
    };

    const sortedFiles = [...files].sort((a, b) => {
        const aIsFolder = a.mimeType === 'application/vnd.google-apps.folder';
        const bIsFolder = b.mimeType === 'application/vnd.google-apps.folder';
        if (aIsFolder && !bIsFolder) return -1;
        if (!aIsFolder && bIsFolder) return 1;
        return a.name.localeCompare(b.name);
    });

    return (
        <div className="file-picker-overlay">
            <div className="file-picker-modal">
                <div className="file-picker-header">
                    <div className="header-title-row">
                        <h2>Select File</h2>
                        <button className="close-btn" onClick={onCancel}>
                            <X size={20} />
                        </button>
                    </div>
                    {currentPath.length > 1 && (
                        <div className="breadcrumb-row">
                            <button className="back-btn" onClick={onNavigateUp} title="Go Up">
                                <ArrowLeft size={16} />
                            </button>
                            <span className="current-path">
                                {currentPath.map(p => p.name).join(' / ')}
                            </span>
                        </div>
                    )}
                </div>

                <div className="file-list">
                    {files.length === 0 && (
                        <div className="empty-state">No Markdown files found</div>
                    )}
                    {sortedFiles.map(file => {
                        const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                        return (
                            <div
                                key={file.id}
                                className={`file-item ${isFolder ? 'is-folder' : ''}`}
                                onClick={() => isFolder && onNavigate ? onNavigate(file.id, file.name) : onSelect(file)}
                            >
                                <span className="file-icon">
                                    {isFolder ? <Folder size={18} fill="currentColor" fillOpacity={0.2} /> : <FileText size={18} />}
                                </span>
                                <span className="file-name-text">{file.name}</span>
                                <span className="file-date">
                                    {new Date(file.modifiedTime || '').toLocaleDateString()}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="file-picker-footer">
                    {isCreating ? (
                        <form onSubmit={handleCreate} className="create-file-form">
                            <input
                                autoFocus
                                type="text"
                                placeholder="File name (e.g. notes.md)"
                                value={newFileName}
                                onChange={e => setNewFileName(e.target.value)}
                            />
                            <button type="submit" className="primary-btn">Create</button>
                            <button type="button" className="text-btn" onClick={() => setIsCreating(false)}>Cancel</button>
                        </form>
                    ) : (
                        <button className="create-btn" onClick={() => setIsCreating(true)}>
                            <Plus size={18} style={{ marginRight: '6px' }} />
                            New File
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
