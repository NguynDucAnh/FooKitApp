import axiosClient from '../axiosClient';
import { paymentService } from '../paymentService';

jest.mock('../axiosClient');

const mockedAxiosClient = axiosClient as jest.Mocked<typeof axiosClient>;

describe('paymentService checkout URL normalization', () => {
  it('keeps a valid HTTPS checkout URL', async () => {
    mockedAxiosClient.post.mockResolvedValueOnce({
      data: {
        checkoutUrl: 'https://pay.example.test/checkout?order=123',
      },
    });

    const result = await paymentService.createPayment({ planId: 'plan-1' });

    expect(result.checkoutUrl).toBe('https://pay.example.test/checkout?order=123');
    expect(result.paymentUrl).toBe(result.checkoutUrl);
  });

  it.each([
    'http://pay.example.test/checkout',
    'javascript:alert(1)',
    'fookitapp://payment/result',
    'not a url',
  ])('drops an unsafe checkout URL returned by the API: %s', async (checkoutUrl) => {
    mockedAxiosClient.post.mockResolvedValueOnce({
      data: { checkoutUrl },
    });

    const result = await paymentService.createPayment({ planId: 'plan-1' });

    expect(result.checkoutUrl).toBeUndefined();
    expect(result.paymentUrl).toBeUndefined();
  });
});
