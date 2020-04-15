import TableOfContents from "vuepress-plugin-table-of-contents/lib/components/TableOfContents"
// 通过继承 TOC 实现设置 includeLevel
export default {
    name: 'TOC',
    extends: TableOfContents,
    props: {
      includeLevel: {
          type: Array,
          required: false,
          default: () => [1, 5],
      },
    mounted: function () {
      console.log("mounted", this)
    }
  },
}
