import { useState, useEffect, useCallback } from 'react';
import {
    loadGoogleScripts,
    initializeGapiClient,
    initializeGisClient,
    handleAuthClick,
    handleSignOut,
    listFiles,
    getFileContent,
    saveFile,
    createFile
} from '../services/google';

export interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    modifiedTime?: string;
}

export function useGoogleDrive() {
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [files, setFiles] = useState<DriveFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let gapiLoaded = false;
        let gisLoaded = false;

        const onGapiLoad = async () => {
            await new Promise<void>((resolve) => gapi.load('client', resolve));
            await initializeGapiClient();
            gapiLoaded = true;
            if (gisLoaded) setIsInitialized(true);
        };

        const onGisLoad = () => {
            initializeGisClient((tokenResponse) => {
                if (tokenResponse && tokenResponse.access_token) {
                    setIsSignedIn(true);
                    // Fetch user info or list files
                    // For now just set signed in
                }
            });
            gisLoaded = true;
            if (gapiLoaded) setIsInitialized(true);
        };

        loadGoogleScripts(onGapiLoad, onGisLoad);
    }, []);

    const login = useCallback(() => {
        handleAuthClick();
    }, []);

    const logout = useCallback(() => {
        handleSignOut();
        setIsSignedIn(false);
        setCurrentUser(null);
        setFiles([]);
    }, []);

    const refreshFiles = useCallback(async () => {
        if (!isSignedIn) return;
        setLoading(true);
        try {
            const driveFiles = await listFiles();
            setFiles(driveFiles || []);
        } catch (err: any) {
            setError(err.message || 'Failed to list files');
        } finally {
            setLoading(false);
        }
    }, [isSignedIn]);

    // Initial load
    useEffect(() => {
        if (isSignedIn) refreshFiles();
    }, [isSignedIn, refreshFiles]);

    return {
        isInitialized,
        isSignedIn,
        currentUser,
        files,
        loading,
        error,
        login,
        logout,
        refreshFiles,
        getFile: getFileContent,
        saveFile,
        createFile
    };
}
