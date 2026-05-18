export const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

export const generateId = (): string =>
  Math.random().toString(36).substring(2) + Date.now().toString(36);

export const groupBy = <T>(arr: T[], key: keyof T): Record<string, T[]> => {
  return arr.reduce((result, item) => {
    const groupKey = String(item[key]);
    return {...result, [groupKey]: [...(result[groupKey] || []), item]};
  }, {} as Record<string, T[]>);
};

export const debounce = <T extends (...args: any[]) => any>(fn: T, delay: number) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const chunk = <T>(arr: T[], size: number): T[][] => {
  return Array.from({length: Math.ceil(arr.length / size)}, (_, i) =>
    arr.slice(i * size, i * size + size),
  );
};
