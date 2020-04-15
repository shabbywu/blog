import TOC from "./components/TOC"
export default ({
    Vue, // VuePress 正在使用的 Vue 构造函数
    options, // 附加到根实例的一些选项
    router, // 当前应用的路由实例
    siteData // 站点元数据
  }) => {
    setTimeout(function(){
      // 延迟注册, 避免被覆盖
      Vue.component(TOC.name, TOC)
    })
}