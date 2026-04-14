// Mock switch - set VITE_USE_MOCK=true in .env to use mock data
// Set VITE_USE_MOCK=false or omit to use real API
export const useMock = import.meta.env.VITE_USE_MOCK === 'true'
