import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schemas/schema';
import { resolvers } from './resolvers/resolvers';

dotenv.config();

const PORT = Number(process.env.PORT) || 8000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/assignment2';
const JWT_SECRET = process.env.JWT_SECRET || 'ebaldin';

interface Context {
  userId?: string;
}

async function start() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const server = new ApolloServer<Context>({ typeDefs, resolvers });

  const { url } = await startStandaloneServer(server, {
    listen: { port: PORT },
    context: async ({ req }) => {
      const token = (req.headers.authorization || '').replace('Bearer ', '');
      if (!token) return {};
      try {
        const { userId } = jwt.verify(token, JWT_SECRET) as { userId: string };
        return { userId };
      } catch {
        return {};
      }
    },
  });

  console.log(`GraphQL ready at ${url}`);
}

start().catch(console.error);
