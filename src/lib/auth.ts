import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/cold-text";

const client = new MongoClient(MONGODB_URI);
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client
  }),
  trustedOrigins: [
    "http://localhost:3000",
    "https://pitchpad.vercel.app",
  ],
  emailAndPassword: {
    enabled: true,
    async sendResetPassword(data, request) {
      // TODO: Send an email to the user with a link to reset their password
      console.log("Reset password email would be sent to:", data.user.email);
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});
