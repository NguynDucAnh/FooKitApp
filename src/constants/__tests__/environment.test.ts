import { resolvePublicConfig } from '../index';

describe('public mobile environment configuration', () => {
  it('uses production-safe defaults when public overrides are absent', () => {
    const config = resolvePublicConfig({});

    expect(config.apiUrl).toBe(
      'https://fookit-be-gpfhhchcceeyhah3.southeastasia-01.azurewebsites.net'
    );
    expect(config.googleWebClientId).toContain('.apps.googleusercontent.com');
    expect(config.googleRedirectUri).toBe('https://auth.expo.io/@thuy1412/fookitapp');
  });

  it('normalizes public URL overrides without changing their paths', () => {
    const config = resolvePublicConfig({
      apiUrl: ' https://api.example.test/ ',
      googleWebClientId: ' client-id ',
      googleRedirectUri: ' https://auth.example.test/mobile/ ',
    });

    expect(config.apiUrl).toBe('https://api.example.test');
    expect(config.googleWebClientId).toBe('client-id');
    expect(config.googleRedirectUri).toBe('https://auth.example.test/mobile');
  });
});
