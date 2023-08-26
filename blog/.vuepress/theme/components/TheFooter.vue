<template>
    <footer class="footer">
      <p
        v-if="sns"
        class="footer-sns-links"
      >
        <a
          v-for="(item, name) in sns"
          :key="name"
          class="sns-link"
          :href="item.link"
          target="_blank"
        >
          <IconSns
            :name="name"
            :account="item.account"
          />
        </a>
      </p>
  
      <p
        v-if="poweredBy"
        class="footer-text"
      >
        <span>Powered by </span>
  
        <a
          href="https://github.com/vuejs/vuepress"
          target="_blank"
        >
          VuePress
        </a>
  
        <template v-if="poweredByTheme">
          <span> | </span>
  
          <a
            href="https://github.com/meteorlxy/vuepress-theme-meteorlxy"
            target="_blank"
          >
            meteorlxy
          </a>
        </template>

        <template v-if="feeds">
          <span> | </span>
  
          <a
            href="/rss.xml"
            target="_blank"
          >
          <svg xmlns="http://www.w3.org/2000/svg" id="RSSicon" viewBox="0 0 8 8" class="icon">
<title>RSS feed icon</title>
<style type="text/css">
  .button {stroke: none; fill: orange;}
  .symbol {stroke: none; fill: white;}
</style>
<rect class="button" width="8" height="8" rx="1.5"/>
<circle class="symbol" cx="2" cy="6" r="1"/>
<path class="symbol" d="m 1,4 a 3,3 0 0 1 3,3 h 1 a 4,4 0 0 0 -4,-4 z"/>
<path class="symbol" d="m 1,2 a 5,5 0 0 1 5,5 h 1 a 6,6 0 0 0 -6,-6 z"/>
</svg>
          </a>
        </template>
      </p>
  
      <!-- eslint-disable vue/no-v-html -->
      <p
        v-if="custom"
        class="footer-text"
        v-html="custom"
      />
      <!-- eslint-enable vue/no-v-html -->
    </footer>
  </template>
  
  <script>
  import IconSns from '@theme/components/IconSns.vue'

  export default {
    name: 'TheFooter',
  
    components: {
        IconSns,
    },
  
    computed: {
      poweredBy () {
        return this.$themeConfig.footer.poweredBy !== false
      },
  
      poweredByTheme () {
        return this.$themeConfig.footer.poweredByTheme !== false
      },
  
      custom () {
        return this.$themeConfig.footer.custom || null
      },
  
      sns () {
        return this.$themeConfig.personalInfo.sns || null
      },

      feeds () {
        return this.$themeConfig.footer.feeds !== false
      }
    },
  }
</script>

<style lang="stylus" scoped>
@require '~@theme/styles/variables'

.footer
  color $grayTextColor
  padding-bottom 1.5rem
  text-align center
  border-top 1px solid $borderColor
  .footer-sns-links
    margin 1em 0
  .footer-text
    margin 0.5em 0
</style>