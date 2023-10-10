---
date: 2023-09-28
title: "[Golang] 容易被 k8s 误导的 json:\",inline\""
sidebarDepth: 1
category: golang
tags:
- golang

draft: false
---

# 背景介绍
最近在开发 K8s Operator 时遇到一个奇怪的现象 -- 不管参数怎样传递, 请求发送到 Operator 时总会返回 `422 Unprocessable Content`。
Apiserver 返回的错误提示非常清晰，就是请求中缺了必须的字段(`FieldValueRequired`)。   

排查下来发现这些参数都已经传递了的。具体的请求和返回值如下所示(相关信息已脱敏):

```bash
curl -X POST -H "Content-Type: application/json" https://example.com/apis/paas.bk.tencent.com/v1alpha1/namespaces/bkapp-foo-prod/bkapps -d `{
	"apiVersion": "paas.bk.tencent.com/v1alpha1",
	"kind": "BkApp",
	"metadata": {
		"name": "foo"
	},
	"spec": {
		"build": null,
		"processes": [{
			"name": "web",
			"replicas": 1
		}, {
			"name": "dev",
			"replicas": 1
		}],
		"envOverlay": {
			"autoscaling": [{
				"envName": "stag",
				"process": "web",
				"minReplicas": 3,
				"maxReplicas": 5,
				"policy": "default"
			}]
		}
	},
	"status": {
		"conditions": []
	}
}`

---
# 接口返回值如下:
{
  "kind": "Status",
  "apiVersion": "v1",
  "metadata": {},
  "status": "Failure",
  "message": "BkApp.paas.bk.tencent.com \"foo\" is invalid: [spec.envOverlay.autoscaling[0].maxReplicas: Required value, spec.envOverlay.autoscaling[0].minReplicas: Required value, spec.envOverlay.autoscaling[0].policy: Required value]",
  "reason": "Invalid",
  "details": {
    "name": "foo",
    "group": "paas.bk.tencent.com",
    "kind": "BkApp",
    "causes": [
      {
        "reason": "FieldValueRequired",
        "message": "Required value",
        "field": "spec.envOverlay.autoscaling[0].maxReplicas"
      },
      {
        "reason": "FieldValueRequired",
        "message": "Required value",
        "field": "spec.envOverlay.autoscaling[0].minReplicas"
      },
      {
        "reason": "FieldValueRequired",
        "message": "Required value",
        "field": "spec.envOverlay.autoscaling[0].policy"
      }
    ]
  },
  "code": 422
}
```

# 问题定位
出现问题的 CRD ApiVersion 是 **v1alpha1**, 但 Operator 中当前生效的 ApiVersion 版本是 **v1alpha2**, 因此请求真正到达 Operator 的流程非常长, 大致可划分为: **Cconversion** -> **Defaulter** -> **Validator**, 以上任何一个环节的代码出现问题，都可能导致最后的 **Validator** 抛出 `FieldValueRequired`。

::: details 名词解释: Cconversion、Defaulter、Validator
**Cconversion**: Conversion 控制器负责将 Kubernetes 对象从一种 API 版本转换为另一种 API 版本。例如，当 Kubernetes 升级到新的 API 版本时，Conversion 控制器可以将旧版本的 API 对象转换为新版本的 API 对象，以便它们能够在新版本中使用。

**Defaulter**: Defaulter 控制器负责为 Kubernetes 对象设置默认值。例如，如果用户没有为某个对象的某个字段提供值，则 Defaulter 控制器将为该字段设置默认值。这有助于确保 Kubernetes 对象始终具有正确的配置。

**Validator**: Validator 控制器负责验证 Kubernetes 对象是否符合 Kubernetes API 的规范。例如，Validator 控制器可以检查对象是否包含必需的字段，是否使用了正确的数据类型，以及是否符合其他 Kubernetes API 规范。
:::

由于我们的代码在 **Defaulter** 和 **Validator** 执行前都有日志记录执行流程, 所以可以通过观察 Operator 的标准输出日志定位到异常流程。然而通过观察标准输出日志发现, 请求经历完 **Defaulter** 就已经被 k8s apiserver 以 `422 Unprocessable Content` 状态码拒绝了。

```bash
DEBUG   controller-runtime.webhook.webhooks     received request        {"webhook": "/mutate-paas-bk-tencent-com-v1alpha2-bkapp", "UID": "a5c350b3-7945-4d57-a8cc-bcc659a12562", "kind": "paas.bk.tencent.com/v1alpha2, Kind=BkApp", "resource": {"group":"paas.bk.tencent.com","version":"v1alpha2","resource":"bkapps"}}
* INFO    bkapp-resource  default {"name": "foo"}
DEBUG   controller-runtime.webhook.webhooks     wrote response  {"webhook": "/mutate-paas-bk-tencent-com-v1alpha2-bkapp", "code": 200, "reason": "", "UID": "a5c350b3-7945-4d57-a8cc-bcc659a12562", "allowed": true}
```

由以上观察结果可以得出一个结论: `422 Unprocessable Content` 状态码的逻辑发生在 **Validator** 环节, 但**并非由 Operator 实现的 ValidatingWebhook 触发**, 而是 k8s apiserver **内置的 CRD 校验逻辑**拒绝了请求。

我们知道, k8s 使用 ***OpenAPI(Swagger)*** 定义所有资源的 **Schema**, CRD 也不例外。所有 Golang 声明的 CRD 结构体最后都会转换成 OpenAPI(Swagger) Schema。而 OpenAPI 除了用于声明接口描述以外, 还能用于数据校验。   
因此可以合理推测这个 `422 Unprocessable Content` 错误是在 k8s apiserver 根据 OpenAPI Schema 校验请求时返回的, 从而推断出根本问题是 **CRD 的字段声明有误**, 那究竟是什么样的错误才会导致 apiserver 无法解释已经传递的参数呢？我们不妨先看下目前的 CRD 定义:


