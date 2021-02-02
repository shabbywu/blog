---
date: 2021-01-31
title: How To Build Images:Docker 镜像规范 v1.2
sidebarDepth: 2
category: docker
tags:
-   kaniko
-   docker
-   build
-   image

draft: false
---
# 前言
现在是容器化时代，不管是开发、测试还是运维，很少有人会不知道或不会用 Docker。使用 Docker 也很简单，很多时候启动容器无非就是执行 `docker run {your-image-name}`, 而构建镜像也就是执行一句 `docker build dockerfile .`的事情。
也许正是由于 **Docker** 对实现细节封装得过于彻底，最近在学习 google 开源的镜像构建工具 [kaniko](https://github.com/GoogleContainerTools/kaniko) 时, 才发现我们也许只是学会了**如何使用`Docker CLI`** , 而并非明白 Docker 是如何运行的。
所以笔者决定开始写「How To Build Images」这一系列文章，这是本系列的第一篇，「Docker 镜像规范」。
> 注: 本文假设读者了解如何使用 Docker, 包括但不限于懂得执行 `docker run` 和 `docker build` 以及编写 Dockerfile。

# [Docker镜像规范](https://github.com/moby/moby/tree/master/image/spec)
容器镜像存储了文件系统发生的变更，而容器镜像规范则描述了**如何记录该变更历史和相应操作的参数**以及**如何将容器镜像转换成容器**。
> 简单点, 就是描述**容器>>序列化>>镜像**以及**镜像>>反序列化>>容器**的规范😯

## 版本历史
- [v1](https://github.com/moby/moby/blob/master/image/spec/v1.md)
    - 初版
- [v1.1](https://github.com/moby/moby/blob/master/image/spec/v1.1.md)
    - 由 Docker v1.10 实现 (February, 2016)
    - 确定使用 sha256 摘要作为各层(Layer)的 id (以前是随机值)
    - 新增 **manifest.json** 文件, 该文件负责记录镜像内容和依赖关系的元数据。
- [v1.2](https://github.com/moby/moby/blob/master/image/spec/v1.2.md)
    - 由  Docker v1.12 实现 (July, 2016)
    - 将 Healthcheck 纳入镜像规范
- [OCI v1 image]((https://github.com/opencontainers/image-spec))
    - 由 Open Container Initiative (OCI) 提出的镜像规范
    - 不兼容 [Docker(moby)](https://github.com/moby/moby/pull/33355), 但可以 push 至 Registry 然后再 pull 下来

为了统一容器格式和运行时创建的标准, Docker 联合 CoreOS 等组织在 linux 基金会的主持下成立了 Open Container Initiative (OCI)。
目前 OCI 已经提出了两个规范:[运行时规范(runtime-spec)](https://github.com/opencontainers/runtime-spec)和[镜像规范(image-spec)](https://github.com/opencontainers/image-spec), 但**由于 docker 尚未兼容 OCI 镜像规范, 本文不涉及 OCI 镜像规范的内容。** ~~(不排除以后会写😆)~~

## 一个🌰 : Docker 镜像的基本结构
我们以 busybox:latest 为例, 展示 Docker 镜像的基础结构。
```bash
.
├── 036a82c6d65f2fa43a13599661490be3fca1c3d6790814668d4e8c0213153b12
│   ├── VERSION
│   ├── json
│   └── layer.tar
├── 6ad733544a6317992a6fac4eb19fe1df577d4dec7529efec28a5bd0edad0fd30.json
├── manifest.json
└── repositories

1 directory, 6 files
```
接下来以该🌰 详细介绍 Docker 镜像中各组成部分的含义和内容。

### directories (backward)
```bash
.
├── VERSION
├── json
└── layer.tar

0 directories, 3 files
```
可以发现, 镜像中的每层(Layer)解压后可以对应到一个目录，这些目录的名称是根据该层(Layer)的相关信息使用一致性 hash 算法生成, (TIPS: v1版本规范是随机生成), 每个目录包括 3 个文件, 分别是:
- VERSION, `json` 文件内容个格式规范, 目前只能是 1.0。
- json, 在 v1 版本中定义的描述该层(Layer)信息的元数据，但由于 v1.2 版本中不需要依赖此文件，因此无需关注。
- layer.tar, 存储该层(Layer)文件系统的变更记录的归档包。
> 需要注意的是, 这些目录布局仅是为了向后兼容, 当前版本(v1.2)中每层(Layer)的归档包均在 `manifest.json` 指定。

### repositories (backward)
```json
{
  "busybox": {
    "latest": "036a82c6d65f2fa43a13599661490be3fca1c3d6790814668d4e8c0213153b12"
  }
}
```
repositories 中存储了一个 json 对象, 该对象的每个 key 是镜像的名称, value 是`标签-镜像id映射表`。
> 需要注意的是, 该文件同样是仅用于向后兼容, 当前版本(v1.2)中镜像与layer的关系均在 `manifest.json` 中指定。

### manifest.json
```json
[
  {
    "Config": "6ad733544a6317992a6fac4eb19fe1df577d4dec7529efec28a5bd0edad0fd30.json",
    "RepoTags": [
      "busybox:latest"
    ],
    "Layers": [
      "036a82c6d65f2fa43a13599661490be3fca1c3d6790814668d4e8c0213153b12/layer.tar"
    ]
  }
]
```
`mainfest.json` 记录了一个列表, 该列表中每一项描述了一个镜像的内容清单以及该镜像的父镜像(可选的)。
该列表中每一项由以下几个字段组成:
- Config: 引用启动容器的配置对象。
- RepoTags: 描述该镜像的引用关系。
- Layers: 指向描述该镜像文件系统各(Layer)的变更记录。
- Parent: (可选) 该镜像的父镜像的 imageID, 该父镜像必须记录在当前的 manifest.json。
> 需要注意的是, 该 manifest.json 与 Docker Register API 描述的 manifest.json 不是同一个文件。(详见附录部分)

### Config (aka Image JSON)
```json
{
	"architecture": "amd64",
	"config": {
		"Hostname": "",
		"Domainname": "",
		"User": "",
		"AttachStdin": false,
		"AttachStdout": false,
		"AttachStderr": false,
		"Tty": false,
		"OpenStdin": false,
		"StdinOnce": false,
		"Env": [
			"PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
		],
		"Cmd": [
			"sh"
		],
		"ArgsEscaped": true,
		"Image": "sha256:7def3adf6786f772d2f02fc74c2d3f3334228416760aee45d3b6e561ce1c1dd3",
		"Volumes": null,
		"WorkingDir": "",
		"Entrypoint": null,
		"OnBuild": null,
		"Labels": null
	},
	"container": "3fbce8bb8947b036ee7ff05a86c0574159c04fc10a3db7485ab7bf4f56fd4020",
	"container_config": {
		"Hostname": "3fbce8bb8947",
		"Domainname": "",
		"User": "",
		"AttachStdin": false,
		"AttachStdout": false,
		"AttachStderr": false,
		"Tty": false,
		"OpenStdin": false,
		"StdinOnce": false,
		"Env": [
			"PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
		],
		"Cmd": [
			"/bin/sh",
			"-c",
			"#(nop) ",
			"CMD [\"sh\"]"
		],
		"ArgsEscaped": true,
		"Image": "sha256:7def3adf6786f772d2f02fc74c2d3f3334228416760aee45d3b6e561ce1c1dd3",
		"Volumes": null,
		"WorkingDir": "",
		"Entrypoint": null,
		"OnBuild": null,
		"Labels": {}
	},
	"created": "2017-11-03T22:39:17.345892474Z",
	"docker_version": "17.06.2-ce",
	"history": [{
			"created": "2017-11-03T22:39:17.173629428Z",
			"created_by": "/bin/sh -c #(nop) ADD file:264af0c48e23e8b8fc57c2c70c7b5b08be20601d75f5efca07c5ace8748bcbcd in / "
		},
		{
			"created": "2017-11-03T22:39:17.345892474Z",
			"created_by": "/bin/sh -c #(nop)  CMD [\"sh\"]",
			"empty_layer": true
		}
	],
	"os": "linux",
	"rootfs": {
		"type": "layers",
		"diff_ids": [
			"sha256:0271b8eebde3fa9a6126b1f2335e170f902731ab4942f9f1914e77016540c7bb"
		]
	}
}
```
#### created `string`
```json
{
    "created": "2017-11-03T22:39:17.345892474Z"
}
```
ISO-8601 格式的字符串, 描述了当前镜像创建的日期和时间。

#### author `string`
```json
{
    "author": "nobody"
}
```
描述创建并维护这个镜像的个人或实体的名称和/或电子邮箱。

#### architecture `string`
```json
{
    "architecture": "amd64"
}
```
描述该镜像中的二进制文件运行依赖的 CPU 架构，可能的值包括:
- 386
- amd64
- arm
> 需要注意的是, 可选范围的值未来可能会添加或减少, 同时, 这里声明的值在不一定会被容器运行时实现(e.g. runc 或 rkt)所支持。

#### os `string`
```json
{
    "os": "linux"
}
```
描述该镜像运行所基于的操作系统的名称, 可能的值包括:
- darwin
- freebsd
- linux
> 需要注意的是, 可选范围的值未来可能会添加或减少, 同时, 这里声明的值在不一定会被容器运行时实现(e.g. runc 或 rkt)所支持。

#### config (aka Container RunConfig) `object, optional`
```json
{
    "config": {
        "User": "",
        "Tty": false,
        "Env": [
            "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
        ],
        "Entrypoint": null,
        "Cmd": [
            "sh"
        ],
        "Volumes": null,
        "WorkingDir": "",
        "Labels": null
    }
}
```
描述容器运行时在实例化该镜像时, 所使用的默认参数。
> 需要注意的是, 该字段可以为 null, 在这种情况下, 应在创建容器时指定运行所需要的任何参数。

##### User `string`
```json
{
    "config": {
        "User": "root"
    }
}
```
描述容器中应该使用的用户名或UID, 当创建容器时未指定该值时，该值将用作默认值。
该字段支持以下格式:
- user
- uid
- user:group
- uid:gid
- uid:group
- user:gid
> 需要注意的是, 当不提供 `group/gid` 时, 默认行为会从容器中 /etc/passwd 中根据给定的 user/uid 配置默认组合补充组(supplementary groups)。

##### Memory `integer`
```json
{
    "config": {
        "Memory": 1024
    }
}
```
描述容器实例的内存限制(以 bytes 为单位), 当创建容器时未指定该值时，该值将用作默认值。

##### MemorySwap `integer`
```json
{
    "config": {
        "MemorySwap": -1
    }
}
```
描述允许容器使用的总内存使用量(memory + swap), 当创建容器时未指定该值时，该值将用作默认值。
> 需要注意的是, 设置该值为 -1 时, 表示关闭内存交换。

##### CpuShares `integer`
```json
{
    "config": {
        "CpuShares": 4
    }
}
```
CPU 份额(对于其他容器而言的相对值), 当创建容器时未指定该值时，该值将用作默认值。

##### WorkingDir `string`
描述容器启动入口点进程时所在的工作目录, 当创建容器时未指定该值时，该值将用作默认值。

##### Env `array[string]`
```json
{
    "config": {
        "Env": [
            "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
        ]
    }
}
```
描述运行该镜像时的默认环境变量, 这些值将用作默认值, 并会在创建容器时指定的值进行合并。
该列表的每一项的格式为: `VARNAME="VAR VALUE"`

##### Entrypoint `array[string]`
```json
{
    "config": {
        "Entrypoint": [
            "bash",
            "-c"
        ]
    }
}
```
描述启动容器时要执行的命令的参数列表, 当创建容器时未指定该值时，该值将用作默认值。

##### Cmd `array[string]`
```json
{
    "config": {
        "Cmd": [
            "ls",
        ]
    }
}
```
描述容器入口(entry point) 的默认参数, 当创建容器时未指定该值时，该值将用作默认值。
> 需要注意的是, 如果未指定 `Entrypoint`, 那么 cmd 数组中的第一项应当为要运行的可执行文件。

##### Healthcheck `object`
```json
{
    "config": {
        "Healthcheck": {
            "Test": [
                "CMD-SHELL",
                "/usr/bin/check-health localhost"
            ],
            "Interval": 30000000000,
            "Timeout": 10000000000,
            "Retries": 3
        }
    }
}
```
描述确认容器是否健康的方法，该对象由 4 部分组成, 分别是:
- Test `array[string]`, 检查容器是否健康的测试方法, 可选项为:
    - `[]`: 从父级镜像继承健康检查配置
    - `["None"]`: 禁用健康检查
    - `["CMD", arg1, arg2, ...]`: 直接执行参数
    - `["CMD-SHELL", command]`: 使用镜像中的默认Shell运行命令
- Interval `integer`: 两次探测之间等待的纳秒数。
- Timeout `integer`: 一次探测中等待的纳秒数。
- Retries `integer`: 认为容器不健康所需的连续失败次数。
如果省略该字段, 则表示该值应从父级镜像中获取，同时，这些值将用作默认值, 并会在创建容器时指定的值进行合并。

##### ExposedPorts `object, optional`
```json
{
    "config": {
        "ExposedPorts": {
            "8080": {},
            "53/udp": {},
            "80/tcp": {}
        }
    }
}
```
一组端口, 描述运行该镜像的容器所需要对外暴露的端口组。存储结构为一个 json 对象, 该对象的每个 key 是需要暴露的端口和协议, value 必须是空对象 `{}`。
该对象的键(key)可以是以下的几种格式:
- port/tcp
- port/udp
- port
> 需要注意的是, 该配置的结构之所以如此诡异, 是因为它是直接从 Go 类型 map[string]struct{} 序列化而成的, 因此在 json 中表现为 value 是空对象 `{}`。

##### Volumes `object, optional`
```json
{
    "config": {
        "Volumes": {
            "/var/my-app-data/": {},
            "/etc/some-config.d/": {}
        }
    }
}
```
一组目录, 描述运行该镜像的容器应该被挂载卷覆盖的目录路径。存储结构为一个 json 对象, 该对象的每个 key 是应该被挂载卷覆盖的目录路径, value 必须是空对象 `{}`。
> 需要注意的是, 该配置的结构之所以如此诡异, 是因为它是直接从 Go 类型 map[string]struct{} 序列化而成的, 因此在 json 中表现为 value 是空对象 `{}`。

#### rootfs `object`
```json
{
    "rootfs": {
        "type": "layers",
        "diff_ids": [
            "sha256:0271b8eebde3fa9a6126b1f2335e170f902731ab4942f9f1914e77016540c7bb"
        ]
    }
}
```
`rootfs` 描述该镜像引用的 Layer DiffIDs (详情见附录-术语表), 在镜像配置(Config)存放该值, 可以使得计算镜像配置文件的hash值时, 会根据关联的文件系统的 hash 值的变化而变化。该对象包含两部分, 分别是:
- type: 通常将该值设置为 `layers`。
- diff_ids `(array[Layer DiffIDs])`: 按依赖顺序排序, 即从最底部的层(Layer)到最顶部的层(Layer)排序。

#### history `array`
```json
{
    "history": [{
			"created": "2017-11-03T22:39:17.173629428Z",
			"created_by": "/bin/sh -c #(nop) ADD file:264af0c48e23e8b8fc57c2c70c7b5b08be20601d75f5efca07c5ace8748bcbcd in / "
		},
		{
			"created": "2017-11-03T22:39:17.345892474Z",
			"created_by": "/bin/sh -c #(nop)  CMD [\"sh\"]",
			"empty_layer": true
		}
	]
}
```
`history`描述了该镜像每层(Layer)的历史记录的对象数组，数组按照依赖关系排序，即从最底部的层(Layer)到最顶部的层(Layer)排序。数组中每个对象具有以下的字段:
- created: 该字段描述了该层(Layer)的创建的日期和时间, 要求为ISO-8601 格式的字符串。
- author: 该字段描述创建并维护该层(Layer)的个人或实体的名称和/或电子邮箱。
- created_by: 该字段描述创建该层(Layer)时调用的指令。
- comment: 该字段描述创建该层(Layer)时的自定义注解。
- empty_layer: 该字段用于标记历史记录项是否导致文件系统出现差异, 如果此历史记录项未对应到 `rootfs` 中实际的一项记录, 那么就应该将该项设置为 `true`(简单点, 就是如果 Dockerfile 里执行了类似 ENV, CMD 等指令, 由于这些指令不会导致文件系统的变更, empty_layer 就应该设置为 `true`)。

# 总结
本文主要先从梳理了Docker镜像规范的**版本历史**, 随后简单介绍了 OCI 组织和 OCI 镜像规范与 Docker 镜像规范之间的关系。接下来从一个简单但完整的 🌰 中展示了 **Docker 镜像的目录结构**, 再以此 🌰 介绍了现行镜像规范内容, 其中包括 **manifest.json** 和 **Config** 这两个重要文件的含义和内容。

当你看到这里的时候, 现行的 Docker 镜像规范已经完全介绍完毕, 从下一篇文章开始就进入**实战**内容。预期在下一章里, 我会为大家介绍**如何借助 `runc` 将一个镜像实例化一个容器**, 进一步探讨镜像中各 `Layer` 中记录的 `Filesystem Changeset` 的内容, 为最后介绍如何构建镜像打下铺垫。

> 吐槽: 规范是很文绉绉的内容, 而事实上 Docker 自身的镜像规范的描述得很混乱, 会出现术语混乱的情形。例如 `Image JSON` 在 manifest.json 又被称之为 `Config`; 镜像分发规范和镜像规范又会同时出现 `manifest`。

# 附录
## 术语表
### Layer
Docker 镜像采用了分层结构。每层都是一组文件系统的变更历史。`Layer` 不负责存储诸如环境变量或默认参数等配置元数据, 这些都是整个镜像的属性, 而不属于任何特地的层。

### Image JSON
每个镜像都有一个关联的 JSON 结构(被称之为 Image JSON), 这个结构描述有关该镜像的一些基本信息, 例如创建日期, 作者和其父镜像的ID, 以及运行时的相关配置(包括入口点(entry point), 默认参数, CPU/内存限制, 网络配置以及挂载卷信息等)。除此之外, 该结构还记录着该镜像引用的每一层的hash签名, 并提供这些层的历史信息。
依据规范, 该结构被认为是不可变的, 因为修改本结构就意味着需要重新计算 `ImageID`, 也就意味着创建了新的派生镜像, 原镜像的 Image JSON 并未发送变化。

### Image Filesystem Changeset
Docker 镜像中每一层都保存着相对于它上一层而言, 新添加(added), 发送变更(changed), 或者删除(deleted)的文件的归档包(又称之为文件系统变更集)。通过使用基于层(layer-based)的文件系统或者联合(union)文件系统(例如AUFS), 或者通过计算文件系统快照的差异, 文件系统变更集(`Filesystem Changeset`)可以表现这一系列的镜像层, 就好像这些变更是发送在同一个文件系统上的一样。

### Layer DiffID
Docker 使用在镜像分发传输时, 每层的 tar 归档文件的 SHA256 摘要来引用镜像层。例如, `sha256:0271b8eebde3fa9a6126b1f2335e170f902731ab4942f9f1914e77016540c7bb` 则是一个合法的 `Layer DiffID`。
> 需要注意的是, 必须使用可再现(重放)的方式打包和解包镜像层, 以免更改镜像层ID。例如, 通过使用 `tar-split` 来保存 tar 头。
> 同时, `Layer DiffID` 必须是从未压缩过的 tar 版本计算而来的。

### Layer ChainID
为了方便起见, 有时需要用单个 ID 来表示一层一系列镜像层, 这就引入了 `Layer ChainID` 这一概念。对于仅有一层或者位于最底部的层而言, `Layer ChainID` 等同于 `Layer DiffID`; 而对于其他层而言, `Layer ChainID` 可由以下公示计算: `ChainID(Layer N) = SHA256hex(ChainID(Layer N-1) + " " + DiffID(Layer N))`。

### ImageID
使用以下公示计算镜像ID: `ImageID = SHA256hex(Image JSON)`, 由于 `Image JSON`中引用了镜像中每一层的 hash 值, 因此 ImageID 的计算方法使得镜像内容可寻址(content-addressable)。
> 需要注意的是, Docker 规范中 `Image JSON` 是不含有任何格式化的。因此在计算 SHA256hex 时, 需要保证不含有任何缩进。

### Tag
`Tag` 可用于将用户提供的描述性名称映射到任意单个 `ImageID`, `Tag` 只能从以下的字符集中取值: `[a-zA-Z0-9_.-]`, 同时首字符又不允许为 `.` 或 `-`, 而且长度不允许大于 **128** 个字符。 

### Repository
`Repository` 即镜像名称中 `:` 之前的部分。例如, 一个镜像被命名为 `my-app:3.1.4`, 那么 `my-app` 即被称之为 `Repository`。`Repository`由 `/` 分割的名称组成, 可以选择以 DNS 主机名作为前缀(必须符合标准 DNS 规则, 但不允许含有 `_` 字符)。同时, 如果 `Repository` 存在主机名, 那么就可以在其后加上端口号, （e.g. `:8080`)。最后, `Repository` 不允许以 `/` 开头或者结尾。

## Image Manifest Version 2
与镜像规范中的 `Manifest.json` 不同, `Image Manifest Version 2` 主要被使用于 `Docker Registry API V2`, 即 `docker pull` 以及 `docker push` 等操作之中。
目前 `Image Manifest Version 2` 已推出两个版本, 分别是:
- [Image Manifest V 2, Schema 1](https://docs.docker.com/registry/spec/manifest-v2-1/)
- [Image Manifest V 2, Schema 2](https://docs.docker.com/registry/spec/manifest-v2-2/)
该协议通过引入额外的 Media Type 和 Registry 的 manifest 结构, 解决了 Registry 能提供哪些镜像, 镜像的格式、兼容的操作系统以及镜像各层应该从何处获取等问题。
> 简单点, 就是一份描述镜像文件分发的协议, 对此, OCI 也拟了一份[规范](https://github.com/opencontainers/distribution-spec)。
