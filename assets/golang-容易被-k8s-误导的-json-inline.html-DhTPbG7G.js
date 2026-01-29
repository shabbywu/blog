import{_ as o,r as a,o as l,c as u,f as n,g as e,i,e as s}from"./app-C9ZkQdtL.js";const d={},r=s(`<h2 id="背景介绍" tabindex="-1"><a class="header-anchor" href="#背景介绍"><span>背景介绍</span></a></h2><p>最近在开发 K8s Operator 时遇到一个奇怪的现象 -- 不管参数怎样传递, 请求发送到 Operator 时总会返回 <code>422 Unprocessable Content</code>。 Apiserver 返回的错误提示非常清晰，就是请求中缺了必须的字段(<code>FieldValueRequired</code>)。</p><p>排查下来发现这些参数都已经传递了的。具体的请求和返回值如下所示(相关信息已脱敏):</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>curl -X POST -H &quot;Content-Type: application/json&quot; https://example.com/apis/paas.bk.tencent.com/v1alpha1/namespaces/bkapp-foo-prod/bkapps -d \`{
	&quot;apiVersion&quot;: &quot;paas.bk.tencent.com/v1alpha1&quot;,
	&quot;kind&quot;: &quot;BkApp&quot;,
	&quot;metadata&quot;: {
		&quot;name&quot;: &quot;foo&quot;
	},
	&quot;spec&quot;: {
		&quot;build&quot;: null,
		&quot;processes&quot;: [{
			&quot;name&quot;: &quot;web&quot;,
			&quot;replicas&quot;: 1
		}, {
			&quot;name&quot;: &quot;dev&quot;,
			&quot;replicas&quot;: 1
		}],
		&quot;envOverlay&quot;: {
			&quot;autoscaling&quot;: [{
				&quot;envName&quot;: &quot;stag&quot;,
				&quot;process&quot;: &quot;web&quot;,
				&quot;minReplicas&quot;: 3,
				&quot;maxReplicas&quot;: 5,
				&quot;policy&quot;: &quot;default&quot;
			}]
		}
	},
	&quot;status&quot;: {
		&quot;conditions&quot;: []
	}
}\`

---
## 接口返回值如下:
{
  &quot;kind&quot;: &quot;Status&quot;,
  &quot;apiVersion&quot;: &quot;v1&quot;,
  &quot;metadata&quot;: {},
  &quot;status&quot;: &quot;Failure&quot;,
  &quot;message&quot;: &quot;BkApp.paas.bk.tencent.com \\&quot;foo\\&quot; is invalid: [spec.envOverlay.autoscaling[0].maxReplicas: Required value, spec.envOverlay.autoscaling[0].minReplicas: Required value, spec.envOverlay.autoscaling[0].policy: Required value]&quot;,
  &quot;reason&quot;: &quot;Invalid&quot;,
  &quot;details&quot;: {
    &quot;name&quot;: &quot;foo&quot;,
    &quot;group&quot;: &quot;paas.bk.tencent.com&quot;,
    &quot;kind&quot;: &quot;BkApp&quot;,
    &quot;causes&quot;: [
      {
        &quot;reason&quot;: &quot;FieldValueRequired&quot;,
        &quot;message&quot;: &quot;Required value&quot;,
        &quot;field&quot;: &quot;spec.envOverlay.autoscaling[0].maxReplicas&quot;
      },
      {
        &quot;reason&quot;: &quot;FieldValueRequired&quot;,
        &quot;message&quot;: &quot;Required value&quot;,
        &quot;field&quot;: &quot;spec.envOverlay.autoscaling[0].minReplicas&quot;
      },
      {
        &quot;reason&quot;: &quot;FieldValueRequired&quot;,
        &quot;message&quot;: &quot;Required value&quot;,
        &quot;field&quot;: &quot;spec.envOverlay.autoscaling[0].policy&quot;
      }
    ]
  },
  &quot;code&quot;: 422
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="问题定位" tabindex="-1"><a class="header-anchor" href="#问题定位"><span>问题定位</span></a></h2><p>出现问题的 CRD ApiVersion 是 <strong>v1alpha1</strong>, 但 Operator 中当前生效的 ApiVersion 版本是 <strong>v1alpha2</strong>, 因此请求真正到达 Operator 的流程非常长, 大致可划分为: <strong>Cconversion</strong> -&gt; <strong>Defaulter</strong> -&gt; <strong>Validator</strong>, 以上任何一个环节的代码出现问题，都可能导致最后的 <strong>Validator</strong> 抛出 <code>FieldValueRequired</code>。</p><details class="hint-container details"><summary>名词解释: Cconversion、Defaulter、Validator</summary><p><strong>Cconversion</strong>: Conversion 控制器负责将 Kubernetes 对象从一种 API 版本转换为另一种 API 版本。例如，当 Kubernetes 升级到新的 API 版本时，Conversion 控制器可以将旧版本的 API 对象转换为新版本的 API 对象，以便它们能够在新版本中使用。</p><p><strong>Defaulter</strong>: Defaulter 控制器负责为 Kubernetes 对象设置默认值。例如，如果用户没有为某个对象的某个字段提供值，则 Defaulter 控制器将为该字段设置默认值。这有助于确保 Kubernetes 对象始终具有正确的配置。</p><p><strong>Validator</strong>: Validator 控制器负责验证 Kubernetes 对象是否符合 Kubernetes API 的规范。例如，Validator 控制器可以检查对象是否包含必需的字段，是否使用了正确的数据类型，以及是否符合其他 Kubernetes API 规范。</p></details><p>由于我们的代码在 <strong>Defaulter</strong> 和 <strong>Validator</strong> 执行前都有日志记录执行流程, 所以可以通过观察 Operator 的标准输出日志定位到异常流程。然而通过观察标准输出日志发现, 请求经历完 <strong>Defaulter</strong> 就已经被 k8s apiserver 以 <code>422 Unprocessable Content</code> 状态码拒绝了。</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>DEBUG   controller-runtime.webhook.webhooks     received request        {&quot;webhook&quot;: &quot;/mutate-paas-bk-tencent-com-v1alpha2-bkapp&quot;, &quot;UID&quot;: &quot;a5c350b3-7945-4d57-a8cc-bcc659a12562&quot;, &quot;kind&quot;: &quot;paas.bk.tencent.com/v1alpha2, Kind=BkApp&quot;, &quot;resource&quot;: {&quot;group&quot;:&quot;paas.bk.tencent.com&quot;,&quot;version&quot;:&quot;v1alpha2&quot;,&quot;resource&quot;:&quot;bkapps&quot;}}
* INFO    bkapp-resource  default {&quot;name&quot;: &quot;foo&quot;}
DEBUG   controller-runtime.webhook.webhooks     wrote response  {&quot;webhook&quot;: &quot;/mutate-paas-bk-tencent-com-v1alpha2-bkapp&quot;, &quot;code&quot;: 200, &quot;reason&quot;: &quot;&quot;, &quot;UID&quot;: &quot;a5c350b3-7945-4d57-a8cc-bcc659a12562&quot;, &quot;allowed&quot;: true}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>由以上观察结果可以得出一个结论: <code>422 Unprocessable Content</code> 状态码的逻辑发生在 <strong>Validator</strong> 环节, 但<strong>并非由 Operator 实现的 ValidatingWebhook 触发</strong>, 而是 k8s apiserver <strong>内置的 CRD 校验逻辑</strong>拒绝了请求。</p><p>我们知道, k8s 使用 <em><strong>OpenAPI(Swagger)</strong></em> 定义所有资源的 <strong>Schema</strong>, CRD 也不例外。所有 Golang 声明的 CRD 结构体最后都会转换成 OpenAPI(Swagger) Schema。而 OpenAPI 除了用于声明接口描述以外, 还能用于数据校验。<br> 因此可以合理推测这个 <code>422 Unprocessable Content</code> 错误是在 k8s apiserver 根据 OpenAPI Schema 校验请求时返回的, 从而推断出根本问题是 <strong>CRD 的字段声明有误</strong>, 那究竟是什么样的错误才会导致 apiserver 无法解释已经传递的参数呢？我们不妨先看下目前的 CRD 定义:</p><div class="language-go line-numbers-mode" data-ext="go" data-title="go"><pre class="language-go"><code>// AppEnvOverlay defines environment specified configs.
type AppEnvOverlay struct {
	// Autoscaling overwrite process&#39;s autoscaling config
	// +optional
	Autoscaling []AutoscalingOverlay \`json:&quot;autoscaling,omitempty&quot;\`
}

// AutoscalingOverlay overwrite or add application&#39;s autoscaling config by environment.
type AutoscalingOverlay struct {
	// EnvName is app environment name
	EnvName EnvName \`json:&quot;envName&quot;\`
	// Process is the name of process
	Process string \`json:&quot;process&quot;\`
	// Spec is bkapp autoscaling config
	Spec AutoscalingSpec \`json:&quot;,inline&quot;\`
}

// AutoscalingSpec is bkapp autoscaling config
type AutoscalingSpec struct {
	// minReplicas is the lower limit for the number of replicas to which the autoscaler can scale down.
	// It defaults to 1 pod. minReplicas is allowed to be 0 if the alpha feature gate GPAScaleToZero
	// is enabled and at least one Object or External metric is configured. Scaling is active as long as
	// at least one metric value is available
	MinReplicas int32 \`json:&quot;minReplicas&quot;\`

	// maxReplicas is the upper limit for the number of replicas to which the autoscaler can scale up.
	// It cannot be less that minReplicas.
	MaxReplicas int32 \`json:&quot;maxReplicas&quot;\`

	// Policy defines the policy for autoscaling, its optional values depend on the policies supported by the operator.
	Policy ScalingPolicy \`json:&quot;policy&quot;\`
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>以上是 &quot;envOverlay&quot; 的字段定义, &quot;envOverlay.autoscaling&quot; 接受一个 []AutoscalingOverlay 表示对指定环境(envName)的指定进程(process)的扩缩容配置覆盖。<br> 咋一看这个配置并无问题，因为 <code>json:&quot;,inline&quot;</code> 这个 struct tag 被广泛应用在 k8s 的代码中, 可以很容易猜到 <code>inline</code> 表达的含义就是在将对应字段以 embedded 形式序列化或反序列化。</p><p>不过通过仔细阅读 k8s 代码后发现这个 struct tag 只会被声明到嵌套字段, 并无其他使用场景。</p><details class="hint-container details"><summary>\`json:&quot;,inline&quot;\` 在 k8s 中的使用示例</summary><div class="language-go line-numbers-mode" data-ext="go" data-title="go"><pre class="language-go"><code>type Status struct {   
	TypeMeta \`json:&quot;,inline&quot;\`   
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></details><p>而我们的代码使用方式是 &quot;Spec AutoscalingSpec <code>json:&quot;,inline&quot;</code>&quot;, 与 k8s 的使用方式有差异。<br> 鉴于目前只剩下这个突破口, 所以我们不妨大胆假设 k8s 的用法是错误的, 接下来就事在 go playground 验证 <code>json:&quot;,inline&quot;</code> 究竟能不能做到将对应字段以 embedded 形式序列化或反序列化, 以下是测试代码:</p>`,16),c={href:"https://go.dev/play/p/sX_5d9DPU6_D",target:"_blank",rel:"noopener noreferrer"},v=s(`<div class="language-go line-numbers-mode" data-ext="go" data-title="go"><pre class="language-go"><code>package main

import (
	&quot;encoding/json&quot;
	&quot;fmt&quot;
)

type Metadata struct {
	Key string \`json:&quot;key&quot;\`
}

type A struct {
	M Metadata \`json:&quot;,inline&quot;\`
}

type B struct {
	Metadata \`json:&quot;,inline&quot;\`
}

type C struct {
	Metadata
}

func main() {
	a := A{M: Metadata{Key: &quot;a&quot;}}
	d_a, _ := json.Marshal(a)
	fmt.Println(&quot;A: &quot; + string(d_a))

	b := B{Metadata: Metadata{Key: &quot;a&quot;}}
	d_b, _ := json.Marshal(b)
	fmt.Println(&quot;B: &quot; + string(d_b))

	c := C{Metadata: Metadata{Key: &quot;a&quot;}}
	d_c, _ := json.Marshal(c)
	fmt.Println(&quot;C: &quot; + string(d_c))
}


</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><p>代码的执行结果如下:</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>A: {&quot;M&quot;:{&quot;key&quot;:&quot;a&quot;}}
B: {&quot;key&quot;:&quot;a&quot;}
C: {&quot;key&quot;:&quot;a&quot;}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>从执行结果可以发现, <code>json:&quot;,inline&quot;</code> 并<strong>无实际作用</strong>, 在 k8s 代码中这完完全全就是个吉祥物的存在。</p><h2 id="追根溯源" tabindex="-1"><a class="header-anchor" href="#追根溯源"><span>追根溯源</span></a></h2>`,6),m=n("code",null,'json:",inline"',-1),p=n("code",null,'json:",inline"',-1),q=n("br",null,null,-1),b=n("br",null,null,-1),g={href:"https://github.com/golang/go/issues/6213",target:"_blank",rel:"noopener noreferrer"},h=n("code",null,"inline",-1),y={href:"https://pkg.go.dev/labix.org/v2/mgo/bson",target:"_blank",rel:"noopener noreferrer"},k={href:"https://go.dev/play/p/9TSm1-DTX3Y",target:"_blank",rel:"noopener noreferrer"},f=n("br",null,null,-1),_=s(`<div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code>{
    &quot;type&quot;: &quot;exec&quot;,
    &quot;command&quot;: []
}
---
{
    &quot;type&quot;: &quot;httpGet&quot;,
    &quot;path&quot;: &quot;&quot;,
    &quot;port&quot;: 0,
    &quot;host&quot;: &quot;&quot;
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>由于 golang 标准库不支持 <code>json:&quot;,inline&quot;</code>, 因此 k8s 目前只能通过奇怪但已广泛应用的方式传递参数:</p><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code>{
    &quot;exec&quot;: {
        &quot;command&quot;: []
    },
    &quot;httpGet&quot;: {
        &quot;path&quot;: &quot;&quot;,
        &quot;port&quot;: 0,
        &quot;host&quot;: &quot;&quot;
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span>总结</span></a></h2><p>本文从现网遇到的奇怪问题入手, 展示了排查 k8s apiserver 接口报错的排查思路和具体流程, 并遵循胡适的思想《大胆假设，小心求证》成功解决问题，最后还查到了关于这个问题背后隐藏的鲜为人知的提案。</p>`,5);function A(j,R){const t=a("ExternalLinkIcon");return l(),u("div",null,[r,n("blockquote",null,[n("p",null,[n("a",c,[e("go playground 传送门"),i(t)])])]),v,n("p",null,[e('代码的问题解决了, 只需要将 "Spec AutoscalingSpec '),m,e('" 修改成 "AutoscalingSpec '),p,e('" 即可修复这个错误行为。'),q,e(" 虽然问题修复了，但想必大家都很好奇既然这个 struct tag 无效, 但为什么 k8s 仍然孜孜不倦地使用它？"),b,e(" 一探究竟之下, 发现这其中的故事居然可追溯至 10 年前的"),n("a",g,[e('提案 - proposal: encoding/json: add "inline" struct tag'),i(t)]),e(", 然而至今仍然未被标准库采纳。")]),n("p",null,[e("提案中的语法 "),h,e(" 借鉴于 "),n("a",y,[e("mgo/bson"),i(t)]),e(", 实际上表达的含义是将 Struct 或 Map 的字段以内联的方式嵌套到上级结构体中, 达到实现动态结构体的需求, "),n("a",k,[e("Go Playground 传送门"),i(t)]),e("。"),f,e(" 具体的需求场景即是希望序列化后的 json 可以根据某个字段(例如 type) 拥有不同的数据结构, 例如:")]),_])}const O=o(d,[["render",A],["__file","golang-容易被-k8s-误导的-json-inline.html.vue"]]),w=JSON.parse('{"path":"/posts/2023/09/28/golang-%E5%AE%B9%E6%98%93%E8%A2%AB-k8s-%E8%AF%AF%E5%AF%BC%E7%9A%84-json-inline.html","title":"[Golang] 容易被 k8s 误导的 json:\\",inline\\"","lang":"zh-CN","frontmatter":{"draft":false,"permalinkPattern":"/posts/:year/:month/:day/:slug.html","type":"post","filePathRelative":"_posts/golang/2023-09-28-[Golang] 容易被 k8s 误导的 json:\\",inline\\".md","date":"2023-09-28T00:00:00.000Z","title":"[Golang] 容易被 k8s 误导的 json:\\",inline\\"","sidebarDepth":1,"category":"golang","tags":["golang"],"description":"背景介绍 最近在开发 K8s Operator 时遇到一个奇怪的现象 -- 不管参数怎样传递, 请求发送到 Operator 时总会返回 422 Unprocessable Content。 Apiserver 返回的错误提示非常清晰，就是请求中缺了必须的字段(FieldValueRequired)。 排查下来发现这些参数都已经传递了的。具体的请求和返...","head":[["meta",{"property":"og:url","content":"https://blog.shabbywu.cn/posts/2023/09/28/golang-%E5%AE%B9%E6%98%93%E8%A2%AB-k8s-%E8%AF%AF%E5%AF%BC%E7%9A%84-json-inline.html"}],["meta",{"property":"og:site_name","content":"个人技术文章分享"}],["meta",{"property":"og:title","content":"[Golang] 容易被 k8s 误导的 json:\\",inline\\""}],["meta",{"property":"og:description","content":"背景介绍 最近在开发 K8s Operator 时遇到一个奇怪的现象 -- 不管参数怎样传递, 请求发送到 Operator 时总会返回 422 Unprocessable Content。 Apiserver 返回的错误提示非常清晰，就是请求中缺了必须的字段(FieldValueRequired)。 排查下来发现这些参数都已经传递了的。具体的请求和返..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-02-24T07:10:47.000Z"}],["meta",{"property":"article:author","content":"shabbywu"}],["meta",{"property":"article:tag","content":"golang"}],["meta",{"property":"article:published_time","content":"2023-09-28T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-02-24T07:10:47.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"[Golang] 容易被 k8s 误导的 json:\\\\\\",inline\\\\\\"\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2023-09-28T00:00:00.000Z\\",\\"dateModified\\":\\"2024-02-24T07:10:47.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"shabbywu\\",\\"url\\":\\"https://github.com/shabbywu\\"}]}"],["link",{"rel":"alternate","type":"application/atom+xml","href":"https://blog.shabbywu.cn/atom.xml","title":"个人技术文章分享 Atom Feed"}],["link",{"rel":"alternate","type":"application/json","href":"https://blog.shabbywu.cn/feed.json","title":"个人技术文章分享 JSON Feed"}],["link",{"rel":"alternate","type":"application/rss+xml","href":"https://blog.shabbywu.cn/rss.xml","title":"个人技术文章分享 RSS Feed"}]]},"headers":[{"level":2,"title":"背景介绍","slug":"背景介绍","link":"#背景介绍","children":[]},{"level":2,"title":"问题定位","slug":"问题定位","link":"#问题定位","children":[]},{"level":2,"title":"追根溯源","slug":"追根溯源","link":"#追根溯源","children":[]},{"level":2,"title":"总结","slug":"总结","link":"#总结","children":[]}],"readingTime":{"minutes":6.15,"words":1845},"filePathRelative":"_posts/golang/2023-09-28-golang-容易被-k8s-误导的-json-inline.md","localizedDate":"2023年9月28日","autoDesc":true,"git":{"createdTime":1708758647000,"updatedTime":1708758647000,"contributors":[{"name":"shabbywu","email":"shabbywu@tencent.com","commits":1}]}}');export{O as comp,w as data};
