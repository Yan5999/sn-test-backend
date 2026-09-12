declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      email: string;
      isEmailVerified: boolean;
    }
  }
}

export {};
