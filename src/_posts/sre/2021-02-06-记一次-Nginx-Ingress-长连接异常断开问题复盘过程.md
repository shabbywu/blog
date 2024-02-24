---
date: 2021-02-06
title: 记一次-Nginx-Ingress-长连接异常断开问题复盘过程
sidebarDepth: 2
category: 运维
tags:
-   nginx
-   ingress-controller
-   k8s

draft: false
---
## TLDR
**nginx reload** 导致 worker 重启, 而 **worker_shutdown_timeout** 默认值是 10s (由 nginx-ingress-controller 配置), 导致出现长连接异常断开的问题。

## 问题背景
最近接到用户反馈, 在 **IDC** 通过**域名**访问应用接口时, 当请求耗时到 **3** 分钟的时候会出现服务端不返回数据直接关闭连接的情况, 需要协助排查访问链路中是否有设置超时限制。

## 问题分析和排查复盘
### 访问链路梳理
据了解, 目前集群的流量是依托公司基建(腾讯云CLB)做负载均衡, 将流量打散至 nginx-ingress 运行的节点上, 流量进入集群后, 即按照 k8s 的正常访问链路(`Ingress -> Service -> Pod`)路由至具体的容器。   
为了排查是否由于 CLB 导致超时, 所以需要自查集群内的访问链路是否正常。我们知道, Service 的实现是通过 iptables 做路由规则转发, 如果 `Service -> Pod` 能连通, 那么这层就不会出现超时的情况。所以集群内部的关注点主要在 `Ingress` 和 `Pod` 两个模块。
### 模拟复盘
由于用户无法提供可以测试的现场环境, 所以我们只能在集群内搭建一个模拟超时情况的现场。这里选择了使用 `fastapi` 快速搭建超时现场。
```python
## -*- coding: utf-8 -*-
import asyncio
from fastapi import FastAPI

app = FastAPI()


@app.get("/test/timeout/{wait}")
async def sleep(wait: int):
    print("waiting", wait)
    await asyncio.sleep(wait)
    return {"timeout": False}


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, port=5000)

```
> 😁 如果想了解更多关于 FastAPI 的内容, 可以读我的另一篇文章[fastapi与依赖注入模式](/posts/2020/11/24/fastapi与依赖注入模式.html)

模拟现场搭建好后, 分别在容器内和集群内两个环境下请求该现场:
```bash
## 域名信息以脱敏, 仅供演示, 应用监听 5000 端口
~ Pod内 > curl -H "Host: ****.com" -X GET 127.0.0.1:5000/test/timeout/180
{"timeout": False}

## 域名信息以脱敏, 仅供演示, nginx-ingress 使用 NodePort 模式监听 30080 端口
~ ingress 节点上 > curl -H "Host: xxxx.com" -X GET 127.0.0.1:30080/test/timeout/180
{"timeout": False}

~ ingress 节点上 > curl -H "Host: xxxx.com" -X GET 127.0.0.1:30080/test/timeout/181
curl: (52) Empty reply from server

~ ingress 节点上 > curl -H "Host: xxxx.com" -X GET 127.0.0.1:30080/test/timeout/180
{"timeout": False}

~ ingress 节点上 > curl -H "Host: xxxx.com" -X GET 127.0.0.1:30080/test/timeout/181
curl: (52) Empty reply from server
```
意外情况如期而至, 容器内的访问能正常返回, 而使用 `nginx-ingress` 做代理转发的请求却被服务器中断了连接。  
难道我们在 `nginx-ingress` 上某个地方配置了 **180s** 超时吗？ 现在的问题就转化成是由于哪里的配置不正确导致连接被中断。
> 注: 在模拟复盘时遇上了 **偶然** 因素, 导致排查踩坑。

