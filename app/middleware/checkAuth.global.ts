import { useAuthStore } from '~/composables/stores/authStore/AuthStore';

export default defineNuxtRouteMiddleware((to) => {
  const { get } = useAuthStore();
  if (!get('isLogged') && to.path !== '/login') {
    return navigateTo('/login');
  }
});
