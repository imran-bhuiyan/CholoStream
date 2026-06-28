import { getTeamFlag } from './LiveScores';

describe('getTeamFlag', () => {
  it('should return the correct flag URL for standard countries', () => {
    expect(getTeamFlag('Argentina')).toBe('https://flagsapi.com/AR/flat/64.png');
    expect(getTeamFlag('Brazil')).toBe('https://flagsapi.com/BR/flat/64.png');
    expect(getTeamFlag('France')).toBe('https://flagsapi.com/FR/flat/64.png');
    expect(getTeamFlag('Japan')).toBe('https://flagsapi.com/JP/flat/64.png');
  });

  it('should return the correct flag URL for countries with multiple spellings/aliases', () => {
    expect(getTeamFlag('DR Congo')).toBe('https://flagsapi.com/CD/flat/64.png');
    expect(getTeamFlag('Congo DR')).toBe('https://flagsapi.com/CD/flat/64.png');
    expect(getTeamFlag("Côte d'Ivoire")).toBe('https://flagsapi.com/CI/flat/64.png');
    expect(getTeamFlag("Cote d'Ivoire")).toBe('https://flagsapi.com/CI/flat/64.png');
    expect(getTeamFlag('Curaçao')).toBe('https://flagsapi.com/CW/flat/64.png');
    expect(getTeamFlag('Curacao')).toBe('https://flagsapi.com/CW/flat/64.png');
  });

  it('should return the correct flag URL for countries with sub-regions', () => {
    expect(getTeamFlag('England')).toBe('https://flagsapi.com/GB-ENG/flat/64.png');
    expect(getTeamFlag('Scotland')).toBe('https://flagsapi.com/GB-SCT/flat/64.png');
  });

  it('should return the default UN flag URL for unknown countries', () => {
    expect(getTeamFlag('Unknown Country')).toBe('https://flagsapi.com/UN/flat/64.png');
    expect(getTeamFlag('')).toBe('https://flagsapi.com/UN/flat/64.png');
    expect(getTeamFlag('NonExistent')).toBe('https://flagsapi.com/UN/flat/64.png');
  });
});
