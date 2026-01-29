import{_ as l,r,o as d,c as o,f as n,g as e,i as s,w as c,e as i}from"./app-C9ZkQdtL.js";const u={},v=i(`<h2 id="tldr" tabindex="-1"><a class="header-anchor" href="#tldr"><span>TLDR</span></a></h2><p><strong>nginx reload</strong> 导致 worker 重启, 而 <strong>worker_shutdown_timeout</strong> 默认值是 10s (由 nginx-ingress-controller 配置), 导致出现长连接异常断开的问题。</p><h2 id="问题背景" tabindex="-1"><a class="header-anchor" href="#问题背景"><span>问题背景</span></a></h2><p>最近接到用户反馈, 在 <strong>IDC</strong> 通过<strong>域名</strong>访问应用接口时, 当请求耗时到 <strong>3</strong> 分钟的时候会出现服务端不返回数据直接关闭连接的情况, 需要协助排查访问链路中是否有设置超时限制。</p><h2 id="问题分析和排查复盘" tabindex="-1"><a class="header-anchor" href="#问题分析和排查复盘"><span>问题分析和排查复盘</span></a></h2><h3 id="访问链路梳理" tabindex="-1"><a class="header-anchor" href="#访问链路梳理"><span>访问链路梳理</span></a></h3><p>据了解, 目前集群的流量是依托公司基建(腾讯云CLB)做负载均衡, 将流量打散至 nginx-ingress 运行的节点上, 流量进入集群后, 即按照 k8s 的正常访问链路(<code>Ingress -&gt; Service -&gt; Pod</code>)路由至具体的容器。<br> 为了排查是否由于 CLB 导致超时, 所以需要自查集群内的访问链路是否正常。我们知道, Service 的实现是通过 iptables 做路由规则转发, 如果 <code>Service -&gt; Pod</code> 能连通, 那么这层就不会出现超时的情况。所以集群内部的关注点主要在 <code>Ingress</code> 和 <code>Pod</code> 两个模块。</p><h3 id="模拟复盘" tabindex="-1"><a class="header-anchor" href="#模拟复盘"><span>模拟复盘</span></a></h3><p>由于用户无法提供可以测试的现场环境, 所以我们只能在集群内搭建一个模拟超时情况的现场。这里选择了使用 <code>fastapi</code> 快速搭建超时现场。</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>## -*- coding: utf-8 -*-
import asyncio
from fastapi import FastAPI

app = FastAPI()


@app.get(&quot;/test/timeout/{wait}&quot;)
async def sleep(wait: int):
    print(&quot;waiting&quot;, wait)
    await asyncio.sleep(wait)
    return {&quot;timeout&quot;: False}


if __name__ == &#39;__main__&#39;:
    import uvicorn
    uvicorn.run(app, port=5000)

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,10),m=i(`<p>模拟现场搭建好后, 分别在容器内和集群内两个环境下请求该现场:</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>## 域名信息以脱敏, 仅供演示, 应用监听 5000 端口
~ Pod内 &gt; curl -H &quot;Host: ****.com&quot; -X GET 127.0.0.1:5000/test/timeout/180
{&quot;timeout&quot;: False}

## 域名信息以脱敏, 仅供演示, nginx-ingress 使用 NodePort 模式监听 30080 端口
~ ingress 节点上 &gt; curl -H &quot;Host: xxxx.com&quot; -X GET 127.0.0.1:30080/test/timeout/180
{&quot;timeout&quot;: False}

~ ingress 节点上 &gt; curl -H &quot;Host: xxxx.com&quot; -X GET 127.0.0.1:30080/test/timeout/181
curl: (52) Empty reply from server

~ ingress 节点上 &gt; curl -H &quot;Host: xxxx.com&quot; -X GET 127.0.0.1:30080/test/timeout/180
{&quot;timeout&quot;: False}

~ ingress 节点上 &gt; curl -H &quot;Host: xxxx.com&quot; -X GET 127.0.0.1:30080/test/timeout/181
curl: (52) Empty reply from server
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>意外情况如期而至, 容器内的访问能正常返回, 而使用 <code>nginx-ingress</code> 做代理转发的请求却被服务器中断了连接。<br> 难道我们在 <code>nginx-ingress</code> 上某个地方配置了 <strong>180s</strong> 超时吗？ 现在的问题就转化成是由于哪里的配置不正确导致连接被中断。</p><blockquote><p>注: 在模拟复盘时遇上了 <strong>偶然</strong> 因素, 导致排查踩坑。</p></blockquote><h3 id="配置排查" tabindex="-1"><a class="header-anchor" href="#配置排查"><span>配置排查</span></a></h3><p>\b首先进入 <code>nginx-ingress</code> 其中一个副本的容器中, 先确定配置文件的路径在哪里。</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>## 执行以下指令查看 nginx 的启动参数
ps -ef |grep nginx
---
## 信息以脱敏, 仅供演示
? ? ? ? ? ?    ?:?:? nginx: master process /usr/sbin/nginx -c /etc/nginx/nginx.conf
---
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>定位到 nginx 的启动配置在 <code>/etc/nginx/nginx.conf</code>, 我们直接查看该配置是否设置了超时时间。</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>cat /etc/nginx/nginx.conf | grep timeout
---
## 信息以脱敏, 仅供演示
proxy_connect_timeout                   5s;
proxy_send_timeout                      600s;
proxy_read_timeout                      600s;
proxy_next_upstream                     error timeout;
---
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>呃呃呃, 显而易见, 反向代理配置的时间是 600s, 但是用户反馈的是 <strong>3</strong> 分钟出现超时啊。情况不对劲, 得进一步排查。</p><h3 id="日志排查踩坑" tabindex="-1"><a class="header-anchor" href="#日志排查踩坑"><span>日志排查踩坑</span></a></h3><p>先继续触发一波访问记录, 方便排查日志</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>~ ingress 节点上 &gt; curl -H &quot;Host: xxxx.com&quot; -X GET 127.0.0.1:30080/test/timeout/181?MARK=111111111111111
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>由于平台的所有日志都有配置日志采集, 这里<strong>偷了个懒</strong>直接在 kibana 上看日志。</p><div class="language-markdown line-numbers-mode" data-ext="md" data-title="md"><pre class="language-markdown"><code>127.0.0.1 - [127.0.0.1] - - [dd/MM/yyyy:HH:mm:ss +0000] &quot;GET /test/timeout/181?MARK=111111111111111 HTTP/1.1&quot; 000 0 &quot;-&quot; &quot;curl/7.29.0&quot; 148 179.412 [----] aaa.bbb.ccc.ddd:5000 0 - - xxxxxx

127.0.0.1 - [127.0.0.1] - - [dd/MM/yyyy:HH:mm:ss +0000] &quot;GET /test/timeout/181?MARK=111111111111111 HTTP/1.1&quot; 000 0 &quot;-&quot; &quot;curl/7.29.0&quot; 148 30.932 [----] aaa.bbb.ccc.ddd:5000 0 - - xxxxxx
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>由于不清楚日志的格式, 所以还得查 nginx 中的相应配置</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>cat /etc/nginx/nginx.conf | grep log_format
---
## 信息以脱敏, 仅供演示
log_format upstreaminfo &#39;$the_real_ip - [$the_real_ip] - $remote_user [$time_local] &quot;$request&quot; $status $body_bytes_sent &quot;$http_referer&quot; &quot;$http_user_agent&quot; $request_length $request_time [$proxy_upstream_name] $upstream_addr $upstream_response_length $upstream_response_time $upstream_status $req_id&#39;;
---
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>我们在这里可以看到两次请求的 <code>$request_time</code> 分别是 <strong>179.412s</strong> 和 <strong>30.932s</strong>, 但是由于<strong>先入为主</strong>的认为是存在 <strong>3</strong> 分钟的超时问题(用户反馈以及一直未成功访问超过180s), 忽略了这两个时间之间的差异。<br> 到这里排查的思路断了, 恰好又是周五快下班才收到用户反馈, 就先和用户 <s>忽</s>反<s>悠</s> 馈说初步定位到平台存在异常中断长连接的问题, 需要进一步排查, 溜了溜了。</p><h3 id="求助大佬-峰回路转" tabindex="-1"><a class="header-anchor" href="#求助大佬-峰回路转"><span>求助大佬, 峰回路转</span></a></h3><p>在小组群里同步排查进度: 问题是出自 <code>nginx-ingress</code>, 结合用户反馈和偶然的测试结果, 目前怀疑是 nginx 某个地方存在 180s 超时, 但是找不到哪里有这个配置, 下班之余也要求助一下大佬。<br> 接下来, 神奇的事情出现了, 大佬在晚上再次发起测试请求, 发现能突破 180s 的限制, 所以可以明确并没有 180s 超时的限制。</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>~ ingress 节点上 &gt; time curl -H &quot;Host: xxxx.com&quot; -X GET 127.0.0.1:30080/test/timeout/200
{&quot;timeout&quot;: False}
real 3m20.074s
user 0m0.000s
sys 0m0.008s
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>此刻心情如图: (￣ε(#￣)☆╰╮(￣▽￣///)</p></blockquote><p>说回正事, 既然不存在超时的限制, 那么究竟是哪里有问题呢？再次发起请求, 发现网络不稳定:</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>~ ingress 节点上 &gt; time curl -H &quot;Host: xxxx.com&quot; -X GET 127.0.0.1:30080/test/timeout/200
{&quot;timeout&quot;: False}
real 0m14.425s
user 0m0.000s
sys 0m0.008s
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>重点来了, 大佬<strong>没有偷懒</strong>, 直接查看了这个 nginx 的运行日志, 有意外发现: 在请求被意外中止前, nginx-controller 输出了日志:</p><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>I0205 HH:mm:ss 7 controller.go:195] Backend successfully reloaded.
I0205 HH:mm:ss 7 controller.go:212] Dynamic reconfiguration successed.
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div>`,26),g={href:"https://github.com/kubernetes/ingress-nginx/blob/nginx-0.20.0/internal/ingress/controller/controller.go#L195",target:"_blank",rel:"noopener noreferrer"},b=i(`<div class="language-go line-numbers-mode" data-ext="go" data-title="go"><pre class="language-go"><code>// syncIngress collects all the pieces required to assemble the NGINX
// configuration file and passes the resulting data structures to the backend
// (OnUpdate) when a reload is deemed necessary.
func (n *NGINXController) syncIngress(interface{}) error {

	// 获取 ingress 列表
    ings := n.store.ListIngresses()
    ...

    // 解析出 nginx 可以理解的 upstreams 和 servers
    upstreams, servers := n.getBackendServers(ings)
    ...

    pcfg = ... // 生成 nginx 配置文件对象

    // 判断 lua 的动态配置是否能够满足需求, 能够满足就不触发 reload
	if n.cfg.DynamicConfigurationEnabled &amp;&amp; n.IsDynamicConfigurationEnough(pcfg) {
		glog.Infof(&quot;Changes handled by the dynamic configuration, skipping backend reload.&quot;)
	} else {
        glog.Infof(&quot;Configuration changes detected, backend reload required.&quot;)
        ...
        // 关键操作
        err := n.OnUpdate(*pcfg)
        ...
        glog.Infof(&quot;Backend successfully reloaded.&quot;)
        ...
	}

	if n.cfg.DynamicConfigurationEnabled {
        // 调用 lua server 提供的 api 更新动态配置
		isFirstSync := n.runningConfig.Equal(&amp;ingress.Configuration{})
		go func(isFirstSync bool) {
            ...
			err := configureDynamically(pcfg, n.cfg.ListenPorts.Status, n.cfg.DynamicCertificatesEnabled)
			if err == nil {
				glog.Infof(&quot;Dynamic reconfiguration succeeded.&quot;)
			} else {
				glog.Warningf(&quot;Dynamic reconfiguration failed: %v&quot;, err)
			}
		}(isFirstSync)
    }
    ...
}

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,1),p={href:"https://github.com/kubernetes/ingress-nginx/blob/nginx-0.20.0/internal/ingress/controller/nginx.go#L648",target:"_blank",rel:"noopener noreferrer"},h=i(`<div class="language-go line-numbers-mode" data-ext="go" data-title="go"><pre class="language-go"><code>// OnUpdate is called by the synchronization loop whenever configuration
// changes were detected. The received backend Configuration is merged with the
// configuration ConfigMap before generating the final configuration file.
// Returns nil in case the backend was successfully reloaded.
func (n *NGINXController) OnUpdate(ingressCfg ingress.Configuration) error {
    // 上面是配置合并和测试配置的逻辑, 不重要
    ...

    // 继续排查的一个方案: 开启日志等级至 Lv2, 将会打印 diff 信息.
	if glog.V(2) {
		src, _ := ioutil.ReadFile(cfgPath)
		if !bytes.Equal(src, content) {
            ...
			// TODO: executing diff can return exit code != 0
			diffOutput, _ := exec.Command(&quot;diff&quot;, &quot;-u&quot;, cfgPath, tmpfile.Name()).CombinedOutput()
            glog.Infof(&quot;NGINX configuration diff:\\n%v&quot;, string(diffOutput))
            ...
		}
	}

    o, err := nginxExecCommand(&quot;-s&quot;, &quot;reload&quot;).CombinedOutput()
    ...
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,1),x=n("code",null,"nginx-ingress-controller",-1),f=n("code",null,"nginx -s reload",-1),_={href:"http://nginx.org/en/docs/ngx_core_module.html#worker_shutdown_timeout",target:"_blank",rel:"noopener noreferrer"},q=i('<h2 id="总结与展望" tabindex="-1"><a class="header-anchor" href="#总结与展望"><span>总结与展望</span></a></h2><p>由最初接到用户反馈至最后排查到问题是由于 nginx reload 导致连接关闭, 可谓是一番波折, 通过这次问题排查学到了挺多的东西:</p><ul><li>复盘要小心<strong>偶然</strong>情况, 有时候复现出来的结果不一定是真正的结论。</li><li>避免被用户带偏, 如果一开始不先入为主的认为存在 <strong>3</strong> 分钟超时的假设, 就不一定会被 <strong>偶然</strong> 的情况误导, 导致排查进度受阻。</li><li>查日志<strong>别偷懒</strong>, kibana 查日志虽然方便, 但是搜索太精准时, 会忽略掉<strong>上下文的日志</strong>。</li><li><code>time</code> 指令挺好用, 可以测量特定指令执行时所需消耗的时间及系统资源等资讯。</li></ul><p>虽然现在查明了用户连接中断的原因, 但是禁不住我的一下心血来潮。今早在 kibana 上搜索了一下 <code>&quot;Changes handled by the dynamic configuration, skipping backend reload.&quot;</code> 和 <code>&quot;Configuration changes detected, backend reload required.&quot;</code>。<br> 结果意外发现平台的 nginx-ingress-controller 每半小时平均会触发一百余次的 nginx reload。如果贸然提高 <code>worker_shutdown_timeout</code>, 可能会导致存在大量(多代)等待退出的 nginx worker, 而在等待 worker 完全替换的过程中需要消耗更多的内存。为了从根本上解决这个问题, 仍然需要查明<strong>是什么原因导致频繁触发 nginx reload?</strong>。</p>',4);function y(E,k){const a=r("RouteLink"),t=r("ExternalLinkIcon");return d(),o("div",null,[v,n("blockquote",null,[n("p",null,[e("😁 如果想了解更多关于 FastAPI 的内容, 可以读我的另一篇文章"),s(a,{to:"/posts/2020/11/24/fastapi%E4%B8%8E%E4%BE%9D%E8%B5%96%E6%B3%A8%E5%85%A5%E6%A8%A1%E5%BC%8F.html"},{default:c(()=>[e("fastapi与依赖注入模式")]),_:1})])]),m,n("p",null,[e("马上搜索相应的日志信息, 很快就在 nginx-controller 的代码里搜到"),n("a",g,[e("相应记录"),s(t)]),e("。")]),b,n("p",null,[e("再继续往上回溯, 马上就找到了案件的"),n("a",p,[e("幕后凶手"),s(t)])]),h,n("p",null,[e("可以明确, "),x,e(" 触发了 "),f,e(" 指令, 导致 nginx worker 进程重启。通过进一步查询文档发现, nginx 提供了关闭 worker 进程的超时时间的配置项: "),n("a",_,[e("worker_shutdown_timeout"),s(t)]),e(", 而该值在 nginx-ingress-controller==0.26.0 的版本中已经从 10s 提升至 240s, 而项目中使用的 nginx-ingress-controller 版本是古早的 0.20.0 版本, 因此由 reload 引发的问题尤为显著。")]),q])}const C=l(u,[["render",y],["__file","记一次-nginx-ingress-长连接异常断开问题复盘过程.html.vue"]]),B=JSON.parse('{"path":"/posts/2021/02/06/%E8%AE%B0%E4%B8%80%E6%AC%A1-nginx-ingress-%E9%95%BF%E8%BF%9E%E6%8E%A5%E5%BC%82%E5%B8%B8%E6%96%AD%E5%BC%80%E9%97%AE%E9%A2%98%E5%A4%8D%E7%9B%98%E8%BF%87%E7%A8%8B.html","title":"记一次-Nginx-Ingress-长连接异常断开问题复盘过程","lang":"zh-CN","frontmatter":{"draft":false,"permalinkPattern":"/posts/:year/:month/:day/:slug.html","type":"post","filePathRelative":"_posts/sre/2021-02-06-记一次-Nginx-Ingress-长连接异常断开问题复盘过程.md","date":"2021-02-06T00:00:00.000Z","title":"记一次-Nginx-Ingress-长连接异常断开问题复盘过程","sidebarDepth":2,"category":"运维","tags":["nginx","ingress-controller","k8s"],"description":"TLDR nginx reload 导致 worker 重启, 而 worker_shutdown_timeout 默认值是 10s (由 nginx-ingress-controller 配置), 导致出现长连接异常断开的问题。 问题背景 最近接到用户反馈, 在 IDC 通过域名访问应用接口时, 当请求耗时到 3 分钟的时候会出现服务端不返回数据直接...","head":[["meta",{"property":"og:url","content":"https://blog.shabbywu.cn/posts/2021/02/06/%E8%AE%B0%E4%B8%80%E6%AC%A1-nginx-ingress-%E9%95%BF%E8%BF%9E%E6%8E%A5%E5%BC%82%E5%B8%B8%E6%96%AD%E5%BC%80%E9%97%AE%E9%A2%98%E5%A4%8D%E7%9B%98%E8%BF%87%E7%A8%8B.html"}],["meta",{"property":"og:site_name","content":"个人技术文章分享"}],["meta",{"property":"og:title","content":"记一次-Nginx-Ingress-长连接异常断开问题复盘过程"}],["meta",{"property":"og:description","content":"TLDR nginx reload 导致 worker 重启, 而 worker_shutdown_timeout 默认值是 10s (由 nginx-ingress-controller 配置), 导致出现长连接异常断开的问题。 问题背景 最近接到用户反馈, 在 IDC 通过域名访问应用接口时, 当请求耗时到 3 分钟的时候会出现服务端不返回数据直接..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-02-24T07:10:47.000Z"}],["meta",{"property":"article:author","content":"shabbywu"}],["meta",{"property":"article:tag","content":"nginx"}],["meta",{"property":"article:tag","content":"ingress-controller"}],["meta",{"property":"article:tag","content":"k8s"}],["meta",{"property":"article:published_time","content":"2021-02-06T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-02-24T07:10:47.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"记一次-Nginx-Ingress-长连接异常断开问题复盘过程\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2021-02-06T00:00:00.000Z\\",\\"dateModified\\":\\"2024-02-24T07:10:47.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"shabbywu\\",\\"url\\":\\"https://github.com/shabbywu\\"}]}"],["link",{"rel":"alternate","type":"application/atom+xml","href":"https://blog.shabbywu.cn/atom.xml","title":"个人技术文章分享 Atom Feed"}],["link",{"rel":"alternate","type":"application/json","href":"https://blog.shabbywu.cn/feed.json","title":"个人技术文章分享 JSON Feed"}],["link",{"rel":"alternate","type":"application/rss+xml","href":"https://blog.shabbywu.cn/rss.xml","title":"个人技术文章分享 RSS Feed"}]]},"headers":[{"level":2,"title":"TLDR","slug":"tldr","link":"#tldr","children":[]},{"level":2,"title":"问题背景","slug":"问题背景","link":"#问题背景","children":[]},{"level":2,"title":"问题分析和排查复盘","slug":"问题分析和排查复盘","link":"#问题分析和排查复盘","children":[{"level":3,"title":"访问链路梳理","slug":"访问链路梳理","link":"#访问链路梳理","children":[]},{"level":3,"title":"模拟复盘","slug":"模拟复盘","link":"#模拟复盘","children":[]},{"level":3,"title":"配置排查","slug":"配置排查","link":"#配置排查","children":[]},{"level":3,"title":"日志排查踩坑","slug":"日志排查踩坑","link":"#日志排查踩坑","children":[]},{"level":3,"title":"求助大佬, 峰回路转","slug":"求助大佬-峰回路转","link":"#求助大佬-峰回路转","children":[]}]},{"level":2,"title":"总结与展望","slug":"总结与展望","link":"#总结与展望","children":[]}],"readingTime":{"minutes":7.71,"words":2314},"filePathRelative":"_posts/sre/2021-02-06-记一次-nginx-ingress-长连接异常断开问题复盘过程.md","localizedDate":"2021年2月6日","autoDesc":true,"git":{"createdTime":1708758647000,"updatedTime":1708758647000,"contributors":[{"name":"shabbywu","email":"shabbywu@tencent.com","commits":1}]}}');export{C as comp,B as data};
