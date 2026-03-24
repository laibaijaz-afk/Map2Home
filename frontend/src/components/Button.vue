<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'px-6 py-3 font-semibold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2',
      {
        'btn-primary': variant === 'primary',
        'btn-secondary': variant === 'secondary',
        'btn-outline': variant === 'outline',
        'opacity-50 cursor-not-allowed': disabled || loading,
        'hover:shadow-2xl hover:scale-105 active:scale-95': !disabled && !loading
      }
    ]"
    aria-pressed="false"
  >
    <svg
      v-if="loading"
      class="animate-spin h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <slot />
  </button>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'button'
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'outline'].includes(v)
  },
  disabled: Boolean,
  loading: Boolean
})
</script>
