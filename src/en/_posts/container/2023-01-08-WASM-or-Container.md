---
date: 2023-01-08
title: Webassembly - Will the next generation container runtime?
sidebarDepth: 2
category: Container Technology
tags:
-   Webassembly
---
## Preface
On March 20, 2013, DotCloud released the first version of Docker, marking the beginning of the era of containerization. Now, in the age of containerization, whether it's development, testing, or operations, few people are unaware of or do not know how to use Docker. Over the past decade since Docker's release, open source collaboration has propelled containerization technology to great heights. Despite rapid iteration of containerization products, the core of container technology has always revolved around Linux. Whenever we mention containers, we are essentially referring to runtime implementations based on the Linux Kernel.

Today, besides Linux containers, there are many other container runtime implementations, such as [Kata Containers](https://github.com/kata-containers/kata-containers) and [gVisor](https://github.com/google/gvisor). So, who might be the next generation runtime implementation? -- It's quite likely to be WebAssembly.

This article will introduce what WebAssembly is, why it has the potential to become the next generation runtime implementation, and demonstrate the differences between WebAssembly containers and conventional Linux containers.

::: tip Further Reading: What are Containers?
A **container image** is a lightweight, standalone, executable **software package**. When **applications** are packaged as container images for delivery, regardless of the underlying infrastructure (Linux or Windows; ARM or X86), they will always run in the same way.

**Containers** provide a technology for quickly and reliably running **applications** from one computing environment to another. Containers are a form of Software as a Service (SaaS).
:::

## What is WebAssembly (aka Wasm)
WebAssembly is a secure, portable, low-level (similar to assembly) programming language (or binary instruction format, akin to assembly) designed to be executed in a stack-based virtual machine.
Wasm is designed as a portable compilation target for programming languages, with the primary aim of achieving high performance applications on the Web.

## Hello Wasm
We'll quickly understand what a Wasm program is through a simple Hello World Demo.

### Source Language: Rust
WebAssembly is a portable compilation target for programming languages, thus requiring compilation from another language. A common source language is Rust. Below is the simplest example of a Hello World sample code based on Rust:

```rust
// file: hello.rs
fn main() {
  println!("Hello Wasm");
}
```

Due to Rust's conventions, it's also necessary to write a `Cargo.toml` file in order to compile the code.
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

Les's run hello.rs
```bash
❯ cargo run
   Compiling hello v0.0.1
    Finished dev [unoptimized + debuginfo] target(s) in 0.26s
     Running `target/debug/hello`
Hello Wasm
```

### Compiling Wasm
By default, Rust compiles into executable files. We need to specify additional compilation parameters to compile into Wasm.

```bash
## Install compilation dependencies
❯ rustup target add wasm32-wasi
info: downloading component 'rust-std' for 'wasm32-wasi'
info: installing component 'rust-std' for 'wasm32-wasi'

## Compile into Wasm
❯ rustc hello.rs --target wasm32-wasi

## Compile to generate hello.wasm
❯ ls -lah hello.wasm
-rwxr-xr-x  1 shabbywu  staff   2.1M  1  8 16:04 hello.wasm
```

### Execution
WebAssembly is a binary instruction format for stack-based virtual machines and requires a WebAssembly virtual machine to execute Wasm. Common major browser engines (such as Chrome, Edge, Firefox, and Safari) all support executing Wasm. However, to execute in the terminal, you need to install a Wasm runtime first. Here are popular Wasm runtime implementations:
- [Wasmtime](https://wasmtime.dev/), a fast, secure WebAssembly runtime developed by the Bytecode Alliance.
- [WAMR](https://github.com/bytecodealliance/wasm-micro-runtime), a lightweight WebAssembly runtime developed by the Bytecode Alliance, suitable for embedded, IoT, edge computing, smart devices, and other scenarios.
- [Wasmer](https://wasmer.io/), offering ultra-lightweight containers based on WebAssembly that can run anywhere: from desktop to cloud, IoT devices, and can also be embedded into any programming language.
- [Wasm3](https://github.com/wasm3/wasm3), the fastest WebAssembly **interpreter**, and the most universal Wasm runtime.
- [WasmEdge](https://wasmedge.org/), a lightweight, high-performance, and scalable WebAssembly runtime suitable for cloud-native, edge, and decentralized applications. It supports serverless applications, embedded functions, microservices, smart contracts, and IoT devices.

We'll demonstrate executing Wasm using Wasmer, which has the highest number of stars.
```bash
## Install Wasmer
❯ curl https://get.wasmer.io -sSfL | sh

## Execute hello.wasm
❯ wasmer run hello.wasm
Hello Wasm
```

## Why is WebAssembly said to have the potential to become the next generation runtime implementation?
WebAssembly's features make it full of possibilities:
- **Standard**: WebAssembly is designed to be versionless, feature-testable, and backward-compatible. Major browsers have already implemented the initial version of the WebAssembly specification.
- **Fast**: It can provide near-native speed through Just-In-Time (JIT) or Ahead-Of-Time (AOT) compilation capabilities of most runtimes. Unlike starting a VM or a container, it doesn't have cold starts.
- **Secure**: By default, WebAssembly runtimes are sandboxed, allowing secure memory access. A capability-based model ensures that WebAssembly applications can only access explicitly allowed content, making the software supply chain more secure.
- **Portable**: The binary format of WebAssembly is designed to execute efficiently on different operating systems (currently supporting Linux, Windows, macOS, Android, and even embedded devices) and instruction sets (currently supporting x86, ARM, RISC-V, etc.).
- **High Performance**: WebAssembly requires minimal memory footprint and ultra-low CPU thresholds to run.
- **Multi-Language Support**: [Several programming languages](https://github.com/appcypher/awesome-wasm-langs) can compile to WebAssembly.

### WebAssembly Transitioning from Browser to Server-side
WebAssembly originated in the browser, primarily to complement JavaScript's shortcomings in execution performance. However, WebAssembly is not meant to replace JavaScript but rather to provide the capability to execute large applications in the browser's (sandboxed) environment.

WebAssembly relies on a virtual machine for execution, and the ability of browser engines to run WebAssembly programs is due to their integration of WebAssembly virtual machines. If the WebAssembly virtual machine is separated and run independently, then we can execute WebAssembly programs outside the browser. Unlike the browser execution environment, server-side programs need to interact with external environments (such as file systems, networks, etc.). Since WebAssembly is designed to execute in a secure sandboxed environment, interacting with the external environment introduces potential security risks. Therefore, WebAssembly has proposed [WASI (WebAssembly System Interface)](https://github.com/WebAssembly/WASI/blob/main/phases/snapshot/docs.md), which describes the operation interfaces supported by WebAssembly programs.

> WASI is implemented by WebAssembly runtimes, for example, [fd_readdir](https://github.com/bytecodealliance/wasmtime/blob/main/crates/wasi-common/src/snapshots/preview_1.rs#L596) is the implementation of the directory reading interface in [Wasmtime](https://wasmtime.dev/).

As developers, we don't need to concern ourselves with the specific implementation of the WebAssembly virtual machine; we only need to compile the application into WebAssembly binary instructions to execute it on any server.
![The principle of running WebAssembly on servers](/img/Wasm-work-on-servers.png)

### Impact of WebAssembly on Software Delivery
In the era of containerization, containers have become the de facto standard for software delivery, with virtually all software providing container deployment solutions.

To standardize container lifecycle management and delivery media, the Open Container Initiative (OCI) proposed [5 principles that containers need to adhere to](https://github.com/opencontainers/runtime-spec/blob/main/principles.md). WebAssembly essentially aligns with these principles:
- **Standard operations**: Wasm defines the main function as the primary entry point, and the Wasm virtual machine executes the main function to start the Wasm program.
- **Content-agnostic**: Wasm is delivered as a binary file after compilation, naturally independent of content.
- **Infrastructure-agnostic**: Wasm relies on a stack-based virtual machine, and the virtual machine implementation does not depend on the infrastructure.
- **Industrial-grade delivery**: Wasm is compiled once and executed everywhere. Wasm does not need to concern itself with software delivery issues.
- ❌ **Designed for automation**: While Wasm does not concern itself with automated deployment, it does not hinder Wasm containerization. However, there is still a lack of standard processes and toolchains (similar to Dockerfile and Docker CLI) at present.

The characteristics of WebAssembly naturally support containerization. *If all applications are compiled into Wasm for delivery*, it means that we only need to complete a series of packaging operations to automatically deploy Wasm programs to all servers. For this reason, Solomon Hykes (the founder of Docker) even proposed that WASM+WASI would be the next development direction for server software infrastructure.

::: warning [Tweet from Solomon Hykes (Founder of Docker)]((https://twitter.com/solomonstre/status/1111004913222324225))
"If WASM+WASI existed in 2008, we wouldn't have needed to created Docker. That's how important it is. Webassembly on the server is the future of computing. A standardized system interface was the missing link. Let's hope WASI is up to the task!" -- Solomon Hykes, creator of Docker
:::

Indeed, if the operating system integrates a Wasm virtual machine (similar to browsers), and *if all applications are compiled into Wasm*, then we don't need "Linux containers" at all. We don't need to virtualize a complete layer of Linux operating systems; we only need a Wasm virtual machine to achieve "containerized deployment" of Wasm programs.

## Containerizing WebAssembly
Docker announced on October 24, 2022, that it will support running Wasm containers as a Beta feature in Docker Desktop 4.15! As mentioned earlier, Wasm is a faster, lighter alternative to Linux/Windows containers. This section will demonstrate the differences between Wasm containers and conventional Linux containers, including building Wasm images, running Wasm containers, and comparing them with native execution.
![Docker+Wasm](/img/Docker+Wasm.png)

### Building and Running Wasm Images
We know that for compiled languages, the final output is a .wasm file, making building images trivial. To raise the challenge, we'll use an interpreted language, [CPython](https://github.com/python/cpython), for this demonstration.

Unlike compiled languages like C and Rust, for interpreted languages like Python and Ruby, we need to compile their interpreters into Wasm. Once the interpreter is compiled into Wasm, any Wasm virtual machine can run these interpreted languages.

In theory, this works, but since WASI does not provide complete POSIX compatibility, modifying some source code is required when compiling CPython. The open-source project [python-wasi](https://github.com/singlestore-labs/python-wasi.git) has completed this experiment, allowing CPython to be compiled into Wasm with the help of this project.

#### 0. 整理项目结构
For the convenience of description, we assume that the project structure conforms to the following directory tree. See above for details.
```bash
.
├── build.sh
└── src
    ├── main.py
    |── [cpython](https://github.com/python/cpython/archive/refs/tags/v3.11.1.tar.gz)
    └── [python-wasi](https://github.com/singlestore-labs/python-wasi)
```

Among them, the content of main.py is as follows:
```python
import os
## Print environment variables to test security
for k, v in os.environ.items():
  print(f"{k}={v}")

print("------")
print("Hello World")
print("------")
print(os.listdir())
```

#### 1. Write the buildah build script
Currently, Docker Engine does not support building Wasm images, so you need to use buildah to build the image. Since CPython needs to be compiled into wasm, you need to use a multi-stage build.
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

For ease of reading, the above build.sh is equivalent to the following Dockerfile
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

#### 2. Build and upload the image
When building the image, you need to specify the platform architecture as `wasi/wasm32`

```bash
## Build image
❯ chmod +x build.sh
❯ ./build.sh
❯ buildah push docker.io/435495971/wasm-cpython
```

#### 3. Run image
Running `wasi/wasm32` requires specifying the platform architecture as `wasi/wasm32` and the runtime as `io.containerd.wasmedge.v1`. Due to the unstable nature of the WASI protocol, currently only wasmtime can run wasm-cpython. Therefore, we can only use [runwasi](https://github.com/containerd/runwasi) to run Wasm containers.

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

### Native vs. Wasm
Now, let's compare the execution of **native Linux Containers** with Wasm execution. The control group will use the following Dockerfile for construction.

```dockerfile
FROM python:3.11.1
COPY main.py main.py
ENTRYPOINT ["python", "main.py"]
```

The following is the output of building the image execution:
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

From the control experiment, it can be observed that Wasm containers output fewer environment variables, which is a result of Wasm's security features. Unless explicitly declared, Wasm programs cannot access any additional environment variables. Additionally, since Wasm is compiled without external linking dependencies, the contents of the container are more concise.

## Conclusion
This article first introduces what WebAssembly is and why WebAssembly has the potential to become the next generation runtime implementation. Finally, it shows how to build a WebAssembly container, and briefly compares the running differences between WebAssembly containers and Linux containers.
