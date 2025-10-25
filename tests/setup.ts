import { ref, computed, reactive, watch, nextTick } from 'vue';

// Provide Vue reactivity APIs globally to mimic Nuxt auto-imports in <script setup>
Object.assign(globalThis as unknown as Record<string, unknown>, {
  ref,
  computed,
  reactive,
  watch,
  nextTick,
});
