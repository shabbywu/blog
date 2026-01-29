import{_ as r,a as c}from"./Docker-Registry-v2-auth-via-central-service-BlF2KKtw.js";import{_ as l,r as s,o as u,c as b,f as i,g as e,i as n,w as d,e as o}from"./app-C9ZkQdtL.js";const v={},m=o('<h2 id="前言" tabindex="-1"><a class="header-anchor" href="#前言"><span>前言</span></a></h2><p>现在是容器化时代，不管是开发、测试还是运维，很少有人会不知道或不会用 Docker。使用 Docker 也很简单，很多时候启动容器无非就是执行 <code>docker run {your-image-name}</code>，而构建镜像也就是执行一句 <code>docker build dockerfile .</code>的事情。<br> 也许正是由于 <strong>Docker</strong> 对实现细节封装得过于彻底，有时候会觉得我们也许只是学会了<strong>如何使用<code>Docker CLI</code></strong> , 而并非明白 Docker 是如何运行的。<br> 笔者将在『How To Build Images』系列文章讲述 <code>Docker build dockerfile .</code>相关的实现细节，本文是本系列的第三篇文章，将为各位介绍 Docker Daemon 与 Docker Registry 的交互流程和实现细节。</p><h2 id="docker-daemon-与-docker-registry-的关系" tabindex="-1"><a class="header-anchor" href="#docker-daemon-与-docker-registry-的关系"><span>Docker Daemon 与 Docker Registry 的关系</span></a></h2><p>我们平时使用的 <code>docker</code> 命令称之为 <code>Docker Cli</code>。<code>Docker Cli</code> 为用户提供了在命令行中操作镜像、容器、网络和数据卷的相关指令, 但事实上真正操作相应资源实体的进程是 <code>Docker Daemon</code>。<br><code>Docker</code> 使用的是典型的 C/S 架构, <code>Docker Daemon</code> 则是后台常驻运行的服务端组件, 负责管理宿主机中的所有 Docker 资源以及与其他 Daemon 进行通讯。<br><code>Docker Registry</code> 负责存储和分发 Docker 镜像。当我们调用 <code>docker pull</code> 和 <code>docker push</code> 时, <code>Docker Daemon</code> 将从 <code>Docker Registry</code> 提取镜像或推送镜像至 <code>Docker Registry</code>。 <img src="'+r+'" alt="Docker architecture" loading="lazy"></p><h2 id="docker-daemon-拉取镜像的流程" tabindex="-1"><a class="header-anchor" href="#docker-daemon-拉取镜像的流程"><span>Docker Daemon 拉取镜像的流程</span></a></h2>',5),h=i("code",null,"docker pull",-1),p=i("code",null,"Docker Daemon",-1),g=i("code",null,"Docker Registry",-1),f=i("code",null,"config.json(镜像配置)",-1),q=i("code",null,"manifest.json(镜像清单)",-1),k=i("code",null,"layer.tar(镜像层内容)",-1),y=i("br",null,null,-1),_=i("code",null,"Docker Daemon",-1),D=i("p",null,[e("为了解决这个问题, 需要引入另一个概念, "),i("code",null,"Docker Image Manifest"),e("。")],-1),E=i("h3",{id:"docker-image-manifest",tabindex:"-1"},[i("a",{class:"header-anchor",href:"#docker-image-manifest"},[i("span",null,"Docker Image Manifest")])],-1),T=i("p",null,[i("code",null,"Docker Image Manifest"),e(" 不同于 "),i("code",null,"manifest.json"),e(", 前者是用于描述 "),i("code",null,"Docker Registry"),e(" 中的镜像的清单文件, 而后者是描述导出镜像中内容的清单文件。")],-1),I=i("code",null,"Docker Image Manifest",-1),B={href:"https://github.com/distribution/distribution/blob/main/docs/spec/manifest-v2-1.md",target:"_blank",rel:"noopener noreferrer"},w={href:"https://github.com/distribution/distribution/blob/main/docs/spec/manifest-v2-2.md",target:"_blank",rel:"noopener noreferrer"},A=o(`<p>以下是 Schema 2 的清单样例:</p><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code>{
    &quot;schemaVersion&quot;: 2,
    &quot;mediaType&quot;: &quot;application/vnd.docker.distribution.manifest.v2+json&quot;,
    &quot;config&quot;: {
        &quot;mediaType&quot;: &quot;application/vnd.docker.container.image.v1+json&quot;,
        &quot;size&quot;: 7023,
        &quot;digest&quot;: &quot;sha256:b5b2b2c507a0944348e0303114d8d93aaaa081732b86451d9bce1f432a537bc7&quot;
    },
    &quot;layers&quot;: [
        {
            &quot;mediaType&quot;: &quot;application/vnd.docker.image.rootfs.diff.tar.gzip&quot;,
            &quot;size&quot;: 32654,
            &quot;digest&quot;: &quot;sha256:e692418e4cbaf90ca69d05a66403747baa33ee08806650b51fab815ad7fc331f&quot;
        },
        {
            &quot;mediaType&quot;: &quot;application/vnd.docker.image.rootfs.diff.tar.gzip&quot;,
            &quot;size&quot;: 16724,
            &quot;digest&quot;: &quot;sha256:3c3a4604a545cdc127456d94e421cd355bca5b528f4a9c1905b15da2eb4a4c6b&quot;
        },
        {
            &quot;mediaType&quot;: &quot;application/vnd.docker.image.rootfs.diff.tar.gzip&quot;,
            &quot;size&quot;: 73109,
            &quot;digest&quot;: &quot;sha256:ec4b8955958665577945c89419d1af06b5f7636b4ac3da7f12184802ad867736&quot;
        }
    ]
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,2),C={class:"hint-container tip"},j=i("p",{class:"hint-container-title"},"提示",-1),M=i("strong",null,"application/vnd.docker.container.image.v1+json",-1),$=i("code",null,"Config",-1),R=i("code",null,"Image JSON",-1),z=o(`<h3 id="流程总结" tabindex="-1"><a class="header-anchor" href="#流程总结"><span>流程总结</span></a></h3><p><code>Docker Registry</code> 使用 <strong>数字摘要(digest)</strong> 定位镜像层和镜像配置等镜像内容, 而 <code>Docker Image Manifest</code> 又描述了镜像配置和镜像层的数字摘要以及相应的文件类型, 最后 <code>Docker Daemon</code> 只需要根据清单逐一下载解析即可。<br> 简而言之, <code>docker pull</code> 的流程可概况如下:</p><div class="language-plantuml line-numbers-mode" data-ext="plantuml" data-title="plantuml"><pre class="language-plantuml"><code><img src="https://www.plantuml.com/plantuml/svg/V4yrOkj04Ett56Qs-u_12uHRas0DGcCPPcPcPkRaCfwLT8kOmwbsP-PXfHppIR5uD8Bo7_Gxo0V2bAGJuf68pkFn_46_QmkRMXyLvJbTvdv8LzpKKmoMOr9QH_fxONXAcro0zc5oqmc3atyGaYY1yiLqlyb0hxPw1tV3wlOwMHefeE2qBGl1jCv65WvWuGIkp-1m1XPsbFaR61bGvZhAk0gxBiPIN0wvfpoCPs5szDlX82ktPF185yGC9STqcPj-zV6np86kJZYwTJYowSdAghOtKCHbvo8lIWMnhp4jKBfiB1ZgBrFLxlDSahPiaYDup1QX8ZA5Z5LS38jngeN5CUftGnWBsGCNn7IfPfB54KfdKvzdo48lcR-0ZRaF9JW-bkrmjfgzP-wwxEZd4bhdeF9uP0lm78qPJqZcEVkNTGfPl-My3CCtm6ZEB-1o0BeT6ES0
"></code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h2 id="docker-daemon-推送镜像的流程" tabindex="-1"><a class="header-anchor" href="#docker-daemon-推送镜像的流程"><span>Docker Daemon 推送镜像的流程</span></a></h2><p>推送镜像的工作流程与拉取镜像完全相反。<code>Docker Daemon</code> 首先创建镜像清单, 再需要将所有镜像层推送至 <code>Docker Registry</code>, 只有当所有镜像层完全推送至镜像仓库后, 再将镜像配置上传至镜像仓库, 最后才推送镜像清单, <code>docker push</code> 的流程可概况如下:</p><div class="language-plantuml line-numbers-mode" data-ext="plantuml" data-title="plantuml"><pre class="language-plantuml"><code><img src="https://www.plantuml.com/plantuml/svg/N4v3WWD15DtNAM8d-p4lCDwEkX0qmzNOjctRkan-TVeKOwy-7WkrQ9qQZKN2w7r1sOrIGqXGJN9CewP08923iai_FgLrGaGIJT0z1tUtniGyj0tnwmuOcCX1I1LaeIvgokRzFSRABTmEyS5jexdbWmKdhQyKXaskJwToWJ0jggPCVFe8XZVXwXGEfc5-Mv-xXk5-VRRzMrVWDaMf89fShpGtoavVzwRlbxzHwEo0mvjCrvdfdt4E4iAQWAn5OfGfCQ66igYGNH5YyYiWDZByrJT1MLWmkJ9Fqto-Xy-Tm_hiltHHYffS_7Jb5K_VThhHtmv6nu3-SEXga4JCI22eIQBxPTXSWz2423IiwefByWku781E1CO70000
"></code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h2 id="流程之外但必不可少的步骤-用户认证" tabindex="-1"><a class="header-anchor" href="#流程之外但必不可少的步骤-用户认证"><span>流程之外但必不可少的步骤: 用户认证</span></a></h2><p>到目前为止, 我们已经完整展示了拉取镜像和推送镜像的操作流程, 但是还有一个至关重要的步骤还未介绍, 那就是<strong>用户认证</strong>。<br> Docker Registry 采用中央认证服务实现用户身份认证, 具体的认证流程如下所示: <img src="`+c+'" alt="v2-auth-via-central-service" loading="lazy"></p><ol><li><code>Docker Daemon</code> 尝试进行 pull/push 操作</li><li>如果 <code>Docker Registry</code> 需要进行用户认证, 那么就应该返回 <code>HTTP 401 Unauthorized</code> 的响应, 并在返回头里描述如何进行用户认证(基于 WWW-Authenticate 协议)</li><li><code>Docker Daemon</code> 向中央认证服务进行用户认证</li><li>中央认证服务向 <code>Docker Daemon</code> 返回一个 <code>Bearer token</code>, 代表用户的身份</li><li><code>Docker Daemon</code> 重试 <strong>步骤1</strong> 中发送的请求, 并在请求头中带上 <strong>步骤4</strong> 中返回的 <code>Bearer token</code></li><li><code>Docker Registry</code> 认证请求头中附带的 <code>Bearer token</code>, 验证通过后即可正常相应</li></ol><h2 id="小试牛刀" tabindex="-1"><a class="header-anchor" href="#小试牛刀"><span>小试牛刀</span></a></h2>',10),x=o(`<h3 id="_1-创建镜像清单-docker-image-manifest" tabindex="-1"><a class="header-anchor" href="#_1-创建镜像清单-docker-image-manifest"><span>1. 创建镜像清单(Docker Image Manifest)</span></a></h3><p>重新根据上一篇文章记载的流程构建这个镜像, 并在计算 <code>镜像配置(config.json)</code> 与 <code>镜像层 (layer.tar)</code> 的 sha256 数字摘要后, 即可编写<code>镜像清单(Docker Image Manifest)</code>, 得如下所示的 JSON 文件:</p><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code>{
    &quot;schemaVersion&quot;: 2,
    &quot;mediaType&quot;: &quot;application/vnd.docker.distribution.manifest.v2+json&quot;,
    &quot;config&quot;: {
        &quot;mediaType&quot;: &quot;application/vnd.docker.container.image.v1+json&quot;,
        &quot;size&quot;: 546,
        &quot;digest&quot;: &quot;sha256:2bd297f395ef7193402fbf58b1010655c7bf27b22c38545a63c71af402f73dc5&quot;
    },
    &quot;layers&quot;: [
        {
            &quot;mediaType&quot;: &quot;application/vnd.docker.image.rootfs.diff.tar.gzip&quot;,
            &quot;size&quot;: 10240,
            &quot;digest&quot;: &quot;sha256:cc668e407245ebdacbb7ac6d5ead798556adb5aebfcdd7fa2ca777bed3a83fed&quot;
        }
    ]
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-上传镜像层与镜像配置至-docker-registry" tabindex="-1"><a class="header-anchor" href="#_2-上传镜像层与镜像配置至-docker-registry"><span>2. 上传镜像层与镜像配置至 Docker Registry</span></a></h3>`,4),Z={href:"https://github.com/distribution/distribution/blob/main/docs/spec/api.md#monolithic-upload",target:"_blank",rel:"noopener noreferrer"},S=o(`<div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>## 涉及的环境变量:
## - your_username: DockerHub 的账号
## - your_password: DockerHub 账号的密码
## - your_token: 认证接口返回的 token 或 access_token

## 【用户认证】发起上传镜像配置操作
➜ curl -X POST &quot;https://registry.hub.docker.com/v2/\${your_username}/runc-hello/blobs/uploads/&quot; -v

## 返回 401 Unauthorized
## &lt; HTTP/1.1 401 Unauthorized
## &lt; docker-distribution-api-version: registry/2.0
## &lt; www-authenticate: Bearer realm=&quot;https://auth.docker.io/token&quot;,service=&quot;registry.docker.io&quot;,scope=&quot;repository:\${your_username}/runc-hello:pull,push&quot;

## 【用户认证】进行用户认证
➜ curl -u &quot;\${your_username}:\${your_password}&quot; &quot;https://auth.docker.io/token?service=registry.docker.io&amp;scope=repository:\${your_username}/runc-hello:pull,push&quot;
## {
##  &quot;token&quot;: &quot;...&quot;,
##  &quot;access_token&quot;: &quot;...&quot;,
##  &quot;expires_in&quot;: 300,
##  &quot;issued_at&quot;: &quot;2021-12-07T01:50:05.654533932Z&quot;
## }

## 【上传镜像配置】重新发起上传镜像配置操作
➜ curl -H &quot;Authorization: Bearer \${your_token}&quot; -X POST &quot;https://registry.hub.docker.com/v2/\${your_username}/runc-hello/blobs/uploads/&quot; -v
## &lt; HTTP/1.1 202 Accepted
## &lt; content-length: 0
## &lt; docker-distribution-api-version: registry/2.0
## &lt; docker-upload-uuid: 53231064-74b5-48d5-8cbd-5f810fa99a0c
## &lt; location: https://registry.hub.docker.com/v2/435495971/runc-hello/blobs/uploads/53231064-74b5-48d5-8cbd-5f810fa99a0c?_state=S8Kt2Fx6i-CX-C7j4kS9RahBhxtS5BySKuJoaKup6QJ7Ik5hbWUiOiI0MzU0OTU5NzEvcnVuYy1oZWxsbyIsIlVVSUQiOiI1MzIzMTA2NC03NGI1LTQ4ZDUtOGNiZC01ZjgxMGZhOTlhMGMiLCJPZmZzZXQiOjAsIlN0YXJ0ZWRBdCI6IjIwMjEtMTItMDdUMDI6NDE6MjEuODgwMDcwOTI5WiJ9

## 【上传镜像配置】开始上传镜像配置内容
➜ curl -H &quot;Authorization: Bearer \${your_token}&quot; -X PUT &quot;https://registry.hub.docker.com/v2/\${your_username}/runc-hello/blobs/uploads/53231064-74b5-48d5-8cbd-5f810fa99a0c?_state=S8Kt2Fx6i-CX-C7j4kS9RahBhxtS5BySKuJoaKup6QJ7Ik5hbWUiOiI0MzU0OTU5NzEvcnVuYy1oZWxsbyIsIlVVSUQiOiI1MzIzMTA2NC03NGI1LTQ4ZDUtOGNiZC01ZjgxMGZhOTlhMGMiLCJPZmZzZXQiOjAsIlN0YXJ0ZWRBdCI6IjIwMjEtMTItMDdUMDI6NDE6MjEuODgwMDcwOTI5WiJ9&amp;digest=sha256:2bd297f395ef7193402fbf58b1010655c7bf27b22c38545a63c71af402f73dc5&quot; --upload-file config.json -v
## 上传成功, 返回 201
## &lt; HTTP/1.1 201 Created
## &lt; content-length: 0
## &lt; docker-content-digest: sha256:2bd297f395ef7193402fbf58b1010655c7bf27b22c38545a63c71af402f73dc5


## 【上传镜像层】发起上传镜像层操作
➜ curl -H &quot;Authorization: Bearer \${your_token}&quot; -X POST &quot;https://registry.hub.docker.com/v2/\${your_username}/runc-hello/blobs/uploads/&quot; -v
## &lt; HTTP/1.1 202 Accepted
## &lt; content-length: 0
## &lt; docker-distribution-api-version: registry/2.0
## &lt; docker-upload-uuid: 34efca43-27ed-4806-a74e-6cbea2d222f2
## &lt; location: https://registry.hub.docker.com/v2/435495971/runc-hello/blobs/uploads/34efca43-27ed-4806-a74e-6cbea2d222f2?_state=O7lkfqKiEF-Ryqhms-_CnCsmd76kDtt_HjuprAebwJN7Ik5hbWUiOiI0MzU0OTU5NzEvcnVuYy1oZWxsbyIsIlVVSUQiOiIzNGVmY2E0My0yN2VkLTQ4MDYtYTc0ZS02Y2JlYTJkMjIyZjIiLCJPZmZzZXQiOjAsIlN0YXJ0ZWRBdCI6IjIwMjEtMTItMDdUMDI6NDY6MzEuNTY2ODMwNjI3WiJ9

## 【上传镜像层】开始上传镜像层内容
➜ curl -H &quot;Authorization: Bearer \${your_token}&quot; -X PUT &quot;https://registry.hub.docker.com/v2/\${your_username}/runc-hello/blobs/uploads/34efca43-27ed-4806-a74e-6cbea2d222f2?_state=O7lkfqKiEF-Ryqhms-_CnCsmd76kDtt_HjuprAebwJN7Ik5hbWUiOiI0MzU0OTU5NzEvcnVuYy1oZWxsbyIsIlVVSUQiOiIzNGVmY2E0My0yN2VkLTQ4MDYtYTc0ZS02Y2JlYTJkMjIyZjIiLCJPZmZzZXQiOjAsIlN0YXJ0ZWRBdCI6IjIwMjEtMTItMDdUMDI6NDY6MzEuNTY2ODMwNjI3WiJ9&amp;digest=sha256:cc668e407245ebdacbb7ac6d5ead798556adb5aebfcdd7fa2ca777bed3a83fed&quot; --upload-file layer.tar -v
## 上传成功, 返回 201
## &lt; HTTP/1.1 201 Created
## &lt; content-length: 0
## &lt; docker-content-digest: sha256:cc668e407245ebdacbb7ac6d5ead798556adb5aebfcdd7fa2ca777bed3a83fed
## &lt; docker-distribution-api-version: registry/2.0
## &lt; location: https://registry.hub.docker.com/v2/\${your_username}/runc-hello/blobs/sha256:cc668e407245ebdacbb7ac6d5ead798556adb5aebfcdd7fa2ca777bed3a83fed
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-上传镜像清单" tabindex="-1"><a class="header-anchor" href="#_3-上传镜像清单"><span>3. 上传镜像清单</span></a></h3><p>Docker 官方文档里的样例使用的是 Manifest Schema 1, 包含的内容很复杂, 但事实上用 Schema 2 也同样能创建镜像清单。</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>➜ curl -H &quot;Authorization: Bearer \${your_token}&quot; -X PUT &quot;https://registry.hub.docker.com/v2/\${your_username}/runc-hello/manifests/latest&quot; -H &quot;Content-Type: application/vnd.docker.distribution.manifest.v2+json&quot; -v -d &#39;{
    &quot;schemaVersion&quot;: 2,
    &quot;mediaType&quot;: &quot;application/vnd.docker.distribution.manifest.v2+json&quot;,
    &quot;config&quot;: {
        &quot;mediaType&quot;: &quot;application/vnd.docker.container.image.v1+json&quot;,
        &quot;size&quot;: 546,
        &quot;digest&quot;: &quot;sha256:2bd297f395ef7193402fbf58b1010655c7bf27b22c38545a63c71af402f73dc5&quot;
    },
    &quot;layers&quot;: [
        {
            &quot;mediaType&quot;: &quot;application/vnd.docker.image.rootfs.diff.tar.gzip&quot;,
            &quot;size&quot;: 10240,
            &quot;digest&quot;: &quot;sha256:cc668e407245ebdacbb7ac6d5ead798556adb5aebfcdd7fa2ca777bed3a83fed&quot;
        }
    ]
}&#39;
## 上传成功, 返回 201
## &lt; HTTP/1.1 201 Created
## &lt; docker-content-digest: sha256:c4c42af74cf13c704100d9a7583d106d90f737ffb7dc12593022884986fc41dc
## &lt; docker-distribution-api-version: registry/2.0
## &lt; location: https://registry.hub.docker.com/v2/\${your_username}/runc-hello/manifests/sha256:c4c42af74cf13c704100d9a7583d106d90f737ffb7dc12593022884986fc41dc
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_4-验证" tabindex="-1"><a class="header-anchor" href="#_4-验证"><span>4. 验证</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>➜ docker pull 435495971/runc-hello:latest
## latest: Pulling from 435495971/runc-hello
## cc668e407245: Pull complete
## Digest: sha256:c4c42af74cf13c704100d9a7583d106d90f737ffb7dc12593022884986fc41dc
## Status: Downloaded newer image for 435495971/runc-hello:latest
## docker.io/435495971/runc-hello:latest

