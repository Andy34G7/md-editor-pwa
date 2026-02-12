const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || ''; // Optional but good for some calls
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

export interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    modifiedTime?: string;
}

export const loadGoogleScripts = (onGapiLoaded: () => void, onGisLoaded: () => void) => {
    const script1 = document.createElement('script');
    script1.src = 'https://apis.google.com/js/api.js';
    script1.async = true;
    script1.defer = true;
    script1.onload = () => onGapiLoaded();
    document.body.appendChild(script1);

    const script2 = document.createElement('script');
    script2.src = 'https://accounts.google.com/gsi/client';
    script2.async = true;
    script2.defer = true;
    script2.onload = () => onGisLoaded();
    document.body.appendChild(script2);
};

export const initializeGapiClient = async () => {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: DISCOVERY_DOCS,
    });
    gapiInited = true;
};

export const initializeGisClient = (callback: (response: any) => void) => {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse: any) => {
            callback(tokenResponse);
        },
    });
    gisInited = true;
    return tokenClient;
};

export const handleAuthClick = () => {
    if (tokenClient) {
        if (gapi.client.getToken() === null) {
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            tokenClient.requestAccessToken({ prompt: '' });
        }
    }
};

export const handleSignOut = () => {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token, () => {
            gapi.client.setToken(null);
        });
    }
};

export const getUserProfile = async () => {
    try {
        const response = await gapi.client.request({
            'path': 'https://www.googleapis.com/oauth2/v3/userinfo',
            'method': 'GET'
        });
        return response.result;
    } catch (err) {
        console.error('Error fetching user profile', err);
        return null;
    }
};

export const listFiles = async (parentId: string = 'root') => {
    if (!gapiInited) return;
    try {
        const response = await gapi.client.drive.files.list({
            'pageSize': 100,
            'fields': 'files(id, name, mimeType, modifiedTime)',
            'q': `'${parentId}' in parents and (mimeType = 'text/markdown' or name contains '.md' or mimeType = 'application/vnd.google-apps.folder') and trashed = false`,
            'orderBy': 'folder, name'
        });
        return response.result.files;
    } catch (err) {
        console.error('Error listing files', err);
        throw err;
    }
};

export const getFileContent = async (fileId: string) => {
    try {
        const response = await gapi.client.drive.files.get({
            fileId: fileId,
            alt: 'media',
        });
        return response.body;
    } catch (err) {
        console.error('Error getting file', err);
        throw err;
    }
};

export const saveFile = async (fileId: string, content: string) => {
    try {
        const response = await gapi.client.request({
            path: `/upload/drive/v3/files/${fileId}`,
            method: 'PATCH',
            params: { uploadType: 'media' },
            body: content,
        });
        return response;
    } catch (err) {
        console.error('Error saving file', err);
        throw err;
    }
};

export const createFile = async (name: string, content: string, parentId: string = 'root') => {
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const contentType = 'text/markdown';
    const metadata = {
        'name': name,
        'mimeType': contentType,
        'parents': [parentId]
    };

    const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + contentType + '\r\n\r\n' +
        content +
        close_delim;

    try {
        const response = await gapi.client.request({
            'path': '/upload/drive/v3/files',
            'method': 'POST',
            'params': { 'uploadType': 'multipart' },
            'headers': {
                'Content-Type': 'multipart/related; boundary="' + boundary + '"'
            },
            'body': multipartRequestBody
        });
        return response.result;
    } catch (err) {
        console.error('Error creating file', err);
        throw err;
    }
};

export const renameFile = async (fileId: string, newName: string) => {
    try {
        const response = await gapi.client.drive.files.update({
            fileId: fileId,
            resource: {
                name: newName
            }
        });
        return response.result;
    } catch (err) {
        console.error('Error renaming file', err);
        throw err;
    }
};
