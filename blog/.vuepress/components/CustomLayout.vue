<!-- .vuepress/components/CustomLayout.vue -->

<template>
  <div class="custom-layout">

    <!-- .main-div is the block with white background -->
    <div class="main-div">
      This is a custom layout
    </div>

    <div class="main-div">
      <!-- <Content /> is to show the rendered markdown content of this page -->
      <Content class="content" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomLayout',
}
</script>