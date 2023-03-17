'use strict'
// 全局声明插件代号
const pluginname = 'butterfly_footer_beautify'
// 全局声明依赖
const pug = require('pug')
const path = require('path')
const urlFor = require('hexo-util').url_for.bind(hexo)
const util = require('hexo-util')

hexo.extend.filter.register('after_generate', function () {
// =====================================================================
  // 首先获取整体的配置项名称
  const config = hexo.config.footer_beautify || hexo.theme.config.footer_beautify
  // 首先获取所有的徽标参数列表，默认是博客框架+主题框架的徽标
  // 如果配置开启
  if (!(config && config.enable)) return
  // 集体声明配置项
    const data = {
      pjaxenable: hexo.theme.config.pjax.enable,
      exclude: config.exclude,
      layout_type: config.layout.type,
      layout_name: config.layout.name,
      layout_index: config.layout.index ? config.layout.index : 0,
      enable_page: config.enable_page ? config.enable_page : "all",
      iconsenable: config.footer_icons.enable,
      icon_left: config.footer_icons.left,
      icon_right: config.footer_icons.right,
      logoenable: config.footer_logo.enable,
      logo_url: config.footer_logo.url,
      groupenable: config.footer_group.enable,
      footer_group_link: config.footer_group.footer_group_link,
      flinksenable: config.footer_friend_links.enable,
      flinks_num: config.footer_friend_links.number ? config.footer_friend_links.number:5,
      copyrightenable:  config.footer_bottom.copyright.enable,
      author: config.footer_bottom.copyright.author,
      link: config.footer_bottom.copyright.link,
      time: config.footer_bottom.copyright.time,
      bottom_left: config.footer_bottom.left,
      bottom_right: config.footer_bottom.right,
      runtimeenable: config.footer_bottom.runtime.enable,
      runtime: config.footer_bottom.runtime.time,
      footer_css: config.footer_css ? urlFor(config.footer_css) : "./lib/footer.min.css",
      footer_js: config.footer_js ? urlFor(config.footer_js) : "./lib/footer.min.js",
    }
  // 渲染页面
  const temple_html_text = config.temple_html ? config.temple_html : pug.renderFile(path.join(__dirname, './lib/html.pug'),data);
  // 友联
  if (data.flinksenable){
    const YML = require('yamljs')
    const fs = require('fs')
  
    let ls = [],
        data = YML.parse(fs.readFileSync('source/_data/link.yml').toString().replace(/(?<=rss:)\s*\n/g, ' ""\n'));
  
    data.forEach((e, i) => { if (i > 1) ls = ls.concat(e.link_list) });
    fs.writeFileSync('source/link.json', `{"link_list": ${JSON.stringify(ls)},"length":${ls.length}}`)
  }
  //cdn资源声明
    //样式资源
  const css_text = `<link rel="stylesheet" href="${data.footer_css}" media="print" onload="this.media='all'">`
    //脚本资源
  let js_text = `<script defer src="${data.footer_js}"></script>`

  //注入容器声明
  var get_layout
  //若指定为class类型的容器
  if (data.layout_type === 'class') {
    //则根据class类名及序列获取容器
    get_layout = `document.getElementsByClassName('${data.layout_name}')[${data.layout_index}]`
  }
  // 若指定为id类型的容器
  else if (data.layout_type === 'id') {
    // 直接根据id获取容器
    get_layout = `document.getElementById('${data.layout_name}')`
  }
  // 若未指定容器类型，默认使用id查询
  else {
    get_layout = `document.getElementById('${data.layout_name}')`
  }

  //挂载容器脚本
  var user_info_js = `<script data-pjax>
  function ${pluginname}_injector_config(){
    var parent_div_git = ${get_layout};
    var item_html = '${temple_html_text}';
    console.log('已挂载${pluginname}')
    parent_div_git.innerHTML=item_html
    }
  var elist = '${data.exclude}'.split(',');
  var cpage = location.pathname;
  var epage = '${data.enable_page}';
  var flag = 0;

  for (var i=0;i<elist.length;i++){
    if (cpage.includes(elist[i])){
      flag++;
    }
  }

  if ((epage ==='all')&&(flag == 0)){
    ${pluginname}_injector_config();
  }
  else if (epage === cpage){
    ${pluginname}_injector_config();
  }
  </script>`
  // 注入用户脚本
  // 此处利用挂载容器实现了二级注入
  hexo.extend.injector.register('body_end', user_info_js, "default");
  // 注入脚本资源
  hexo.extend.injector.register('body_end', js_text, "default");
  // 注入样式资源
  hexo.extend.injector.register('head_end', css_text, "default");
},
hexo.extend.helper.register('priority', function(){
  // 过滤器优先级，priority 值越低，过滤器会越早执行，默认priority是10
  const pre_priority = hexo.config.footer_beautify.priority || hexo.theme.config.footer_beautify.priority
  const priority = pre_priority ? pre_priority : 10
  return priority
}),


)
