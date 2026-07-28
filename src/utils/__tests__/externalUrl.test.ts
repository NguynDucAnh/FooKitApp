import {
  ExternalUrlOpener,
  getHttpsUrl,
  openExternalHttpsUrl,
} from '../externalUrl';

describe('external URL security', () => {
  test.each([
    ['http://pay.example.test/checkout'],
    ['javascript:alert(1)'],
    ['fookitapp://payment/result'],
    ['//pay.example.test/checkout'],
    ['not a url'],
    ['https://user:password@pay.example.test/checkout'],
    [''],
    [null],
  ])('rejects an unsafe commerce URL: %p', (value) => {
    expect(getHttpsUrl(value)).toBeNull();
  });

  it('accepts HTTPS without rewriting path or query parameters', () => {
    const url = '  https://pay.example.test/checkout?order=123&source=mobile  ';

    expect(getHttpsUrl(url)).toBe(
      'https://pay.example.test/checkout?order=123&source=mobile',
    );
  });

  it('checks device support before opening an affiliate URL', async () => {
    const opener: jest.Mocked<ExternalUrlOpener> = {
      canOpenURL: jest.fn().mockResolvedValue(true),
      openURL: jest.fn().mockResolvedValue(undefined),
    };
    const url = 'https://shop.example.test/product/1';

    await expect(openExternalHttpsUrl(url, opener)).resolves.toBe(url);
    expect(opener.canOpenURL).toHaveBeenCalledWith(url);
    expect(opener.openURL).toHaveBeenCalledWith(url);
  });

  it('does not open a URL unsupported by the device', async () => {
    const opener: jest.Mocked<ExternalUrlOpener> = {
      canOpenURL: jest.fn().mockResolvedValue(false),
      openURL: jest.fn(),
    };

    await expect(
      openExternalHttpsUrl('https://shop.example.test/product/1', opener),
    ).rejects.toThrow('Thiết bị không hỗ trợ mở liên kết này.');
    expect(opener.openURL).not.toHaveBeenCalled();
  });

  it('does not ask the device to open an insecure URL', async () => {
    const opener: jest.Mocked<ExternalUrlOpener> = {
      canOpenURL: jest.fn(),
      openURL: jest.fn(),
    };

    await expect(
      openExternalHttpsUrl('http://shop.example.test/product/1', opener),
    ).rejects.toThrow('Liên kết không hợp lệ');
    expect(opener.canOpenURL).not.toHaveBeenCalled();
    expect(opener.openURL).not.toHaveBeenCalled();
  });
});
