---
date: 2021-01-31
title: How To Build Images:Docker Image Specification v1.2
sidebarDepth: 2
category: Container Technology
tags:
-   docker
-   build

---

## Preface
We are now in the era of containerization, where hardly anyone in development, testing, or operations would be unfamiliar with or unable to use Docker. Using Docker is also straightforward; most of the time, launching a container simply involves executing `docker run {your-image-name}`, and building an image is as simple as executing `docker build dockerfile .`.   
Perhaps it's precisely because Docker encapsulates implementation details so thoroughly that I recently realized, while learning about kaniko, an open-source image building tool by Google, that we may have only learned **how to use Docker CLI**, rather than understanding how Docker actually operates.   
Therefore, I has decided to start writing a series of articles about **『How To Build Images』**, with this being the first installment: 『Docker Image Specification』.
> Note: This article assumes that readers know how to use Docker, including but not limited to knowing how to execute `docker run` and `docker build` and writing a Dockerfile.

## [Docker Image Specification](https://github.com/moby/moby/tree/master/image/spec)
Container images store changes to the file system, while container image specification describes **how to record the history of these changes and the corresponding operation parameters** as well as **how to convert container images into containers**.
> Simply, it describes the specifications for **container >> serialization >> image** and **image >> deserialization >> container** 😯

