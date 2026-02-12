import React, { useState, useCallback, useEffect } from 'react';
import './SplitPane.css';

interface SplitPaneProps {
    left: React.ReactNode;
    right: React.ReactNode;
    initialLeftWidth?: number; // percentage
}

export const SplitPane: React.FC<SplitPaneProps> = ({ left, right, initialLeftWidth = 50 }) => {
    const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging) {
            const newLeftWidth = (e.clientX / window.innerWidth) * 100;
            // Limit width between 10% and 90%
            if (newLeftWidth > 10 && newLeftWidth < 90) {
                setLeftWidth(newLeftWidth);
            }
        }
    }, [isDragging]);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
        <div className="split-pane-container">
            <div className="split-pane-left" style={{ width: `${leftWidth}%` }}>
                {left}
            </div>
            <div className="split-pane-divider" onMouseDown={handleMouseDown}>
                <div className="divider-handle" />
            </div>
            <div className="split-pane-right" style={{ width: `${100 - leftWidth}%` }}>
                {right}
            </div>
        </div>
    );
};
