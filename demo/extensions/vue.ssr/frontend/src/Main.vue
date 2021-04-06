<template>
  <h1>Hello World :)</h1>
</template>

<script lang="ts">

export default {
  name: 'Main',
  created()
  {
    console.log('[DEMO: Vue environment]', process.env.VUE_ENV);
    console.log('[DEMO: Node environment]', process.env.NODE_ENV);
  }
};
</script>

<style lang="sass" src="Main.sass"></style>