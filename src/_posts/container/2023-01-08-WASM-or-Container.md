---
date: 2023-01-08
title: Webassembly - 会是下一代的容器运行时吗?  
sidebarDepth: 2
category: 容器技术
tags:
-   Webassembly

draft: false
---
## 前言
2013年3月20日, DotCloud 发布了 Docker 的首个版本, 从此开启了容器化时代的序幕。现在是容器化时代, 不管是开发、测试还是运维, 很少有人会不知道或不会用 Docker。自 Docker 发布至今的 10年内, 开源和社区共建让容器化技术如日中天。尽管容器化产品迭代迅速, 但是容器技术的核心却一直围绕着 Linux, 每当我们提及容器时, 实际上我们指代的往往是基于 Linux Kernel 的运行时实现。
时至今日, 除了 Linux 容器以外还有很多容器运行时实现, 例如 [Kata Containers](https://github.com/kata-containers/kata-containers) 和 [gVisor](https://github.com/google/gvisor), 那究竟谁会是下一代运行时实现呢？-- 很可能是 Webassembly。

这篇文章会介绍什么是 WebAssembly, 为什么它有成为下一代运行时实现的潜力, 并演示 WebAssembly 容器与常规的 Linux 容器的差异。

::: tip 延伸阅读: 什么是容器？
**容器镜像**是一个轻量级的、独立的、可执行的**软件包**, 只要**应用程序**打包成容器镜像交付, 无论在何种基础架构(Linux 或 Windows; ARM 或 X86), 它们都将始终以相同的方式运行。

**容器**提供一种可以快速且可靠地将**应用程序**从一个计算环境运行到另一个计算环境的技术, 容器是软件即服务(Software as a service, SaaS)。
:::

## 什么是 Webassembly (aka Wasm)
WebAssembly 是一种安全的、可移植的、低级别的(类似于汇编)的编程语言(或者说是二进制指令格式, 类似于汇编), 需要在基于堆栈的虚拟机中执行。
Wasm 被设计为编程语言的可移植编译目标, 主要目标是在 Web 上实现高性能的应用。

## Hello Wasm
我们通过简单的 Hello World Demo 快速认识什么是 Wasm 程序。

### 源语言 Rust
Wasm 是编程语言的可移植编译目标, 因此需要从另一种语言编译生成, 常见的源语言是 Rust, 以下是一个最简单的基于 Rust 的 Hello World 样例代码:
```rust
// file: hello.rs
fn main() {
  println!("Hello Wasm");
}
```

由于 Rust 的规则, 还需要编写 Cargo.toml 才能编译代码。
```toml
## file: Cargo.toml
[package]
name = "hello"
version = "0.0.1"

[[bin]]
name = "hello"
path = "hello.rs"

[dependencies]
```

测试运行 hello.rs
```bash
❯ cargo run
   Compiling hello v0.0.1
    Finished dev [unoptimized + debuginfo] target(s) in 0.26s
     Running `target/debug/hello`
Hello Wasm
```

### 编译 Wasm
默认情况下, Rust 会被编译成可执行文件, 我们需要指定额外的编译参数才能编译得到 Wasm

```bash
## 安装编译依赖
❯ rustup target add wasm32-wasi
info: downloading component 'rust-std' for 'wasm32-wasi'
info: installing component 'rust-std' for 'wasm32-wasi'
## 编译成 Wasm
❯ rustc hello.rs --target wasm32-wasi
## 编译生成 hello.wasm
❯ ls -lah hello.wasm
-rwxr-xr-x  1 shabbywu  staff   2.1M  1  8 16:04 hello.wasm
```

### 执行
WebAssembly 是一种用于基于堆栈的虚拟机的二进制指令格式, 需要使用 WebAssembly 虚拟机才能执行 Wasm。常见的主要浏览器引擎(如 Chrome, Edge, Firefox 和 Safari)均支持执行 Wasm, 但想要在终端执行则需要先安装 Wasm 运行时, 以下是目前流行的 Wasm 运行时实现:
- [Wasmtime](https://wasmtime.dev/), 是由[字节码联盟(Bytecode Alliance)](https://bytecodealliance.org/)开发的快速, 安全的 WebAssembly 运行时。
- [WAMR](https://github.com/bytecodealliance/wasm-micro-runtime), 是由[字节码联盟(Bytecode Alliance)](https://bytecodealliance.org/)开发的 WebAssembly 轻量级运行时, 适用于嵌入式、物联网、边缘计算、智能设备等场景。
- [Wasmer](https://wasmer.io/) 提供基于 WebAssembly 的超轻量级容器,其可以在任何地方运行：从桌面到云、以及 IoT 设备, 并且也能嵌入到 任何编程语言中。
- [Wasm3](https://github.com/wasm3/wasm3) 是最快 WebAssembly **解释器**, 也是最通用的 Wasm 运行时。
- [WasmEdge](https://wasmedge.org/) 是一种轻量级、高性能且可扩展的 WebAssembly 运行时, 适用于云原生、边缘和去中心化应用程序。 它为无服务器应用程序、嵌入式功能、微服务、智能合约和物联网设备提供支持。

我们选用 Star 数最多的 Wasmer 演示执行 Wasm:
```bash
## 安装 Wasmer
❯ curl https://get.wasmer.io -sSfL | sh
## 执行 hello.wasm
❯ wasmer run hello.wasm
Hello Wasm
```

##  为什么说 WebAssembly 具有成为下一代运行时实现的潜力？
Wasm 的特性让它充满无限可能:
- **标准** —— Wasm 被设计成无版本、特性可测试、向后兼容的, 主流浏览器均已实现初版 Wasm 规范。
- **快速** —— 它可以通过大多数运行时的 JIT/AOT 能力提供类似原生的速度。 与启动 VM 或启动容器不同的是, 它没有冷启动。
- **安全** —— 默认情况下, Wasm 运行时是沙箱化的, 允许安全访问内存。基于能力的模型确保 Wasm 应用程序只能访问得到明确允许的内容。软件供应链更加安全。
- **可移植** —— Wasm 的二进制格式是被设计成可在不同操作系统(目前支持 Linux、Windows、macOS、Android、甚至是嵌入式设备)与指令集（目前支持 x86、ARM、RISC-V等）上高效执行的。
- **高性能** —— Wasm 只需极小的内存占用和超低的 CPU 门槛就能运行。
- ️**支持多语言** —— [多种编程语言](https://github.com/appcypher/awesome-wasm-langs)可以编译成 Wasm。

### WebAssembly 正从浏览器走向服务端
WebAssembly 起源于浏览器, 最初主要用于补齐 JavaScript 在执行性能方面的短板, 但 Wasm 并非为了取代 JavaScript, 而是希望提供一种在浏览器(沙盒环境)执行大型应用程序的能力。
Wasm 依赖虚拟机执行, 而浏览器引擎能运行 Wasm 程序是因为浏览器引起集成了 Wasm 虚拟机。如果将 Wasm 虚拟机剥离出来单独运行, 那我们就可以在浏览器之外的地方执行 Wasm 程序。与浏览器执行环境不同, 服务端程序需要与外部环境(如文件系统、网络等)交互, 由于 Wasm 设计上是在安全沙箱执行的语言, 与外部环境交互将引入潜在的安全风险，因此 Wasm 提出了 [WASI(WebAssembly System Interface)](https://github.com/WebAssembly/WASI/blob/main/phases/snapshot/docs.md) 描述了 Wasm 程序支持的操作接口。
> WASI 由 Wasm 运行时实现, 例如 [fd_readdir](https://github.com/bytecodealliance/wasmtime/blob/main/crates/wasi-common/src/snapshots/preview_1.rs#L596) 是 [Wasmtime](https://wasmtime.dev/) 的读取目录接口的实现。

作为开发者并不需要关心 Wasm 虚拟机的具体实现, 只需要将应用程序编译为 Wasm 二进制指令即可在任意服务器上执行。
![Wasm执行在服务端的原理](/img/Wasm-work-on-servers.png)

### WebAssembly 对软件交付的影响
在容器化时代, 容器已成为软件交付的事实标准，基本上所有软件均提供了「容器」部署的方案。
为了统一容器的生命周期管理和交付介质，Open Container Initiative(OCI)提出了[5点标准容器需要符合的原则](https://github.com/opencontainers/runtime-spec/blob/main/principles.md), 而 WebAssembly 基本符合这些原则:
- Standard operations(标准操作): Wasm 定义了 main 函数作为主入口, Wasm 虚拟机执行 main 函数即可启动 Wasm 程序。
- Content-agnostic(与内容无关): Wasm 编译后以二进制文件交付, 天然与内容无关。
- Infrastructure-agnostic(与基础设施无关): Wasm 依赖基于堆栈的虚拟机, 而虚拟机实现不依赖基础设施。
- Industrial-grade delivery(工业级交付): Wasm 一次编译, 到处执行。Wasm 无需关心软件交付的问题。
- ❌ Designed for automation(为自动化而设计): Wasm 并不关心自动化部署的事宜, 但这不影响 Wasm 容器化，只是目前仍然缺乏标准流程和工具链(类似于 Dockerfile 和 Docker Cli)。

WebAssembly 的特性让它天生支持容器化，*如果应用程序都编译成 Wasm 交付*, 那意味着我们只需要完成一系列的封装操作，即可将 Wasm 程序自动化部署至所有服务器。为此, Solomon Hykes(Docker创始人)甚至提出 WASM+WASI 将是服务器软件基础设施的下一个发展方向。
::: warning [Solomon Hykes(Docker创始人)的推文]((https://twitter.com/solomonstre/status/1111004913222324225))
"If WASM+WASI existed in 2008, we wouldn't have needed to created Docker. That's how important it is. Webassembly on the server is the future of computing. A standardized system interface was the missing link. Let's hope WASI is up to the task!" -- Solomon Hykes, creator of Docker
:::

确实, 如果操作系统集成了 Wasm 虚拟机(就像浏览器一样), 同时*如果应用程序都编译成 Wasm*, 那么我们根本不需要 "Linux 容器", 不需要虚拟一层完整的 Linux 操作系统, 只需要 Wasm 虚拟机, 即可完成 Wasm 程序的"容器化部署"。

## 容器化 WebAssembly
Docker 在 2022 年 10 月 24 日宣布将在 Docker Desktop 4.15 以 Beta 特性支持运行 Wasm 容器！正如前文所言, Wasm 是一个更快、更轻量的 Linux/Windows 容器的替代品。这一节将演示 Wasm 容器与常规的 Linux 容器的差异，包括构建 Wasm 镜像、运行 Wasm 容器和原生执行的对比。
![Docker+Wasm](/img/Docker+Wasm.png)

### 构建并运行 Wasm 镜像
我们知道, 对于编译型语言最终生成的是 .wasm 文件, 编译镜像无任何技术含量。为了提高挑战性, 我们使用解释型语言 [CPython](https://github.com/python/cpython) 完成这一节的演示。

与 C 和 Rust 等编译型语言不同, 对于 Python、Ruby 等解释型语言, 我们需要将它们的解释器编译成 Wasm。一旦将解释器编译为 Wasm, 任何 Wasm 虚拟机都能够运行这些解释型语言。

理论如此, 但由于 WASI 并未提供完整的 POISX 兼容, 在编译 CPython 时需要修改部分源码, 开源项目 [python-wasi](https://github.com/singlestore-labs/python-wasi.git) 已完成了这个实验, 借助该项目即可将 CPython 编译成 Wasm。

#### 0. 整理项目结构
为了方便描述, 我们假设项目结构符合以下目录树, 具体内容见上文。
```bash
.
├── build.sh
└── src
    ├── main.py
    |── [cpython](https://github.com/python/cpython/archive/refs/tags/v3.11.1.tar.gz)
    └── [python-wasi](https://github.com/singlestore-labs/python-wasi)
```

其中, main.py 内容如下:
```python
import os
## 打印环境变量, 测试安全性
for k, v in os.environ.items():
  print(f"{k}={v}")

print("------")
print("Hello World")
print("------")
print(os.listdir())
```

#### 1. 编写 buildah 构建脚本
目前 Docker Engine 并未支持构建 Wasm 镜像, 因此需要使用 buildah 进行镜像构建, 由于需要将 CPython 编译成 wasm, 因此需要使用多阶段构建。
```bash
## build.sh
### python-wasi-builder
buildah from --format=docker --name python-wasi-builder docker.io/435495971/python-wasi-builder
buildah copy python-wasi-builder src/python-wasi .
buildah copy python-wasi-builder src/cpython cpython
buildah run -e WASMTIME_HOME=/root/.wasmtime -e WASI_SDK_PATH=/opt/wasi-sdk -e WASMTIME_BACKTRACE_DETAILS=1 -e PATH=/root/.wasmtime/bin:/opt/wasi-sdk/bin:/root/.wasmer/bin:/opt/wabt/build:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin python-wasi-builder /bin/bash run.sh

### wasm image
buildah from --name wasm-cpython scratch
buildah copy --from python-wasi-builder wasm-cpython wasi-python3.11.wasm /python3.wasm
buildah copy wasm-cpython src/main.py main.py 
buildah config --annotation "module.wasm.image/variant=compat" --entrypoint '["python3.wasm", "main.py"]' --os wasi --arch wasm32 wasm-cpython
buildah commit wasm-cpython docker.io/435495971/wasm-cpython
```

为了方便阅读, 上述 build.sh 与下列的 Dockerfile 等价
```dockerfile
FROM docker.io/435495971/python-wasi-builder as build
COPY src/python-wasi .
COPY src/cpython cpython
SHELL ["/bin/bash", "-c"] 
ENV WASMTIME_HOME=/root/.wasmtime
ENV WASI_SDK_PATH=/opt/wasi-sdk
ENV WASMTIME_BACKTRACE_DETAILS=1
ENV PATH=/root/.wasmtime/bin:/opt/wasi-sdk/bin:/root/.wasmer/bin:/opt/wabt/build:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
RUN ./run.sh

FROM scratch
COPY --from=build wasi-python3.11.wasm /python3.wasm
COPY src/main.py main.py
ENTRYPOINT [ "python3.wasm", "main.py"]
```

#### 2. 构建并上传镜像
构建镜像时需要指定平台架构为 `wasi/wasm32`

```bash
## 构建镜像
❯ chmod +x build.sh
❯ ./build.sh
❯ buildah push docker.io/435495971/wasm-cpython
```

#### 3. 运行镜像
运行 `wasi/wasm32` 需要指定平台架构为 `wasi/wasm32` 和运行时为 `io.containerd.wasmedge.v1`, 由于 WASI 协议不稳定, 目前只有 wasmtime 可以运行 wasm-cpython, 因此只能使用 [runwasi](https://github.com/containerd/runwasi) 运行 Wasm 容器。

```bash
❯ ctr run --rm \
  --runtime=io.containerd.wasmtime.v1 \
  docker.io/435495971/wasm-cpython:latest \
  testwasm

PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
------
Hello World
------
['main.py', 'python3.wasm']
```

### 原生 vs Wasm
现在我们将**原生 Linux Container**执行与 Wasm 执行进行比较, 对照组使用以下 Dockerfile 构建。

```dockerfile
FROM python:3.11.1
COPY main.py main.py
ENTRYPOINT ["python", "main.py"]
```

以下是构建镜像执行的输出结果:

```bash
## docker run -it --rm raw-example 
PATH=/usr/local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
HOSTNAME=ab16d4f1dbe1
TERM=xterm
LANG=C.UTF-8
GPG_KEY=A035C8C19219BA821ECEA86B64E628F8D684696D
PYTHON_VERSION=3.11.1
PYTHON_PIP_VERSION=22.3.1
PYTHON_SETUPTOOLS_VERSION=65.5.1
PYTHON_GET_PIP_URL=https://github.com/pypa/get-pip/raw/66030fa03382b4914d4c4d0896961a0bdeeeb274/public/get-pip.py
PYTHON_GET_PIP_SHA256=1e501cf004eac1b7eb1f97266d28f995ae835d30250bec7f8850562703067dc6
HOME=/root
------
Hello World
------
['mnt', 'home', 'var', 'run', 'boot', 'srv', 'tmp', 'sbin', 'media', 'dev', 'bin', 'lib', 'root', 'opt', 'etc', 'sys', 'usr', 'lib64', 'proc', '.dockerenv', 'main.py']
```

从对照实验可以看出, Wasm 容器输出的环境变量更少, 这是 Wasm 安全特性导致的。除非明确声明，否则 Wasm 程序无法获取到任何额外的环境变量。同时, 由于 Wasm 编译后不依赖外部链接, 容器内容更简洁。

## 总结
本文首先介绍了什么是 WebAssembly 以及 WebAssembly 为何具备成为下一代运行时实现的潜力。最后展示了如何构建 WebAssembly 容器, 并简单对比了 WebAssembly 容器和 Linux 容器的运行差异。
