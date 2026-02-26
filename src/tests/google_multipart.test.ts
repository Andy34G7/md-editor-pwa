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

    it('should ensure boundary does not collide with content', () => {
        // We verify that the generated boundary is not present in the original content.
        const content = 'Some content that might have a collision if we were unlucky';
        const name = 'test.md';
        const parentId = 'root';

        const { boundary } = constructMultipartBody(name, content, parentId);

        expect(content.includes(boundary)).toBe(false);
    });
});
