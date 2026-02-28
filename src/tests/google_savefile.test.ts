import { describe, it, expect, mock, beforeEach, afterEach } from 'bun:test';
import { saveFile } from '../services/google';

describe('saveFile', () => {
    let originalGapi: any;
    let originalFetch: any;

    beforeEach(() => {
        // Save originals
        originalGapi = (global as any).gapi;
        originalFetch = global.fetch;

        // Mock gapi
        (global as any).gapi = {
            client: {
                getToken: mock(() => ({ access_token: 'test-access-token' }))
            }
        };

        // Mock fetch
        global.fetch = mock(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ id: 'test-file-id', status: 'success' })
        })) as any;
    });

    afterEach(() => {
        // Restore originals
        (global as any).gapi = originalGapi;
        global.fetch = originalFetch;
    });

    it('should call fetch with the correct URL and method', async () => {
        const fileId = 'file123';
        const content = 'Test content';

        await saveFile(fileId, content);

        expect(global.fetch).toHaveBeenCalledTimes(1);
        const [url, options] = (global.fetch as ReturnType<typeof mock>).mock.calls[0];

        expect(url).toBe(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`);
        expect(options.method).toBe('PATCH');
    });

    it('should include the correct headers', async () => {
        const fileId = 'file123';
        const content = 'Test content';

        await saveFile(fileId, content);

        const [, options] = (global.fetch as ReturnType<typeof mock>).mock.calls[0];

        expect(options.headers).toEqual({
            'Authorization': 'Bearer test-access-token',
            'Content-Type': 'text/plain'
        });
    });

    it('should send the raw string content as the body', async () => {
        const fileId = 'file123';
        const content = '# Hello\nThis is a test document.';

        await saveFile(fileId, content);

        const [, options] = (global.fetch as ReturnType<typeof mock>).mock.calls[0];

        expect(options.body).toBe(content);
    });

    it('should throw an error if no access token is available', async () => {
        (global as any).gapi.client.getToken.mockReturnValue(null);

        try {
            await saveFile('file123', 'content');
            expect(true).toBe(false); // Should not reach here
        } catch (e: any) {
            expect(e.message).toBe('No access token available');
        }
    });

    it('should throw an error if the response is not ok', async () => {
        global.fetch = mock(() => Promise.resolve({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error'
        })) as any;

        try {
            await saveFile('file123', 'content');
            expect(true).toBe(false); // Should not reach here
        } catch (e: any) {
            expect(e.message).toBe('Failed to save file: 500 Internal Server Error');
        }
    });
});
