---
date: 2021-03-31
title: How To Run Container:OCI 运行时规范
sidebarDepth: 2
category: 容器技术
tags:
-   OCI
-   docker

draft: false
---
## 前言
现在是容器化时代，不管是开发、测试还是运维，很少有人会不知道或不会用 Docker。使用 Docker 也很简单，很多时候启动容器无非就是执行 `docker run {your-image-name}`，而构建镜像也就是执行一句 `docker build dockerfile .`的事情。   
也许正是由于 **Docker** 对实现细节封装得过于彻底，有时候会觉得我们也许只是学会了**如何使用`Docker CLI`** , 而并非明白 Docker 是如何运行的。   
笔者在编写『How To Build Images』时发现, 构建镜像和运行容器并非两条平行线。在介绍构建时或多或少会涉及运行时的内容，因此决定同时开展另一系列文章『How To Run Container』，而这是新系列的第一篇，『OCI 运行时规范』。

## [OCI运行时规范](https://github.com/opencontainers/runtime-spec/blob/master/spec.md)
OCI运行时规范旨在指定容器的**配置**，**执行环境**和**生命周期**。
- 定义如何描述容器所支持的平台和创建容器实例时需要的配置信息(`config.json`)，避免各`运行时实现`提出不同标准
- 定义容器的执行环节，确保容器内运行的应用程序在各`运行时实现`中具有一致的环境
- 定义容器的生命周期，确保容器在各`运行时实现`中具有一致的表现

### [容器格式 -- 文件系统捆绑包(Filesystem Bundle)](https://github.com/opencontainers/runtime-spec/blob/master/bundle.md)
OCI运行时规范提出将容器编排为文件系统捆绑包(Filesystem Bundle)的形式, 即以某种方式组织一系列文件, 其中包含足以让合规的`运行时实现`能够启动容器的所有必要数据和元数据。  
一个标准的容器捆绑包包含了加载和运行容器所需的所有信息, 其中包括以下内容:
- `config.json`: 包含容器的配置信息。该文件必须存储在捆绑包的根目录, 且必须被命名为 **config.json**。文件的详细内容见后文。
- 容器的根文件系统(`root filesystem`): 由 `root.path` 属性指定的目录（可选）。

需要注意的是, 容器的运行时内容必须全部存储在本地文件系统上的单个目录中, 但该目录本身不属于捆绑包的一部分。   
换而言之, 在使用 `tar` 归档容器捆绑包时, 这些内容应该存储在归档文件的根目录中, 而不是嵌套在其他目录之下:
```bash
.
├── config.json
└── $root.path
```

### [运行时实现和容器生命周期](https://github.com/opencontainers/runtime-spec/blob/master/runtime.md)
#### 容器的作用域
`运行时实现`的实例必须能够对其创建的容器执行本规范中定义的操作，且不可操作其他容器，不管其他容器是使用相同的`运行时实现`或不同的`运行时实现`创建的。

#### 容器的状态
使用 `State` 对象描述容器的状态, 将该对象序列化成 JSON 时, 格式如下所示:

```json
{
    "ociVersion": "0.2.0",
    "id": "oci-container1",
    "status": "running",
    "pid": 4422,
    "bundle": "/containers/redis",
    "annotations": {
        "myKey": "myValue"
    }
}
```
容器状态包含以下几个属性:
- **ociVersion** (string, REQUIRED): 描述该运行时遵守的 「OCI运行时规范」 版本
- **id** (string, REQUIRED): 描述容器的 ID。该值在该主机上的所有容器中必须是唯一的，但不需要在主机之间保证唯一性。
- **status** (string, REQUIRED): 描述该容器的运行状态, 必须在以下各值中取值:
    - **creating**: 容器正在创建 (生命周期中的第2步)
    - **created**: 运行时已执行完创建操作 (生命周期中的第2步), 此时容器进程处于运行状态但又未执行用户指定的程序
    - **running**: 容器进程已执行用户指定的程序, 且尚未推出 (生命周期中的第5步之后)
    - **stopped**: 容器进程已退出 (生命周期中的第7步)
    可由运行时实现定义额外的状态, 但不可与上述定义的运行时状态重复。
