import{_ as d,a as t}from"./容器可读层-CtpmvAQL.js";import{_ as c,r as o,o as u,c as b,b as e,d as n,e as a,w as r,a as i}from"./app-B5jANzC-.js";const v={},m=i('<h2 id="前言" tabindex="-1"><a class="header-anchor" href="#前言"><span>前言</span></a></h2><p>现在是容器化时代，不管是开发、测试还是运维，很少有人会不知道或不会用 Docker。使用 Docker 也很简单，很多时候启动容器无非就是执行 <code>docker run {your-image-name}</code>，而构建镜像也就是执行一句 <code>docker build dockerfile .</code>的事情。<br> 也许正是由于 <strong>Docker</strong> 对实现细节封装得过于彻底，有时候会觉得我们也许只是学会了<strong>如何使用<code>Docker CLI</code></strong> , 而并非明白 Docker 是如何运行的。<br> 笔者将在『How To Run Container』系列文章讲述 <code>docker run {your-image-name}</code> 相关的实现细节，本文是本系列的第二篇文章，将为各位介绍从镜像创建容器涉及到的实现细节。</p><h2 id="什么是镜像和容器" tabindex="-1"><a class="header-anchor" href="#什么是镜像和容器"><span>什么是镜像和容器？</span></a></h2><h3 id="_1-什么是镜像" tabindex="-1"><a class="header-anchor" href="#_1-什么是镜像"><span>1. 什么是镜像？</span></a></h3>',4),h=e("code",null,"镜像",-1),p=e("strong",null,"存储了文件系统发生的变更历史",-1),g=i(`<div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>.
├── 036a82c6d65f2fa43a13599661490be3fca1c3d6790814668d4e8c0213153b12
│   ├── VERSION
│   ├── json
│   └── layer.tar
├── f578fecf2875c8c4e4f88d15b90949fa40c71a0f0231b831f1263c708c2d524d
│   ├── VERSION
│   ├── json
│   └── layer.tar
├── 6ad733544a6317992a6fac4eb19fe1df577d4dec7529efec28a5bd0edad0fd30.json
├── manifest.json
└── repositories
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在存储文件系统发生的变更时, 镜像(Image) 将<strong>一组文件系统的变更历史</strong>定义为<code>「镜像层(Image Layer)」</code>, 每个镜像层负责记录该层镜像与上一层镜像的文件系统之间的差异, 而这些镜像层之间的关系则由<code>镜像清单(Image manifest)</code>负责维护。<br> 综上所述, <strong>镜像可以简单地理解成由多个镜像层叠加起来的文件系统</strong>。(如下图)</p><div class="language-plantuml line-numbers-mode" data-ext="plantuml" data-title="plantuml"><pre class="language-plantuml"><code><img src="https://www.plantuml.com/plantuml/svg/SoWkIImgAStDuIf8JCvEJ4zLyCm5ajLS2a2GbfcJgl1owfodpVtFThG-xPsABlgojVVvtdLWKJ01D2epBJ6vHC4diJAro12Re14sGJy5Bf0eJ9kDdXvKiPN2YsLjpsTFGv8sGaZxmQLhkHnIyrA0tW00
"></code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div>`,3),f=i('<h3 id="_2-什么是容器" tabindex="-1"><a class="header-anchor" href="#_2-什么是容器"><span>2.什么是容器？</span></a></h3><p>根据 OCI 的定义, <code>容器</code>是一个可配置<strong>资源限制</strong>和<strong>隔离性</strong>的, 用于<strong>执行进程的环境</strong>。我们知道, <code>Linux 容器</code>的<strong>资源限制</strong>和<strong>隔离性</strong>是分别基于 <code>Cgroup</code> 和 <code>Linux Namespace</code> 实现的, 两者都是 Linux 内核提供的功能, 其中 Cgroup 用于限制和隔离一组进程对系统资源的使用, 而 Linux Namespace 对内核资源(IPC、Network、Mount、PID、UTS 和 User)进行了封装, 使得不同进程在各自的 Namespace 下操作同一种资源时, 不会影响 Namespace 下的进程。<br><code>容器</code>和<code>镜像</code>的关系就像是模板和实例, 镜像提供了<strong>运行容器的必要元素(文件系统和运行配置)</strong>，但不依赖镜像也可运行容器, 简而言之, 我们可以认为<strong>镜像是容器的充分不必要条件</strong>。</p>',2),y=e("strong",null,"如何使用镜像运行容器",-1),E=e("strong",null,"如何在不依赖镜像的前提下, 构建容器运行要素并运行容器",-1),k=i(`<h2 id="docker-是如何从镜像创建容器" tabindex="-1"><a class="header-anchor" href="#docker-是如何从镜像创建容器"><span>Docker 是如何从镜像创建容器？</span></a></h2><p>正如前文所言, <code>镜像</code>是一个<strong>存储了文件系统发生的变更历史</strong>的归档包, 而<code>容器</code>是一个可配置<strong>资源限制</strong>和<strong>隔离性</strong>的, 用于<strong>执行进程的环境</strong>。从本质而言, 镜像为容器提供了文件系统和运行参数配置, 而容器则是从镜像创建出来的一个实例。<br> 接下来, 我们将深入探讨 Docker 从镜像创建出容器的实现细节。</p><h3 id="镜像存储和-unionfs" tabindex="-1"><a class="header-anchor" href="#镜像存储和-unionfs"><span>镜像存储和 UnionFS</span></a></h3><p>Docker 镜像分层的存储设计借鉴自 UnionFS。UnionFS 是一种可以将多个独立的文件系统中的文件和目录联合挂载, 形成一个统一的, 屏蔽底层细节的文件系统的技术。<br> Docker 镜像中每个镜像层都是一个<strong>不完整</strong>的文件系统, 它记录该层镜像与上一层镜像的文件系统之间的差异。这种分层策略赋予了 Docker 更轻量的镜像(相对于虚拟机而言), 分发镜像时只需要下载对应的镜像层即可。<br> 当然, 这种分层镜像设计也引入了一个难题, <strong>如何删除上层镜像的文件?</strong><br> 对于这个问题, Docker 也是原封不动地引入了 UnionFS 的解决方案: <code>Whiteout</code> 和<code> Opaque</code>。</p><h4 id="whiteout" tabindex="-1"><a class="header-anchor" href="#whiteout"><span>Whiteout</span></a></h4><p>所谓的 <code>Whiteout</code> 和<code> Opaque Whiteout</code> 是借鉴自 UnionFS 协议, Docker 镜像通过约定的文件命名方式, 描述了下层文件系统需要屏蔽上层文件系统中的哪些文件或目录。例如, 以下是包含多个资源的基础层:</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>❯ tree .
.
└── a
    ├── b
    │   └── c
    │       ├── bar
    │       └── foo
    └── baz

3 directories, 3 files
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果下层文件系统内需要删除 <code>a/b/c/foo</code> 这个文件, 那么下层文件系统则需要创建一个以 <code>.wh.&lt;filename&gt;</code> 为命名的隐藏文件, 即下层文件系统应当具有以下的文件系统结构:</p>`,8),_=e("div",{class:"language-bash line-numbers-mode","data-ext":"sh","data-title":"sh"},[e("pre",{bash:"",class:"language-bash"},[e("code",null,`❯ tree . -a
.
└── a
    └── b
        └── c
            └── .wh.foo

3 directories, 1 file
`)]),e("div",{class:"highlight-lines"},[e("br"),e("br"),e("br"),e("br"),e("br"),e("div",{class:"highlight-line"}," "),e("br"),e("br")]),e("div",{class:"line-numbers","aria-hidden":"true"},[e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"})])],-1),w=i('<h4 id="opaque-whiteout" tabindex="-1"><a class="header-anchor" href="#opaque-whiteout"><span>Opaque Whiteout</span></a></h4><p>除了通过 <code>Whiteout</code> 描述删除单个文件的协议外, 还可以通过 <code>Opaque Whiteout</code> 描述删除某个目录下的所有文件。<br> 以上面提到的基础文件系统为例, 如果下层文件系统希望删除 <code>a</code> 目录下的所有文件, 那么下层文件系统则需要在 <code>a</code> 目录下创建命名为 <code>.wh..wh..opq</code> 的隐藏文件, 即下层文件系统应当具有以下的文件系统结构:</p>',2),B=e("div",{class:"language-bash line-numbers-mode","data-ext":"sh","data-title":"sh"},[e("pre",{bash:"",class:"language-bash"},[e("code",null,`❯ tree . -a
.
└── a
    └── .wh..wh..opq

1 directory, 1 file
`)]),e("div",{class:"highlight-lines"},[e("br"),e("br"),e("br"),e("div",{class:"highlight-line"}," "),e("br"),e("br")]),e("div",{class:"line-numbers","aria-hidden":"true"},[e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"})])],-1),q=e("p",null,[n("当然, 我们也可以通过 "),e("code",null,"Whiteout"),n(" 达到与 "),e("code",null,"Opaque Whiteout"),n(" 等价的效果, 例如以上面提到的基础文件系统为例, 我们希望删除 "),e("code",null,"a"),n(" 目录下的所有文件, 还可以采用以下的文件系统结构获得等价的结果:")],-1),x=e("div",{class:"language-bash line-numbers-mode","data-ext":"sh","data-title":"sh"},[e("pre",{bash:"",class:"language-bash"},[e("code",null,`❯ tree . -a 
.
└── a
    ├── .wh.b
    └── .wh.baz

1 directory, 2 files
`)]),e("div",{class:"highlight-lines"},[e("br"),e("br"),e("br"),e("div",{class:"highlight-line"}," "),e("div",{class:"highlight-line"}," "),e("br"),e("br")]),e("div",{class:"line-numbers","aria-hidden":"true"},[e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"})])],-1),D=i('<blockquote><p>值得注入的是: 如 <code>Opaque Whiteout</code> 不同的是, 如果 <code>a</code> 目录下新增一个新的文件或目录, 那么通过 <code>Whiteout</code> 删除 <code>a</code> 目录下的所有文件则需要为这个新的文件或目录创建新的 <code>Whiteout</code> 隐藏文件, 而使用 <code>Opaque Whiteout</code> 则不需要。</p></blockquote><h3 id="readonly-copy-on-write" tabindex="-1"><a class="header-anchor" href="#readonly-copy-on-write"><span>ReadOnly &amp; Copy on Write</span></a></h3><h4 id="readonly-layer" tabindex="-1"><a class="header-anchor" href="#readonly-layer"><span>ReadOnly Layer</span></a></h4><p>Docker 在 UnionFS 的基础上设计了镜像内容(文件系统变更历史)的存储方案, 同时又增加了一个限制: <strong>所有镜像层只读, 不允许更改镜像层内容</strong>。</p><p>这个限制不但避免了容器内容在运行时出现意外变更<sup>注</sup>, 而且使得容器镜像比虚拟机而言更加轻量。</p><blockquote><p>注: 试想下, 如果上层文件系统内容变更后, 联合挂载的文件系统是否需要同步变更内容？</p></blockquote><figure><img src="'+d+`" alt="镜像层只读样例(以 ubuntu 镜像为例)" tabindex="0" loading="lazy"><figcaption>镜像层只读样例(以 ubuntu 镜像为例)</figcaption></figure><p>基于 Docker 出色的镜像设计方案, 使得每台主机只需要为每个镜像层存储一个副本, 同时在分发镜像时也只需下载缺失的镜像层内容, 这大大节省了存储和网络带宽。</p><p>接下来, 那么容器如何在只读的镜像层增删内容呢？这就不得不介绍另一个技术: <strong>Copy-on-Write</strong></p><h4 id="copy-on-write" tabindex="-1"><a class="header-anchor" href="#copy-on-write"><span>Copy-on-Write</span></a></h4><p><strong>Copy-on-Write(简称, Cow)</strong> 实际上是一种计算机程序设计领域的优化策略, 顾名思义, 如果有多个用户同时请求相同的资源时(如内存或磁盘上的数据), 他们首先会获得指向相同资源的地址, 直到某个用户视图修改资源的内容时, 系统才会真正复制一份专属副本给该用户, 而其他用户所访问的资源仍然保持不变。</p><div class="language-plantuml line-numbers-mode" data-ext="plantuml" data-title="plantuml"><pre class="language-plantuml"><code><img src="https://www.plantuml.com/plantuml/svg/X96rTMKn441pLJ7PhkdbPaigmHLyPZP3P6PcPsPcXceUTc7HPyhctA4xPteoVQvqNtyiYb3Kv--3lWIaGu5W7tX3QP-dBvI8eqma54-wqguO95sUY2lWw-qRZlg0frtnGDI7N9w-H1hwCxuqBeW9GhaIi5ycpSzL64K0_t43QF2VDF2OPkFnmcfiRPwRis_MnQUpyooQU9inTsSUNZU0AmCOIqRCnHbdVLOo8XajP5JrifsTdNnr6nZ7IyRigprpgLA4AGY7Dd0sVitb4yMfv3J7Ynr9FKTImP5KS2GKgMObWajCieAbXbJUH6ZXKLnIV8BbkiJXRM3VVHdJUmfh6iU4zwnSiamHfdcCk0XqQ9fyPevpZugOCiny55OxKOylxlqRC7K10000
"></code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>容器引入Cow(🐂)技术, 通过<strong>延迟拷贝</strong>的方式节省了创建多个完整副本时带来的空间和时间上的开销。该技术在容器上则表现为每个容器在 UnionFS 的基础上增加了各自的读写层(R/W Layer), 该层中的所有内容即是该容器的所有文件系统变更<sup>注</sup>。</p><blockquote><p>注: 借助 Cow 技术, 构建镜像时只需要将每层镜像的读写层归档成镜像层即可。</p></blockquote><figure><img src="`+t+'" alt="容器可读层(以 ubuntu 镜像为例)" tabindex="0" loading="lazy"><figcaption>容器可读层(以 ubuntu 镜像为例)</figcaption></figure><h2 id="实战-基于-overlayfs2-徒手从镜像创建容器" tabindex="-1"><a class="header-anchor" href="#实战-基于-overlayfs2-徒手从镜像创建容器"><span>实战: 基于 OverlayFS2, 徒手从镜像创建容器</span></a></h2>',16),C=i('<ol><li>将容器编排为文件系统捆绑包(Filesystem Bundle)的形式</li><li>往 <code>config.json</code> 编写正确的配置</li><li>往 <code>$root.path</code> 填充合理和可用的文件</li><li>执行 runc run $containerid 启动容器</li></ol><p>但是如上一篇文章不同的是, 我们这次不再是徒手构建 Docker 镜像, 而是从 DockerHub 中获取镜像，充分模拟 <code>docker run {your-image-name}</code> 涉及的流程。</p><h3 id="_1-获取镜像" tabindex="-1"><a class="header-anchor" href="#_1-获取镜像"><span>1. 获取镜像</span></a></h3>',3),A={href:"https://raw.githubusercontent.com/moby/moby/master/contrib/download-frozen-image-v2.sh",target:"_blank",rel:"noopener noreferrer"},F=e("code",null,"Token 认证",-1),S=e("code",null,"拉取镜像清单",-1),O=e("code",null,"拉取镜像层",-1),R=e("div",{class:"language-bash line-numbers-mode","data-ext":"sh","data-title":"sh"},[e("pre",{bash:"",class:"language-bash"},[e("code",null,`❯ ./download-frozen-image-v2.sh -h
usage: ./download-frozen-image-v2.sh dir image[:tag][@digest] ...
       ./download-frozen-image-v2.sh /tmp/old-hello-world hello-world:latest@sha256:8be990ef2aeb16dbcb9271ddfe2610fa6658d13f6dfb8bc72074cc1ca36966a7

❯ ./download-frozen-image-v2.sh alpine alpine/git:v2.30.2
Downloading 'alpine/git:v2.30.2@v2.30.2' (3 layers)...
#=#=-  ##     #
############################################################################################################################################################################ 100.0%
#=#=-  ##     #
############################################################################################################################################################################ 100.0%
#=#=-  ##     #
############################################################################################################################################################################ 100.0%

Download of images into 'alpine' complete.
Use something like the following to load the result into a Docker daemon:
  tar -cC 'alpine' . | docker load

## 查看镜像结构
❯ tree alpine/
alpine/
├── 09af0b97aec5975955488d528e8535d2678b75cb29adb6827abd85b52802d1b1
│   ├── json
│   ├── layer.tar
│   └── VERSION
├── 86f68eb8bb2057574a5385c9ce7528b70632e1c750fb36d5ac76c0a5460f5d95
│   ├── json
│   ├── layer.tar
│   └── VERSION
├── b86cef5f7cf032b9793fe2a4fb18ddf606df8ea9e41d4c2086749bf943c2985b.json
├── d8aa90f099f0f17f3ad894f0909e6bfd026cc4c76eec03e3e50391af42f41976
│   ├── json
│   ├── layer.tar
│   └── VERSION
├── manifest.json
└── repositories

3 directories, 12 files
`)]),e("div",{class:"highlight-lines"},[e("br"),e("br"),e("br"),e("br"),e("div",{class:"highlight-line"}," "),e("br"),e("br"),e("br"),e("br"),e("br"),e("br"),e("br"),e("br"),e("br"),e("br"),e("br"),e("br"),e("br"),e("div",{class:"highlight-line"}," "),e("br"),e("br"),e("br"),e("div",{class:"highlight-line"}," "),e("br"),e("br"),e("br"),e("div",{class:"highlight-line"}," "),e("br"),e("div",{class:"highlight-line"}," "),e("br"),e("br"),e("div",{class:"highlight-line"}," "),e("br"),e("div",{class:"highlight-line"}," "),e("br"),e("br"),e("br")]),e("div",{class:"line-numbers","aria-hidden":"true"},[e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"})])],-1),I=e("h3",{id:"_2-构建-overlay-文件系统",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#_2-构建-overlay-文件系统"},[e("span",null,"2. 构建 Overlay 文件系统")])],-1),W={href:"https://github.com/moby/moby/blob/master/daemon/graphdriver/overlay2/overlay.go",target:"_blank",rel:"noopener noreferrer"},P=i(`<blockquote><p>OverlayFS 是一个与 AUFS 类似的但性能更快, 实现更简单的现代联合文件系统, 已集成至 linux 3.8 以上版本的内核，是 Docker 推荐使用在生产环境的文件系统。</p></blockquote><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>## 解压缩镜像内容
### 确定镜像层顺序
❯ cat alpine/manifest.json
[
  {
    &quot;Config&quot;: &quot;b86cef5f7cf032b9793fe2a4fb18ddf606df8ea9e41d4c2086749bf943c2985b.json&quot;,
    &quot;RepoTags&quot;: [
      &quot;alpine/git:v2.30.2&quot;
    ],
    &quot;Layers&quot;: [
      &quot;86f68eb8bb2057574a5385c9ce7528b70632e1c750fb36d5ac76c0a5460f5d95/layer.tar&quot;,
      &quot;09af0b97aec5975955488d528e8535d2678b75cb29adb6827abd85b52802d1b1/layer.tar&quot;,
      &quot;d8aa90f099f0f17f3ad894f0909e6bfd026cc4c76eec03e3e50391af42f41976/layer.tar&quot;
    ]
  }
]

### 创建镜像层解压缩的目录
❯ mkdir -p /tmp/overlay/image/1 /tmp/overlay/image/2 /tmp/overlay/image/3 

### 解压镜像层内容, 并按顺序进行编排
❯ tar -C /tmp/overlay/image/1 -xf alpine/86f68eb8bb2057574a5385c9ce7528b70632e1c750fb36d5ac76c0a5460f5d95/layer.tar
❯ tar -C /tmp/overlay/image/2 -xf alpine/09af0b97aec5975955488d528e8535d2678b75cb29adb6827abd85b52802d1b1/layer.tar 
❯ tar -C /tmp/overlay/image/3 -xf alpine/d8aa90f099f0f17f3ad894f0909e6bfd026cc4c76eec03e3e50391af42f41976/layer.tar

## 构建 OverlayFS
### 创建挂载点(空目录)
❯ mkdir -p /tmp/overlay/container-a/merged /tmp/overlay/container-a/upperdir /tmp/overlay/container-a/workdir

### 挂载镜像文件系统至 /tmp/overlay/container-a/merged 目录, 其中镜像的读写层内容存储在 /tmp/overlay/container-a/upperdir
❯ cd /tmp/overlay/ &amp;&amp; \\
  mount -t overlay overlay \\
  -o lowerdir=image/1:image/2:image/3,upperdir=container-a/upperdir,workdir=container-a/workdir \\
  /tmp/overlay/container-a/merged

## 验证挂载记录
❯ mount |grep overlay
overlay on /tmp/overlay/container-a/merged type overlay (rw,relatime,lowerdir=image/1:image/2:image/3,upperdir=container-a/upperdir,workdir=container-a/workdir)

## 验证读写层不会影响底层文件系统
❯ echo &quot;1&quot; &gt; /tmp/overlay/container-a/merged/a

## 只有读写层(upperdir)会被写入
❯ cat /tmp/overlay/container-a/upperdir/a
1

## 底层文件系统(lowerdir)不会被修改
❯ cat image/1/a
cat: image/1/a: No such file or directory
❯ cat image/2/a
cat: image/2/a: No such file or directory
❯ cat image/3/a
cat: image/3/a: No such file or directory

## 但是, 挂载后修改底层文件系统则会体现到挂载的联合文件系统之中
❯ echo &quot;2&quot; &gt; image/1/b
❯ cat container-a/merged/b
2

## 然后在 merged 层中删除 b, 再查看读写层的内容
❯ rm container-a/merged/b &amp;&amp; ls -ahl container-a/upperdir
总用量 8.0K
drwxr-xr-x 2 root root 4.0K 8月  12 17:08 .
drwxr-xr-x 5 root root 4.0K 8月  12 12:05 ..
c--------- 1 root root 0, 0 8月  12 17:08 b

## 验证并不影响底层的镜像文件系统
❯ cat image/1/b
2
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-启动容器" tabindex="-1"><a class="header-anchor" href="#_3-启动容器"><span>3. 启动容器</span></a></h3><p>在步骤 1,2 中以成功从镜像创建出容器的文件系统, 现在只需要使用 runc 启动即可。</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>❯ cd /tmp/overlay/container-a/

## 创建 config.json
❯ runc spec

## 将 &quot;rootfs&quot; 替换成 &quot;merged&quot;, 即设置容器的启动目录在 merged
❯ sed -i &quot;s/\\&quot;rootfs\\&quot;/\\&quot;merged\\&quot;/&quot; config.json
## 取消 readonly
❯ sed -i &quot;s/\\&quot;readonly\\&quot;: true/\\&quot;readonly\\&quot;: false/&quot; config.json

## 启动！
❯ runc run container-a

## 尝试写入文件
❯ echo &quot;hello world&quot; &gt; container-a
❯ cat container-a
hello world

## 容器外验证文件是否写入成功
❯ cat cat upperdir/container-a
hello world
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_4-小结" tabindex="-1"><a class="header-anchor" href="#_4-小结"><span>4. 小结</span></a></h3><p>到这里我们成功从镜像创建出容器的文件系统, 并成功启动容器, 最后我们总结一下, 从镜像创建容器十分简单, 只需要: 0. 熟悉 Docker Registry API V2 规范, 了解如何从 DocerHub 下载镜像(可选, 如果已有镜像则不需要)</p><ol><li>熟悉 Docker 镜像规范, 了解如何从镜像转换成文件系统</li></ol><ul><li>如果镜像内屏蔽下层文件系统中的内容, 那么还需要了解不同 UnionFS 实现 Whiteout 的方式</li></ul><ol start="2"><li>熟悉 OCI 运行时规范, 了解如何从根文件系统启动容器</li></ol><h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span>总结</span></a></h2><p>这篇文章是『How To Run Container』系列的第二篇，主要以 Docker 镜像设计为切入点, 介绍了 Docker 镜像分层设计是借鉴于 Union FileSystem。Docker 在顶层设计上要求镜像中每层的内容只增不删, 但上层文件系统可借助 <code>Whiteout 协议</code> 屏蔽下层文件系统中的内容。同时, 得益于 <code>Copy-on-Write(写入时复制)</code> 技术, Docker 为每个容器分配了各自的可读写的层, 使得容器对镜像内容的修改互不干扰, 而这容器读写层亦记录了该容器的所有文件系统变更。最后, 这篇文章还演示了在不依赖 Docker Engine 的前提下, 如何从镜像构造出容器根文件系统并启动容器。<br> 到目前为止, 我们已基本掌握容器化技术涉及到的所有技术, 本系列的下一篇文章将带大家深入 Linux 内核, 探索容器实现<strong>资源限制</strong>和<strong>隔离性</strong>的细节。<br> 但在此之前, 笔者将先编写『How To Build Images』系列的第三篇文章, 在未来的这篇文章中将与大家深入探讨 <code>Docker Daemon</code> 与 <code>Docker Registry</code> 的交互流程, 为大家剖析隐藏在 <code>docker pull</code> 与 <code>docker push</code> 背后的细节。</p>`,12);function N(j,L){const l=o("RouteLink"),s=o("ExternalLinkIcon");return u(),b("div",null,[m,e("p",null,[n("正如我上一篇文章"),a(l,{to:"/posts/2021/01/31/how-to-build-images-docker-%E9%95%9C%E5%83%8F%E8%A7%84%E8%8C%83.html"},{default:r(()=>[n("『Docker 镜像规范 v1.2』")]),_:1}),n("中指出的, "),h,n("是一个"),p,n("的归档包。一般而言，一个基本的镜像具有以下的目录结构:")]),g,e("blockquote",null,[e("p",null,[n("事实上, 镜像内还记录了该镜像的一些基本信息, 例如创建日期, 作者和其父镜像的ID, 以及运行时的相关配置, 关于镜像内容更详细的描述可参考我的另一篇文章"),a(l,{to:"/posts/2021/01/31/how-to-build-images-docker-%E9%95%9C%E5%83%8F%E8%A7%84%E8%8C%83.html"},{default:r(()=>[n("『Docker 镜像规范 v1.2』")]),_:1})])]),f,e("blockquote",null,[e("p",null,[n("关于“充分不必要条件”, 感兴趣的读者可以阅读我在上一篇文章"),a(l,{to:"/posts/2021/04/01/how-to-build-image-%E4%BB%8E-0-%E5%BC%80%E5%A7%8B%E5%B8%A6%E4%BD%A0%E5%BE%92%E6%89%8B%E6%9E%84%E5%BB%BA-docker-%E9%95%9C%E5%83%8F.html#%E7%85%A7%E7%8C%AB%E7%94%BB%E8%99%8E-%E6%9E%84%E5%BB%BA%E5%8F%AF%E8%BF%90%E8%A1%8C%E7%9A%84%E5%AE%B9%E5%99%A8%E6%8D%86%E7%BB%91%E5%8C%85"},{default:r(()=>[n("『从 0 开始带你徒手构建 Docker 镜像』")]),_:1}),n("。在这篇文章中, 我先后为大家展示了"),y,n("和"),E,n("。")])]),k,_,w,B,q,x,D,e("p",null,[n("使用 runc 启动容器的流程已经在上一篇文章"),a(l,{to:"/posts/2021/04/01/how-to-build-image-%E4%BB%8E-0-%E5%BC%80%E5%A7%8B%E5%B8%A6%E4%BD%A0%E5%BE%92%E6%89%8B%E6%9E%84%E5%BB%BA-docker-%E9%95%9C%E5%83%8F.html"},{default:r(()=>[n("『从 0 开始带你徒手构建 Docker 镜像』")]),_:1}),n("充分演示, 这里重新回顾下流程, 想要直接运行容器十分简单, 只需要:")]),C,e("p",null,[n("我们知道, DockerHub 并不需要 Docker Engine 即可访问, 其接口规范遵循 Docker Registry API V2。也就是说, 我们只需要使用 REST API 即可从 DockerHub 获取镜像。这里使用到一个开源脚本"),e("a",A,[n("download-frozen-image-v2.sh"),a(s)]),n(", 该脚本使用 curl, jq 等工具实现了"),F,n(", "),S,n(", "),O,n(" 等流程, 下面演示如何使用该脚本拉取 alpine/git:v2.30.2 镜像")]),R,I,e("p",null,[n("在获取到镜像之后, 我们则可以开始将镜像内容编排为文件系统捆绑包(Filesystem Bundle)的形式, 这里根据 "),e("a",W,[n("Docker Overlay2 Driver"),a(s)]),n(" 的流程来构建容器的 rootfs。")]),P])}const H=c(v,[["render",N],["__file","how-to-run-container-浅谈从镜像创建容器的实现细节.html.vue"]]),V=JSON.parse('{"path":"/posts/2021/08/12/how-to-run-container-%E6%B5%85%E8%B0%88%E4%BB%8E%E9%95%9C%E5%83%8F%E5%88%9B%E5%BB%BA%E5%AE%B9%E5%99%A8%E7%9A%84%E5%AE%9E%E7%8E%B0%E7%BB%86%E8%8A%82.html","title":"How To Run Container-浅谈从镜像创建容器的实现细节","lang":"zh-CN","frontmatter":{"draft":false,"permalinkPattern":"/posts/:year/:month/:day/:slug.html","type":"post","date":"2021-08-12T00:00:00.000Z","title":"How To Run Container-浅谈从镜像创建容器的实现细节","sidebarDepth":2,"category":"容器技术","tags":["docker","container"],"description":"前言 现在是容器化时代，不管是开发、测试还是运维，很少有人会不知道或不会用 Docker。使用 Docker 也很简单，很多时候启动容器无非就是执行 docker run {your-image-name}，而构建镜像也就是执行一句 docker build dockerfile .的事情。 也许正是由于 Docker 对实现细节封装得过于彻底，有时候...","head":[["link",{"rel":"alternate","hreflang":"en-us","href":"https://blog.shabbywu.cn/en/posts/2021/08/12/how-to-run-container-%E6%B5%85%E8%B0%88%E4%BB%8E%E9%95%9C%E5%83%8F%E5%88%9B%E5%BB%BA%E5%AE%B9%E5%99%A8%E7%9A%84%E5%AE%9E%E7%8E%B0%E7%BB%86%E8%8A%82.html"}],["meta",{"property":"og:url","content":"https://blog.shabbywu.cn/posts/2021/08/12/how-to-run-container-%E6%B5%85%E8%B0%88%E4%BB%8E%E9%95%9C%E5%83%8F%E5%88%9B%E5%BB%BA%E5%AE%B9%E5%99%A8%E7%9A%84%E5%AE%9E%E7%8E%B0%E7%BB%86%E8%8A%82.html"}],["meta",{"property":"og:site_name","content":"个人技术文章分享"}],["meta",{"property":"og:title","content":"How To Run Container-浅谈从镜像创建容器的实现细节"}],["meta",{"property":"og:description","content":"前言 现在是容器化时代，不管是开发、测试还是运维，很少有人会不知道或不会用 Docker。使用 Docker 也很简单，很多时候启动容器无非就是执行 docker run {your-image-name}，而构建镜像也就是执行一句 docker build dockerfile .的事情。 也许正是由于 Docker 对实现细节封装得过于彻底，有时候..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:image","content":"https://blog.shabbywu.cn/img/镜像层只读样例.png"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:locale:alternate","content":"en-US"}],["meta",{"name":"twitter:card","content":"summary_large_image"}],["meta",{"name":"twitter:image:alt","content":"How To Run Container-浅谈从镜像创建容器的实现细节"}],["meta",{"property":"article:author","content":"shabbywu"}],["meta",{"property":"article:tag","content":"docker"}],["meta",{"property":"article:tag","content":"container"}],["meta",{"property":"article:published_time","content":"2021-08-12T00:00:00.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"How To Run Container-浅谈从镜像创建容器的实现细节\\",\\"image\\":[\\"https://blog.shabbywu.cn/img/镜像层只读样例.png\\",\\"https://blog.shabbywu.cn/img/容器可读层.jpg\\"],\\"datePublished\\":\\"2021-08-12T00:00:00.000Z\\",\\"dateModified\\":null,\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"shabbywu\\",\\"url\\":\\"https://github.com/shabbywu\\"}]}"],["link",{"rel":"alternate","type":"application/atom+xml","href":"https://blog.shabbywu.cn/atom.xml","title":"个人技术文章分享 Atom Feed"}],["link",{"rel":"alternate","type":"application/json","href":"https://blog.shabbywu.cn/feed.json","title":"个人技术文章分享 JSON Feed"}],["link",{"rel":"alternate","type":"application/rss+xml","href":"https://blog.shabbywu.cn/rss.xml","title":"个人技术文章分享 RSS Feed"}]]},"headers":[{"level":2,"title":"前言","slug":"前言","link":"#前言","children":[]},{"level":2,"title":"什么是镜像和容器？","slug":"什么是镜像和容器","link":"#什么是镜像和容器","children":[{"level":3,"title":"1. 什么是镜像？","slug":"_1-什么是镜像","link":"#_1-什么是镜像","children":[]},{"level":3,"title":"2.什么是容器？","slug":"_2-什么是容器","link":"#_2-什么是容器","children":[]}]},{"level":2,"title":"Docker 是如何从镜像创建容器？","slug":"docker-是如何从镜像创建容器","link":"#docker-是如何从镜像创建容器","children":[{"level":3,"title":"镜像存储和 UnionFS","slug":"镜像存储和-unionfs","link":"#镜像存储和-unionfs","children":[]},{"level":3,"title":"ReadOnly & Copy on Write","slug":"readonly-copy-on-write","link":"#readonly-copy-on-write","children":[]}]},{"level":2,"title":"实战: 基于 OverlayFS2, 徒手从镜像创建容器","slug":"实战-基于-overlayfs2-徒手从镜像创建容器","link":"#实战-基于-overlayfs2-徒手从镜像创建容器","children":[{"level":3,"title":"1. 获取镜像","slug":"_1-获取镜像","link":"#_1-获取镜像","children":[]},{"level":3,"title":"2. 构建 Overlay 文件系统","slug":"_2-构建-overlay-文件系统","link":"#_2-构建-overlay-文件系统","children":[]},{"level":3,"title":"3. 启动容器","slug":"_3-启动容器","link":"#_3-启动容器","children":[]},{"level":3,"title":"4. 小结","slug":"_4-小结","link":"#_4-小结","children":[]}]},{"level":2,"title":"总结","slug":"总结","link":"#总结","children":[]}],"readingTime":{"minutes":13.19,"words":3958},"filePathRelative":"_posts/container/2021-07-17-how-to-run-container-浅谈从镜像创建容器的实现细节.md","localizedDate":"2021年8月12日","autoDesc":true}');export{H as comp,V as data};
