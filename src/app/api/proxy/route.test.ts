import { NextRequest } from 'next/server';
import { GET, OPTIONS } from './route';

describe('Proxy API - CORS checks', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('allows safe origin cholostream.vercel.app', async () => {
    const req = new NextRequest('http://localhost:3000/api/proxy', {
      headers: new Headers({
        origin: 'https://cholostream.vercel.app'
      })
    });
    const res = await OPTIONS(req);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://cholostream.vercel.app');
  });

  it('allows safe origin dynamically from environment VERCEL_URL', async () => {
    process.env.VERCEL_URL = 'dynamic-project-id.vercel.app';
    const req = new NextRequest('http://localhost:3000/api/proxy', {
      headers: new Headers({
        origin: 'https://dynamic-project-id.vercel.app'
      })
    });
    const res = await OPTIONS(req);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://dynamic-project-id.vercel.app');
  });

  it('allows safe origin from subdomains of cholostream.vercel.app', async () => {
    const req = new NextRequest('http://localhost:3000/api/proxy', {
      headers: new Headers({
        origin: 'https://pr-123.cholostream.vercel.app'
      })
    });
    const res = await OPTIONS(req);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://pr-123.cholostream.vercel.app');
  });

  it('denies malicious vercel subdomains', async () => {
    const req = new NextRequest('http://localhost:3000/api/proxy', {
      headers: new Headers({
        origin: 'https://attacker.vercel.app'
      })
    });
    const res = await OPTIONS(req);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('denies malicious spoofed domains', async () => {
    const req = new NextRequest('http://localhost:3000/api/proxy', {
      headers: new Headers({
        origin: 'https://attackercholostream.vercel.app'
      })
    });
    const res = await OPTIONS(req);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('allows localhost', async () => {
    const req = new NextRequest('http://localhost:3000/api/proxy', {
      headers: new Headers({
        origin: 'http://localhost:3000'
      })
    });
    const res = await OPTIONS(req);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
  });
});