➜ docker run --rm 435495971/runc-hello:latest
Hello runc!
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span>总结</span></a></h2>`,7),O=i("code",null,"docker pull",-1),N=i("code",null,"docker push",-1),P=i("code",null,"docker build dockerfile .",-1),H=o(`<h2 id="附录" tabindex="-1"><a class="header-anchor" href="#附录"><span>附录</span></a></h2><h3 id="手把手教你从-docker-registry-拉取镜像" tabindex="-1"><a class="header-anchor" href="#手把手教你从-docker-registry-拉取镜像"><span>手把手教你从 Docker Registry 拉取镜像</span></a></h3><p>由于篇幅问题, 正文的「小试牛刀」环节只展示了推送镜像的操作, 在这里继续介绍 ”拉取镜像“ 涉及的操作。</p><h4 id="_1-下载镜像清单" tabindex="-1"><a class="header-anchor" href="#_1-下载镜像清单"><span>1. 下载镜像清单</span></a></h4><p>在下载镜像清单时, Docker Registry 默认返回的是 <code>Schema 1</code>, 如果希望接收 <code>Schema 2</code> 版本的 Manifest, 则需要指定 <code>Accept: application/vnd.docker.distribution.manifest.v2+json</code>。</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>➜ curl -H &quot;Accept: application/vnd.docker.distribution.manifest.v2+json&quot; -H &quot;Authorization: Bearer \${your_token}&quot; &quot;https://registry.hub.docker.com/v2/\${your_username}/runc-hello/manifests/latest&quot;
## {
##     &quot;schemaVersion&quot;: 2,
##     &quot;mediaType&quot;: &quot;application/vnd.docker.distribution.manifest.v2+json&quot;,
##     &quot;config&quot;: {
##         &quot;mediaType&quot;: &quot;application/vnd.docker.container.image.v1+json&quot;,
##         &quot;size&quot;: 546,
##         &quot;digest&quot;: &quot;sha256:2bd297f395ef7193402fbf58b1010655c7bf27b22c38545a63c71af402f73dc5&quot;
##     },
##     &quot;layers&quot;: [
##         {
##             &quot;mediaType&quot;: &quot;application/vnd.docker.image.rootfs.diff.tar.gzip&quot;,
##             &quot;size&quot;: 10240,
##             &quot;digest&quot;: &quot;sha256:cc668e407245ebdacbb7ac6d5ead798556adb5aebfcdd7fa2ca777bed3a83fed&quot;
##         }
##     ]
## }
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_2-下载镜像配置与镜像层" tabindex="-1"><a class="header-anchor" href="#_2-下载镜像配置与镜像层"><span>2. 下载镜像配置与镜像层</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>## 下载镜像配置
➜ curl -H &quot;Authorization: Bearer \${your_token}&quot; &quot;https://registry.hub.docker.com/v2/\${your_username}/runc-hello/blobs/sha256:2bd297f395ef7193402fbf58b1010655c7bf27b22c38545a63c71af402f73dc5&quot; -o 2bd297f395ef7193402fbf58b1010655c7bf27b22c38545a63c71af402f73dc5 -L

