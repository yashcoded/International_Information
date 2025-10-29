// Client-side request tracking using localStorage
export const REQUEST_LIMIT = 5;
const STORAGE_KEY = 'visa_info_requests';
const RESET_PERIOD_DAYS = 30;

interface RequestData {
  count: number;
  resetDate: string; // ISO date string
}

export function getRequestData(): RequestData {
  if (typeof window === 'undefined') {
    return { count: 0, resetDate: new Date().toISOString() };
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  
  if (!stored) {
    const initialData: RequestData = {
      count: 0,
      resetDate: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  }

  try {
    const data: RequestData = JSON.parse(stored);
    
    // Check if we need to reset (30 days passed)
    const resetDate = new Date(data.resetDate);
    const now = new Date();
    const daysPassed = (now.getTime() - resetDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysPassed >= RESET_PERIOD_DAYS) {
      const resetData: RequestData = {
        count: 0,
        resetDate: now.toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resetData));
      return resetData;
    }
    
    return data;
  } catch (error) {
    console.error('Error parsing request data:', error);
    const initialData: RequestData = {
      count: 0,
      resetDate: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  }
}

export function incrementRequestCount(): RequestData {
  const data = getRequestData();
  data.count += 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

export function getRemainingRequests(): number {
  const data = getRequestData();
  return Math.max(0, REQUEST_LIMIT - data.count);
}

export function hasReachedLimit(): boolean {
  const data = getRequestData();
  return data.count >= REQUEST_LIMIT;
}

export function getResetDate(): Date {
  const data = getRequestData();
  const resetDate = new Date(data.resetDate);
  resetDate.setDate(resetDate.getDate() + RESET_PERIOD_DAYS);
  return resetDate;
}

export function formatResetDate(): string {
  const resetDate = getResetDate();
  return resetDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

