import{_ as o,r as t,o as d,c as l,b as e,d as n,e as s,a}from"./app-B5jANzC-.js";const r={},c=e("h2",{id:"前言",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#前言"},[e("span",null,"前言")])],-1),u=e("code",null,"docker run {your-image-name}",-1),v=e("code",null,"docker build dockerfile .",-1),b=e("strong",null,"Docker",-1),m={href:"https://github.com/GoogleContainerTools/kaniko",target:"_blank",rel:"noopener noreferrer"},h=e("strong",null,[n("如何使用"),e("code",null,"Docker CLI")],-1),p=e("blockquote",null,[e("p",null,[n("注: 本文假设读者了解如何使用 Docker, 包括但不限于懂得执行 "),e("code",null,"docker run"),n(" 和 "),e("code",null,"docker build"),n(" 以及编写 Dockerfile。")])],-1),q={id:"docker镜像规范",tabindex:"-1"},g={class:"header-anchor",href:"#docker镜像规范"},f={href:"https://github.com/moby/moby/tree/master/image/spec",target:"_blank",rel:"noopener noreferrer"},y=a('<p>容器镜像存储了文件系统发生的变更，而容器镜像规范则描述了<strong>如何记录该变更历史和相应操作的参数</strong>以及<strong>如何将容器镜像转换成容器</strong>。</p><blockquote><p>简单点, 就是描述<strong>容器&gt;&gt;序列化&gt;&gt;镜像</strong>以及<strong>镜像&gt;&gt;反序列化&gt;&gt;容器</strong>的规范😯</p></blockquote><h3 id="版本历史" tabindex="-1"><a class="header-anchor" href="#版本历史"><span>版本历史</span></a></h3>',3),k={href:"https://github.com/moby/moby/blob/master/image/spec/v1.md",target:"_blank",rel:"noopener noreferrer"},j=e("ul",null,[e("li",null,"初版")],-1),_={href:"https://github.com/moby/moby/blob/master/image/spec/v1.1.md",target:"_blank",rel:"noopener noreferrer"},D=e("ul",null,[e("li",null,"由 Docker v1.10 实现 (February, 2016)"),e("li",null,"确定使用 sha256 摘要作为各层(Layer)的 id (以前是随机值)"),e("li",null,[n("新增 "),e("strong",null,"manifest.json"),n(" 文件, 该文件负责记录镜像内容和依赖关系的元数据。")])],-1),x={href:"https://github.com/moby/moby/blob/master/image/spec/v1.2.md",target:"_blank",rel:"noopener noreferrer"},I=e("ul",null,[e("li",null,"由 Docker v1.12 实现 (July, 2016)"),e("li",null,"将 Healthcheck 纳入镜像规范")],-1),C=e("a",{href:"(https://github.com/opencontainers/image-spec)"},"OCI v1 image",-1),S=e("li",null,"由 Open Container Initiative (OCI) 提出的镜像规范",-1),L={href:"https://github.com/moby/moby/pull/33355",target:"_blank",rel:"noopener noreferrer"},E={href:"https://github.com/opencontainers/runtime-spec",target:"_blank",rel:"noopener noreferrer"},T={href:"https://github.com/opencontainers/image-spec",target:"_blank",rel:"noopener noreferrer"},w=e("strong",null,"由于 docker 尚未兼容 OCI 镜像规范, 本文不涉及 OCI 镜像规范的内容。",-1),O=e("s",null,"(不排除以后会写😆)",-1),A=a(`<h3 id="一个🌰-docker-镜像的基本结构" tabindex="-1"><a class="header-anchor" href="#一个🌰-docker-镜像的基本结构"><span>一个🌰 : Docker 镜像的基本结构</span></a></h3><p>我们以 busybox:latest 为例, 展示 Docker 镜像的基础结构。</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>.
├── 036a82c6d65f2fa43a13599661490be3fca1c3d6790814668d4e8c0213153b12
│   ├── VERSION
│   ├── json
│   └── layer.tar
├── 6ad733544a6317992a6fac4eb19fe1df577d4dec7529efec28a5bd0edad0fd30.json
├── manifest.json
└── repositories

1 directory, 6 files
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>接下来以该🌰 详细介绍 Docker 镜像中各组成部分的含义和内容。</p><h4 id="directories-backward" tabindex="-1"><a class="header-anchor" href="#directories-backward"><span>directories (backward)</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>.
├── VERSION
├── json
└── layer.tar

0 directories, 3 files
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以发现, 镜像中的每层(Layer)解压后可以对应到一个目录，这些目录的名称是根据该层(Layer)的相关信息使用一致性 hash 算法生成, (TIPS: v1版本规范是随机生成), 每个目录包括 3 个文件, 分别是:</p><ul><li>VERSION, <code>json</code> 文件内容个格式规范, 目前只能是 1.0。</li><li>json, 在 v1 版本中定义的描述该层(Layer)信息的元数据，但由于 v1.2 版本中不需要依赖此文件，因此无需关注。</li><li>layer.tar, 存储该层(Layer)文件系统的变更记录的归档包。</li></ul><blockquote><p>需要注意的是, 这些目录布局仅是为了向后兼容, 当前版本(v1.2)中每层(Layer)的归档包均在 <code>manifest.json</code> 指定。</p></blockquote><h4 id="repositories-backward" tabindex="-1"><a class="header-anchor" href="#repositories-backward"><span>repositories (backward)</span></a></h4><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code>{
  &quot;busybox&quot;: {
    &quot;latest&quot;: &quot;036a82c6d65f2fa43a13599661490be3fca1c3d6790814668d4e8c0213153b12&quot;
  }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>repositories 中存储了一个 json 对象, 该对象的每个 key 是镜像的名称, value 是<code>标签-镜像id映射表</code>。</p><blockquote><p>需要注意的是, 该文件同样是仅用于向后兼容, 当前版本(v1.2)中镜像与layer的关系均在 <code>manifest.json</code> 中指定。</p></blockquote><h4 id="manifest-json" tabindex="-1"><a class="header-anchor" href="#manifest-json"><span>manifest.json</span></a></h4><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code>[
  {
    &quot;Config&quot;: &quot;6ad733544a6317992a6fac4eb19fe1df577d4dec7529efec28a5bd0edad0fd30.json&quot;,
    &quot;RepoTags&quot;: [
      &quot;busybox:latest&quot;
    ],
    &quot;Layers&quot;: [
      &quot;036a82c6d65f2fa43a13599661490be3fca1c3d6790814668d4e8c0213153b12/layer.tar&quot;
    ]
  }
]
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>mainfest.json</code> 记录了一个列表, 该列表中每一项描述了一个镜像的内容清单以及该镜像的父镜像(可选的)。 该列表中每一项由以下几个字段组成:</p><ul><li>Config: 引用启动容器的配置对象。</li><li>RepoTags: 描述该镜像的引用关系。</li><li>Layers: 指向描述该镜像文件系统各(Layer)的变更记录。</li><li>Parent: (可选) 该镜像的父镜像的 imageID, 该父镜像必须记录在当前的 manifest.json。</li></ul><blockquote><p>需要注意的是, 该 manifest.json 与 Docker Register API 描述的 manifest.json 不是同一个文件。(详见附录部分)</p></blockquote><h4 id="config-aka-image-json" tabindex="-1"><a class="header-anchor" href="#config-aka-image-json"><span>Config (aka Image JSON)</span></a></h4><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code>{
	&quot;architecture&quot;: &quot;amd64&quot;,
	&quot;config&quot;: {
		&quot;Hostname&quot;: &quot;&quot;,
		&quot;Domainname&quot;: &quot;&quot;,
		&quot;User&quot;: &quot;&quot;,
		&quot;AttachStdin&quot;: false,
		&quot;AttachStdout&quot;: false,
		&quot;AttachStderr&quot;: false,
		&quot;Tty&quot;: false,
		&quot;OpenStdin&quot;: false,
		&quot;StdinOnce&quot;: false,
		&quot;Env&quot;: [
			&quot;PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin&quot;
		],
		&quot;Cmd&quot;: [
			&quot;sh&quot;
		],
		&quot;ArgsEscaped&quot;: true,
		&quot;Image&quot;: &quot;sha256:7def3adf6786f772d2f02fc74c2d3f3334228416760aee45d3b6e561ce1c1dd3&quot;,
		&quot;Volumes&quot;: null,
		&quot;WorkingDir&quot;: &quot;&quot;,
		&quot;Entrypoint&quot;: null,
		&quot;OnBuild&quot;: null,
		&quot;Labels&quot;: null
	},
	&quot;container&quot;: &quot;3fbce8bb8947b036ee7ff05a86c0574159c04fc10a3db7485ab7bf4f56fd4020&quot;,
	&quot;container_config&quot;: {
		&quot;Hostname&quot;: &quot;3fbce8bb8947&quot;,
		&quot;Domainname&quot;: &quot;&quot;,
		&quot;User&quot;: &quot;&quot;,
		&quot;AttachStdin&quot;: false,
		&quot;AttachStdout&quot;: false,
		&quot;AttachStderr&quot;: false,
		&quot;Tty&quot;: false,
		&quot;OpenStdin&quot;: false,
		&quot;StdinOnce&quot;: false,
		&quot;Env&quot;: [
			&quot;PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin&quot;
		],
		&quot;Cmd&quot;: [
			&quot;/bin/sh&quot;,
			&quot;-c&quot;,
			&quot;#(nop) &quot;,
			&quot;CMD [\\&quot;sh\\&quot;]&quot;
		],
		&quot;ArgsEscaped&quot;: true,
		&quot;Image&quot;: &quot;sha256:7def3adf6786f772d2f02fc74c2d3f3334228416760aee45d3b6e561ce1c1dd3&quot;,
		&quot;Volumes&quot;: null,
		&quot;WorkingDir&quot;: &quot;&quot;,
		&quot;Entrypoint&quot;: null,
		&quot;OnBuild&quot;: null,
		&quot;Labels&quot;: {}
	},
	&quot;created&quot;: &quot;2017-11-03T22:39:17.345892474Z&quot;,
	&quot;docker_version&quot;: &quot;17.06.2-ce&quot;,
	&quot;history&quot;: [{
			&quot;created&quot;: &quot;2017-11-03T22:39:17.173629428Z&quot;,
			&quot;created_by&quot;: &quot;/bin/sh -c #(nop) ADD file:264af0c48e23e8b8fc57c2c70c7b5b08be20601d75f5efca07c5ace8748bcbcd in / &quot;
		},
		{
			&quot;created&quot;: &quot;2017-11-03T22:39:17.345892474Z&quot;,
			&quot;created_by&quot;: &quot;/bin/sh -c #(nop)  CMD [\\&quot;sh\\&quot;]&quot;,
			&quot;empty_layer&quot;: true
		}
	],
	&quot;os&quot;: &quot;linux&quot;,
	&quot;rootfs&quot;: {
		&quot;type&quot;: &quot;layers&quot;,
		&quot;diff_ids&quot;: [
			&quot;sha256:0271b8eebde3fa9a6126b1f2335e170f902731ab4942f9f1914e77016540c7bb&quot;
		]
	}
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h5 id="created-string" tabindex="-1"><a class="header-anchor" href="#created-string"><span>created <code>string</code></span></a></h5><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code>{
    &quot;created&quot;: &quot;2017-11-03T22:39:17.345892474Z&quot;
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>ISO-8601 格式的字符串, 描述了当前镜像创建的日期和时间。</p><h5 id="author-string" tabindex="-1"><a class="header-anchor" href="#author-string"><span>author <code>string</code></span></a></h5><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code>{
    &quot;author&quot;: &quot;nobody&quot;
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>描述创建并维护这个镜像的个人或实体的名称和/或电子邮箱。</p><h5 id="architecture-string" tabindex="-1"><a class="header-anchor" href="#architecture-string"><span>architecture <code>string</code></span></a></h5><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code>{
    &quot;architecture&quot;: &quot;amd64&quot;
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>描述该镜像中的二进制文件运行依赖的 CPU 架构，可能的值包括:</p><ul><li>386</li><li>amd64</li><li>arm</li></ul><blockquote><p>需要注意的是, 可选范围的值未来可能会添加或减少, 同时, 这里声明的值在不一定会被容器运行时实现(e.g. runc 或 rkt)所支持。</p></blockquote><h5 id="os-string" tabindex="-1"><a class="header-anchor" href="#os-string"><span>os <code>string</code></span></a></h5><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code>{
    &quot;os&quot;: &quot;linux&quot;
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>描述该镜像运行所基于的操作系统的名称, 可能的值包括:</p><ul><li>darwin</li><li>freebsd</li><li>linux</li></ul><blockquote><p>需要注意的是, 可选范围的值未来可能会添加或减少, 同时, 这里声明的值在不一定会被容器运行时实现(e.g. runc 或 rkt)所支持。</p></blockquote><h5 id="config-aka-container-runconfig-object-optional" tabindex="-1"><a class="header-anchor" href="#config-aka-container-runconfig-object-optional"><span>config (aka Container RunConfig) <code>object, optional</code></span></a></h5><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code>{
    &quot;config&quot;: {
        &quot;User&quot;: &quot;&quot;,
        &quot;Tty&quot;: false,
        &quot;Env&quot;: [
            &quot;PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin&quot;
        ],
        &quot;Entrypoint&quot;: null,
        &quot;Cmd&quot;: [
            &quot;sh&quot;
        ],
        &quot;Volumes&quot;: null,
        &quot;WorkingDir&quot;: &quot;&quot;,
        &quot;Labels&quot;: null
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>描述容器运行时在实例化该镜像时, 所使用的默认参数。</p><blockquote><p>需要注意的是, 该字段可以为 null, 在这种情况下, 应在创建容器时指定运行所需要的任何参数。</p></blockquote><h6 id="user-string" tabindex="-1"><a class="header-anchor" href="#user-string"><span>User <code>string</code></span></a></h6><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code>{
    &quot;config&quot;: {
        &quot;User&quot;: &quot;root&quot;
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>描述容器中应该使用的用户名或UID, 当创建容器时未指定该值时，该值将用作默认值。 该字段支持以下格式:</p><ul><li>user</li><li>uid</li><li>user:group</li><li>uid:gid</li><li>uid:group</li><li>user:gid</li></ul><blockquote><p>需要注意的是, 当不提供 <code>group/gid</code> 时, 默认行为会从容器中 /etc/passwd 中根据给定的 user/uid 配置默认组合补充组(supplementary groups)。</p></blockquote><h6 id="memory-integer" tabindex="-1"><a class="header-anchor" href="#memory-integer"><span>Memory <code>integer</code></span></a></h6><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code>{
    &quot;config&quot;: {
        &quot;Memory&quot;: 1024
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>描述容器实例的内存限制(以 bytes 为单位), 当创建容器时未指定该值时，该值将用作默认值。</p><h6 id="memoryswap-integer" tabindex="-1"><a class="header-anchor" href="#memoryswap-integer"><span>MemorySwap <code>integer</code></span></a></h6><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code>{
    &quot;config&quot;: {
        &quot;MemorySwap&quot;: -1
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>描述允许容器使用的总内存使用量(memory + swap), 当创建容器时未指定该值时，该值将用作默认值。</p><blockquote><p>需要注意的是, 设置该值为 -1 时, 表示关闭内存交换。</p></blockquote><h6 id="cpushares-integer" tabindex="-1"><a class="header-anchor" href="#cpushares-integer"><span>CpuShares <code>integer</code></span></a></h6><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code>{
    &quot;config&quot;: {
        &quot;CpuShares&quot;: 4
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>CPU 份额(对于其他容器而言的相对值), 当创建容器时未指定该值时，该值将用作默认值。</p><h6 id="workingdir-string" tabindex="-1"><a class="header-anchor" href="#workingdir-string"><span>WorkingDir <code>string</code></span></a></h6><p>描述容器启动入口点进程时所在的工作目录, 当创建容器时未指定该值时，该值将用作默认值。</p><h6 id="env-array-string" tabindex="-1"><a class="header-anchor" href="#env-array-string"><span>Env <code>array[string]</code></span></a></h6><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code>{
    &quot;config&quot;: {
        &quot;Env&quot;: [
            &quot;PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin&quot;
        ]
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>描述运行该镜像时的默认环境变量, 这些值将用作默认值, 并会在创建容器时指定的值进行合并。 该列表的每一项的格式为: <code>VARNAME=&quot;VAR VALUE&quot;</code></p><h6 id="entrypoint-array-string" tabindex="-1"><a class="header-anchor" href="#entrypoint-array-string"><span>Entrypoint <code>array[string]</code></span></a></h6><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code>{
    &quot;config&quot;: {
        &quot;Entrypoint&quot;: [
            &quot;bash&quot;,
            &quot;-c&quot;
        ]
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>描述启动容器时要执行的命令的参数列表, 当创建容器时未指定该值时，该值将用作默认值。</p><h6 id="cmd-array-string" tabindex="-1"><a class="header-anchor" href="#cmd-array-string"><span>Cmd <code>array[string]</code></span></a></h6><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code>{
    &quot;config&quot;: {
        &quot;Cmd&quot;: [
            &quot;ls&quot;,
        ]
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>描述容器入口(entry point) 的默认参数, 当创建容器时未指定该值时，该值将用作默认值。</p><blockquote><p>需要注意的是, 如果未指定 <code>Entrypoint</code>, 那么 cmd 数组中的第一项应当为要运行的可执行文件。</p></blockquote><h6 id="healthcheck-object" tabindex="-1"><a class="header-anchor" href="#healthcheck-object"><span>Healthcheck <code>object</code></span></a></h6><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code>{
    &quot;config&quot;: {
        &quot;Healthcheck&quot;: {
            &quot;Test&quot;: [
                &quot;CMD-SHELL&quot;,
                &quot;/usr/bin/check-health localhost&quot;
            ],
            &quot;Interval&quot;: 30000000000,
            &quot;Timeout&quot;: 10000000000,
            &quot;Retries&quot;: 3
        }
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>描述确认容器是否健康的方法，该对象由 4 部分组成, 分别是:</p><ul><li>Test <code>array[string]</code>, 检查容器是否健康的测试方法, 可选项为: <ul><li><code>[]</code>: 从父级镜像继承健康检查配置</li><li><code>[&quot;None&quot;]</code>: 禁用健康检查</li><li><code>[&quot;CMD&quot;, arg1, arg2, ...]</code>: 直接执行参数</li><li><code>[&quot;CMD-SHELL&quot;, command]</code>: 使用镜像中的默认Shell运行命令</li></ul></li><li>Interval <code>integer</code>: 两次探测之间等待的纳秒数。</li><li>Timeout <code>integer</code>: 一次探测中等待的纳秒数。</li><li>Retries <code>integer</code>: 认为容器不健康所需的连续失败次数。 如果省略该字段, 则表示该值应从父级镜像中获取，同时，这些值将用作默认值, 并会在创建容器时指定的值进行合并。</li></ul><h6 id="exposedports-object-optional" tabindex="-1"><a class="header-anchor" href="#exposedports-object-optional"><span>ExposedPorts <code>object, optional</code></span></a></h6><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code>{
    &quot;config&quot;: {
        &quot;ExposedPorts&quot;: {
            &quot;8080&quot;: {},
            &quot;53/udp&quot;: {},
            &quot;80/tcp&quot;: {}
        }
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>一组端口, 描述运行该镜像的容器所需要对外暴露的端口组。存储结构为一个 json 对象, 该对象的每个 key 是需要暴露的端口和协议, value 必须是空对象 <code>{}</code>。 该对象的键(key)可以是以下的几种格式:</p><ul><li>port/tcp</li><li>port/udp</li><li>port</li></ul><blockquote><p>需要注意的是, 该配置的结构之所以如此诡异, 是因为它是直接从 Go 类型 map[string]struct{} 序列化而成的, 因此在 json 中表现为 value 是空对象 <code>{}</code>。</p></blockquote><h6 id="volumes-object-optional" tabindex="-1"><a class="header-anchor" href="#volumes-object-optional"><span>Volumes <code>object, optional</code></span></a></h6><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code>{
    &quot;config&quot;: {
        &quot;Volumes&quot;: {
            &quot;/var/my-app-data/&quot;: {},
            &quot;/etc/some-config.d/&quot;: {}
        }
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>一组目录, 描述运行该镜像的容器应该被挂载卷覆盖的目录路径。存储结构为一个 json 对象, 该对象的每个 key 是应该被挂载卷覆盖的目录路径, value 必须是空对象 <code>{}</code>。</p><blockquote><p>需要注意的是, 该配置的结构之所以如此诡异, 是因为它是直接从 Go 类型 map[string]struct{} 序列化而成的, 因此在 json 中表现为 value 是空对象 <code>{}</code>。</p></blockquote><h5 id="rootfs-object" tabindex="-1"><a class="header-anchor" href="#rootfs-object"><span>rootfs <code>object</code></span></a></h5><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code>{
    &quot;rootfs&quot;: {
        &quot;type&quot;: &quot;layers&quot;,
        &quot;diff_ids&quot;: [
            &quot;sha256:0271b8eebde3fa9a6126b1f2335e170f902731ab4942f9f1914e77016540c7bb&quot;
        ]
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>rootfs</code> 描述该镜像引用的 Layer DiffIDs (详情见附录-术语表), 在镜像配置(Config)存放该值, 可以使得计算镜像配置文件的hash值时, 会根据关联的文件系统的 hash 值的变化而变化。该对象包含两部分, 分别是:</p><ul><li>type: 通常将该值设置为 <code>layers</code>。</li><li>diff_ids <code>(array[Layer DiffIDs])</code>: 按依赖顺序排序, 即从最底部的层(Layer)到最顶部的层(Layer)排序。</li></ul><h5 id="history-array" tabindex="-1"><a class="header-anchor" href="#history-array"><span>history <code>array</code></span></a></h5><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code>{
    &quot;history&quot;: [{
			&quot;created&quot;: &quot;2017-11-03T22:39:17.173629428Z&quot;,
			&quot;created_by&quot;: &quot;/bin/sh -c #(nop) ADD file:264af0c48e23e8b8fc57c2c70c7b5b08be20601d75f5efca07c5ace8748bcbcd in / &quot;
		},
		{
			&quot;created&quot;: &quot;2017-11-03T22:39:17.345892474Z&quot;,
			&quot;created_by&quot;: &quot;/bin/sh -c #(nop)  CMD [\\&quot;sh\\&quot;]&quot;,
			&quot;empty_layer&quot;: true
		}
	]
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>history</code>描述了该镜像每层(Layer)的历史记录的对象数组，数组按照依赖关系排序，即从最底部的层(Layer)到最顶部的层(Layer)排序。数组中每个对象具有以下的字段:</p><ul><li>created: 该字段描述了该层(Layer)的创建的日期和时间, 要求为ISO-8601 格式的字符串。</li><li>author: 该字段描述创建并维护该层(Layer)的个人或实体的名称和/或电子邮箱。</li><li>created_by: 该字段描述创建该层(Layer)时调用的指令。</li><li>comment: 该字段描述创建该层(Layer)时的自定义注解。</li><li>empty_layer: 该字段用于标记历史记录项是否导致文件系统出现差异, 如果此历史记录项未对应到 <code>rootfs</code> 中实际的一项记录, 那么就应该将该项设置为 <code>true</code>(简单点, 就是如果 Dockerfile 里执行了类似 ENV, CMD 等指令, 由于这些指令不会导致文件系统的变更, empty_layer 就应该设置为 <code>true</code>)。</li></ul><h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span>总结</span></a></h2><p>本文主要先从梳理了Docker镜像规范的<strong>版本历史</strong>, 随后简单介绍了 OCI 组织和 OCI 镜像规范与 Docker 镜像规范之间的关系。接下来从一个简单但完整的 🌰 中展示了 <strong>Docker 镜像的目录结构</strong>, 再以此 🌰 介绍了现行镜像规范内容, 其中包括 <strong>manifest.json</strong> 和 <strong>Config</strong> 这两个重要文件的含义和内容。自 v1.1 版本的镜像规范开始, Docker 引入了 <strong>manifest.json</strong> 的概念, 从此就无需关心镜像的目录结构, 镜像中有效的信息都被记录在 manifest 中。</p><p>当你看到这里的时候, 现行的 Docker 镜像规范已经完全介绍完毕, 从下一篇文章开始就进入<strong>实战</strong>内容。预期在下一章里, 我会为大家<strong>分享从 0 开始构建 Docker 镜像的经验</strong>, 以进一步探讨镜像中各 <code>Layer</code> 中记录的 <code>Filesystem Changeset</code> 的内容, 为最后介绍如何构建镜像打下铺垫。</p><blockquote><p>吐槽: 规范是很文绉绉的内容, 而事实上 Docker 自身的镜像规范的描述得很混乱, 会出现术语混乱的情形。例如 <code>Image JSON</code> 在 manifest.json 又被称之为 <code>Config</code>; 镜像分发规范和镜像规范又会同时出现 <code>manifest</code>。</p></blockquote><hr><h2 id="附录" tabindex="-1"><a class="header-anchor" href="#附录"><span>附录</span></a></h2><h3 id="术语表" tabindex="-1"><a class="header-anchor" href="#术语表"><span>术语表</span></a></h3><h4 id="layer" tabindex="-1"><a class="header-anchor" href="#layer"><span>Layer</span></a></h4><p>Docker 镜像采用了分层结构。每层都是一组文件系统的变更历史。<code>Layer</code> 不负责存储诸如环境变量或默认参数等配置元数据, 这些都是整个镜像的属性, 而不属于任何特地的层。</p><h4 id="image-json" tabindex="-1"><a class="header-anchor" href="#image-json"><span>Image JSON</span></a></h4><p>每个镜像都有一个关联的 JSON 结构(被称之为 Image JSON), 这个结构描述有关该镜像的一些基本信息, 例如创建日期, 作者和其父镜像的ID, 以及运行时的相关配置(包括入口点(entry point), 默认参数, CPU/内存限制, 网络配置以及挂载卷信息等)。除此之外, 该结构还记录着该镜像引用的每一层的hash签名, 并提供这些层的历史信息。 依据规范, 该结构被认为是不可变的, 因为修改本结构就意味着需要重新计算 <code>ImageID</code>, 也就意味着创建了新的派生镜像, 原镜像的 Image JSON 并未发送变化。</p><h4 id="image-filesystem-changeset" tabindex="-1"><a class="header-anchor" href="#image-filesystem-changeset"><span>Image Filesystem Changeset</span></a></h4><p>Docker 镜像中每一层都保存着相对于它上一层而言, 新添加(added), 发生变更(changed), 或者删除(deleted)的文件的归档包(又称之为文件系统变更集)。通过使用基于层(layer-based)的文件系统或者联合(union)文件系统(例如AUFS), 或者通过计算文件系统快照的差异, 文件系统变更集(<code>Filesystem Changeset</code>)可以表现这一系列的镜像层, 就好像这些变更是发送在同一个文件系统上的一样。</p><h4 id="layer-diffid" tabindex="-1"><a class="header-anchor" href="#layer-diffid"><span>Layer DiffID</span></a></h4><p>Docker 使用在镜像分发传输时, 每层的 tar 归档文件的 SHA256 摘要来引用镜像层。例如, <code>sha256:0271b8eebde3fa9a6126b1f2335e170f902731ab4942f9f1914e77016540c7bb</code> 则是一个合法的 <code>Layer DiffID</code>。</p><blockquote><p>需要注意的是, 必须使用可再现(重放)的方式打包和解包镜像层, 以免更改镜像层ID。例如, 通过使用 <code>tar-split</code> 来保存 tar 头。 同时, <code>Layer DiffID</code> 必须是从未压缩过的 tar 版本计算而来的。</p></blockquote><h4 id="layer-chainid" tabindex="-1"><a class="header-anchor" href="#layer-chainid"><span>Layer ChainID</span></a></h4><p>为了方便起见, 有时需要用单个 ID 来表示一层一系列镜像层, 这就引入了 <code>Layer ChainID</code> 这一概念。对于仅有一层或者位于最底部的层而言, <code>Layer ChainID</code> 等同于 <code>Layer DiffID</code>; 而对于其他层而言, <code>Layer ChainID</code> 可由以下公示计算: <code>ChainID(Layer N) = SHA256hex(ChainID(Layer N-1) + &quot; &quot; + DiffID(Layer N))</code>。</p><h4 id="imageid" tabindex="-1"><a class="header-anchor" href="#imageid"><span>ImageID</span></a></h4><p>使用以下公示计算镜像ID: <code>ImageID = SHA256hex(Image JSON)</code>, 由于 <code>Image JSON</code>中引用了镜像中每一层的 hash 值, 因此 ImageID 的计算方法使得镜像内容可寻址(content-addressable)。</p><blockquote><p>需要注意的是, Docker 规范中 <code>Image JSON</code> 是不含有任何格式化的。因此在计算 SHA256hex 时, 需要保证不含有任何缩进。</p></blockquote><h4 id="tag" tabindex="-1"><a class="header-anchor" href="#tag"><span>Tag</span></a></h4><p><code>Tag</code> 可用于将用户提供的描述性名称映射到任意单个 <code>ImageID</code>, <code>Tag</code> 只能从以下的字符集中取值: <code>[a-zA-Z0-9_.-]</code>, 同时首字符又不允许为 <code>.</code> 或 <code>-</code>, 而且长度不允许大于 <strong>128</strong> 个字符。</p><h4 id="repository" tabindex="-1"><a class="header-anchor" href="#repository"><span>Repository</span></a></h4><p><code>Repository</code> 即镜像名称中 <code>:</code> 之前的部分。例如, 一个镜像被命名为 <code>my-app:3.1.4</code>, 那么 <code>my-app</code> 即被称之为 <code>Repository</code>。<code>Repository</code>由 <code>/</code> 分割的名称组成, 可以选择以 DNS 主机名作为前缀(必须符合标准 DNS 规则, 但不允许含有 <code>_</code> 字符)。同时, 如果 <code>Repository</code> 存在主机名, 那么就可以在其后加上端口号, （e.g. <code>:8080</code>)。最后, <code>Repository</code> 不允许以 <code>/</code> 开头或者结尾。</p><h3 id="image-manifest-version-2" tabindex="-1"><a class="header-anchor" href="#image-manifest-version-2"><span>Image Manifest Version 2</span></a></h3><p>与镜像规范中的 <code>Manifest.json</code> 不同, <code>Image Manifest Version 2</code> 主要被使用于 <code>Docker Registry API V2</code>, 即 <code>docker pull</code> 以及 <code>docker push</code> 等操作之中。 目前 <code>Image Manifest Version 2</code> 已推出两个版本, 分别是:</p>`,115),N={href:"https://docs.docker.com/registry/spec/manifest-v2-1/",target:"_blank",rel:"noopener noreferrer"},R={href:"https://docs.docker.com/registry/spec/manifest-v2-2/",target:"_blank",rel:"noopener noreferrer"},V={href:"https://github.com/opencontainers/distribution-spec",target:"_blank",rel:"noopener noreferrer"};function M(H,P){const i=t("ExternalLinkIcon");return d(),l("div",null,[c,e("p",null,[n("现在是容器化时代，不管是开发、测试还是运维，很少有人会不知道或不会用 Docker。使用 Docker 也很简单，很多时候启动容器无非就是执行 "),u,n(", 而构建镜像也就是执行一句 "),v,n("的事情。 也许正是由于 "),b,n(" 对实现细节封装得过于彻底，最近在学习 google 开源的镜像构建工具 "),e("a",m,[n("kaniko"),s(i)]),n(" 时, 才发现我们也许只是学会了"),h,n(" , 而并非明白 Docker 是如何运行的。 所以笔者决定开始写『How To Build Images』这一系列文章，这是本系列的第一篇，『Docker 镜像规范』。")]),p,e("h2",q,[e("a",g,[e("span",null,[e("a",f,[n("Docker镜像规范"),s(i)])])])]),y,e("ul",null,[e("li",null,[e("a",k,[n("v1"),s(i)]),j]),e("li",null,[e("a",_,[n("v1.1"),s(i)]),D]),e("li",null,[e("a",x,[n("v1.2"),s(i)]),I]),e("li",null,[C,e("ul",null,[S,e("li",null,[n("不兼容 "),e("a",L,[n("Docker(moby)"),s(i)]),n(", 但可以 push 至 Registry 然后再 pull 下来")])])])]),e("p",null,[n("为了统一容器格式和运行时创建的标准, Docker 联合 CoreOS 等组织在 linux 基金会的主持下成立了 Open Container Initiative (OCI)。 目前 OCI 已经提出了两个规范:"),e("a",E,[n("运行时规范(runtime-spec)"),s(i)]),n("和"),e("a",T,[n("镜像规范(image-spec)"),s(i)]),n(", 但"),w,n(),O]),A,e("ul",null,[e("li",null,[e("a",N,[n("Image Manifest V 2, Schema 1"),s(i)])]),e("li",null,[e("a",R,[n("Image Manifest V 2, Schema 2"),s(i)]),n(" 该协议通过引入额外的 Media Type 和 Registry 的 manifest 结构, 解决了 Registry 能提供哪些镜像, 镜像的格式、兼容的操作系统以及镜像各层应该从何处获取等问题。")])]),e("blockquote",null,[e("p",null,[n("简单点, 就是一份描述镜像文件分发的协议, 对此, OCI 也拟了一份"),e("a",V,[n("规范"),s(i)]),n("。")])])])}const U=o(r,[["render",M],["__file","how-to-build-images-docker-镜像规范.html.vue"]]),B=JSON.parse('{"path":"/posts/2021/01/31/how-to-build-images-docker-%E9%95%9C%E5%83%8F%E8%A7%84%E8%8C%83.html","title":"How To Build Images:Docker 镜像规范 v1.2","lang":"zh-CN","frontmatter":{"draft":false,"permalinkPattern":"/posts/:year/:month/:day/:slug.html","type":"post","date":"2021-01-31T00:00:00.000Z","title":"How To Build Images:Docker 镜像规范 v1.2","sidebarDepth":2,"category":"容器技术","tags":["docker","build"],"description":"前言 现在是容器化时代，不管是开发、测试还是运维，很少有人会不知道或不会用 Docker。使用 Docker 也很简单，很多时候启动容器无非就是执行 docker run {your-image-name}, 而构建镜像也就是执行一句 docker build dockerfile .的事情。 也许正是由于 Docker 对实现细节封装得过于彻底，最近...","head":[["link",{"rel":"alternate","hreflang":"en-us","href":"https://blog.shabbywu.cn/en/posts/2021/01/31/how-to-build-images-docker-%E9%95%9C%E5%83%8F%E8%A7%84%E8%8C%83.html"}],["meta",{"property":"og:url","content":"https://blog.shabbywu.cn/posts/2021/01/31/how-to-build-images-docker-%E9%95%9C%E5%83%8F%E8%A7%84%E8%8C%83.html"}],["meta",{"property":"og:site_name","content":"个人技术文章分享"}],["meta",{"property":"og:title","content":"How To Build Images:Docker 镜像规范 v1.2"}],["meta",{"property":"og:description","content":"前言 现在是容器化时代，不管是开发、测试还是运维，很少有人会不知道或不会用 Docker。使用 Docker 也很简单，很多时候启动容器无非就是执行 docker run {your-image-name}, 而构建镜像也就是执行一句 docker build dockerfile .的事情。 也许正是由于 Docker 对实现细节封装得过于彻底，最近..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:locale:alternate","content":"en-US"}],["meta",{"property":"article:author","content":"shabbywu"}],["meta",{"property":"article:tag","content":"docker"}],["meta",{"property":"article:tag","content":"build"}],["meta",{"property":"article:published_time","content":"2021-01-31T00:00:00.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"How To Build Images:Docker 镜像规范 v1.2\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2021-01-31T00:00:00.000Z\\",\\"dateModified\\":null,\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"shabbywu\\",\\"url\\":\\"https://github.com/shabbywu\\"}]}"],["link",{"rel":"alternate","type":"application/atom+xml","href":"https://blog.shabbywu.cn/atom.xml","title":"个人技术文章分享 Atom Feed"}],["link",{"rel":"alternate","type":"application/json","href":"https://blog.shabbywu.cn/feed.json","title":"个人技术文章分享 JSON Feed"}],["link",{"rel":"alternate","type":"application/rss+xml","href":"https://blog.shabbywu.cn/rss.xml","title":"个人技术文章分享 RSS Feed"}]]},"headers":[{"level":2,"title":"前言","slug":"前言","link":"#前言","children":[]},{"level":2,"title":"Docker镜像规范","slug":"docker镜像规范","link":"#docker镜像规范","children":[{"level":3,"title":"版本历史","slug":"版本历史","link":"#版本历史","children":[]},{"level":3,"title":"一个🌰 : Docker 镜像的基本结构","slug":"一个🌰-docker-镜像的基本结构","link":"#一个🌰-docker-镜像的基本结构","children":[]}]},{"level":2,"title":"总结","slug":"总结","link":"#总结","children":[]},{"level":2,"title":"附录","slug":"附录","link":"#附录","children":[{"level":3,"title":"术语表","slug":"术语表","link":"#术语表","children":[]},{"level":3,"title":"Image Manifest Version 2","slug":"image-manifest-version-2","link":"#image-manifest-version-2","children":[]}]}],"readingTime":{"minutes":14.14,"words":4243},"filePathRelative":"_posts/container/2021-01-31-how-to-build-images-docker-镜像规范.md","localizedDate":"2021年1月31日","autoDesc":true}');export{U as comp,B as data};
