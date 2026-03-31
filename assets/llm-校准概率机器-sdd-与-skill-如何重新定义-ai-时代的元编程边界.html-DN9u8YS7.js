import{_ as l,o as i,c as s,d as n,e as o,h as e,i as t}from"./app-BtInbfcg.js";const a="/img/古典元编程对比AI元编程.png",c="/img/SDD-SOP.png",d="/img/双螺旋收敛LLM不确定性.png",r="/img/元编程演进-开发者职责定位.png",p={},g=o('<h1 id="校准概率机器-sdd-与-skill-如何重新定义-ai-时代的元编程边界" tabindex="-1"><a class="header-anchor" href="#校准概率机器-sdd-与-skill-如何重新定义-ai-时代的元编程边界"><span>校准概率机器：SDD 与 Skill 如何重新定义 AI 时代的元编程边界</span></a></h1><blockquote><p>从 Python 元类到 BDD Scenario，约束系统的设计者才是真正的架构师</p></blockquote><h2 id="元编程的古典定义及其天花板" tabindex="-1"><a class="header-anchor" href="#元编程的古典定义及其天花板"><span>元编程的古典定义及其天花板</span></a></h2><p>元编程（Metaprogramming）在软件工程中有一个精准的定义：用代码操纵代码，用结构描述结构，让程序在运行时或编译时自动完成原本需要手工编写的工作。</p><p>Python 生态是古典元编程的最佳展示场。</p><p>Django 的 <code>ModelBase</code> 元类是其中最具代表性的案例：当你定义一个继承自 <code>models.Model</code> 的类时，<code>ModelBase.__new__</code> 会在类对象被创建的瞬间介入——它扫描所有 <code>Field</code> 描述符，注册到 <code>_meta</code> 容器，生成数据库迁移所需的元信息，并将该类绑定到 ORM 的查询管理器上。开发者写下的十行类定义，在 Python 解释器的元类机制下，展开为数百行的运行时行为。</p><p>Flask 的路由装饰器是另一种形态的元编程：<code>@app.route(&quot;/api/v1/users&quot;)</code> 不是一个注释，不是一个标记，而是一次<strong>运行时的注册行为</strong>——它在函数对象被定义时立即将其写入应用的 URL 规则树，并附上 HTTP 方法约束、参数提取规则和视图函数引用。元编程将「声明意图」与「完成注册」合并成了一个动作。</p><p>这些机制的工程价值是真实的：它们消除了大量重复的样板代码，将框架的使用成本压缩到极低的水平。然而，古典元编程有一条无法逾越的边界——</p><p><strong>它理解语法，但不理解语义。</strong></p><p><code>ModelBase</code> 知道你定义了 <code>CharField(max_length=100)</code>，但它不知道这个字段代表「用户真实姓名，须经实名认证系统二次校验，且不得与历史记录重复」。</p><p>Flask 的路由系统知道 <code>/api/v1/users</code> 接受 <code>POST</code> 请求，但它不知道这个接口「仅限内部服务调用，须携带服务间认证令牌，且每个 IP 每分钟限流 100 次」。那些关于业务规则、安全约束、数据治理的核心知识，始终游离在元编程机制之外，只能由人工逐处填补。</p><p>开发者，因此成为了一台永不停歇的<strong>肉身编译器</strong>：接收高层的业务语义，输出低层的语法结构，无休止地循环。</p><hr><h2 id="元编程范式的转变——从-code→code-到-intent→system" tabindex="-1"><a class="header-anchor" href="#元编程范式的转变——从-code→code-到-intent→system"><span>元编程范式的转变——从 Code→Code 到 Intent→System</span></a></h2><p>大型语言模型的出现，在古典元编程的天花板上打开了一道缺口。</p><p>这道缺口的本质，是执行层的替换：LLM 可以直接理解人类意图，并将其转化为结构化的可执行实现。</p><p>那道原本只能由人类开发者手工搭建的「语义→语法」桥梁，LLM 可以在数分钟内独立完成。范式从 <code>Code → Code</code>（用代码描述规则，Python 解释器执行规则）跃迁为 <code>Intent → System</code>（用自然语言描述意图，LLM 生成系统）。</p><figure><img src="'+a+'" alt="古典元编程对比AI元编程" tabindex="0" loading="lazy"><figcaption>古典元编程对比AI元编程</figcaption></figure>',18),u=o(`<p>然而，跃迁同时带来了古典时代从未出现过的新风险：<strong>非确定性（Non-determinism）</strong>。</p><p>古典元编程的执行者是 Python 解释器——它严格、确定、无歧义。在相同的元类定义下，每一次生成的运行时行为都完全一致。而 LLM 是一台概率机器。它对同一个意图的每一次理解，都可能在细节上产生漂移：函数命名今天叫 <code>get_alb</code>，明天叫 <code>fetch_alb_instance</code>；测试今天写了，明天在另一次生成里悄然消失；序列化格式今天返回 JSON，明天换成了嵌套字典。</p><p><strong>概率正确</strong>与<strong>必然正确</strong>之间的距离，在规模化工程协作场景中，正是一次生产事故的宽度。</p><hr><h2 id="双螺旋解法——sdd-与-skill-的约束共生" tabindex="-1"><a class="header-anchor" href="#双螺旋解法——sdd-与-skill-的约束共生"><span>双螺旋解法——SDD 与 Skill 的约束共生</span></a></h2><p>非确定性的解法不是放弃 LLM，也不是更努力地手写提示词。解法是重建一套<strong>约束系统</strong>，让 LLM 在确定性的边界内运行。</p><p>这套系统由两条螺旋构成，各自负责一个层次的约束。</p><h3 id="_3-1-sdd-spec-是-ai-时代的元代码" tabindex="-1"><a class="header-anchor" href="#_3-1-sdd-spec-是-ai-时代的元代码"><span>3.1 SDD：Spec 是 AI 时代的元代码</span></a></h3><p>Spec Driven Development（规范驱动开发）的核心工具，是 BDD 格式的 Scenario。它是一种介于自然语言和形式逻辑之间的<strong>约束语言</strong>——不描述「怎么做」，只断言「做完之后世界是什么状态」。</p><p>以 <code>gamecloud-mcp</code> 项目的 ALB 负载均衡器查询工具为例，其 <code>spec.md</code> 包含如下 Scenario：</p><blockquote><h3 id="requirement-alb-列表查询" tabindex="-1"><a class="header-anchor" href="#requirement-alb-列表查询"><span>Requirement: ALB 列表查询</span></a></h3><p>系统 SHALL 提供按条件查询阿里云 ALB 负载均衡器列表的能力。</p><p><strong>Scenario: 按项目查询 ALB 列表</strong></p><ul><li><strong>WHEN</strong> 用户调用 <code>search_alb_by_project</code> 工具，提供 <code>project</code> 参数</li><li><strong>THEN</strong> 系统返回该项目下所有 ALB 实例的精简信息列表</li></ul><p><strong>Scenario: 缺少必选参数 project</strong></p><ul><li><strong>WHEN</strong> 用户调用查询工具但未提供 <code>project</code> 参数</li><li><strong>THEN</strong> 系统返回参数校验错误</li></ul></blockquote><p>这两条 Scenario 字数不超过五十，但每个词都承载着精确的工程含义：</p><ul><li><code>SHALL</code>（规范中隐含的强制语气）：这不是建议，是硬性约束</li><li><code>WHEN</code>：触发条件的精确边界——什么输入、什么调用路径</li><li><code>THEN</code>：可验证的结果断言——不是「应该差不多返回一些数据」，而是「返回该项目下<strong>所有</strong> ALB 实例的<strong>精简</strong>信息列表」</li><li><code>project</code> 在第一条中出现、在第二条中缺失：两条 Scenario 共同确立了 <code>project</code> 是<strong>必选参数</strong>这一事实</li></ul><p>当 LLM 读到这两条约束时，它的自由度被大幅压缩：函数必须叫 <code>search_alb_by_project</code>（WHEN 已指定），<code>project</code> 必须是必选参数（两条 Scenario 共同锁死），返回值必须是精简字段而非完整详情（THEN 已明确）。Spec 将模糊的自然语言意图提升为形式化的约束断言——这正是元编程的本质：<strong>用结构约束结构</strong>。</p><p>Spec 是 AI 时代的元代码。只是它的执行者，不再是解释器或编译器，而是 LLM。</p><h3 id="_3-2-skill-架构规范的强制执行器" tabindex="-1"><a class="header-anchor" href="#_3-2-skill-架构规范的强制执行器"><span>3.2 Skill：架构规范的强制执行器</span></a></h3><p>Spec 锁死了「做什么」，但它无法约束「怎么做」——代码骨架、命名惯例、序列化格式、测试规范，这些属于工程实现层的约束，需要第二条螺旋。</p><p>Skill 是一套<strong>元约束系统</strong>，以 SOP（标准操作程序）的形式，强制规定 LLM 在生成每一个工具时必须遵守的架构规则。</p><p>继续以 <code>gamecloud-mcp</code> 项目的 ALB 负载均衡器查询工具为例，<code>cloud-resource-query-tool</code> Skill 的代码生成步骤（Step 5）定义了如下骨架：</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code># FastMCP 实例命名：必须遵循 &quot;&lt;provider&gt;/&lt;resource&gt;/&quot; 格式
alb_tools = FastMCP(name=&quot;aliyun/alb/&quot;)

# FieldSelector 必须分离：LIST 返回精简字段，GET 返回完整字段
LIST_FIELDS = FieldSelector([
    &quot;load_balancer_id&quot;, &quot;name&quot;, &quot;region&quot;, &quot;project&quot;, &quot;mode&quot;, &quot;dns_name&quot;,
])

GET_FIELDS = FieldSelector([
    &quot;load_balancer_id&quot;, &quot;name&quot;, &quot;region&quot;, &quot;project&quot;, &quot;mode&quot;, &quot;dns_name&quot;,
    &quot;zone_mappings&quot;, &quot;load_balancer_billing_config&quot;, &quot;access_log_config&quot;,
])

# 序列化器：必须使用 @with_toon_serializer，不得使用裸 dict
@alb_tools.tool(description=&quot;按项目查询 ALB 列表&quot;)
@with_toon_serializer  # ← 强制约束，不可省略
async def search_alb_by_project(project: str) -&gt; dict[str, Any]:
    ...
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>每一行都是一条<strong>不可协商的架构规则</strong>：</p><ul><li>FastMCP 实例命名决定了工具的 MCP 注册路径；</li><li>LIST/GET 字段分离确保了响应体的精简与完整的明确区分；</li><li><code>@with_toon_serializer</code> 保证了所有工具的输出格式对 LLM 一致可解析。</li></ul><p>Skill 以 SOP 的形式，指导 LLM 同时完成代码生成与任务规划：</p><figure><img src="`+c+'" alt="Skill SOP 流程" tabindex="0" loading="lazy"><figcaption>Skill SOP 流程</figcaption></figure>',24),m=e("p",null,[t("Skill SOP 的价值在于同时规范两件事："),e("strong",null,"代码如何生成，以及 Spec 规划任务如何拆分"),t("。在 tasks.md 拟定阶段，Skill 要求每个模块必须包含集成测试任务条目——测试的存在性在编码开始前已被固定，不依赖人工事后判断。")],-1),h=e("p",null,"在 SOP 的指引下，LLM 在完成代码生成后，须立即执行测试并验证结果，形成「生成 → 自测 → 修正」的闭环。测试不再是独立的后置工序，而是每个开发任务的内置收尾步骤。",-1),_=e("h3",{id:"_3-3-约束收敛-双螺旋如何收敛不确定性",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#_3-3-约束收敛-双螺旋如何收敛不确定性"},[e("span",null,"3.3 约束收敛：双螺旋如何收敛不确定性")])],-1),S=e("p",null,"SDD Spec 与 Skill SOP，各自是一条约束链：Spec 链编码语义规则（锁定行为边界），Skill 链编码架构规则（SOP 固化实现方式）。两者缠绕形成双螺旋——正如 DNA 双链，缺少任何一条，约束结构都是不完整的。",-1),b=e("p",null,"两链叠加，共同将 LLM 的输出空间从无约束逐步收窄至确定性区间：",-1),y=e("figure",null,[e("img",{src:d,alt:"双螺旋收敛 LLM 不确定性",tabindex:"0",loading:"lazy"}),e("figcaption",null,"双螺旋收敛 LLM 不确定性")],-1),L=o('<p>这不是限制 LLM 的能力，而是对其输出施加工程约束：LLM 的语义理解得到充分发挥，「非确定性」的风险被精确裁剪。在双螺旋的约束下，概率机器(LLM)可以稳定输出确定性的工程成果。</p><hr><h2 id="开发者的新位置——设计约束系统本身" tabindex="-1"><a class="header-anchor" href="#开发者的新位置——设计约束系统本身"><span>开发者的新位置——设计约束系统本身</span></a></h2><p>在理解了双螺旋解法之后，一个更根本的问题浮现出来：<strong>这一切中，人类开发者究竟在做什么？</strong></p><p>表面上看，开发者在写 Spec，在写 Skill。但本质上，开发者在做的事情和 Django 核心贡献者设计 <code>ModelBase</code> 元类时做的事情，是同一件事——<strong>设计规则</strong>，让其他实体（Python 解释器，或 LLM）在这套规则的约束下自动完成工作。</p><figure><img src="'+r+'" alt="元编程演进下，开发者职责的变与不变" tabindex="0" loading="lazy"><figcaption>元编程演进下，开发者职责的变与不变</figcaption></figure>',6),k=e("p",null,[t("两种范式的差异是媒介和执行者，而非开发者的角色本质。无论是设计 "),e("code",null,"ModelBase"),t(" 元类、编写 ALB Spec，还是定义 "),e("code",null,"cloud-resource-query-tool"),t(" Skill，开发者做的都是同一件事：制定规则，让执行者（Python 解释器或 LLM）在规则边界内自动完成工作。")],-1),E=e("p",null,[t("在 AI 时代，开发者的工作层次从「逐行编写语法结构」上移到了「设计让 LLM 可靠完成翻译的约束体系」。这不是降低了开发者的价值，而是解放了开发者，让他们真正站到了那个更高的位置："),e("strong",null,"约束系统的设计者，秩序的立法者"),t("。")],-1),D=e("p",null,"媒介从代码变成了 Markdown 文档，执行者从 Python 解释器变成了大型语言模型。但那个位于两层之间的元逻辑——用结构约束结构，用规则驱动执行——从未变过。",-1),A=e("p",null,"变化的是工具，不变的是架构师的职责。",-1),v=e("hr",null,null,-1);function q(B,f){return i(),s("div",null,[g,n(` \`\`\`
┌──────────────────────────────────┬──────────────────────────────────┐
│         古典范式                  │          AI 范式                  │
│      Code → Code                 │       Intent → System             │
├──────────────────────────────────┼──────────────────────────────────┤
│                                  │                                  │
│  业务意图                         │  业务意图                         │
│     │                            │     │                            │
│     ▼  [人工翻译]                 │     ▼  [LLM 理解]                │
│  ┌──────────────┐                │  ┌──────────────┐               │
│  │  语法结构     │  ← 语义缺口    │  │  语义理解     │  ⚠ 非确定性   │
│  │  metaclass   │    在此发生    │  │  (概率性)     │   在此爆发    │
│  │  decorator   │               │  └──────────────┘               │
│  └──────────────┘               │     │                            │
│     │                            │     ▼  [LLM 生成]                │
│     ▼  [Python 解释器执行]        │  代码实现                         │
│  运行时行为                       │  (命名随机 / 结构任意 / 测试缺失)  │
│                                  │                                  │
└──────────────────────────────────┴──────────────────────────────────┘
\`\`\` `),u,n(` \`\`\`
  Step 1                    Step 2                    Step 3
┌───────────────┐          ┌───────────────┐          ┌───────────────┐
│   SDK 探测    │─────────▶│   参数解析    │─────────▶│   字段解析    │
│ ls ... grep   │          │_get_kwargs()  │          │ResponseModel  │
│ 定位 SDK 模块 │          │ 分类展示参数  │          │ 解析字段类型  │
└───────────────┘          └───────────────┘          └──────┬────────┘
                                                             │
                                                             ▼
  Step 6                    Step 5                    Step 4
┌───────────────┐          ┌───────────────┐          ┌───────────────┐
│   格式校验    │◀─────────│   代码生成    │◀─────────│   用户确认    │
│ make format   │          │ 生成骨架代码  │          │ 确认参数/字段 │
│ make lint     │          │ 写入工具文件  │          │ 确认序列化方式│
└──────┬────────┘          └───────────────┘          └───────────────┘
       │
       ▼
  Step 7
┌───────────────┐
│   集成测试    │
│ 编写 & 执行   │
│ 验证调用链路  │
└───────────────┘
\`\`\` `),m,h,_,S,b,y,n(` \`\`\`
  业务意图（自然语言）
          │
          ▼
┌─────────────────────────────────────────┐
│         LLM 未约束输出空间               │  宽度 ≈ ∞
│  █████████████████████████████████████  │  命名任意 / 结构随意 /
│  █████████████████████████████████████  │  测试缺失 / 格式不稳
└─────────────────────────────────────────┘
          │
          │  施加 Skill（SOP）约束
          ▼
┌───────────────────────────────┐
│     架构约束后的输出空间        │  宽度缩减 ~60%
│  █████████████████████████    │  命名规范 / 骨架固定 /
│  █████████████████████████    │  测试存在 / 格式统一
└───────────────────────────────┘
          │
          │  再施加 SDD Spec 约束
          ▼
┌──────────────────────┐
│   语义约束后的输出空间  │  宽度缩减 ~85%
│  ████████████████    │  行为固定 / 参数明确 /
│  ████████████████    │  边界清晰 / 错误场景覆盖
└──────────────────────┘
          │
          │  双螺旋完全收敛
          ▼
      ┌──────────┐
      │ 确定性    │  可预测 · 可重复 · 可审计
      │ 实现区间  │  每次生成结果等价
      └──────────┘
\`\`\` `),L,n(` \`\`\`
┌──────────────────────────────────┬──────────────────────────────────┐
│         古典元编程                │          AI 元编程                │
├──────────────────────────────────┼──────────────────────────────────┤
│ 设计者    架构师 / 框架作者        │ 设计者    架构师 / 开发者           │
│              │                   │              │                   │
│              ▼                   │              ▼                   │
│ 约束载体   元类 · 装饰器           │ 约束载体   Spec · Skill            │
│           metaclass / @route     │           BDD Scenario / SOP     │
│              │                   │              │                   │
│              ▼                   │              ▼                   │
│ 执行者    Python 解释器            │ 执行者    大型语言模型（LLM）        │
│              │                   │              │                   │
│              ▼                   │              ▼                   │
│ 产出      运行时行为               │ 产出      确定性代码实现            │
└──────────────────────────────────┴──────────────────────────────────┘
         媒介变了，执行者变了，但「设计规则」的角色从未变过
\`\`\` `),k,E,D,A,v])}const P=l(p,[["render",q],["__file","llm-校准概率机器-sdd-与-skill-如何重新定义-ai-时代的元编程边界.html.vue"]]),I=JSON.parse('{"path":"/posts/2026/03/17/llm-%E6%A0%A1%E5%87%86%E6%A6%82%E7%8E%87%E6%9C%BA%E5%99%A8-sdd-%E4%B8%8E-skill-%E5%A6%82%E4%BD%95%E9%87%8D%E6%96%B0%E5%AE%9A%E4%B9%89-ai-%E6%97%B6%E4%BB%A3%E7%9A%84%E5%85%83%E7%BC%96%E7%A8%8B%E8%BE%B9%E7%95%8C.html","title":"校准概率机器：SDD 与 Skill 如何重新定义 AI 时代的元编程边界","lang":"zh-CN","frontmatter":{"draft":false,"permalinkPattern":"/posts/:year/:month/:day/:slug.html","type":"post","filePathRelative":"_posts/llm/2026-03-17-[LLM] 校准概率机器：SDD 与 Skill 如何重新定义 AI 时代的元编程边界.md","date":"2026-03-17T00:00:00.000Z","title":"校准概率机器：SDD 与 Skill 如何重新定义 AI 时代的元编程边界","sidebarDepth":1,"category":"llm","tags":["llm"],"description":"校准概率机器：SDD 与 Skill 如何重新定义 AI 时代的元编程边界 从 Python 元类到 BDD Scenario，约束系统的设计者才是真正的架构师 元编程的古典定义及其天花板 元编程（Metaprogramming）在软件工程中有一个精准的定义：用代码操纵代码，用结构描述结构，让程序在运行时或编译时自动完成原本需要手工编写的工作。 Pyt...","head":[["meta",{"property":"og:url","content":"https://blog.shabbywu.cn/posts/2026/03/17/llm-%E6%A0%A1%E5%87%86%E6%A6%82%E7%8E%87%E6%9C%BA%E5%99%A8-sdd-%E4%B8%8E-skill-%E5%A6%82%E4%BD%95%E9%87%8D%E6%96%B0%E5%AE%9A%E4%B9%89-ai-%E6%97%B6%E4%BB%A3%E7%9A%84%E5%85%83%E7%BC%96%E7%A8%8B%E8%BE%B9%E7%95%8C.html"}],["meta",{"property":"og:site_name","content":"个人技术文章分享"}],["meta",{"property":"og:title","content":"校准概率机器：SDD 与 Skill 如何重新定义 AI 时代的元编程边界"}],["meta",{"property":"og:description","content":"校准概率机器：SDD 与 Skill 如何重新定义 AI 时代的元编程边界 从 Python 元类到 BDD Scenario，约束系统的设计者才是真正的架构师 元编程的古典定义及其天花板 元编程（Metaprogramming）在软件工程中有一个精准的定义：用代码操纵代码，用结构描述结构，让程序在运行时或编译时自动完成原本需要手工编写的工作。 Pyt..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:image","content":"https://blog.shabbywu.cn/img/古典元编程对比AI元编程.png"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2026-03-17T08:07:00.000Z"}],["meta",{"name":"twitter:card","content":"summary_large_image"}],["meta",{"name":"twitter:image:alt","content":"校准概率机器：SDD 与 Skill 如何重新定义 AI 时代的元编程边界"}],["meta",{"property":"article:author","content":"shabbywu"}],["meta",{"property":"article:tag","content":"llm"}],["meta",{"property":"article:published_time","content":"2026-03-17T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2026-03-17T08:07:00.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"校准概率机器：SDD 与 Skill 如何重新定义 AI 时代的元编程边界\\",\\"image\\":[\\"https://blog.shabbywu.cn/img/古典元编程对比AI元编程.png\\",\\"https://blog.shabbywu.cn/img/SDD-SOP.png\\",\\"https://blog.shabbywu.cn/img/双螺旋收敛LLM不确定性.png\\",\\"https://blog.shabbywu.cn/img/元编程演进-开发者职责定位.png\\"],\\"datePublished\\":\\"2026-03-17T00:00:00.000Z\\",\\"dateModified\\":\\"2026-03-17T08:07:00.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"shabbywu\\",\\"url\\":\\"https://github.com/shabbywu\\"}]}"],["link",{"rel":"alternate","type":"application/atom+xml","href":"https://blog.shabbywu.cn/atom.xml","title":"个人技术文章分享 Atom Feed"}],["link",{"rel":"alternate","type":"application/json","href":"https://blog.shabbywu.cn/feed.json","title":"个人技术文章分享 JSON Feed"}],["link",{"rel":"alternate","type":"application/rss+xml","href":"https://blog.shabbywu.cn/rss.xml","title":"个人技术文章分享 RSS Feed"}]]},"headers":[{"level":2,"title":"元编程的古典定义及其天花板","slug":"元编程的古典定义及其天花板","link":"#元编程的古典定义及其天花板","children":[]},{"level":2,"title":"元编程范式的转变——从 Code→Code 到 Intent→System","slug":"元编程范式的转变——从-code→code-到-intent→system","link":"#元编程范式的转变——从-code→code-到-intent→system","children":[]},{"level":2,"title":"双螺旋解法——SDD 与 Skill 的约束共生","slug":"双螺旋解法——sdd-与-skill-的约束共生","link":"#双螺旋解法——sdd-与-skill-的约束共生","children":[{"level":3,"title":"3.1 SDD：Spec 是 AI 时代的元代码","slug":"_3-1-sdd-spec-是-ai-时代的元代码","link":"#_3-1-sdd-spec-是-ai-时代的元代码","children":[]},{"level":3,"title":"3.2 Skill：架构规范的强制执行器","slug":"_3-2-skill-架构规范的强制执行器","link":"#_3-2-skill-架构规范的强制执行器","children":[]},{"level":3,"title":"3.3 约束收敛：双螺旋如何收敛不确定性","slug":"_3-3-约束收敛-双螺旋如何收敛不确定性","link":"#_3-3-约束收敛-双螺旋如何收敛不确定性","children":[]}]},{"level":2,"title":"开发者的新位置——设计约束系统本身","slug":"开发者的新位置——设计约束系统本身","link":"#开发者的新位置——设计约束系统本身","children":[]}],"readingTime":{"minutes":10.5,"words":3150},"filePathRelative":"_posts/llm/2026-03-17-llm-校准概率机器-sdd-与-skill-如何重新定义-ai-时代的元编程边界.md","localizedDate":"2026年3月17日","autoDesc":true,"git":{"createdTime":1773731794000,"updatedTime":1773734820000,"contributors":[{"name":"shabbywu(伍镜滔)","email":"wujingtao01@corp.netease.com","commits":6}]}}');export{P as comp,I as data};