```go
// AppEnvOverlay defines environment specified configs.
type AppEnvOverlay struct {
	// Autoscaling overwrite process's autoscaling config
	// +optional
	Autoscaling []AutoscalingOverlay `json:"autoscaling,omitempty"`
}

// AutoscalingOverlay overwrite or add application's autoscaling config by environment.
type AutoscalingOverlay struct {
	// EnvName is app environment name
	EnvName EnvName `json:"envName"`
	// Process is the name of process
	Process string `json:"process"`
	// Spec is bkapp autoscaling config
	Spec AutoscalingSpec `json:",inline"`
}

// AutoscalingSpec is bkapp autoscaling config
type AutoscalingSpec struct {
	// minReplicas is the lower limit for the number of replicas to which the autoscaler can scale down.
	// It defaults to 1 pod. minReplicas is allowed to be 0 if the alpha feature gate GPAScaleToZero
	// is enabled and at least one Object or External metric is configured. Scaling is active as long as
	// at least one metric value is available
	MinReplicas int32 `json:"minReplicas"`

	// maxReplicas is the upper limit for the number of replicas to which the autoscaler can scale up.
	// It cannot be less that minReplicas.
	MaxReplicas int32 `json:"maxReplicas"`

	// Policy defines the policy for autoscaling, its optional values depend on the policies supported by the operator.
	Policy ScalingPolicy `json:"policy"`
}
```

以上是 "envOverlay" 的字段定义, "envOverlay.autoscaling" 接受一个 []AutoscalingOverlay 表示对指定环境(envName)的指定进程(process)的扩缩容配置覆盖。   
咋一看这个配置并无问题，因为 `json:",inline"` 这个 struct tag 被广泛应用在 k8s 的代码中, 可以很容易猜到 `inline` 表达的含义就是在将对应字段以 embedded 形式序列化或反序列化。

不过通过仔细阅读 k8s 代码后发现这个 struct tag 只会被声明到嵌套字段, 并无其他使用场景。

::: details `json:",inline"`  在 k8s 中的使用示例
```go
type Status struct {   
	TypeMeta `json:",inline"`   
}
```
::: 

而我们的代码使用方式是 "Spec AutoscalingSpec `json:",inline"`", 与 k8s 的使用方式有差异。   
鉴于目前只剩下这个突破口, 所以我们不妨大胆假设 k8s 的用法是错误的, 接下来就事在 go playground 验证 `json:",inline"` 究竟能不能做到将对应字段以 embedded 形式序列化或反序列化, 以下是测试代码:

> [go playground 传送门](https://go.dev/play/p/sX_5d9DPU6_D)
```go
package main

import (
	"encoding/json"
	"fmt"
)

type Metadata struct {
	Key string `json:"key"`
}

type A struct {
	M Metadata `json:",inline"`
}

type B struct {
	Metadata `json:",inline"`
}

type C struct {
	Metadata
}

func main() {
	a := A{M: Metadata{Key: "a"}}
	d_a, _ := json.Marshal(a)
	fmt.Println("A: " + string(d_a))

	b := B{Metadata: Metadata{Key: "a"}}
	d_b, _ := json.Marshal(b)
	fmt.Println("B: " + string(d_b))

	c := C{Metadata: Metadata{Key: "a"}}
	d_c, _ := json.Marshal(c)
	fmt.Println("C: " + string(d_c))
}


```

---

代码的执行结果如下: 

```bash
A: {"M":{"key":"a"}}
B: {"key":"a"}
C: {"key":"a"}
```

从执行结果可以发现, `json:",inline"` 并**无实际作用**, 在 k8s 代码中这完完全全就是个吉祥物的存在。


# 追根溯源
代码的问题解决了, 只需要将 "Spec AutoscalingSpec `json:",inline"`" 修改成 "AutoscalingSpec `json:",inline"`" 即可修复这个错误行为。   
虽然问题修复了，但想必大家都很好奇既然这个 struct tag 无效, 但为什么 k8s 仍然孜孜不倦地使用它？   
一探究竟之下, 发现这其中的故事居然可追溯至 10 年前的[提案 - proposal: encoding/json: add "inline" struct tag](https://github.com/golang/go/issues/6213), 然而至今仍然未被标准库采纳。

提案中的语法 `inline` 借鉴于 [mgo/bson](https://pkg.go.dev/labix.org/v2/mgo/bson), 实际上表达的含义是将 Struct 或 Map 的字段以内联的方式嵌套到上级结构体中, 达到实现动态结构体的需求, [Go Playground 传送门](https://go.dev/play/p/9TSm1-DTX3Y)。    
具体的需求场景即是希望序列化后的 json 可以根据某个字段(例如 type) 拥有不同的数据结构, 例如:

```json
{
    "type": "exec",
    "command": []
}
---
{
    "type": "httpGet",
    "path": "",
    "port": 0,
    "host": ""
}
```

由于 golang 标准库不支持 `json:",inline"`, 因此 k8s 目前只能通过奇怪但已广泛应用的方式传递参数:
```json
{
    "exec": {
        "command": []
    },
    "httpGet": {
        "path": "",
        "port": 0,
        "host": ""
    }
}
```


# 总结
本文从现网遇到的奇怪问题入手, 展示了排查 k8s apiserver 接口报错的排查思路和具体流程, 并遵循胡适的思想《大胆假设，小心求证》成功解决问题，最后还查到了关于这个问题背后隐藏的鲜为人知的提案。