- **pid** (int, 对于 linux 以外的操作系统为可选值, 对于 linux 系统的 created, running 阶段是必须值): 描述容器进程的 ID。对于在运行时命名空间(namespace)中执行的钩子(hooks), 该值是运行时实现所感知的 pid。对于在容器命名空间(namespace)中执行的钩子(hooks), 该值是容器所感知到的 pid。
- **bundle** (string, REQUIRED): 描述容器的捆绑包目录的绝对路径。(提供此信息是为了让使用者可以在主机上找到容器的配置和根文件系统。)
- **annotations** (map, OPTIONAL): 描述与容器关联的注解。如果没有提供注解, 则该属性可以不存在或为空。
除此之外, 运行时实现可以往 State 对象添加额外的属性。

#### 容器的生命周期
容器的生命周期依据时间轴的先后顺序描述了从创建容器到销毁之间发生的事件。
1. 传递捆绑包位置和容器唯一标识作为参数, 调用由遵循 OCI 标准的 `运行时实现` 实现的 **create** 指令。
2. `运行时实现`根据 `config.json` 中的配置创建容器的运行时环境, 如果无法创建该环境, 则必须生成**错误(Error)**。该步骤仅负责创建 `config.json` 中请求的资源, 但并不运行用户指定的程序。在此不走之后, 任何对 `config.json` 的更新都不会影响到容器实例。
3. `运行时实现`调用 **prestart** 钩子, 如果调用时出现异常, 则必须生成**错误(Error)**, 并停止容器, 并直接跳转至步骤12继续执行。
4. `运行时实现`调用 **createRuntime** 钩子, 如果调用时出现异常, 则必须生成**错误(Error)**, 并停止容器, 并直接跳转至步骤12继续执行。
5. `运行时实现`调用 **createContainer** 钩子, 如果调用时出现异常, 则必须生成**错误(Error)**, 并停止容器, 并直接跳转至步骤12继续执行。
6. 传递步骤1中使用的容器唯一标识作为参数, 调用由遵循 OCI 标准的 `运行时实现` 提供的 **start** 指令。
7. `运行时实现`调用 **startContainer** 钩子, 如果调用时出现异常, 则必须生成**错误(Error)**, 并停止容器, 并直接跳转至步骤12继续执行。
8. `运行时实现`开始运行 **process** 指定的用户指定的程序。
9. `运行时实现`调用 **poststart** 钩子, 如果调用时出现异常, 则必须记录**警告(Warning)**, 但继续执行生命周期, 就像该钩子执行成功一样。
10. 容器进程退出。
11. 传递步骤1中使用的容器唯一标识作为参数, 调用由遵循 OCI 标准的 `运行时实现` 提供的 **delete** 指令。
12. 必须通过回退在创建阶段(步骤2)中执行的步骤来销毁容器。
13. `运行时实现`调用 **poststop** 钩子, 如果调用时出现异常, 则必须记录**警告(Warning)**, 但继续执行生命周期, 就像该钩子执行成功一样。

#### OCI运行时标准操作
OCI运行时规范定义了 5 个标准操作, 规范了与容器之间的交互流程。
- Query State: `state <container-id>` 根据指定的容器ID查询容器的状态。
- Create: `create <container-id> <path-to-bundle>` 根据容器捆绑包路径和容器ID创建容器实例
- Start: `start <container-id>` 执行用户指定的程序。
- Kill: `kill <container-id> <signal>` 将指定的信号发送到容器进程。
- Delete: `delete <container-id>` 删除容器以及在**create**步骤中创建的资源。

