import { describe, it, expect, test } from 'vitest';

// Simple test to verify vitest is working
test('basic math works', () => {
    expect(1 + 1).toBe(2);
});

describe('basic tests', () => {
    it('should pass', () => {
        expect(true).toBe(true);
    });
});