### 配置排查
首先进入 `nginx-ingress` 其中一个副本的容器中, 先确定配置文件的路径在哪里。
```bash
## 执行以下指令查看 nginx 的启动参数
ps -ef |grep nginx
---
## 信息以脱敏, 仅供演示
? ? ? ? ? ?    ?:?:? nginx: master process /usr/sbin/nginx -c /etc/nginx/nginx.conf
---
```
定位到 nginx 的启动配置在 `/etc/nginx/nginx.conf`, 我们直接查看该配置是否设置了超时时间。
```bash
cat /etc/nginx/nginx.conf | grep timeout
---
## 信息以脱敏, 仅供演示
proxy_connect_timeout                   5s;
proxy_send_timeout                      600s;
proxy_read_timeout                      600s;
proxy_next_upstream                     error timeout;
---
```
呃呃呃, 显而易见, 反向代理配置的时间是 600s, 但是用户反馈的是 **3** 分钟出现超时啊。情况不对劲, 得进一步排查。

### 日志排查踩坑
先继续触发一波访问记录, 方便排查日志
```bash
~ ingress 节点上 > curl -H "Host: xxxx.com" -X GET 127.0.0.1:30080/test/timeout/181?MARK=111111111111111
```
由于平台的所有日志都有配置日志采集, 这里**偷了个懒**直接在 kibana 上看日志。
```markdown
127.0.0.1 - [127.0.0.1] - - [dd/MM/yyyy:HH:mm:ss +0000] "GET /test/timeout/181?MARK=111111111111111 HTTP/1.1" 000 0 "-" "curl/7.29.0" 148 179.412 [----] aaa.bbb.ccc.ddd:5000 0 - - xxxxxx

127.0.0.1 - [127.0.0.1] - - [dd/MM/yyyy:HH:mm:ss +0000] "GET /test/timeout/181?MARK=111111111111111 HTTP/1.1" 000 0 "-" "curl/7.29.0" 148 30.932 [----] aaa.bbb.ccc.ddd:5000 0 - - xxxxxx
```
由于不清楚日志的格式, 所以还得查 nginx 中的相应配置
```bash
cat /etc/nginx/nginx.conf | grep log_format
---
## 信息以脱敏, 仅供演示
log_format upstreaminfo '$the_real_ip - [$the_real_ip] - $remote_user [$time_local] "$request" $status $body_bytes_sent "$http_referer" "$http_user_agent" $request_length $request_time [$proxy_upstream_name] $upstream_addr $upstream_response_length $upstream_response_time $upstream_status $req_id';
---
```
我们在这里可以看到两次请求的 `$request_time` 分别是 **179.412s** 和 **30.932s**, 但是由于**先入为主**的认为是存在 **3** 分钟的超时问题(用户反馈以及一直未成功访问超过180s), 忽略了这两个时间之间的差异。   
到这里排查的思路断了, 恰好又是周五快下班才收到用户反馈, 就先和用户 ~~忽~~反~~悠~~ 馈说初步定位到平台存在异常中断长连接的问题, 需要进一步排查, 溜了溜了。

