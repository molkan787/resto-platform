<template>
    <div>
        <h3 v-for="(t, i) in foo" :key="i">{{ t }}</h3>
    </div>
</template>

<script>
export default {
    data: () => ({
        foo: [
            'Hello world!',
        ]
    })
}
</script>