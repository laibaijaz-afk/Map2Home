<template>
  <div class="mb-4">
    <div class="relative">
      <input
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        @input="$emit('update:modelValue', $event.target.value)"
        @focus="focused = true"
        @blur="focused = false"
        class="input-field peer"
        :class="{ 'ring-2 ring-red-500': error }"
      />

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
import { ref } from 'vue'

defineProps({
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
  hint: String
})

defineEmits(['update:modelValue'])

const focused = ref(false)
</script>
