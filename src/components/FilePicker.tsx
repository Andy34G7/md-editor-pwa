import React from 'react';
import { File, X } from 'lucide-react';
import { DriveFile } from '../hooks/useGoogleDrive';
import './FilePicker.css';

interface FilePickerProps {
    files: DriveFile[];
    onSelect: (file: DriveFile) => void;
    onCancel: () => void;
    onNewFile?: () => void;
    isLoading?: boolean;
}

export const FilePicker: React.FC<FilePickerProps> = ({ files, onSelect, onCancel, onNewFile, isLoading }) => {
    return (
        <div className="file-picker-overlay">
            <div className="file-picker-modal">
                <div className="file-picker-header">
                    <h2>Select a File</h2>
                    <div className="header-actions">
                        {onNewFile && (
                            <button className="new-file-btn" onClick={onNewFile}>
                                + New
                            </button>
                        )}
                        <button className="close-btn" onClick={onCancel}>
                            <X size={20} />
                        </button>
                    </div>
                </div>
                <div className="file-picker-content">
                    {isLoading ? (
                        <div className="loading">Loading files...</div>
                    ) : files.length === 0 ? (
                        <div className="empty-state">No Markdown files found in your Drive.</div>
                    ) : (
                        <ul className="file-list">
                            {files.map((file) => (
                                <li key={file.id} onClick={() => onSelect(file)} className="file-item">
                                    <File size={16} className="file-icon" />
                                    <span className="file-name">{file.name}</span>
                                    <span className="file-date">
                                        {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : ''}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};
