import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.general_users.findFirst({
          where: { email: credentials.email },
          select: {
            id: true,
            ids: true,
            email: true,
            password: true,
            first_name: true,
            last_name: true,
            timezone: true,
            status: true,
          },
        });

        if (!user || !user.password) {
          throw new Error(
            "Email address and password that you entered doesn't match any account"
          );
        }

        if (user.status !== 1) {
          throw new Error("Your account has not been activated");
        }

        const crypto = await import("crypto");
        const md5Hash = crypto
          .createHash("md5")
          .update(credentials.password)
          .digest("hex");

        let isValidPassword = false;

        if (user.password === md5Hash) {
          isValidPassword = true;
          const newHash = await bcrypt.hash(credentials.password, 10);
          await prisma.general_users.update({
            where: { id: user.id },
            data: { password: newHash },
          });
        } else if (
          user.password.startsWith("$2") ||
          user.password.startsWith("$P$")
        ) {
          isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password
          );
        }

        if (!isValidPassword) {
          throw new Error(
            "Email address and password that you entered doesn't match any account"
          );
        }

        await prisma.general_users.update({
          where: { id: user.id },
          data: {
            history_ip: "server",
            reset_key: crypto.randomBytes(16).toString("hex"),
          },
        });

        return {
          id: String(user.id),
          email: user.email,
          name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
          firstName: user.first_name,
          lastName: user.last_name,
          timezone: user.timezone,
        };
      },
    }),

    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const staff = await prisma.general_staffs.findFirst({
          where: { email: credentials.email },
          select: {
            id: true,
            ids: true,
            email: true,
            password: true,
            first_name: true,
            last_name: true,
            timezone: true,
            status: true,
          },
        });

        if (!staff || !staff.password) {
          throw new Error(
            "Email address and password that you entered doesn't match any account"
          );
        }

        if (staff.status !== 1) {
          throw new Error("Your account has not been activated!");
        }

        const crypto = await import("crypto");
        const md5Hash = crypto
          .createHash("md5")
          .update(credentials.password)
          .digest("hex");

        let isValidPassword = false;

        if (staff.password === md5Hash) {
          isValidPassword = true;
          const newHash = await bcrypt.hash(credentials.password, 10);
          await prisma.general_staffs.update({
            where: { id: staff.id },
            data: { password: newHash },
          });
        } else if (
          staff.password.startsWith("$2") ||
          staff.password.startsWith("$P$")
        ) {
          isValidPassword = await bcrypt.compare(
            credentials.password,
            staff.password
          );
        }

        if (!isValidPassword) {
          throw new Error(
            "Email address and password that you entered doesn't match any account"
          );
        }

        const newIds = crypto.randomBytes(16).toString("hex");
        await prisma.general_staffs.update({
          where: { id: staff.id },
          data: {
            reset_key: newIds,
            history_ip: "server",
            ids: newIds,
          },
        });

        return {
          id: String(staff.id),
          email: staff.email,
          name: `${staff.first_name || ""} ${staff.last_name || ""}`.trim(),
          firstName: staff.first_name,
          lastName: staff.last_name,
          timezone: staff.timezone,
          isAdmin: true,
          staffId: staff.id,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as any;
        if (u.isAdmin) {
          token.staffId = u.staffId;
          token.isAdmin = true;
        } else {
          token.uid = parseInt(user.id);
        }
        token.firstName = u.firstName;
        token.lastName = u.lastName;
        token.timezone = u.timezone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.isAdmin) {
          (session.user as any).staffId = token.staffId;
          (session.user as any).isAdmin = true;
        } else {
          (session.user as any).uid = token.uid;
        }
        (session.user as any).firstName = token.firstName;
        (session.user as any).lastName = token.lastName;
        (session.user as any).timezone = token.timezone;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
