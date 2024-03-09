---
date: 2021-03-31
title: How To Run Container:OCI Runtime Specification
sidebarDepth: 2
category: Container Technology
tags:
-   OCI
-   docker

---
## Preface
We are now in the era of containerization, where hardly anyone in development, testing, or operations would be unfamiliar with or unable to use Docker. Using Docker is also straightforward; most of the time, launching a container simply involves executing `docker run {your-image-name}`, and building an image is as simple as executing `docker build dockerfile .`.   
Perhaps it's precisely because Docker encapsulates implementation details so thoroughly that I recently realized that we may have only learned **how to use Docker CLI**, rather than understanding how Docker actually operates.   
While writing the series about **『How To Build Images』**, I realized that building images and running containers are not two parallel lines. The process of building often involves aspects of runtime, so I decided to simultaneously start another series of articles about **『How To Run Container』** with this being the first installment: 『OCI Runtime Specification』.

## [OCI Runtime Specification](https://github.com/opencontainers/runtime-spec/blob/master/spec.md)
The OCI Runtime Specification aims to define the **configuration**, **execution environment**, and **lifecycle** of containers.
- It defines how to describe the platforms supported by the container and the configuration information needed when creating container instances (`config.json`), thus avoiding different standards proposed by various **runtime implementations**.
- It defines the execution phase of containers, ensuring that the applications running inside containers have a consistent environment across different **runtime implementations**.
- It defines the lifecycle of containers, ensuring consistent behavior across different **runtime implementations**.

### [Container format -- Filesystem Bundle](https://github.com/opencontainers/runtime-spec/blob/master/bundle.md)
The OCI Runtime Specification proposes orchestrating containers in the form of Filesystem Bundles, which organize a series of files in a way that includes all necessary data and metadata for compliant **runtime implementations** to start the container.

A standard container bundle includes all the information needed to load and run the container, including:

- `config.json`: Contains the container's configuration information. This file must be stored in the root directory of the bundle and must be named **config.json**. Details of the file's contents are described below.
- Container's root filesystem: A directory specified by the `root.path` property (optional).

It's important to note that the runtime contents of the container must all be stored within a single directory on the local filesystem, but this directory itself is not part of the bundle.    
In other words, when using `tar` to archive a container bundle, these contents should be stored at the root of the archive file, rather than nested within other directories:

```bash
.
├── config.json
└── $root.path
```

### [Runtime and Lifecycle](https://github.com/opencontainers/runtime-spec/blob/master/runtime.md)
#### Scope of a Container
The entity using a runtime to create a container MUST be able to use the operations defined in this specification against that same container. Whether other entities using the same, or other, instance of the runtime can see that container is out of scope of this specification.

#### State
Use the `State` object to describe the state of the container. When the object is serialized into JSON, the format is as follows:

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
The state of a container includes the following properties:
- **ociVersion** (string, REQUIRED): is version of the Open Container Initiative Runtime Specification with which the state complies.
- **id** (string, REQUIRED): is the container's ID. This MUST be unique across all containers on this host. There is no requirement that it be unique across hosts.
- **status** (string, REQUIRED): is the runtime state of the container. The value MAY be one of:
    - **creating**: the container is being created (step 2 in the lifecycle)
    - **created**: the runtime has finished the create operation (after step 2 in the lifecycle), and the container process has neither exited nor executed the user-specified program
    - **running**: the container process has executed the user-specified program but has not exited (after step 8 in the lifecycle)
    - **stopped**: the container process has exited (step 10 in the lifecycle)
    Additional values MAY be defined by the runtime, however, they MUST be used to represent new runtime states not defined above.
- **pid** (int, REQUIRED when `status` is `created` or `running` on Linux, OPTIONAL on other platforms): is the ID of the container process. For hooks executed in the runtime namespace, it is the pid as seen by the runtime. For hooks executed in the container namespace, it is the pid as seen by the container.
- **bundle** (string, REQUIRED): is the absolute path to the container's bundle directory. This is provided so that consumers can find the container's configuration and root filesystem on the host.
- **annotations** (map, OPTIONAL): contains the list of annotations associated with the container. If no annotations were provided then this property MAY either be absent or an empty map.

#### Lifecycle
The lifecycle describes the timeline of events that happen from when a container is created to when it ceases to exist.

