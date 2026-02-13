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
    createFile,
    renameFile,
    getUserProfile,
    createPicker,
    createFolderPicker,
    DriveFile  // Import Shared Type
} from '../services/google';

// Remove local DriveFile interface definition

export function useGoogleDrive() {
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [files, setFiles] = useState<DriveFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentFolderId, setCurrentFolderId] = useState<string>('root');
    const [folderPath, setFolderPath] = useState<{ id: string, name: string }[]>([{ id: 'root', name: 'My Drive' }]);

    const [accessToken, setAccessToken] = useState<string | null>(null);

    useEffect(() => {
        let gapiLoaded = false;
        let gisLoaded = false;

        const onGapiLoad = async () => {
            await new Promise<void>((resolve) => gapi.load('client:picker', resolve));
            await initializeGapiClient();
            gapiLoaded = true;
            if (gisLoaded) setIsInitialized(true);
        };

        const onGisLoad = () => {
            initializeGisClient(async (tokenResponse) => {
                if (tokenResponse && tokenResponse.access_token) {
                    setAccessToken(tokenResponse.access_token);
                    setIsSignedIn(true);

                    // Fetch user info
                    const profile = await getUserProfile();
                    if (profile) {
                        setCurrentUser({
                            name: profile.name,
                            email: profile.email,
                            avatar: profile.picture
                        });
                    }
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
        setCurrentFolderId('root');
        setFolderPath([{ id: 'root', name: 'My Drive' }]);
    }, []);

    const refreshFiles = useCallback(async (folderId: string = currentFolderId) => {
        if (!isSignedIn) return;
        setLoading(true);
        try {
            const driveFiles = await listFiles(folderId);
            setFiles(driveFiles || []);
        } catch (err: any) {
            setError(err.message || 'Failed to list files');
        } finally {
            setLoading(false);
        }
    }, [isSignedIn, currentFolderId]);

    const navigateToFolder = useCallback((folderId: string, folderName: string) => {
        setCurrentFolderId(folderId);
        setFolderPath(prev => [...prev, { id: folderId, name: folderName }]);
        refreshFiles(folderId);
    }, [refreshFiles]);

    const navigateUp = useCallback(() => {
        if (folderPath.length <= 1) return;
        const newPath = [...folderPath];
        newPath.pop(); // Remove current
        const parent = newPath[newPath.length - 1];
        setFolderPath(newPath);
        setCurrentFolderId(parent.id);
        refreshFiles(parent.id);
    }, [folderPath, refreshFiles]);

    // Initial load
    useEffect(() => {
        if (isSignedIn) refreshFiles(currentFolderId);
    }, [isSignedIn]); // Changed dependency to just isSignedIn to avoid loops, or careful with currentFolderId

    return {
        isInitialized,
        isSignedIn,
        currentUser,
        files,
        loading,
        error,
        currentFolderId,
        folderPath,
        login,
        logout,
        refreshFiles,
        navigateToFolder,
        navigateUp,
        getFile: getFileContent,
        saveFile,
        createFile: (name: string, content: string, parentId?: string) => createFile(name, content, parentId || currentFolderId),
        renameFile,
        openPicker: (onSelect: (file: any) => void) => {
            if (accessToken) {
                createPicker(accessToken, onSelect);
            } else {
                console.error("No access token available for picker");
            }
        },
        openFolderPicker: (onSelect: (folder: any) => void) => {
            if (accessToken) {
                createFolderPicker(accessToken, onSelect);
            } else {
                console.error("No access token available for folder picker");
            }
        }
    };
}
