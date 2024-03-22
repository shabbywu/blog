import { getDirname, path, fs, debug } from "vuepress/utils";
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

  extendsPageOptions: async (pageOptions, app) => {
    var log = debug("vuepress:core/page");
    var DATE_RE = /(\d{4}-\d{1,2}(-\d{1,2})?)-(.*)/;
    if (pageOptions.filePath?.startsWith(app.dir.source("_posts")) || pageOptions.filePath?.startsWith(app.dir.source("en/_posts"))) {

      pageOptions.frontmatter = pageOptions.frontmatter ?? {}
      // 调整 TOC 消失的最低宽度
      // 整体背景色
      pageOptions.frontmatter.draft = pageOptions.frontmatter.draft || false
      pageOptions.frontmatter.permalinkPattern = '/posts/:year/:month/:day/:slug.html'
      pageOptions.frontmatter.type = 'post'
      
      // 重写文件路径, 解决 vuepress 默认的 slugify 逻辑不兼容 vuepress 1 的问题
      const filePath = pageOptions.filePath;
      const parts = pageOptions.filePath.split("/");
      const filename = path.parse(filePath).name;
      const match = filename.match(DATE_RE);
      if (match) {
        parts[parts.length-1] = match[1] + "-" + defaultSlugify(match[3].replace(".md", "")) + ".md";
      } else {
        parts[parts.length-1] = defaultSlugify(filename.replace(".md", "")) + ".md";
      }
      pageOptions.filePath = parts.join("/");
      try {
        const content = await fs.readFile(filePath, "utf-8");
        pageOptions.content = content;
      } catch (e) {
        log(e instanceof Error ? e.message : e);
      }

    }
  },

  extendsPage: (page) => {
    if (page.frontmatter.type === 'post') {
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
  },

  // Enable it with pwa
  // shouldPrefetch: false,
});