## 验证镜像配置
➜ cat 2bd297f395ef7193402fbf58b1010655c7bf27b22c38545a63c71af402f73dc5
{&quot;architecture&quot;:&quot;amd64&quot;,&quot;config&quot;:{&quot;User&quot;:&quot;&quot;,&quot;Tty&quot;:false,&quot;Env&quot;:[&quot;PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin&quot;],&quot;Cmd&quot;:[&quot;/hello&quot;],&quot;Volumes&quot;:null,&quot;WorkingDir&quot;:&quot;/&quot;,&quot;Entrypoint&quot;:null,&quot;Labels&quot;:null},&quot;created&quot;:&quot;1970-01-01T00:00:00.0Z&quot;,&quot;docker_version&quot;:&quot;20.10.5&quot;,&quot;history&quot;:[{&quot;created&quot;:&quot;1970-01-01T00:00:00.0Z&quot;,&quot;created_by&quot;:&quot;nasm hello.nasm -f elf64 -o hello.o &amp;&amp; ld hello.o -o hello &amp;&amp; cp hello /hello&quot;}],&quot;os&quot;:&quot;linux&quot;,&quot;rootfs&quot;:{&quot;type&quot;:&quot;layers&quot;,&quot;diff_ids&quot;:[&quot;sha256:cc668e407245ebdacbb7ac6d5ead798556adb5aebfcdd7fa2ca777bed3a83fed&quot;]}}

