<template>
  <div class="p-4 h-full w-full flex items-center justify-center">
    <UForm :state="state" class="w-[400px] space-y-4" @submit="onSubmit">
      <UFormField class="w-full" label="Логин" name="login">
        <UInput v-model="state.login" class="w-full" />
      </UFormField>

      <UFormField class="w-full" label="Пароль" name="password">
        <UInput v-model="state.password" class="w-full" />
      </UFormField>

      <UButton type="submit"> Отправить </UButton>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/composables/stores/authStore/AuthStore';
const { set, get } = useAuthStore();
if (get('isLogged')) {
  navigateTo('/');
}
const state = reactive({
  login: '',
  password: '',
});

const { $api } = useNuxtApp();

async function onSubmit() {
  const res = await $api.auth.login(state);
  if (res.status === 'success') {
    set('isLogged', true);
    navigateTo('/');
  }
}
</script>