### 求助大佬, 峰回路转
在小组群里同步排查进度: 问题是出自 `nginx-ingress`, 结合用户反馈和偶然的测试结果, 目前怀疑是 nginx 某个地方存在 180s 超时, 但是找不到哪里有这个配置, 下班之余也要求助一下大佬。   
接下来, 神奇的事情出现了, 大佬在晚上再次发起测试请求, 发现能突破 180s 的限制, 所以可以明确并没有 180s 超时的限制。
```bash
~ ingress 节点上 > time curl -H "Host: xxxx.com" -X GET 127.0.0.1:30080/test/timeout/200
{"timeout": False}
real 3m20.074s
user 0m0.000s
sys 0m0.008s
```
> 此刻心情如图: (￣ε(#￣)☆╰╮(￣▽￣///)

说回正事, 既然不存在超时的限制, 那么究竟是哪里有问题呢？再次发起请求, 发现网络不稳定:
```bash
~ ingress 节点上 > time curl -H "Host: xxxx.com" -X GET 127.0.0.1:30080/test/timeout/200
{"timeout": False}
real 0m14.425s
user 0m0.000s
sys 0m0.008s
```

重点来了, 大佬**没有偷懒**, 直接查看了这个 nginx 的运行日志, 有意外发现: 在请求被意外中止前, nginx-controller 输出了日志: 
```
I0205 HH:mm:ss 7 controller.go:195] Backend successfully reloaded.
I0205 HH:mm:ss 7 controller.go:212] Dynamic reconfiguration successed.
```
马上搜索相应的日志信息, 很快就在 nginx-controller 的代码里搜到[相应记录](https://github.com/kubernetes/ingress-nginx/blob/nginx-0.20.0/internal/ingress/controller/controller.go#L195)。
```go
// syncIngress collects all the pieces required to assemble the NGINX
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
	if n.cfg.DynamicConfigurationEnabled && n.IsDynamicConfigurationEnough(pcfg) {
		glog.Infof("Changes handled by the dynamic configuration, skipping backend reload.")
	} else {
        glog.Infof("Configuration changes detected, backend reload required.")
        ...
        // 关键操作
        err := n.OnUpdate(*pcfg)
        ...
        glog.Infof("Backend successfully reloaded.")
        ...
	}

	if n.cfg.DynamicConfigurationEnabled {
        // 调用 lua server 提供的 api 更新动态配置
		isFirstSync := n.runningConfig.Equal(&ingress.Configuration{})
		go func(isFirstSync bool) {
            ...
			err := configureDynamically(pcfg, n.cfg.ListenPorts.Status, n.cfg.DynamicCertificatesEnabled)
			if err == nil {
				glog.Infof("Dynamic reconfiguration succeeded.")
			} else {
				glog.Warningf("Dynamic reconfiguration failed: %v", err)
			}
		}(isFirstSync)
    }
    ...
}

```

再继续往上回溯, 马上就找到了案件的[幕后凶手](https://github.com/kubernetes/ingress-nginx/blob/nginx-0.20.0/internal/ingress/controller/nginx.go#L648)
```go
// OnUpdate is called by the synchronization loop whenever configuration
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
			diffOutput, _ := exec.Command("diff", "-u", cfgPath, tmpfile.Name()).CombinedOutput()
            glog.Infof("NGINX configuration diff:\n%v", string(diffOutput))
            ...
		}
	}

    o, err := nginxExecCommand("-s", "reload").CombinedOutput()
    ...
}
```
可以明确, `nginx-ingress-controller` 触发了 `nginx -s reload` 指令, 导致 nginx worker 进程重启。通过进一步查询文档发现, nginx 提供了关闭 worker 进程的超时时间的配置项: [worker_shutdown_timeout](http://nginx.org/en/docs/ngx_core_module.html#worker_shutdown_timeout), 而该值在 nginx-ingress-controller==0.26.0 的版本中已经从 10s 提升至 240s, 而项目中使用的 nginx-ingress-controller 版本是古早的 0.20.0 版本, 因此由 reload 引发的问题尤为显著。

## 总结与展望
由最初接到用户反馈至最后排查到问题是由于 nginx reload 导致连接关闭, 可谓是一番波折, 通过这次问题排查学到了挺多的东西:
- 复盘要小心**偶然**情况, 有时候复现出来的结果不一定是真正的结论。
- 避免被用户带偏, 如果一开始不先入为主的认为存在 **3** 分钟超时的假设, 就不一定会被 **偶然** 的情况误导, 导致排查进度受阻。
- 查日志**别偷懒**, kibana 查日志虽然方便, 但是搜索太精准时, 会忽略掉**上下文的日志**。
- `time` 指令挺好用, 可以测量特定指令执行时所需消耗的时间及系统资源等资讯。

虽然现在查明了用户连接中断的原因, 但是禁不住我的一下心血来潮。今早在 kibana 上搜索了一下 `"Changes handled by the dynamic configuration, skipping backend reload."` 和 `"Configuration changes detected, backend reload required."`。   
结果意外发现平台的 nginx-ingress-controller 每半小时平均会触发一百余次的 nginx reload。如果贸然提高 `worker_shutdown_timeout`, 可能会导致存在大量(多代)等待退出的 nginx worker, 而在等待 worker 完全替换的过程中需要消耗更多的内存。为了从根本上解决这个问题, 仍然需要查明**是什么原因导致频繁触发 nginx reload?**。
