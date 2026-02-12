import React, { useState, useEffect, useRef } from 'react';
import { FileText, Save, Moon, Sun, User, Download } from 'lucide-react';
import './Layout.css';

const FONTS = [
    { name: 'Sans Serif (Inter)', value: 'Inter, system-ui, sans-serif' },
    { name: 'Serif (Merriweather)', value: 'Merriweather, Georgia, serif' },
    { name: 'Monospace (Fira Code)', value: '"Fira Code", monospace' },
    { name: 'Red Hat Display', value: '"Red Hat Display", sans-serif' },
    { name: 'Montserrat', value: 'Montserrat, sans-serif' },
];

interface LayoutProps {
    children: React.ReactNode;
    onSave?: () => void;
    isDark?: boolean;
    onToggleTheme?: () => void;
    user?: { name: string; email: string; avatar?: string } | null;
    onLogin?: () => void;
    onLogout?: () => void;
    fileName?: string;
    currentFont?: string;
    onFontChange?: (font: string) => void;
    onRename?: (newName: string) => void;
    onDownload?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
    children,
    onSave,
    isDark,
    onToggleTheme,
    user,
    onLogin,
    onLogout,
    fileName = 'Untitled.md',
    currentFont,
    onFontChange,
    onRename,
    onDownload,
}) => {
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(fileName);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setTempName(fileName);
    }, [fileName]);

    useEffect(() => {
        if (isEditingName && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditingName]);

    const handleNameSubmit = () => {
        setIsEditingName(false);
        if (tempName && tempName.trim() !== '' && tempName !== fileName && onRename) {
            onRename(tempName);
        } else {
            setTempName(fileName);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleNameSubmit();
        if (e.key === 'Escape') {
            setIsEditingName(false);
            setTempName(fileName);
        }
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <div className="header-left">
                    <div className="logo">
                        <FileText size={24} />
                    </div>
                    <div className="file-info">
                        {isEditingName ? (
                            <input
                                ref={inputRef}
                                type="text"
                                className="file-name-input"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                onBlur={handleNameSubmit}
                                onKeyDown={handleKeyDown}
                            />
                        ) : (
                            <span
                                className="file-name"
                                onDoubleClick={() => onRename && setIsEditingName(true)}
                                title="Double click to rename"
                            >
                                {fileName}
                            </span>
                        )}
                        <button className="icon-btn" onClick={onSave} title="Save (Ctrl+S)">
                            <Save size={18} />
                        </button>
                        {onDownload && (
                            <button className="icon-btn" onClick={onDownload} title="Download Local">
                                <Download size={18} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="header-right">
                    {onFontChange && (
                        <select
                            className="font-select"
                            value={currentFont}
                            onChange={(e) => onFontChange(e.target.value)}
                            title="Change Preview Font"
                        >
                            {FONTS.map(f => (
                                <option key={f.value} value={f.value}>{f.name}</option>
                            ))}
                        </select>
                    )}
                    <button className="icon-btn" onClick={onToggleTheme} title="Toggle Theme">
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {user ? (
                        <div className="user-profile" onClick={onLogout} title={`Signed in as ${user.name}`}>
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="avatar" />
                            ) : (
                                <div className="avatar-placeholder">{user.name[0]}</div>
                            )}
                        </div>
                    ) : (
                        <button className="login-btn" onClick={onLogin}>
                            <User size={18} style={{ marginRight: '8px' }} />
                            Sign In
                        </button>
                    )}
                </div>
            </header>
            <main className="app-main">
                {children}
            </main>
        </div>
    );
};
