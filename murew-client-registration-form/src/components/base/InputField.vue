<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps({
    type: String,
    modelValue: String,
    name: String,
    label: String,
    placeholder: String,
    description: String,
    errorMessage: String,
    emptyError: Boolean,
})
defineEmits(['update:modelValue'])
const showEmptyError = computed(
    () => props.emptyError && (props.modelValue ?? '').trim().length === 0
)
</script>

<template>
    <div class="field" :class="{ error: errorMessage || showEmptyError }">
        <label :for="name">{{ label }}</label>
        <input
            :value="modelValue"
            @input="$emit('update:modelValue', (<any>$event.target).value)"
            :type="type ?? 'text'" :name="name"
            :placeholder="placeholder ?? label ?? ''"
        />
        <label v-if="errorMessage || showEmptyError" class="errorMessage">
            {{ errorMessage ?? 'Please enter a value' }}
        </label>
        <label v-if="description" class="description">{{ description }}</label>
    </div>
</template>

<style scoped>
.description{
    font-weight: normal !important;
    color: #5d5d5d !important;
}
.errorMessage{
    font-weight: normal !important;
}
</style>