### Specification History
- [v1](https://github.com/moby/moby/blob/master/image/spec/v1.md)
    - first edition
- [v1.1](https://github.com/moby/moby/blob/master/image/spec/v1.1.md)
    - Implemented by Docker v1.10 (February, 2016)
    - use sha256 digests as ids for each layer from now on(previously used random values)
    - Added **manifest.json** file, which is responsible for recording metadata of image content and dependencies.
- [v1.2](https://github.com/moby/moby/blob/master/image/spec/v1.2.md)
    - mplemented by Docker v1.12 (July, 2016)
    - add Healthcheck into image specifications
- [OCI v1 image]((https://github.com/opencontainers/image-spec))
    - Image specification proposed by the Open Container Initiative (OCI)
    - Not compatible with [Docker(moby)](https://github.com/moby/moby/pull/33355), But you can push image to the Registry and then pull it back and registry will auto convert it into the one docker(moby) is supported.

To standardize container formats and runtime creation, Docker, along with organizations like CoreOS, established the Open Container Initiative (OCI) under the supervision of the Linux Foundation. Currently, OCI has proposed two specifications: the [Runtime Specification (runtime-spec)](https://github.com/opencontainers/runtime-spec) and the [Image Specification (image-spec)](https://github.com/opencontainers/image-spec).   
However, **since Docker has not yet fully adopted the OCI image specification, this series of articles will not cover content related to the OCI image specification**. ~~(MAY be considered in the future 😆)~~

### A 🌰: Basic Structure of Docker Images
We will use *busybox:latest* as an example to show the basic structure of a Docker image.

::: details What is 🌰 meaning?
🌰 is the homophone of example in chinese.
:::

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
Next, this 🌰 will introduce in detail the meaning and content of each component in the Docker image.

#### files in directories (backward compatibility only)
```bash
.
├── VERSION
├── json
└── layer.tar

0 directories, 3 files
```

It can be observed that each layer in the image can be mapped to a directory after decompression. The names of these directories are generated using a consistent hash algorithm based on the relevant information of the layer (TIPS: randomly generated in v1 specification). Each directory contains three files:
- VERSION, the spec version of `json` file, which is currently set to 1.0.
- json, which contain metadata defining information about the layer in v1 specification, but it is not required in v1.2 specification, so we can ignore this file.
- layer.tar, an archive file storing the changes made to the file system of the layer.
> It's worth noting that this directory layout is only for backward compatibility. In the current version (v1.2), the archive files for each layer are specified in `manifest.json`.

#### repositories (backward compatibility only)
```json
{
  "busybox": {
    "latest": "036a82c6d65f2fa43a13599661490be3fca1c3d6790814668d4e8c0213153b12"
  }
}
```

The `repositories` file contains a JSON object where each key represents the name of an image, and its corresponding value is **a mapping of tags to image IDs**.
> It's important to note that this file is also used for backward compatibility. In the current version (v1.2), the relationship between images and layers is specified in `manifest.json`.

#### manifest.json
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
`manifest.json` records a list where each item describes the contents inventory of an image and its parent image (optional). Each item in this list consists of the following fields:
- Config: Reference to the configuration object that starts the container.
- RepoTags: Describes the reference relationships of the image.
- Layers: Points to the records of changes made to the file system of the image's layers.
- Parent: (optional) The image ID of the parent image. This parent image must be listed in the current `manifest.json`.
> It's important to note that this `manifest.json` is not the same file as the `manifest.json` described in the Docker Registry API (see the appendix for details).

#### Config (aka Image JSON)
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
##### created `string`
```json
{
    "created": "2017-11-03T22:39:17.345892474Z"
}
```
`created` is a string in ISO-8601 format, describing the date and time the current image was created.

##### author `string`
```json
{
    "author": "nobody"
}
```
`author` describes the name and/or email address of the person or entity that created and maintains this image.

##### architecture `string`
```json
{
    "architecture": "amd64"
}
```
`architecture` describes the CPU architecture that the binary files in this image depend on to run. Possible values include:
- 386
- amd64
- arm
> It should be noted that the values in the optional range may be added or reduced in the future, and at the same time, the values declared here may not be supported by the container runtime implementation (e.g. runc or rkt).

##### os `string`
```json
{
    "os": "linux"
}
```
`os` describes the name of the operating system this image is running on. Possible values include:
- darwin
- freebsd
- linux
> It should be noted that the values in the optional range may be added or reduced in the future, and at the same time, the values declared here may not be supported by the container runtime implementation (e.g. runc or rkt).

##### config (aka Container RunConfig) `object, optional`
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
config describes the default parameters used by the container runtime when instantiating the image.
> It should be noted that this field can be null, in which case any parameters required to run should be specified when creating the container.

###### User `string`
```json
{
    "config": {
        "User": "root"
    }
}
```
`User` describes the username or UID that should be used in the container. This value will be used as the default when the value is not specified when the container is created. This field supports the following formats:
- user
- uid
- user:group
- uid:gid
- uid:group
- user:gid
> Note that when no `group/gid` is provided, the default behavior is to configure the default combination of supplementary groups from `/etc/passwd` in the container based on the given user/uid.

###### Memory `integer`
```json
{
    "config": {
        "Memory": 1024
    }
}
```
`Memory` describes the memory limit of the container instance (in bytes), which will be used as the default when this value is not specified when creating the container.

###### MemorySwap `integer`
```json
{
    "config": {
        "MemorySwap": -1
    }
}
```
`MemorySwap` describes the total memory usage (memory + swap) that the container is allowed to use. This value is used as the default value when this value is not specified when creating the container.
> It should be noted that setting this value to -1 means turning off memory swapping.

###### CpuShares `integer`
```json
{
    "config": {
        "CpuShares": 4
    }
}
```
`CpuShares` describes the cpu shares relative to other containers, used as the default when this value is not specified when creating the container.

###### WorkingDir `string`
`WorkingDir` describes the working directory where the container starts the entry point process. When this value is not specified when creating the container, this value will be used as the default value.

###### Env `array[string]`
```json
{
    "config": {
        "Env": [
            "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
        ]
    }
}
```
`Env` describes the default environment variables when running this image. These values will be used as default values and will be combined with the values specified when creating the container.
The format of each item in this list is: `VARNAME="VAR VALUE"`

###### Entrypoint `array[string]`
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
`Entrypoint` A list of parameters describing the command to be executed when starting the container, this value will be used as the default when this value is not specified when the container is created.

###### Cmd `array[string]`
```json
{
    "config": {
        "Cmd": [
            "ls",
        ]
    }
}
```
`Cmd` describes the default parameters of the container entrypoint. When this value is not specified when creating the container, this value will be used as the default value.
> It should be noted that if `Entrypoint` is not specified, the first item in the cmd array should be the executable file to be run.

###### Healthcheck `object`
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
Healthcheck describes the method to confirm whether the container is healthy. This object consists of 4 parts, namely:
- Test `array[string]`, a test method to check whether the container is healthy, the options are:
     - `[]`: Inherit health check configuration from parent image
     - `["None"]`: disable health checks
     - `["CMD", arg1, arg2, ...]`: execute parameters directly
     - `["CMD-SHELL", command]`: Use the default shell in the image to run the command
- Interval `integer`: Number of nanoseconds to wait between probes.
- Timeout `integer`: The number of nanoseconds to wait in a probe.
- Retries `integer`: The number of consecutive failures required to consider the container unhealthy.
If this field is omitted, it means that the value should be obtained from the parent image, and these values will be used as default values, combined with the values specified when the container was created.

###### ExposedPorts `object, optional`
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
ExposedPorts describes the port group that needs to be exposed to the outside world by the container running the image. The storage structure is a json object, each key of the object is the port and protocol that need to be exposed, and the value must be an empty object `{}`.
The key of this object can be in the following formats:
- port/tcp
- port/udp
- port
> It should be noted that the reason why the structure of this configuration is so weird is that it is directly serialized from the Go type map[string]struct{}, so the value in json is an empty object `{}` .

###### Volumes `object, optional`
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
Volumes describes the directory path that the container running the image should be covered by the mounted volume. The storage structure is a json object. Each key of the object is a directory path that should be covered by the mounted volume. The value must be an empty object `{}`.
> It should be noted that the reason why the structure of this configuration is so weird is that it is directly serialized from the Go type map[string]struct{}, so the value in json is an empty object `{}` .

##### rootfs `object`
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
`rootfs` describes the Layer DiffIDs referenced by the image (see Appendix - Glossary for details). Storing this value in the image configuration (Config) allows the hash value of the image configuration file to be calculated based on the hash value of the associated file system. Change with change. This object contains two parts, namely:
- type: Normally set this value to `layers`.
- diff_ids `(array[Layer DiffIDs])`: Sort in dependency order, that is, from the bottom layer (Layer) to the top layer (Layer).

##### history `array`
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
`history` is an object array that describes the history of each layer of the image. The array is sorted according to dependency, that is, from the bottom layer to the top layer. Each object in the array has the following fields:
- created: This field describes the date and time when the layer was created, which must be a string in ISO-8601 format.
- author: This field describes the name and/or email address of the person or entity who created and maintains this layer (Layer).
- created_by: This field describes the instruction called when creating this layer (Layer).
- comment: This field describes the custom comment when creating this layer (Layer).
- empty_layer: This field is used to mark whether the history item causes differences in the file system. If this history item does not correspond to an actual record in `rootfs`, then this item should be set to `true`. (Simply, if instructions like ENV, CMD, etc. are executed in the Dockerfile, since these instructions will not cause changes to the file system, `empty_layer` should be set to `true`).

## Conclusion
This article primarily begins by outlining the **version history** of Docker image specifications. It then briefly introduces the relationship between the OCI organization and the OCI image specification and the Docker image specification. Next, it demonstrates the **directory structure of Docker images** through a simple yet comprehensive 🌰. Following this example 🌰, the current image specification content is introduced, including the meanings and contents of the **manifest.json** and **Config** files. Since version 1.1 of the image specification, Docker has introduced the concept of **manifest.json**, eliminating the need to concern oneself with the directory structure of images, as all relevant information is now recorded in the manifest.

By the time you reach this point, the current Docker image specification has been fully covered. Starting from the next article, we will delve into **practical** content. In the upcoming chapters, I will share my experience of **building Docker images from scratch**, further exploring the contents of `Filesystem Changeset` recorded in each `Layer` of the image. This will lay the groundwork for the final discussion on how to build images.

> Critique: Specifications are often presented in a very formal and verbose manner, yet in reality, Docker's own image specification is described in a confusing manner, leading to instances of terminology confusion. For example, the `Image JSON` is referred to as `Config` within `manifest.json`; there is also confusion between the image distribution specification and the image specification, with both referring to `manifest`.

---

## Appendix
### Glossary
#### Layer
Docker images adopt a layered structure. Each layer is a history of changes to a set of file systems. `Layer` is not responsible for storing configuration metadata such as environment variables or default parameters, which are properties of the entire image and do not belong to any particular layer.

#### Image JSON
Each image has an associated JSON structure, referred to as the Image JSON. This structure describes some basic information about the image, such as its creation date, author, the ID of its parent image, and runtime-related configurations (including entry point, default parameters, CPU/memory limits, network configuration, and mounted volume information, etc.). Additionally, this structure records the hash signatures of each layer referenced by the image and provides historical information about these layers.

According to the specification, this structure is considered immutable because modifying it would require recalculating the `ImageID`, which in turn means creating a new derived image. The Image JSON of the original image remains unchanged.

#### Image Filesystem Changeset
In a Docker image, each layer stores an archive package, also known as a filesystem changeset, containing files that are added, modified, or deleted relative to the layer below it. By utilizing a layer-based or union filesystem (such as AUFS) or calculating the differences in filesystem snapshots, the `filesystem changeset ` represents a series of image layers as if these changes were applied to the same filesystem.

#### Layer DiffID
When distributing Docker images, Docker references each layer using the SHA256 digest of its tar archive file. For example, `sha256:0271b8eebde3fa9a6126b1f2335e170f902731ab4942f9f1914e77016540c7bb` is a valid Layer DiffID.

> It's important to note that packing and unpacking image layers must be done in a reproducible (replayable) manner to prevent changes in the layer IDs. For example, using `tar-split` to preserve tar headers.
> Additionally, the Layer DiffID must be calculated from the uncompressed tar version.

#### Layer ChainID
For convenience, sometimes it's necessary to represent a series of image layers with a single ID. This introduces the concept of the `Layer ChainID`. For a single-layer image or the bottom-most layer, the `Layer ChainID` is equivalent to the `Layer DiffID`. However, for other layers, the `Layer ChainID` can be calculated using the following formula: 

```
ChainID(Layer N) = SHA256hex(ChainID(Layer N-1) + " " + DiffID(Layer N))
```

This formula calculates the `Layer ChainID` of Layer N based on the `Layer ChainID` of the previous layer (Layer N-1) concatenated with the `Layer DiffID` of Layer N, and then hashed using SHA256.

#### ImageID
The image ID is calculated using the following formula: `ImageID = SHA256hex(Image JSON)`. Since the Image JSON references the hash values of every layer in the image, this calculation method makes the image content addressable.
> It's important to note that according to the Docker specification, the Image JSON does not contain any formatting. Therefore, when calculating SHA256hex, it's crucial to ensure that there is no indentation or formatting present in the JSON structure.

#### Tag
A `Tag` can be used to map a descriptive name provided by the user to any single `ImageID`. The `Tag` can only consist of characters from the following character set: `[a-zA-Z0-9_.-]`. Additionally, the first character cannot be `.` or `-`, and the length of the `Tag` cannot exceed **128** characters.

#### Repository
The `Repository` refers to the part of the image name before the `:`. For example, if an image is named `my-app:3.1.4`, then `my-app` is referred to as the `Repository`. The `Repository` consists of a name separated by `/`, which can optionally begin with a DNS hostname prefix (must adhere to standard DNS rules but cannot contain `_` characters). Additionally, if the `Repository` includes a hostname, a port number can be added after it (e.g., `:8080`). Lastly, the `Repository` cannot begin or end with `/`.

### Image Manifest Version 2
Unlike the `Manifest.json` in the image specification, the `Image Manifest Version 2` is primarily used in the `Docker Registry API V2`, which includes operations such as `docker pull` and `docker push`.

Currently, there are two versions of `Image Manifest Version 2`:
- [Image Manifest V 2, Schema 1](https://docs.docker.com/registry/spec/manifest-v2-1/)
- [Image Manifest V 2, Schema 2](https://docs.docker.com/registry/spec/manifest-v2-2/)

This protocol addresses issues related to what images the registry can provide, the format of the images, compatible operating systems, and where the layers of the image should be obtained from by introducing additional media types and the manifest structure of the registry.

> Simply, it is a protocol for describing the distribution of image files. OCI has also proposed a specification for this purpose, see also [OCI Distribution Specification](https://github.com/opencontainers/distribution-spec).