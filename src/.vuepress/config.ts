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
    "/en/": {
      lang: "en-US",
      title: "Personal technical article sharing",
      description: "Here is a simple blog",
    },
  },

  theme,

  alias: {
    "@theme-hope/components/NormalPage": path.resolve(
      __dirname,
      "./theme/page/components/NormalPage.vue",
    ),
    "@theme-hope/modules/navbar/components/Navbar": path.resolve(
      __dirname,
      "./theme/navbar/components/NavbarWithBanner.ts",
    ),
    "@theme-hope/modules/blog/components/BloggerInfo": path.resolve(
      __dirname,
      "./theme/blog/components/BloggerInfo.ts",
    ),
  },

  plugins: [
    usePagesPlugin({
      startsWith: "/",
      filter(page) {
        return page.path.startsWith("/posts/") || page.path.startsWith("/en/posts/") 
      },
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
    if (pageOptions.filePath?.startsWith(app.dir.source("_posts")) || pageOptions.filePath?.startsWith(app.dir.source("en/_posts"))) {

      pageOptions.frontmatter = pageOptions.frontmatter ?? {}
      // 调整 TOC 消失的最低宽度
      // 整体背景色
      pageOptions.frontmatter.draft = pageOptions.frontmatter.draft || false
      pageOptions.frontmatter.permalinkPattern = '/posts/:year/:month/:day/:slug.html'
      pageOptions.frontmatter.type = 'post'
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

        if (page.frontmatter.draft) {
          if (page.path.startsWith("/en/")) {
            page.path = page.path.replace("/en/", "/en/drafts/");
            page.data.path = page.data.path.replace("/en/", "/en/drafts/");
          } else {
            page.path = page.path.replace("/", "/drafts/");
            page.data.path = page.data.path.replace("/", "/drafts/");
          }

        }
    }
  }

  // Enable it with pwa
  // shouldPrefetch: false,
});
