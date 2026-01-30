import { describe, it, expect } from 'vitest';
import { getCampusColor, getCampusColorBg, formatServiceTime } from '../lib/utils';

describe('getCampusColor', () => {
    it('returns correct color for Centro campus', () => {
        expect(getCampusColor('INA Centro')).toBe('text-pop-yellow');
        expect(getCampusColor('centro')).toBe('text-pop-yellow');
    });

    it('returns correct color for Cambé campus', () => {
        expect(getCampusColor('INA Cambé')).toBe('text-cta');
        expect(getCampusColor('cambe')).toBe('text-cta');
    });

    it('returns correct color for Ibiporã campus', () => {
        expect(getCampusColor('INA Ibiporã')).toBe('text-pop-pink');
        expect(getCampusColor('ibipora')).toBe('text-pop-pink');
    });

    it('returns correct color for Zona Sul campus', () => {
        expect(getCampusColor('INA Zona Sul')).toBe('text-pop-purple');
    });

    it('returns default color for unknown campus', () => {
        expect(getCampusColor('Unknown Campus')).toBe('text-primary');
    });
});

describe('getCampusColorBg', () => {
    it('returns correct background color for each campus', () => {
        expect(getCampusColorBg('Centro')).toBe('bg-pop-yellow');
        expect(getCampusColorBg('Cambé')).toBe('bg-cta');
        expect(getCampusColorBg('Ibiporã')).toBe('bg-pop-pink');
        expect(getCampusColorBg('Zona Sul')).toBe('bg-pop-purple');
    });

    it('returns default background for unknown campus', () => {
        expect(getCampusColorBg('Unknown')).toBe('bg-primary');
    });
});

describe('formatServiceTime', () => {
    it('returns MANHÃ for morning times (before 12:00)', () => {
        expect(formatServiceTime('09:00')).toBe('CULTO MANHÃ');
        expect(formatServiceTime('10:30')).toBe('CULTO MANHÃ');
        expect(formatServiceTime('11:59')).toBe('CULTO MANHÃ');
    });

    it('returns NOITE for times from 12:00 onwards', () => {
        expect(formatServiceTime('12:00')).toBe('CULTO NOITE');
        expect(formatServiceTime('18:00')).toBe('CULTO NOITE');
        expect(formatServiceTime('19:30')).toBe('CULTO NOITE');
        expect(formatServiceTime('20:00')).toBe('CULTO NOITE');
    });
});
