<template>
  <client-only>
    <toggle-button v-bind="$attrs" v-on="$listeners" />
  </client-only>
</template>
<script>
// This is a separate component partly because the toggle we use is not SSR-safe, and by async loading this component
// we can avoid importing it until we're on the client.
import { ToggleButton } from 'vue-js-toggle-button'

export default {
  components: {
    ToggleButton
  }
}
</script>
