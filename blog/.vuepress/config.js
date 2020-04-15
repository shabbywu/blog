const path = require('path');
const glob = require('glob');
var ROOT_PATH = path.resolve(__dirname, '..');
console.log(`ROOT_PATH: ${ROOT_PATH}`)

function genSidebarChildrun(subPath) {
  return glob.sync("**/*.md", {
    cwd: path.join(ROOT_PATH, subPath)
  }).map(item => path.join('/', subPath, item))
}

module.exports = {
  title: 'Shabbywu',
  description: '这是一个简单的博客',
  theme: 'meteorlxy',
  head: [
    ['link', { rel: 'icon', href: '/logo.png' }]
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
      email: 'shabbywu@tencent.com',
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
      custom: 'Copyright 2019-present <a href="https://github.com/shabbywu" target="_blank">shabbywu</a> | MIT License',
    },
    // 评论配置
    comments: {
      platform: 'github', // 可选，默认使用 'github'，还可以选择 'gitlab', 'bitbucket'。详情参考 Vssue 文档
      owner: 'shabbywu',
      repo: 'blog',
      clientId: '3934c6721961da9062bf',
      clientSecret: '12b75149dad24d3e398f130bcc5d639f6f1b5cbe',
      autoCreateIssue: process.env.NODE_ENV !== 'development', // 可选，这样设置可以在开发环境下不自动创建 Issue
    },
    nav: [
      { text: 'Home', link: '/', exact: true  },
      { text: '文章', link: '/posts/', exact: false },
    ],
  },
  plugins: {
    '@vuepress/active-header-links': {},
    '@vuepress/blog': {
      directories: [
        {
          // Unique ID of current classification
          id: 'it',
          // Target directory
          dirname: 'it',
        },
      ],
      comment: [
        {
          // Which service you'd like to use
          service: 'vssue',
          // The owner's name of repository to store the issues and comments.
          owner: 'shabbywu',
          // The name of repository to store the issues and comments.
          repo: 'https://github.com/shabbywu/blog_comment',
          // The clientId & clientSecret introduced in OAuth2 spec.
          clientId: '3934c6721961da9062bf',
          clientSecret: '12b75149dad24d3e398f130bcc5d639f6f1b5cbe',
        },
      ],
    },
    '@vuepress/back-to-top': {},
  },
  markdown: {
    // markdown-it-anchor 的选项
    anchor: { permalink: false },
    // markdown-it-toc 的选项
    toc: { includeLevel: [1, 2, ] },
    extendMarkdown: md => {
      // 使用更多的 markdown-it 插件!
      md.use(require('markdown-it-plantuml'))
    }
  }
}