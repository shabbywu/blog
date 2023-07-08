const path = require('path');
const glob = require('glob');
var ROOT_PATH = path.resolve(__dirname, '..');
console.log(`ROOT_PATH: ${ROOT_PATH}`)

DEVING = process.env.NODE_ENV === 'development'

GITHUB_OAUTH_APP = {
  clientId: !DEVING ? '3934c6721961da9062bf': 'a70c4c9eafc5c615b3a3',
  clientSecret: !DEVING ? '12b75149dad24d3e398f130bcc5d639f6f1b5cbe': 'effd0f0406c557f4bb67ea19ec54f859d6044543',
}

const PlantUMLHighlighter = require('./lib/markdown-it-plantuml');
const plantUMLHighlighter = new PlantUMLHighlighter();
const defaultHighlight = require("@vuepress/markdown/lib/highlight");

module.exports = {
  title: '个人技术文章分享',
  description: '这是一个简单的博客',
  head: [
    ['link', { rel: 'icon', href: '/img/avatar.png' }]
  ],
  themeConfig: {
    // 主题语言，参考下方 [主题语言] 章节
    lang: 'zh-CN',
    // 个人信息（没有或不想设置的，删掉对应字段即可）
    personalInfo: {
      // 昵称
      nickname: 'shabbywu',
      // 所在地
      location: 'Shenzhen, China',
      // 组织
      organization: 'Tencent',
      // 电子邮箱
      email: 'shabbywu@qq.com',
      // 头像
      avatar: '/img/avatar.png',
      sns: {
        // Github 帐号和链接
        github: {
          account: 'shabbywu',
          link: 'https://github.com/shabbywu',
        },
      }
    },
    // 是否显示文章的最近更新时间
    lastUpdated: true,
    // 底部 footer 的相关设置 (可选)
    footer: {
      // 是否显示 Powered by VuePress
      poweredBy: true,
      // 是否显示使用的主题
      poweredByTheme: true,
      // 添加自定义 footer (支持 HTML)
      custom: '<a href="https://github.com/shabbywu/" target="_blank">shabbywu</a> © 2019-present | <a href="http://beian.miit.gov.cn" target="_blank">粤ICP备2021176883号</a>',
    },
    // 评论配置
    comments: {
      platform: 'github', // 可选，默认使用 'github'，还可以选择 'gitlab', 'bitbucket'。详情参考 Vssue 文档
      owner: 'shabbywu',
      repo: 'blog',
      ...GITHUB_OAUTH_APP,
      autoCreateIssue: false,
    },
    nav: [
      { text: 'Home', link: '/', exact: true  },
      { text: '文章', link: '/posts/', exact: false },
    ],
  },
  plugins: [
    [
      '@vuepress/active-header-links', {}
    ],
    [
      '@vuepress/back-to-top', {}
    ],
    [
      '@vuepress/google-analytics',
      {
        'ga': 'UA-171805433-1'
      }
    ],
    ['vuepress-plugin-container', {
      type: 'details',
      before: info => `<details class="custom-block details">${info ? `<summary>${info}</summary>` : ''}\n`,
      after: () => '</details>\n'
    }],
    [
      'sitemap', {
        hostname: 'https://blog.shabbywu.cn'
      }
    ]
  ],
  markdown: {
    // markdown-it-anchor 的选项
    anchor: { permalink: false },
    // markdown-it-toc 的选项
    toc: { includeLevel: [1, 5], },
    extendMarkdown: md => {
      // 使用更多的 markdown-it 插件!

      // md.use(require("markdown-it-anchor").default);
      md.use(require("markdown-it-table-of-contents"), {
        includeLevel: [1, 5], forceFullToc: false
      });

      md.options.highlight = function (str, lang) {
        if (lang === 'plantuml') {
          return plantUMLHighlighter.handle(str, lang)
        }
        return defaultHighlight(str, lang)
      }

    },
    // 从 html 解析出的 headers
    extractHeaders: ['h1', 'h2', 'h3', 'h4', 'h5']
  }
}