1. OCI compliant runtime's `create` command is invoked with a reference to the location of the bundle and a unique identifier.
2. The container's runtime environment MUST be created according to the configuration in `config.json`.
    If the runtime is unable to create the environment specified in the `config.json`, it MUST generate an error.
    While the resources requested in the `config.json` MUST be created, the user-specified program MUST NOT be run at this time.
    Any updates to `config.json` after this step MUST NOT affect the container.
3. The `prestart` hooks MUST be invoked by the runtime.
    If any `prestart` hook fails, the runtime MUST generate an error, stop the container, and continue the lifecycle at step 12.
4. The `createRuntime` hooks MUST be invoked by the runtime.
    If any `createRuntime` hook fails, the runtime MUST generate an error, stop the container, and continue the lifecycle at step 12.
5. The `createContainer` hooks MUST be invoked by the runtime.
    If any `createContainer` hook fails, the runtime MUST generate an error, stop the container, and continue the lifecycle at step 12.
6. Runtime's `start` command is invoked with the unique identifier of the container.
7. The `startContainer` hooks MUST be invoked by the runtime.
    If any `startContainer` hook fails, the runtime MUST generate an error, stop the container, and continue the lifecycle at step 12.
8. The runtime MUST run the user-specified program, as specified by `process`.
9. The `poststart` hooks MUST be invoked by the runtime.
    If any `poststart` hook fails, the runtime MUST log a warning, but the remaining hooks and lifecycle continue as if the hook had succeeded.
10. The container process exits.
    This MAY happen due to erroring out, exiting, crashing or the runtime's `kill` operation being invoked.
11. Runtime's `delete` command is invoked with the unique identifier of the container.
12. The container MUST be destroyed by undoing the steps performed during create phase (step 2).
13. The `poststop` hooks MUST be invoked by the runtime.
    If any `poststop` hook fails, the runtime MUST log a warning, but the remaining hooks and lifecycle continue as if the hook had succeeded.

#### OCI Runtime Operations
The OCI runtime specification defines 5 standard operations and standardizes the interaction process with containers.
- Query State: `state <container-id>` query container state by id.
- Create: `create <container-id> <path-to-bundle>` create container by filesystem bundle and container id.
- Start: `start <container-id>` start user program in container by id.
- Kill: `kill <container-id> <signal>` send signal to container by id
- Delete: `delete <container-id>` delete container by id, the operation MUST delete the resources that were created during the create step.

### [Container Configuration](https://github.com/opencontainers/runtime-spec/blob/master/config.md)
This configuration file contains metadata necessary to implement standard operations against the container. This includes the process to run, environment variables to inject, sandboxing features to use, etc.

Generally speaking, container configuration can be divided into 8 components, namely: `ociVersion`, `root`, `mounts`, `process`, `hostname`, `hooks`, `annotations` and `Platform-specific configuration`.

#### ociVersion (string, REQUIRED)
```json
{
    "ociVersion": "0.1.0"
}
```
`ociVersion` MUST be in SemVer v2.0.0 format and specifies the version of the Open Container Initiative Runtime Specification with which the bundle complies. 

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
`root` specifies the container's root filesystem., includes:
- **path** (string, REQUIRED): Specifies the path to the root filesystem for the container.
    - On POSIX platforms, **path** is either an absolute path or a relative path to the bundle. For example, with a bundle at `/to/bundle` and a root filesystem at `/to/bundle/rootfs`, the path value can be either `/to/bundle/rootfs` or `rootfs`. The value SHOULD be the conventional rootfs.
    - On Windows, **path** MUST be a volume GUID path.
- **readonly** (bool, OPTIONAL):  If true then the root filesystem MUST be read-only inside the container, defaults to false.
    - On Windows, this field MUST be omitted or false.

