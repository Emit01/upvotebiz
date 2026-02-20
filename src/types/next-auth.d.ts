import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      uid: number;
      email: string;
      name: string;
      firstName: string;
      lastName: string;
      timezone: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid: number;
    firstName: string;
    lastName: string;
    timezone: string;
  }
}
