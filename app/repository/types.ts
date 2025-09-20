import type { OzonRepository } from '~/repository/OzonRepository/OzonRepository';

export type Repositories = {
  [RepositoryName.Ozon]: OzonRepository;
};

export enum RepositoryName {
  Ozon = 'ozon',
}

export type ApiResponse = {
  status: string;
  message?: string;
};
