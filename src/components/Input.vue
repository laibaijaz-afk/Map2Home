<template>
  <div class="mb-4">
    <div class="relative">
      <input
        :type="computedType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        @input="$emit('update:modelValue', $event.target.value)"
        @focus="focused = true"
        @blur="focused = false"
        class="input-field peer"
        :class="{ 'ring-2 ring-red-500': error, 'pr-10': showPasswordToggle }"
      />

      <!-- Show/Hide Password Toggle -->
      <button
        v-if="showPasswordToggle"
        type="button"
        tabindex="-1"
        class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
        :aria-label="passwordVisible ? 'Hide password' : 'Show password'"
        @click="passwordVisible = !passwordVisible"
      >
        <svg v-if="!passwordVisible" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      </button>

      <label
        v-if="label"
        class="absolute left-4 -top-2 px-1 bg-white text-sm font-semibold text-gray-600 transition-all duration-200 peer-focus:-translate-y-2 peer-focus:scale-95 peer-placeholder-shown:translate-y-3 peer-placeholder-shown:scale-100"
      >
        {{ label }}
        <span v-if="required" class="text-red-500">*</span>
      </label>
    </div>

    <p v-if="error" class="text-sm text-red-500 mt-1">{{ error }}</p>
    <p v-else-if="hint" class="text-sm text-gray-500 mt-1">{{ hint }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: String,
  type: {
    type: String,
    default: 'text'
  },
  label: String,
  placeholder: String,
  required: Boolean,
  disabled: Boolean,
  error: String,
  hint: String,
  showPasswordToggle: Boolean
})

defineEmits(['update:modelValue'])

const focused = ref(false)
const passwordVisible = ref(false)

const computedType = computed(() => {
  if (props.type === 'password' && props.showPasswordToggle && passwordVisible.value) {
    return 'text'
  }
  return props.type
})
</script>
