import type { OzonRepository } from '~/repository/OzonRepository/OzonRepository';
import type { AuthRepository } from '~/repository/AuthRepository/AuthRepository';

export type Repositories = {
  [RepositoryName.Ozon]: OzonRepository;
  [RepositoryName.Auth]: AuthRepository;
};

export enum RepositoryName {
  Ozon = 'ozon',
  Auth = 'auth',
}
