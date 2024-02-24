import { getDirname, path } from "vuepress/utils";
import { defineUserConfig } from "vuepress";
import { googleAnalyticsPlugin } from '@vuepress/plugin-google-analytics'
import { usePagesPlugin } from 'vuepress-plugin-use-pages'
import { slugify as defaultSlugify } from "@mdit-vue/shared";
import PlantUMLHighlighter from './libs/markdown-it-plantuml.js';
import theme from "./theme.js";
const __dirname = getDirname(import.meta.url);

const plantUMLHighlighter = new PlantUMLHighlighter();

export default defineUserConfig({
  base: "/",
  locales: {
    "/": {
      lang: "zh-CN",
      title: "个人技术文章分享",
      description: "这是一个简单的博客",
    },
    // "/zh/": {
    //   lang: "zh-CN",
    //   title: "博客演示",
    //   description: "vuepress-theme-hope 的博客演示",
    // },
  },

  theme,

  alias: {
    "@theme-hope/components/NormalPage": path.resolve(
      __dirname,
      "./theme/components/page/NormalPage.vue",
    ),
    "@theme-hope/modules/navbar/components/Navbar": path.resolve(
      __dirname,
      "./theme/components/navbar/NavbarWithBanner.ts",
    ),
    "@theme-hope/modules/blog/components/BloggerInfo": path.resolve(
      __dirname,
      "./theme/components/blog/BloggerInfo.ts",
    ),
  },

  plugins: [
    usePagesPlugin({
      startsWith: "/posts/"
    }),
    googleAnalyticsPlugin({
      id: "UA-171805433-1"
    }),
  ],

  extendsMarkdown: (md, app) => {
    md.options.highlight = function (str, lang) {
      if (lang === 'plantuml') {
        return plantUMLHighlighter.handle(str, lang)
      }
      return ''
    }
  },

  extendsPageOptions: (pageOptions, app) => {
    if (pageOptions.filePath?.startsWith(app.dir.source("_posts"))) {
      pageOptions.frontmatter = pageOptions.frontmatter ?? {}
      // 调整 TOC 消失的最低宽度
      // 整体背景色
      pageOptions.frontmatter.draft = pageOptions.frontmatter.draft || false
      pageOptions.frontmatter.permalinkPattern = '/posts/:year/:month/:day/:slug.html'
      pageOptions.frontmatter.type = 'post'

      // 草稿
      if (pageOptions.frontmatter.draft) {
        pageOptions.frontmatter.permalinkPattern = '/drafts/:year/:month/:day/:slug.html'
      }
    }
  },

  extendsPage: (page) => {
    if (page.frontmatter.type === 'post') {
        // 重写 url 路径
        const pagePath = page.permalink || page.pathInferred || "";
        const parts = pagePath.split("/");
        const filename = parts[parts.length-1];
        parts[parts.length-1] = defaultSlugify(filename.replace(".html", "")) + ".html";
        page.path = encodeURI(parts.join("/"));
        page.data.path = page.path;
    }
  }

  // Enable it with pwa
  // shouldPrefetch: false,
});
