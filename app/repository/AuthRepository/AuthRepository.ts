import { RepositoryFactory } from '~/repository/RepositoryFactory';
import type { ApiResponse } from '#shared/types';

export class AuthRepository extends RepositoryFactory {
  async login(credentials: { login: string; password: string }) {
    return this.call<ApiResponse>('/api/login', {
      method: 'POST',
      body: credentials,
    });
  }
}
