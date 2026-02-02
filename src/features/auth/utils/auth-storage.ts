let accessToken: string | null = null;
let username: string | null = null;

export const authStorage = {
  getToken: () => accessToken,
  getUsername: () => username,
  setToken: (token: string | null) => {
    accessToken = token;
  },
  setSession: (token: string, nextUsername: string) => {
    accessToken = token;
    username = nextUsername;
  },
  clearSession: () => {
    accessToken = null;
    username = null;
  },
};
