import React, { useState, useEffect, useRef } from 'react';
import { FileText, Save, Moon, Sun, User, Download, Printer, ListOrdered, Columns, Menu as MenuIcon, X, FolderOpen, FilePlus, LogOut } from 'lucide-react';
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
    onNew?: () => void;
    onOpen?: () => void;
    isDark?: boolean;
    onToggleTheme?: () => void;
    user?: { name: string; email: string; avatar?: string } | null;
    onLogin?: () => void;
    onLogout?: () => void;
    fileName?: string;
    currentFont?: string;
    onFontChange?: (font: string) => void;
    currentFontSize?: number;
    onFontSizeChange?: (size: number) => void;
    onRename?: (newName: string) => void;
    onDownload?: () => void;
    onPrint?: () => void;
    showLineNumbers?: boolean;
    onToggleLineNumbers?: () => void;
    showPreview?: boolean;
    onTogglePreview?: () => void;
}

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 30];

export const Layout: React.FC<LayoutProps> = ({
    children,
    onSave,
    onNew,
    onOpen,
    isDark,
    onToggleTheme,
    user,
    onLogin,
    onLogout,
    fileName = 'Untitled.md',
    currentFont,
    onFontChange,
    currentFontSize = 16,
    onFontSizeChange,
    onRename,
    onDownload,
    onPrint,
    showLineNumbers,
    onToggleLineNumbers,
    showPreview,
    onTogglePreview,
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

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    // Close menu when clicking outside (simple implementation)
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Element;
            if (isMenuOpen && !target.closest('.mobile-menu') && !target.closest('.menu-toggle')) {
                setIsMenuOpen(false);
            }
            if (isProfileMenuOpen && !target.closest('.user-profile-container')) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen, isProfileMenuOpen]);

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
                        <button className="icon-btn" onClick={onNew} title="New File">
                            <FilePlus size={18} />
                        </button>
                        <button className="icon-btn" onClick={onOpen} title="Open File">
                            <FolderOpen size={18} />
                        </button>
                        <button className="icon-btn" onClick={onSave} title="Save (Ctrl+S)">
                            <Save size={18} />
                        </button>
                    </div>
                </div>

                {/* Desktop Menu */}
                <div className="header-right desktop-only">
                    {onFontChange && (
                        <div className="font-controls">
                            <select
                                className="font-select"
                                value={currentFont}
                                onChange={(e) => onFontChange(e.target.value)}
                                title="Font Family"
                            >
                                {FONTS.map(f => (
                                    <option key={f.value} value={f.value}>{f.name}</option>
                                ))}
                            </select>
                            {onFontSizeChange && (
                                <select
                                    className="font-size-select"
                                    value={currentFontSize}
                                    onChange={(e) => onFontSizeChange(Number(e.target.value))}
                                    title="Font Size"
                                >
                                    {FONT_SIZES.map(s => (
                                        <option key={s} value={s}>{s}px</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}
                    {onToggleLineNumbers && (
                        <button
                            className={`icon-btn ${showLineNumbers ? 'active' : ''}`}
                            onClick={onToggleLineNumbers}
                            title="Toggle Line Numbers"
                        >
                            <ListOrdered size={20} />
                        </button>
                    )}
                    {onPrint && (
                        <button className="icon-btn" onClick={onPrint} title="Print / Export PDF">
                            <Printer size={18} />
                        </button>
                    )}
                    {onTogglePreview && (
                        <button
                            className={`icon-btn ${showPreview ? 'active' : ''}`}
                            onClick={onTogglePreview}
                            title={showPreview ? "Hide Preview" : "Show Preview"}
                        >
                            {showPreview ? <Columns size={20} /> : <Columns size={20} style={{ opacity: 0.5 }} />}
                        </button>
                    )}
                    {onDownload && (
                        <button className="icon-btn" onClick={onDownload} title="Download Local">
                            <Download size={18} />
                        </button>
                    )}
                    <button className="icon-btn" onClick={onToggleTheme} title="Toggle Theme">
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {user ? (
                        <div className="user-profile-container">
                            <div
                                className="user-profile"
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                title={`Signed in as ${user.name}`}
                            >
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="avatar" />
                                ) : (
                                    <div className="avatar-placeholder">{user.name[0]}</div>
                                )}
                            </div>
                            {isProfileMenuOpen && (
                                <div className="profile-dropdown">
                                    <div className="profile-info">
                                        <div className="profile-name">{user.name}</div>
                                        <div className="profile-email">{user.email}</div>
                                    </div>
                                    <button
                                        className="profile-menu-item"
                                        onClick={() => {
                                            if (onLogout) onLogout();
                                            setIsProfileMenuOpen(false);
                                        }}
                                    >
                                        <LogOut size={16} style={{ marginRight: '8px' }} />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button className="login-btn" onClick={onLogin}>
                            <User size={18} style={{ marginRight: '8px' }} />
                            Sign In
                        </button>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <div className="header-right mobile-only">
                    {onTogglePreview && (
                        <button
                            className={`icon-btn ${showPreview ? 'active' : ''}`}
                            onClick={onTogglePreview}
                            title="Switch View"
                            style={{ marginRight: '4px' }}
                        >
                            {showPreview ? <FileText size={20} /> : <Columns size={20} />}
                        </button>
                    )}

                    {/* Mobile Profile Icon */}
                    <div style={{ marginRight: '8px' }}>
                        {user ? (
                            <div className="user-profile" onClick={onLogout} title={`Signed in as ${user.name}`}>
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="avatar" style={{ width: '28px', height: '28px' }} />
                                ) : (
                                    <div className="avatar-placeholder" style={{ width: '28px', height: '28px', fontSize: '0.8rem' }}>{user.name[0]}</div>
                                )}
                            </div>
                        ) : (
                            <button className="icon-btn" onClick={onLogin} title="Sign In">
                                <User size={20} />
                            </button>
                        )}
                    </div>

                    <button className="icon-btn menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMenuOpen && (
                    <div className="mobile-menu">
                        {onFontChange && (
                            <div className="mobile-menu-section">
                                <label>Font</label>
                                <select
                                    className="font-select"
                                    value={currentFont}
                                    onChange={(e) => onFontChange(e.target.value)}
                                >
                                    {FONTS.map(f => (
                                        <option key={f.value} value={f.value}>{f.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        {onFontSizeChange && (
                            <div className="mobile-menu-section">
                                <label>Size</label>
                                <select
                                    className="font-size-select"
                                    value={currentFontSize}
                                    onChange={(e) => onFontSizeChange(Number(e.target.value))}
                                >
                                    {FONT_SIZES.map(s => (
                                        <option key={s} value={s}>{s}px</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="mobile-menu-divider" />

                        <div className="mobile-menu-row">
                            <span>Line Numbers</span>
                            {onToggleLineNumbers && (
                                <button
                                    className={`icon-btn ${showLineNumbers ? 'active' : ''}`}
                                    onClick={() => { onToggleLineNumbers(); setIsMenuOpen(false); }}
                                >
                                    <ListOrdered size={20} />
                                </button>
                            )}
                        </div>

                        <div className="mobile-menu-row">
                            <span>Dark Mode</span>
                            <button className="icon-btn" onClick={() => { onToggleTheme && onToggleTheme(); setIsMenuOpen(false); }}>
                                {isDark ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                        </div>

                        <div className="mobile-menu-divider" />

                        <div className="mobile-menu-row">
                            {onNew && (
                                <button className="icon-btn" onClick={() => { onNew(); setIsMenuOpen(false); }} title="New">
                                    <FilePlus size={18} /> New
                                </button>
                            )}
                            {onOpen && (
                                <button className="icon-btn" onClick={() => { onOpen(); setIsMenuOpen(false); }} title="Open">
                                    <FolderOpen size={18} /> Open
                                </button>
                            )}
                            {onPrint && (
                                <button className="icon-btn" onClick={() => { onPrint(); setIsMenuOpen(false); }} title="Print">
                                    <Printer size={18} /> Print
                                </button>
                            )}
                            {onDownload && (
                                <button className="icon-btn" onClick={() => { onDownload(); setIsMenuOpen(false); }} title="Download">
                                    <Download size={18} /> Download
                                </button>
                            )}
                        </div>

                        <div className="mobile-menu-divider" />

                        {user ? (
                            <div className="mobile-menu-user" onClick={onLogout}>
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="avatar" />
                                ) : (
                                    <div className="avatar-placeholder">{user.name[0]}</div>
                                )}
                                <span>Sign Out ({user.name})</span>
                            </div>
                        ) : (
                            <button className="login-btn full-width" onClick={onLogin}>
                                <User size={18} style={{ marginRight: '8px' }} />
                                Sign In
                            </button>
                        )}
                    </div>
                )}
            </header>
            <main className="app-main">
                {children}
            </main>
        </div>
    );
};