### [容器的配置](https://github.com/opencontainers/runtime-spec/blob/master/config.md)
配置文件必须包含对容器实施标准操作所需要的数据和元数据，其中包括容器要运行的进程，需要注入的环境变量，要使用的沙盒功能等等。
大体上, 容器配置可划分为 8 个组成要素, 分别是: `规范版本(ociVersion)`, `根文件系统配置(root)`, `挂载点配置(mounts)`, `进程信息(process)`, `主机名(hostname)`, `钩子(hooks)` , `注解(annotations)` 和 `平台相关配置`。
#### 规范版本 ociVersion (string, REQUIRED)
```json
{
    "ociVersion": "0.1.0"
}
```
规范版本(ociVersion) 必须是 [SemVer v2.0.0](https://semver.org/spec/v2.0.0.html) 格式的字符串, 表示当前容器捆绑包所支持的 OCI 运行时规范版本。

#### 根文件系统配置 root (object, OPTIONAL)
```json
{
    // For POSIX platforms
    "root": {
        "path": "rootfs",
        "readonly": true
    },
    // For Windows
    "root": {
        "path": "\\\\?\\Volume{ec84d99e-3f02-11e7-ac6c-00155d7682cf}\\"
    }
}
```
根文件系统配置 (root) 指定容器的根文件系统, 包含以下字段:
- **path** (string, REQUIRED): 描述容器的根文件系统的路径(在宿主机的位置)。
    - 对于 POSIX platforms 平台, **path** 可以是根文件系统的相对路径或绝对路径。例如, 容器捆绑包位于 `/to/bundel/` 以及根文件系统位于 `/to/bundel/rootfs`, 那么 path 的值可以为 `/to/bundel/rootfs` 或 `rootfs`。
    - 对于 Windows 平台, `path` 必须是数据卷的 GUID 路径。
- **readonly** (bool, OPTIONAL): 描述根文件系统在容器内是否可写的, 默认值是 false。
    - 对于 Windows 平台, 该值必须缺省或为 false。

#### 挂载点配置 mounts (array of objects, OPTIONAL)
```json
{
    // For POSIX platforms
    "mounts": [
        {
            "destination": "/tmp",
            "type": "tmpfs",
            "source": "tmpfs",
            "options": ["nosuid","strictatime","mode=755","size=65536k"]
        }
    ],
    // For Windows
    "mounts": [
        {
            "destination": "C:\\folder-inside-container",
            "source": "C:\\folder-on-host",
            "options": ["ro"]
        }
    ],

}
```
挂载点配置 (mounts) 指定容器除了根目录以外的挂载点。`运行时实现` 必须按 `mounts` 的声明顺序进行挂载。`mounts` 对象包含以下字段:
- **destination** (string, REQUIRED): 描述挂载点的目标位置(容器内的路径), 该值必须是绝对路径。
- **source** (string, OPTIONAL): 一个设备名称，或者是需要挂载到容器的文件和目录的名称。对于 `bind` 类型的挂载, 该值必须是绝对路径或是相对容器捆绑包的相对路径(与 **root.path** 一样)。
- **options** (array of strings, OPTIONAL): 挂载文件系统时的挂载参数。
    - 对于 Linux 平台: 支持的 options 选项详见 [mount(8)](https://man7.org/linux/man-pages/man8/mount.8.html)。
    - 对于 Windows 平台: `运行时实现` 必须支持 `ro` 选项, 表示只读(read-only)。
    - 当 options 中包含 `bind` 或 `rbind` 时, 表示这是 `bind` 类型的挂载。
- **type** (string, OPTIONAL): 被挂载的文件系统的类型。
    - 对于 Linux 平台: 内核支持的文件系统类型声明在 `/proc/filesystems`。对于 `bind` 类型的挂载, **type** 值将被忽略, 按照业界习惯, 该值常被设置为 **none**。

#### 进程信息 process (object, OPTIONAL)
进程信息 (process) 指定容器执行的进程，在 `运行时实现` 调用 **start** 操作时, 该值是必须提供的。`process` 对象包含以下字段:
- **terminal** (bool, OPTIONAL): 描述能否将终端连接到进程, 默认值为 false。
- **consoleSize** (object, OPTIONAL): 描述终端控制台的大小(以字符为单位)。
    - **height** (uint, REQUIRED)
    - **width** (uint, REQUIRED)
- **cwd** (string, REQUIRED):
- **env** (array of strings, OPTIONAL) 
- **args** (array of strings, OPTIONAL)
- **commandLine**  (string, OPTIONAL) 
- **user** (object, REQUIRED): 描述执行进程的用户身份。
    - **uid** (int, REQUIRED): 在容器命名空间中的用户ID。
    - **gid** (int, REQUIRED): 在容器命名空间中的组ID。
    - **umask** (int, OPTIONAL): 用户掩码。
    - **additionalGids** (array of ints, OPTIONAL): 额外给进程添加的在容器命名空间中的组ID。

#### 主机名 hostname (string, OPTIONAL)
主机名 (hostname) 指定容器内进程所能看到的主机名。

#### 钩子 hooks (object, OPTIONAL) 
钩子 (hooks) 允许用户指定在各生命周期事件前后运行特定的程序。`运行时实现` 必须按钩子 (hooks) 的声明顺序依序执行，同时在调用钩子时必须通过 `标准输入(stdin)` 传递容器的状态。OCI运行时规范共定义 6 个钩子，分别是:
- **prestart** (DEPRECATED)：prestart 必须在 **start** 操作被调用之后, 但在用户指定的程序执行之前被调用(且需要在`运行时实现`的命名空间中杯调用)。**prestart** 定义的钩子包含以下参数:
- **createRuntime**: createRuntime 必须在 **create** 操作被调用时, 但在 `pivot_root` 或等效的操作执行之前被调用(且需要在`运行时实现`的命名空间中被调用)。
- **createContainer**: createContainer 必须在 **create** 操作被调用时, 且在**createRuntime**被调用后，但在 `pivot_root` 或等效的操作执行之前被调用(且需要在容器的命名空间中被调用)。
- **startContainer**: startContainer 必须作为 **start** 操作的一部分被执行, 且需要在执行用户指定的进程时被调用。
- **poststart**: poststart 必须在执行用户指定的进程之后, 但是 **start** 操作返回前被调用。
- **poststop**: poststop 操作必须在容器被删除, 但是 **delete** 操作返回前被调用。

以上所有钩子对象具有同样的结构定义:
- **path** (string, REQUIRED): 同 [IEEE Std 1003.1-2008 execv's `path`](https://pubs.opengroup.org/onlinepubs/9699919799/functions/exec.html), 但必须为绝对路径。
- **args** (array of strings, OPTIONAL): 同 [IEEE Std 1003.1-2008 `execv's argv`](https://pubs.opengroup.org/onlinepubs/9699919799/functions/exec.html) 中的定义。
- **env** (array of strings, OPTIONAL): 同 [IEEE Std 1003.1-2008 `environ`](https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap08.html#tag_08_01) 中的定义
- **timeout** (int, OPTIONAL): 描述执行该钩子的等待超时时间，如果设置，则必须为正数。

#### 注解 annotations (object, OPTIONAL) 
```json
{
    "annotations": {
        "com.example.gpu-cores": "2"
    }
}
```
注解 (annotations) 用于存储容器相关的元数据。注解的键必须为非空字符串，注解的键必须为字符串。

#### 平台相关配置
目前OCI运行时规范主要针对 4 类平台做了差异化设定, 分别为: [linux](https://github.com/opencontainers/runtime-spec/blob/master/config-linux.md), [windows](https://github.com/opencontainers/runtime-spec/blob/master/config-windows.md), [solaris](https://github.com/opencontainers/runtime-spec/blob/master/config-solaris.md), [vm](https://github.com/opencontainers/runtime-spec/blob/master/config-vm.md)。对于不同的平台, 直接使用平台名称为 Key 配置对应的配置即可。例如:
```json
{
    "linux": {
        "namespaces": [
            {
                "type": "pid"
            }
        ]
    }
}
```
由于篇幅有限, 暂时不再继续罗列平台之间的差异化配置，感兴趣的读者可以从传送门翻过去看规范原文，或者等我后继空闲继续翻译整理。

## 总结
本文主要翻译了OCI运行时规范的主要内容, 方便对容器技术感兴趣的童鞋快速了解OCI运行时规范涉及的领域。由于精力有限暂且整理到这里，后继有空再整理平台差异化相关的配置项。