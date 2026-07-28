import axiosClient from '../axiosClient';
import { homepageService } from '../homepageService';

jest.mock('../axiosClient');

const mockedAxiosClient = axiosClient as jest.Mocked<typeof axiosClient>;
type Meal = 'breakfast' | 'lunch' | 'dinner';

function mockMealRequests(failedMeals: Meal[] = []) {
  mockedAxiosClient.get.mockImplementation(async (url) => {
    const meal = String(url).split('/').pop() as Meal;
    if (failedMeals.includes(meal)) {
      throw new Error(`${meal} failed`);
    }

    return {
      data: {
        isPremiumExpired: meal === 'dinner',
        dishes: [{ id: `${meal}-dish`, name: `${meal} dish` }],
      },
    };
  });
}

describe('homepageService partial failure orchestration', () => {
  test.each<Meal>(['breakfast', 'lunch', 'dinner'])(
    '%s failure preserves the other successful meals',
    async (failedMeal) => {
      mockMealRequests([failedMeal]);

      const result = await homepageService.getSuggestions();

      expect(result.failedMeals).toEqual([failedMeal]);
      for (const meal of ['breakfast', 'lunch', 'dinner'] as Meal[]) {
        if (meal === failedMeal) {
          expect(result[meal]).toEqual([]);
        } else {
          expect(result[meal]).toEqual([
            { id: `${meal}-dish`, name: `${meal} dish` },
          ]);
        }
      }
    }
  );

  test('returns all meal sections when every request succeeds', async () => {
    mockMealRequests();

    const result = await homepageService.getSuggestions();

    expect(result.failedMeals).toEqual([]);
    expect(result.breakfast).toHaveLength(1);
    expect(result.lunch).toHaveLength(1);
    expect(result.dinner).toHaveLength(1);
    expect(result.isPremiumExpired).toBe(true);
  });

  test('exposes every failed section when all requests fail', async () => {
    mockMealRequests(['breakfast', 'lunch', 'dinner']);

    const result = await homepageService.getSuggestions();

    expect(result).toMatchObject({
      breakfast: [],
      lunch: [],
      dinner: [],
      failedMeals: ['breakfast', 'lunch', 'dinner'],
      isPremiumExpired: false,
    });
  });
});