#### mounts (array of objects, OPTIONAL)
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
`mounts` specifies additional mounts beyond `root`. 。The runtime MUST mount entries in the listed order, mounts includes those fields:
- **destination** (string, REQUIRED): Destination of mount point: path inside container.
- **source** (string, OPTIONAL): A device name, but can also be a file or directory name for bind mounts or a dummy. Path values for bind mounts are either absolute or relative to the bundle. 
- **options** (array of strings, OPTIONAL): Mount options of the filesystem to be used.
    - Linux: See [mount(8)](https://man7.org/linux/man-pages/man8/mount.8.html)。
    - Windows: runtimes MUST support `ro`, mounting the filesystem read-only when `ro` is given.
    - A mount is a bind mount if it has either `bind` or `rbind` in the options.
- **type** (string, OPTIONAL): The type of the filesystem to be mounted.
    - Linux: filesystem types supported by the kernel as listed in  `/proc/filesystems`. For `bind` mounts, the type is a dummy, often "none".

#### process (object, OPTIONAL)
`process` specifies the container process. This property is REQUIRED when start is called.。`process` includes those fields:
- **terminal** (bool, OPTIONAL): specifies whether a terminal is attached to the process, defaults to false.
- **consoleSize** (object, OPTIONAL): specifies the console size in characters of the terminal.
    - **height** (uint, REQUIRED)
    - **width** (uint, REQUIRED)
- **cwd** (string, REQUIRED): is the working directory that will be set for the executable.
- **env** (array of strings, OPTIONAL) 
- **args** (array of strings, OPTIONAL)
- **commandLine**  (string, OPTIONAL) 
- **user** (object, REQUIRED): The user for the process is a platform-specific structure that allows specific control over which user the process runs as.
    - **uid** (int, REQUIRED): specifies the user ID in the container namespace.
    - **gid** (int, REQUIRED): specifies the group ID in the container namespace.
    - **umask** (int, OPTIONAL): specifies the umask of the user.
    - **additionalGids** (array of ints, OPTIONAL): specifies additional group IDs in the container namespace to be added to the process.

#### hostname (string, OPTIONAL)
`hostname` specifies the container's hostname as seen by processes running inside the container.

#### hooks (object, OPTIONAL) 
Hooks allow users to specify programs to run before or after various lifecycle events. Hooks MUST be called in the listed order. The state of the container MUST be passed to hooks over stdin so that they may do work appropriate to the current state of the container.   
The OCI runtime specification defines a total of 6 hooks, namely:
- **prestart** (DEPRECATED)：The prestart hooks MUST be called as part of the create operation after the runtime environment has been created (according to the configuration in config.json) but before the pivot_root or any equivalent operation has been executed.
- **createRuntime**: The createRuntime hooks MUST be called as part of the create operation after the runtime environment has been created (according to the configuration in config.json) but before the pivot_root or any equivalent operation has been executed.
- **createContainer**: The createContainer hooks MUST be called as part of the create operation after the runtime environment has been created (according to the configuration in config.json) but before the pivot_root or any equivalent operation has been executed. 
- **startContainer**: The startContainer hooks MUST be called before the user-specified process is executed as part of the start operation.
- **poststart**: The poststart hooks MUST be called after the user-specified process is executed but before the start operation returns.
- **poststop**: The poststop hooks MUST be called after the container is deleted but before the delete operation returns.

all hook have the same defind:
- **path** (string, REQUIRED): with similar semantics to [IEEE Std 1003.1-2008 execv's `path`](https://pubs.opengroup.org/onlinepubs/9699919799/functions/exec.html), must be absoluted path.
- **args** (array of strings, OPTIONAL): with similar semantics to [IEEE Std 1003.1-2008 `execv's argv`](https://pubs.opengroup.org/onlinepubs/9699919799/functions/exec.html).
- **env** (array of strings, OPTIONAL): with similar semantics to  [IEEE Std 1003.1-2008 `environ`](https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap08.html#tag_08_01).
- **timeout** (int, OPTIONAL):  is the number of seconds before aborting the hook. If set, timeout MUST be greater than zero.

#### annotations (object, OPTIONAL) 
```json
{
    "annotations": {
        "com.example.gpu-cores": "2"
    }
}
```
`annotations` contains arbitrary metadata for the container. Annotations MUST be a key-value map and Keys MUST be not empty strings.

#### Platform-specific configuration
At present, the OCI runtime specification mainly makes differentiated settings for four types of platforms, which are: [linux](https://github.com/opencontainers/runtime-spec/blob/master/config-linux.md), [ windows](https://github.com/opencontainers/runtime-spec/blob/master/config-windows.md), [solaris](https://github.com/opencontainers/runtime-spec/blob/master/ config-solaris.md), [vm](https://github.com/opencontainers/runtime-spec/blob/master/config-vm.md). For different platforms, just use the platform name to configure the corresponding configuration for Key. For example:
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
Due to limited space, here will not continue to list the differentiated configurations between platforms. You can read the OCI Runtime Specification from [GITHUB](https://github.com/opencontainers/runtime-spec/).

## Summary
This article mainly summarizes the main contents of the OCI runtime specification to facilitate those who are interested in container technology to quickly understand the areas involved in the OCI runtime specification.