import { getTeamFlag } from './LiveScores';

describe('getTeamFlag', () => {
  it('should return the correct flag URL for standard countries', () => {
    expect(getTeamFlag('Argentina')).toBe('https://flagcdn.com/w80/ar.png');
    expect(getTeamFlag('Brazil')).toBe('https://flagcdn.com/w80/br.png');
    expect(getTeamFlag('France')).toBe('https://flagcdn.com/w80/fr.png');
    expect(getTeamFlag('Japan')).toBe('https://flagcdn.com/w80/jp.png');
  });

  it('should return the correct flag URL for countries with multiple spellings/aliases', () => {
    expect(getTeamFlag('DR Congo')).toBe('https://flagcdn.com/w80/cd.png');
    expect(getTeamFlag('Congo DR')).toBe('https://flagcdn.com/w80/cd.png');
    expect(getTeamFlag("Côte d'Ivoire")).toBe('https://flagcdn.com/w80/ci.png');
    expect(getTeamFlag("Cote d'Ivoire")).toBe('https://flagcdn.com/w80/ci.png');
    expect(getTeamFlag('Curaçao')).toBe('https://flagcdn.com/w80/cw.png');
    expect(getTeamFlag('Curacao')).toBe('https://flagcdn.com/w80/cw.png');
  });

  it('should return the correct flag URL for countries with sub-regions', () => {
    expect(getTeamFlag('England')).toBe('https://flagcdn.com/w80/gb-eng.png');
    expect(getTeamFlag('Scotland')).toBe('https://flagcdn.com/w80/gb-sct.png');
  });

  it('should return the default UN flag URL for unknown countries', () => {
    expect(getTeamFlag('Unknown Country')).toBe('https://flagcdn.com/w80/un.png');
    expect(getTeamFlag('')).toBe('https://flagcdn.com/w80/un.png');
    expect(getTeamFlag('NonExistent')).toBe('https://flagcdn.com/w80/un.png');
  });
});
