const BASE_PATH = '/student';

export const apiFetch = async (path: string, options?: RequestInit) => {
  const url = `${BASE_PATH}${path}`;
  return fetch(url, options);
};