## 下载镜像层
➜ curl -H &quot;Authorization: Bearer \${your_token}&quot; &quot;https://registry.hub.docker.com/v2/\${your_username}/runc-hello/blobs/sha256:cc668e407245ebdacbb7ac6d5ead798556adb5aebfcdd7fa2ca777bed3a83fed&quot; -o cc668e407245ebdacbb7ac6d5ead798556adb5aebfcdd7fa2ca777bed3a83fed -L

## 验证镜像层
➜ tar -tf cc668e407245ebdacbb7ac6d5ead798556adb5aebfcdd7fa2ca777bed3a83fed
hello
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_3-存储镜像至特定目录" tabindex="-1"><a class="header-anchor" href="#_3-存储镜像至特定目录"><span>3. 存储镜像至特定目录</span></a></h4><p>虽然 Docker Registry 的接口简单, 但是 Docker Daemon 本身还需要将对应的文件存储到特定的目录, 具体的流程包括:</p><ul><li>存储镜像配置至 <code>graph</code> 目录下的 <code>image/\${storage_driver}/imagedb/content/sha256/</code></li><li>解压镜像层内容至 <code>graph</code> 目录下的 <code>\${storage_driver}/\${cache_id}</code> 和</li><li>存储镜像层记录至 <code>graph</code> 目录下的 <code>image/\${storage_driver}/layerdb/content/sha256/</code></li><li>记录镜像与标签的关联关系至 <code>graph</code> 目录下的 <code>image/\${storage_driver}/repositories.json</code></li></ul><p>以下演示对应的操作:</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>## 提取当前的 graph 路径
➜ graph=\`docker info|grep -Eo &quot;Docker Root Dir: .*&quot; | sed -r &quot;s/Docker Root Dir: (.*)/\\1/g&quot;\`

## 提取 Storage Driver 类型
➜ storage_driver=\`docker info|grep -Eo &quot;Storage Driver: .*&quot; | sed -r &quot;s/Storage Driver: (.*)/\\1/g&quot;\`

## 存储镜像配置
➜ cp 2bd297f395ef7193402fbf58b1010655c7bf27b22c38545a63c71af402f73dc5 &quot;\${graph}/image/\${storage_driver}/imagedb/content/sha256/2bd297f395ef7193402fbf58b1010655c7bf27b22c38545a63c71af402f73dc5&quot;

## 构建镜像层内容
## 1. 生成随机 cache-id
➜ cache_id=\`cat /proc/sys/kernel/random/uuid | md5sum | awk &#39;{print $1}&#39;\`
## 2. 创建映射目录
➜ mkdir -p &quot;\${graph}/\${storage_driver}/\${cache_id}&quot;
➜ touch &quot;\${graph}/\${storage_driver}/\${cache_id}/committed&quot;
➜ mkdir &quot;\${graph}/\${storage_driver}/\${cache_id}/diff&quot;
## 3. 解压镜像层至 diff 目录
➜ tar -xf cc668e407245ebdacbb7ac6d5ead798556adb5aebfcdd7fa2ca777bed3a83fed -C &quot;\${graph}/\${storage_driver}/\${cache_id}/diff&quot;
## 4. 生成短 ID (26位长)
➜ lid=\`cat /proc/sys/kernel/random/uuid | md5sum | awk &#39;{print substr($1,0,27)}&#39;\`
## 5. 创建层映射
➜ ln -s &quot;../\${cache_id}/diff&quot; &quot;\${graph}/\${storage_driver}/l/\${lid}&quot; 
## 6. 记录短映射ID
➜ echo -n &quot;$lid&quot; &gt; &quot;\${graph}/\${storage_driver}/\${cache_id}/link&quot;


## 构建镜像层内容(索引)
➜ mkdir -p &quot;\${graph}/image/\${storage_driver}/layerdb/sha256/cc668e407245ebdacbb7ac6d5ead798556adb5aebfcdd7fa2ca777bed3a83fed&quot;
## 1. 记录 diff-id
➜ echo -n &quot;sha256:cc668e407245ebdacbb7ac6d5ead798556adb5aebfcdd7fa2ca777bed3a83fed&quot; &gt; &quot;\${graph}/image/\${storage_driver}/layerdb/sha256/cc668e407245ebdacbb7ac6d5ead798556adb5aebfcdd7fa2ca777bed3a83fed/diff&quot;
## 2. 记录镜像层大小
➜ echo -n \`stat &quot;\${graph}/\${storage_driver}/\${cache_id}/diff/hello&quot; --printf &#39;%s&#39;\` &gt; &quot;\${graph}/image/\${storage_driver}/layerdb/sha256/cc668e407245ebdacbb7ac6d5ead798556adb5aebfcdd7fa2ca777bed3a83fed/size&quot;
## 3. 记录短映射 ID
➜ echo -n &quot;\${cache_id}&quot; &gt; &quot;\${graph}/image/\${storage_driver}/layerdb/sha256/cc668e407245ebdacbb7ac6d5ead798556adb5aebfcdd7fa2ca777bed3a83fed/cache-id&quot;

## 记录镜像索引
➜ python -c &quot;import json;fh=open(&#39;\${graph}/image/\${storage_driver}/repositories.json&#39;);repositories=json.load(fh);repositories[&#39;Repositories&#39;][&#39;hello-runc&#39;]={&#39;hello-runc:latest&#39;: &#39;sha256:2bd297f395ef7193402fbf58b1010655c7bf27b22c38545a63c71af402f73dc5&#39;};print(repositories);fh=open(&#39;\${graph}/image/\${storage_driver}/repositories.json&#39;, mode=&#39;w&#39;);json.dump(repositories, fh);&quot;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_4-验证-1" tabindex="-1"><a class="header-anchor" href="#_4-验证-1"><span>4. 验证</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>## 只有重启 Docker Daemon 进程, 镜像才会被正确识别。
➜ docker images
REPOSITORY   TAG       IMAGE ID   CREATED   SIZE

## 重启 Docker Daemon
➜ systemctl restart docker

➜ docker images
REPOSITORY   TAG       IMAGE ID       CREATED        SIZE
hello-runc   latest    2bd297f395ef   51 years ago   1.02kB

➜ docker run --rm hello-runc
Hello runc!
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,15);function J(V,W){const a=s("RouteLink"),t=s("ExternalLinkIcon");return u(),b("div",null,[m,i("p",null,[e("正如前言, 当在命令行执行 "),h,e(" 时, 实际上是让 "),p,e(" 往 "),g,e(" 拉取所需的镜像。在笔者上一篇文章"),n(a,{to:"/posts/2021/04/01/how-to-build-image-%E4%BB%8E-0-%E5%BC%80%E5%A7%8B%E5%B8%A6%E4%BD%A0%E5%BE%92%E6%89%8B%E6%9E%84%E5%BB%BA-docker-%E9%95%9C%E5%83%8F.html#%E5%BD%92%E6%A1%A3%E5%B0%81%E5%8C%85"},{default:d(()=>[e("『从 0 开始带你徒手构建 Docker 镜像』")]),_:1}),e("曾经展示过构建镜像的过程, 那么镜像是否就是一个包含了 "),f,e(", "),q,e(", "),k,e(" 的 Tar 归档包呢？")]),i("p",null,[e("答案是否定的, Docker Registry 在分发镜像时是按镜像层为单元进行分发, 而并非直接分发镜像本身。"),y,e(" 但是这又引入了另一个问题, 在笔者的另一篇文章"),n(a,{to:"/posts/2021/01/31/how-to-build-images-docker-%E9%95%9C%E5%83%8F%E8%A7%84%E8%8C%83.html"},{default:d(()=>[e("『Docker 镜像规范 v1.2』")]),_:1}),e("描述的镜像都是基于一定的文件目录结构编排的, 如果需要按镜像层进行分发, 那 "),_,e(" 是如何知道从哪里下载哪个镜像层呢？")]),D,E,T,i("p",null,[e("目前 Docker Registry 共支持两个不同格式的 "),I,e(", 分别为 "),i("a",B,[e("Image Manifest Version 2, Schema 1"),n(t)]),e(" 和 "),i("a",w,[e("Image Manifest Version 2, Schema 2"),n(t)]),e("。")]),A,i("div",C,[j,i("p",null,[e("值得注意的是, "),M,e(" 对应的类型即是在"),n(a,{to:"/posts/2021/01/31/how-to-build-images-docker-%E9%95%9C%E5%83%8F%E8%A7%84%E8%8C%83.html"},{default:d(()=>[e("『Docker 镜像规范 v1.2』")]),_:1}),e("中介绍的 "),$,e("(又被称之为 "),R,e(")。")])]),z,i("p",null,[e("在笔者上一篇文章"),n(a,{to:"/posts/2021/04/01/how-to-build-image-%E4%BB%8E-0-%E5%BC%80%E5%A7%8B%E5%B8%A6%E4%BD%A0%E5%BE%92%E6%89%8B%E6%9E%84%E5%BB%BA-docker-%E9%95%9C%E5%83%8F.html#%E5%BD%92%E6%A1%A3%E5%B0%81%E5%8C%85"},{default:d(()=>[e("『从 0 开始带你徒手构建 Docker 镜像』")]),_:1}),e("曾经构建了一个可运行的镜像, 现在我们尝试将该镜像推送至官方的 Docker Registry -- DockerHub。")]),x,i("p",null,[e("根据"),i("a",Z,[e("接口文档"),n(t)]),e(", 我们采用整体上传的方式将镜像层与镜像配置推送至 Docker Registry。")]),S,i("p",null,[e("这篇文章是『How To Build Images』系列的第三篇，首先介绍了 Docker Daemon 与 Docker Registry 之间的关系, 再详细介绍了 "),O,e(" 与 "),N,e(" 背后隐藏的操作细节, 最后以上一篇文章"),n(a,{to:"/posts/2021/04/01/how-to-build-image-%E4%BB%8E-0-%E5%BC%80%E5%A7%8B%E5%B8%A6%E4%BD%A0%E5%BE%92%E6%89%8B%E6%9E%84%E5%BB%BA-docker-%E9%95%9C%E5%83%8F.html#%E5%BD%92%E6%A1%A3%E5%B0%81%E5%8C%85"},{default:d(()=>[e("『从 0 开始带你徒手构建 Docker 镜像』")]),_:1}),e("曾经构建了一个可运行的镜像为例子, 完整演示了推送镜像至 Dockerhub 的步骤。到目前为止, 我们已经掌握了镜像分发和上传的基本知识, 本系列的下一篇文章将为大家剖析 "),P,e(" 背后被隐藏的细节, 同时也将介绍 Google 提出的一个在容器内构建镜像的方案(kaniko)。")]),H])}const Y=l(v,[["render",J],["__file","how-to-build-image-手把手教你如何推镜像至-docker-registry.html.vue"]]),U=JSON.parse('{"path":"/posts/2021/12/05/how-to-build-image-%E6%89%8B%E6%8A%8A%E6%89%8B%E6%95%99%E4%BD%A0%E5%A6%82%E4%BD%95%E6%8E%A8%E9%95%9C%E5%83%8F%E8%87%B3-docker-registry.html","title":"How To Build Images:手把手教你如何访问 Docker Registry","lang":"zh-CN","frontmatter":{"draft":false,"permalinkPattern":"/posts/:year/:month/:day/:slug.html","type":"post","filePathRelative":"_posts/container/2021-12-05-How To Build Image-手把手教你如何推镜像至 Docker Registry.md","date":"2021-12-05T00:00:00.000Z","title":"How To Build Images:手把手教你如何访问 Docker Registry","sidebarDepth":2,"category":"容器技术","tags":["docker","build"],"description":"前言 现在是容器化时代，不管是开发、测试还是运维，很少有人会不知道或不会用 Docker。使用 Docker 也很简单，很多时候启动容器无非就是执行 docker run {your-image-name}，而构建镜像也就是执行一句 docker build dockerfile .的事情。 也许正是由于 Docker 对实现细节封装得过于彻底，有时候...","head":[["link",{"rel":"alternate","hreflang":"en-us","href":"https://blog.shabbywu.cn/en/posts/2021/12/05/how-to-build-image-%E6%89%8B%E6%8A%8A%E6%89%8B%E6%95%99%E4%BD%A0%E5%A6%82%E4%BD%95%E6%8E%A8%E9%95%9C%E5%83%8F%E8%87%B3-docker-registry.html"}],["meta",{"property":"og:url","content":"https://blog.shabbywu.cn/posts/2021/12/05/how-to-build-image-%E6%89%8B%E6%8A%8A%E6%89%8B%E6%95%99%E4%BD%A0%E5%A6%82%E4%BD%95%E6%8E%A8%E9%95%9C%E5%83%8F%E8%87%B3-docker-registry.html"}],["meta",{"property":"og:site_name","content":"个人技术文章分享"}],["meta",{"property":"og:title","content":"How To Build Images:手把手教你如何访问 Docker Registry"}],["meta",{"property":"og:description","content":"前言 现在是容器化时代，不管是开发、测试还是运维，很少有人会不知道或不会用 Docker。使用 Docker 也很简单，很多时候启动容器无非就是执行 docker run {your-image-name}，而构建镜像也就是执行一句 docker build dockerfile .的事情。 也许正是由于 Docker 对实现细节封装得过于彻底，有时候..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:image","content":"https://blog.shabbywu.cn/img/DockerCS架构.png"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:locale:alternate","content":"en-US"}],["meta",{"property":"og:updated_time","content":"2024-03-10T11:33:17.000Z"}],["meta",{"name":"twitter:card","content":"summary_large_image"}],["meta",{"name":"twitter:image:alt","content":"How To Build Images:手把手教你如何访问 Docker Registry"}],["meta",{"property":"article:author","content":"shabbywu"}],["meta",{"property":"article:tag","content":"docker"}],["meta",{"property":"article:tag","content":"build"}],["meta",{"property":"article:published_time","content":"2021-12-05T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-03-10T11:33:17.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"How To Build Images:手把手教你如何访问 Docker Registry\\",\\"image\\":[\\"https://blog.shabbywu.cn/img/DockerCS架构.png\\",\\"https://blog.shabbywu.cn/img/Docker-Registry-v2-auth-via-central-service.png\\"],\\"datePublished\\":\\"2021-12-05T00:00:00.000Z\\",\\"dateModified\\":\\"2024-03-10T11:33:17.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"shabbywu\\",\\"url\\":\\"https://github.com/shabbywu\\"}]}"],["link",{"rel":"alternate","type":"application/atom+xml","href":"https://blog.shabbywu.cn/atom.xml","title":"个人技术文章分享 Atom Feed"}],["link",{"rel":"alternate","type":"application/json","href":"https://blog.shabbywu.cn/feed.json","title":"个人技术文章分享 JSON Feed"}],["link",{"rel":"alternate","type":"application/rss+xml","href":"https://blog.shabbywu.cn/rss.xml","title":"个人技术文章分享 RSS Feed"}]]},"headers":[{"level":2,"title":"前言","slug":"前言","link":"#前言","children":[]},{"level":2,"title":"Docker Daemon 与 Docker Registry 的关系","slug":"docker-daemon-与-docker-registry-的关系","link":"#docker-daemon-与-docker-registry-的关系","children":[]},{"level":2,"title":"Docker Daemon 拉取镜像的流程","slug":"docker-daemon-拉取镜像的流程","link":"#docker-daemon-拉取镜像的流程","children":[{"level":3,"title":"Docker Image Manifest","slug":"docker-image-manifest","link":"#docker-image-manifest","children":[]},{"level":3,"title":"流程总结","slug":"流程总结","link":"#流程总结","children":[]}]},{"level":2,"title":"Docker Daemon 推送镜像的流程","slug":"docker-daemon-推送镜像的流程","link":"#docker-daemon-推送镜像的流程","children":[]},{"level":2,"title":"流程之外但必不可少的步骤: 用户认证","slug":"流程之外但必不可少的步骤-用户认证","link":"#流程之外但必不可少的步骤-用户认证","children":[]},{"level":2,"title":"小试牛刀","slug":"小试牛刀","link":"#小试牛刀","children":[{"level":3,"title":"1. 创建镜像清单(Docker Image Manifest)","slug":"_1-创建镜像清单-docker-image-manifest","link":"#_1-创建镜像清单-docker-image-manifest","children":[]},{"level":3,"title":"2. 上传镜像层与镜像配置至 Docker Registry","slug":"_2-上传镜像层与镜像配置至-docker-registry","link":"#_2-上传镜像层与镜像配置至-docker-registry","children":[]},{"level":3,"title":"3. 上传镜像清单","slug":"_3-上传镜像清单","link":"#_3-上传镜像清单","children":[]},{"level":3,"title":"4. 验证","slug":"_4-验证","link":"#_4-验证","children":[]}]},{"level":2,"title":"总结","slug":"总结","link":"#总结","children":[]},{"level":2,"title":"附录","slug":"附录","link":"#附录","children":[{"level":3,"title":"手把手教你从 Docker Registry 拉取镜像","slug":"手把手教你从-docker-registry-拉取镜像","link":"#手把手教你从-docker-registry-拉取镜像","children":[]}]}],"readingTime":{"minutes":10.96,"words":3289},"filePathRelative":"_posts/container/2021-12-05-how-to-build-image-手把手教你如何推镜像至-docker-registry.md","localizedDate":"2021年12月5日","autoDesc":true,"git":{"createdTime":1708758647000,"updatedTime":1710070397000,"contributors":[{"name":"shabbywu","email":"shabbywu@tencent.com","commits":2}]}}');export{Y as comp,U as data};
