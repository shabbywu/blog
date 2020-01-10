module.exports = {
  title: 'Shabbywu',
  description: '这是一个简单的博客',
  head: [
    ['link', { rel: 'icon', href: '/logo.png' }]
  ],
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: '技术博客', link: '/it/'},
    ],
    sidebar: [
      ['/', '首页'],
      {
        title: '技术博客',
        collapsable: false,
        children: [
          {
            title: 'Python',
            children: [
              '/it/python/2019-10-14-python_async.md'
            ]
          },
          // {
          //   title: '计算机科学',
          //   children: [
          //     '/it/cs/revisiting_coroutines'
          //   ]
          // }
        ]
      },

    ]
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
    '@vssue/vuepress-plugin-vssue': {
      // set `platform` rather than `api`
      platform: 'github',

      // all other options of Vssue are allowed
      owner: 'shabbywu',
      repo: 'blog_comment',
      clientId: '3934c6721961da9062bf',
      clientSecret: '12b75149dad24d3e398f130bcc5d639f6f1b5cbe',
    }
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