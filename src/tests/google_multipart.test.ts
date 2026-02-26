import { describe, it, expect } from 'bun:test';
import { constructMultipartBody } from '../services/google';

describe('Multipart Body Construction', () => {
    it('should construct a valid multipart body with random boundary', () => {
        const name = 'test.md';
        const content = 'Hello World';
        const parentId = 'root';
        const { body, boundary } = constructMultipartBody(name, content, parentId);

        expect(body).toContain(boundary);
        expect(body).toContain('Content-Type: application/json');
        expect(body).toContain('Content-Type: text/markdown');
        expect(body).toContain(content);

        // Check boundary format: ------- followed by 48 hex chars (24 bytes)
        expect(boundary).toMatch(/^-------[0-9a-f]{48}$/);
    });

    it('should not use the static boundary anymore', () => {
        const staticBoundary = '-------314159265358979323846';
        const content = `Safe content`;
        const name = 'test.md';
        const parentId = 'root';

        const { boundary } = constructMultipartBody(name, content, parentId);
        expect(boundary).not.toBe(staticBoundary);
    });

    it('should use the boundary consistently in the multipart body', () => {
        const content = 'Some deterministic content';
        const name = 'test.md';
        const parentId = 'root';

        const { body, boundary } = constructMultipartBody(name, content, parentId);

        const parts = body.split(boundary);
        // Expect at least a starting part, a metadata/content part, and an ending part
        expect(parts.length).toBeGreaterThan(2);
    });
});
