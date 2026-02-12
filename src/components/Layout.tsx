import React from 'react';
import { FileText, Save, Moon, Sun, User } from 'lucide-react';
import './Layout.css';

const FONTS = [
    { name: 'Sans Serif', value: 'Inter, system-ui, sans-serif' },
    { name: 'Serif', value: 'Merriweather, Georgia, serif' },
    { name: 'Monospace', value: '"Fira Code", monospace' },
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
}) => {
    return (
        <div className="app-container">
            <header className="app-header">
                <div className="header-left">
                    <div className="logo">
                        <FileText size={24} />
                    </div>
                    <div className="file-info">
                        <span className="file-name">{fileName}</span>
                        <button className="icon-btn" onClick={onSave} title="Save (Ctrl+S)">
                            <Save size={18} />
                        </button>
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
