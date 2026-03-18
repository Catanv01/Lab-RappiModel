import { AuthenticateUserDTO, CreateUserDTO } from './auth.types';
import Boom from '@hapi/boom';
import { supabase } from '../../config/supabase';
import {
  AuthResponse,
  AuthTokenResponsePassword,
} from '@supabase/supabase-js';
import { pool } from '../../config/database';
import { UserRole } from './auth.types';

export const authenticateUserService = async (
  credentials: AuthenticateUserDTO
): Promise<AuthTokenResponsePassword['data']> => {
  const signInResponse = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (signInResponse.error) {
    throw Boom.unauthorized(signInResponse.error.message);
  }

  return signInResponse.data;
};

export const createUserService = async (
  user: CreateUserDTO
): Promise<AuthResponse['data']> => {
  const signUpResponse = await supabase.auth.signUp({
    email: user.email,
    password: user.password,
    options: {
      data: {
        name: user.name,
        storeName: user.storeName,
        role: user.role,
      },
    },
  });

  if (signUpResponse.error) {
    throw Boom.badRequest(signUpResponse.error.message);
  }

  if (user.role === UserRole.STORE && user.storeName) {
    const userId = signUpResponse.data.user?.id;
    if (userId) {
      await pool.query(
        'INSERT INTO stores (name, "userId") VALUES ($1, $2)',
        [user.storeName, userId]
      );
    }
  }

  return signUpResponse.data;
};

export const getMeService = async (userId: string) => {
  const dbRequest = await pool.query(
    'SELECT id, name, role FROM users WHERE id = $1',
    [userId]
  );

  if (dbRequest.rowCount === 0) {
    throw Boom.notFound('User not found');
  }

  return dbRequest.rows[0];
};