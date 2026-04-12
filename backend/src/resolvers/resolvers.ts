import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GraphQLScalarType, GraphQLError, Kind } from 'graphql';
import User from '../models/User';
import Employee from '../models/Employee';

const JWT_SECRET = process.env.JWT_SECRET || 'ebaldin';

interface Context {
  userId?: string;
}

const DateScalar = new GraphQLScalarType({
  name: 'Date',
  serialize: (v) => (v instanceof Date ? v.toISOString() : v),
  parseValue: (v) => new Date(v as string),
  parseLiteral: (ast) => (ast.kind === Kind.STRING ? new Date(ast.value) : null),
});

export const resolvers = {
  Date: DateScalar,

  Query: {
    getEmployees: () => Employee.find().exec(),

    getEmployee: (_: unknown, { id }: { id: string }) => Employee.findById(id).exec(),

    searchEmployees: (_: unknown, args: { department?: string; designation?: string }) => {
      const query: Record<string, string> = {};
      if (args.department) query.department = args.department;
      if (args.designation) query.designation = args.designation;
      return Employee.find(query).exec();
    },
  },

  Mutation: {
    signUp: async (_: unknown, { username, email, password }: { username: string; email: string; password: string }) => {
      if (await User.findOne({ $or: [{ email }, { username }] })) {
        throw new GraphQLError('User with the same email or username already exists', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
      return User.create({ username, email, password: await bcrypt.hash(password, 10) });
    },

    login: async (_: unknown, { email, password }: { email: string; password: string }) => {
      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password as string))) {
        throw new GraphQLError('Invalid email or password', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      return { token, user };
    },

    addEmployee: (_: unknown, args: Record<string, unknown>, { userId }: Context) => {
      if (!userId) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return Employee.create(args);
    },

    updateEmployee: async (_: unknown, { id, ...fields }: Record<string, unknown>, { userId }: Context) => {
      if (!userId) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      const updated = await Employee.findByIdAndUpdate(id, { ...fields, updated_at: new Date() }, { new: true }).exec();
      if (!updated) throw new GraphQLError('Employee not found', { extensions: { code: 'NOT_FOUND' } });
      return updated;
    },

    deleteEmployee: async (_: unknown, { id }: { id: string }, { userId }: Context) => {
      if (!userId) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      const deleted = await Employee.findByIdAndDelete(id).exec();
      if (!deleted) throw new GraphQLError('Employee not found', { extensions: { code: 'NOT_FOUND' } });
      return true;
    },
  },
};
