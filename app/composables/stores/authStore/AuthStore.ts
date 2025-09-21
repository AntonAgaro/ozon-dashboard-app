import type { AuthStore } from '~/composables/stores/authStore/types';

export function useAuthStore() {
  const store = useState<AuthStore>('auth-store', () => ({
    isLogged: false,
  }));

  function get<K extends keyof AuthStore>(key: K) {
    return store.value[key];
  }

  function set<K extends keyof AuthStore>(key: K, value: AuthStore[K]) {
    store.value[key] = value;
  }

  return { get, set };
}
