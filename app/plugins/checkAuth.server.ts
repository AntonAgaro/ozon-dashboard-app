import jwt from 'jsonwebtoken';
import { useAuthStore } from '~/composables/stores/authStore/AuthStore';
export default defineNuxtPlugin({
  name: 'checkAuth',
  parallel: true,
  setup() {
    const authCookie = useCookie('pewpewpew');

    if (!authCookie?.value) {
      return;
    }

    const jwtSecret = process.env.JWT_SECRET ?? '';
    const login = process.env.LOGIN;

    try {
      const payload = jwt.verify(authCookie.value, jwtSecret) as { login: string };
      if (payload.login === login) {
        const { set } = useAuthStore();
        set('isLogged', true);
      }
    } catch {
      console.log(`Error with verify token ${authCookie.value}`);
      return;
    }
  },
});
