import{_ as e,o as n,c as i,e as t}from"./app-C9ZkQdtL.js";const s={},l=t(`<h1 id="大模型-阿里云实例诊断-ai-赋能云运维的实践与心得" tabindex="-1"><a class="header-anchor" href="#大模型-阿里云实例诊断-ai-赋能云运维的实践与心得"><span>大模型 + 阿里云实例诊断：AI 赋能云运维的实践与心得</span></a></h1><blockquote><p>本文介绍我们如何利用大模型（LLM）结合 MCP Server 技术构建智能化的阿里云实例诊断系统。</p><p>文章重点分享了 MCP 工具设计的三个核心原则：使用 TOON 格式优化 Token 消耗、通过显式标注单位消除大模型幻觉、对时序监控数据进行预计算统计摘要。 同时介绍了 Prompt 工程实践，通过提供完整的输出格式模板来保证诊断报告的一致性。</p></blockquote><h2 id="一、背景与动机" tabindex="-1"><a class="header-anchor" href="#一、背景与动机"><span>一、背景与动机</span></a></h2><h3 id="传统云运维的痛点" tabindex="-1"><a class="header-anchor" href="#传统云运维的痛点"><span>传统云运维的痛点</span></a></h3><p>在日常云资源运维中，运维工程师经常面临这些挑战：</p><ol><li><strong>信息分散</strong>：实例状态、监控数据、安全组规则、磁盘信息分布在不同的控制台页面</li><li><strong>排查耗时</strong>：一个简单的&quot;实例连不上&quot;问题，可能需要检查十几个维度</li><li><strong>经验依赖</strong>：新手难以快速定位问题，老手的经验难以沉淀和传承</li><li><strong>重复劳动</strong>：相似问题反复排查，效率低下</li></ol><h3 id="我们的方案" tabindex="-1"><a class="header-anchor" href="#我们的方案"><span>我们的方案</span></a></h3><p>我们希望打造一个<strong>极简的诊断入口</strong>：用户只需要提供一个实例 ID，系统就能自动完成全面诊断并输出专业报告。</p><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>输入：i-bp1xxxxxxxxxx（实例 ID）
输出：结构化的诊断报告（问题定位 + 解决建议）
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>在这个方案中，<strong>大模型承担两个核心职责</strong>：</p><ol><li><p><strong>智能调度诊断流程</strong></p><ul><li>大模型根据内置的诊断 Prompt 按需调用 MCP 工具</li><li>自主决定调用顺序和调用哪些工具（不是固定流程）</li><li>遇到异常数据时，能够自动深挖相关维度</li></ul></li><li><p><strong>输出用户友好的诊断报告</strong></p><ul><li>将原始的 API 数据、监控指标转换为自然语言描述</li><li>结构化呈现问题和建议，让非技术人员也能看懂</li><li>提供可操作的解决方案，而不仅仅是数据罗列</li></ul></li></ol><p>这正是我们构建的——基于 <strong>Dify + MCP Server</strong> 的智能诊断系统。</p><h2 id="二、技术架构" tabindex="-1"><a class="header-anchor" href="#二、技术架构"><span>二、技术架构</span></a></h2><h3 id="整体架构" tabindex="-1"><a class="header-anchor" href="#整体架构"><span>整体架构</span></a></h3><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│      Dify       │────▶│   MCP Server    │────▶│  GameCloud API  │
│   （模型编排）    │ MCP │    （提供工具）   │HTTP │   (云资源API)    │
│                 │◀────│                 │◀────│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       │
        ▼                       ▼
   自然语言报告           ┌────────────────────────────┐
                        │   MCP Tools 工具集          │
                        ├────────────────────────────┤
                        │ • get_instance_detail      │
                        │ • get_instance_status      │
                        │ • get_monitor_data         │
                        │ • get_disks_info           │
                        │ • get_network_interfaces   │
                        │ • check_security_group     │
                        │ • get_console_log          │
                        │ • create_diagnostic_report │
                        └────────────────────────────┘
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="技术栈" tabindex="-1"><a class="header-anchor" href="#技术栈"><span>技术栈</span></a></h3><table><thead><tr><th>层级</th><th>技术选型</th><th>说明</th></tr></thead><tbody><tr><td><strong>AI 编排层</strong></td><td>Dify</td><td>低代码 AI 应用开发平台，支持 Agent 模式</td></tr><tr><td><strong>协议层</strong></td><td>MCP (Model Context Protocol)</td><td>Anthropic 提出的模型-工具通信协议</td></tr><tr><td><strong>服务层</strong></td><td>FastMCP + Python 3.12</td><td>MCP Server 实现框架</td></tr><tr><td><strong>API 层</strong></td><td>GameCloud/Skyline API</td><td>内部云资源管理 API</td></tr><tr><td><strong>基础设施</strong></td><td>Redis + HTTPX</td><td>限流存储 + 异步 HTTP 客户端</td></tr></tbody></table><h3 id="为什么选择-mcp" tabindex="-1"><a class="header-anchor" href="#为什么选择-mcp"><span>为什么选择 MCP？</span></a></h3><p>MCP (Model Context Protocol) 是 Anthropic 在 2024 年底开源的协议，它解决了一个核心问题：<strong>如何让大模型安全、标准化地调用外部工具</strong>。</p><p>相比传统的 Function Calling，MCP 的优势：</p><ol><li><strong>协议标准化</strong>：统一的工具描述和调用规范</li><li><strong>安全可控</strong>：内置认证、限流等安全机制</li><li><strong>解耦清晰</strong>：工具提供方和消费方完全解耦</li><li><strong>生态丰富</strong>：可复用的工具集，一次开发多处使用</li></ol><h2 id="三、mcp-工具设计与实现" tabindex="-1"><a class="header-anchor" href="#三、mcp-工具设计与实现"><span>三、MCP 工具设计与实现</span></a></h2><h3 id="工具分层设计" tabindex="-1"><a class="header-anchor" href="#工具分层设计"><span>工具分层设计</span></a></h3><p>我们将诊断工具按功能维度进行了分层设计：</p><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>aliyun/instances/diagnostic/
├── basic/                         # 基础信息
│   ├── get_instance_detail        # 实例配置信息
│   └── get_instance_status        # 运行状态
├── monitoring/                    # 监控数据
│   └── get_monitor_data           # CPU/内存/网络/磁盘监控
├── network/                       # 网络诊断
│   ├── get_network_interfaces     # 网卡信息
│   └── check_security_group_rules # 安全组规则
├── disk/                          # 磁盘诊断
│   └── get_disks_info             # 磁盘配置
└── system/                        # 系统日志
    ├── get_console_log            # 控制台日志
    ├── get_system_events          # 系统事件
    └── create_diagnostic_report   # 诊断报告
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="mcp-server-openapi-透传" tabindex="-1"><a class="header-anchor" href="#mcp-server-openapi-透传"><span>MCP Server ≠ OpenAPI 透传</span></a></h3><p>在设计 MCP 工具时，一个常见的误区是：<strong>直接把 OpenAPI 接口包装成 MCP 工具，原样透传 JSON 响应</strong>。</p><p>这种做法存在严重问题：</p><h4 id="❌-问题一-json-编码导致大量无效-token-消耗" tabindex="-1"><a class="header-anchor" href="#❌-问题一-json-编码导致大量无效-token-消耗"><span>❌ 问题一：JSON 编码导致大量无效 Token 消耗</span></a></h4><p>标准 JSON 格式包含大量结构性字符（<code>{</code>, <code>}</code>, <code>&quot;</code>, <code>:</code> 等），这些对大模型理解数据毫无帮助，却会消耗宝贵的 Token 预算。</p><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code>// 原始 JSON（约 180 tokens）
{&quot;cpu_percentage&quot;: 45.2, &quot;memory_usage&quot;: 67.8, &quot;disk_iops_read&quot;: 1234, &quot;disk_iops_write&quot;: 567}

// 使用 TOON 格式（约 80 tokens）
cpu_percentage:45.2 memory_usage:67.8 disk_iops_read:1234 disk_iops_write:567
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>本项目使用 <strong>TOON (Token-Oriented Object Notation)</strong> 格式优化 Token 消耗，在监控数据等大体量返回场景下，可节省 <strong>40-60%</strong> 的 Token。</p><h4 id="❌-问题二-json-key-value-结构对大模型不友好" tabindex="-1"><a class="header-anchor" href="#❌-问题二-json-key-value-结构对大模型不友好"><span>❌ 问题二：JSON Key-Value 结构对大模型不友好</span></a></h4><p>大模型在理解 JSON 字段时容易产生<strong>幻觉</strong>，尤其是单位问题：</p><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code>// API 原始返回
{&quot;bandwidth&quot;: 100, &quot;disk_size&quot;: 500, &quot;memory&quot;: 8}

// 大模型可能的错误理解：
// - bandwidth 是 100 Mbps？100 Kbps？100 Gbps？
// - disk_size 是 500 GB？500 MB？500 块磁盘？
// - memory 是 8 GB？8 MB？8 个内存条？
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>解决方案</strong>：通过两种方式显式标注单位，彻底消除歧义：</p><p><strong>方式一：在字段名中标注单位</strong></p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>return {
    &quot;internet_bandwidth(kbits/s)&quot;: item.internet_bandwidth,
    &quot;disk_size_gb&quot;: disk.size,
    &quot;iops_read(次/s)&quot;: item.iops_read,
    &quot;throughput_mbps&quot;: disk.throughput,
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>方式二：在字段值中使用自然语言标注单位（推荐）</strong></p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>return {
    &quot;internet_bandwidth&quot;: f&quot;{item.internet_bandwidth} Mbps&quot;,
    &quot;disk_size&quot;: f&quot;{disk.size} GB&quot;,
    &quot;memory&quot;: f&quot;{instance.memory / 1024} GB&quot;,
    &quot;iops_read&quot;: f&quot;{item.iops_read} 次/秒&quot;,
    &quot;throughput&quot;: f&quot;{disk.throughput} MB/s&quot;,
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>第二种方式更友好——大模型可以直接将字段值用于生成报告，无需再做单位转换，减少出错可能。</p><h4 id="❌-问题三-api-原始数据包含大量诊断无关信息" tabindex="-1"><a class="header-anchor" href="#❌-问题三-api-原始数据包含大量诊断无关信息"><span>❌ 问题三：API 原始数据包含大量诊断无关信息</span></a></h4><p>云 API 返回的数据通常很全面，但对于诊断场景，很多字段是噪音：</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code># API 原始返回的实例对象包含 50+ 字段
# 但诊断只需要关注这些核心字段：

return {
    &quot;instance_id&quot;: instance.instance_id,
    &quot;name&quot;: instance.name,
    &quot;instance_type&quot;: instance.instance_type,
    &quot;region&quot;: instance.region,
    &quot;zone&quot;: instance.zone_id,
    &quot;private_ips&quot;: instance.private_ips,
    &quot;public_ips&quot;: instance.public_ips,
    &quot;os_type&quot;: instance.os,
    &quot;cpu_topology_type&quot;: instance.cpu_topology_type,
    # 删减了：创建者、标签、计费信息、过期时间等无关字段
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="监控数据的智能预处理" tabindex="-1"><a class="header-anchor" href="#监控数据的智能预处理"><span>监控数据的智能预处理</span></a></h3><p>监控数据是诊断的核心依据，但也是最容易让大模型&quot;翻车&quot;的地方。</p><h4 id="为什么不能直接返回时序数据" tabindex="-1"><a class="header-anchor" href="#为什么不能直接返回时序数据"><span>为什么不能直接返回时序数据？</span></a></h4><p>云监控 API 通常返回这样的时序数据：</p><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code>[
  {&quot;timestamp&quot;: &quot;2024-01-15T10:00:00Z&quot;, &quot;cpu&quot;: 45.2, &quot;memory&quot;: 67.8},
  {&quot;timestamp&quot;: &quot;2024-01-15T10:01:00Z&quot;, &quot;cpu&quot;: 48.1, &quot;memory&quot;: 68.2},
  {&quot;timestamp&quot;: &quot;2024-01-15T10:02:00Z&quot;, &quot;cpu&quot;: 52.3, &quot;memory&quot;: 69.1},
  // ... 还有几百个数据点
]
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>直接返回给大模型会有严重问题：</p><p><strong>问题一：大模型不擅长处理时序数据</strong></p><p>大模型是基于 Transformer 架构的语言模型，它擅长理解语义，但<strong>不擅长数值计算和时序模式识别</strong>。给它一堆数据点，它可能会：</p><ul><li>错误计算平均值、最大值</li><li>无法识别数据趋势（上升/下降）</li><li>对异常值视而不见或过度敏感</li></ul><p><strong>问题二：时序数据极易引发幻觉</strong></p><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>// 原始数据：CPU 从 45% 涨到 52%
大模型可能的错误解读：
❌ &quot;CPU 使用率飙升，系统即将崩溃&quot;（过度解读 7% 的波动）
❌ &quot;CPU 平均使用率约 30%&quot;（随机猜测）
❌ &quot;CPU 呈现周期性波动&quot;（无中生有）
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>问题三：海量数据点消耗大量 Token</strong></p><p>30 分钟的分钟级监控数据就有 30 个点，6 个指标就是 180 个数据点。直接返回会消耗数千 Token，且大部分是无效信息。</p><h4 id="我们的解决方案-预计算统计摘要" tabindex="-1"><a class="header-anchor" href="#我们的解决方案-预计算统计摘要"><span>我们的解决方案：预计算统计摘要</span></a></h4><p>与其让大模型做它不擅长的事，不如<strong>在 MCP Server 层完成数据分析，只给大模型结论性信息</strong>：</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>def analyze_metric(dataset: list[dict]):
    &quot;&quot;&quot;将时序监控数据聚合为统计摘要&quot;&quot;&quot;
    df = pandas.DataFrame(dataset)
    
    # 计算统计指标（大模型不擅长的事，我们来做）
    stats = df.describe(percentiles=[0.25, 0.5, 0.75, 0.95])
    
    # 计算趋势（用线性回归拟合斜率）
    for column in df.columns:
        trend_slope, trend_desc = _evaluate_series_trend(df[column])
        stats.loc[&quot;current&quot;] = df[column].iloc[-1]        # 当前值
        stats.loc[&quot;trend_slope&quot;] = trend_slope            # 趋势斜率
        stats.loc[&quot;trend_desc&quot;] = trend_desc              # 人类可读的趋势描述
    
    return stats.to_dict()

def _evaluate_series_trend(series: pandas.Series):
    &quot;&quot;&quot;评估时序数据趋势&quot;&quot;&quot;
    if len(series) &lt;= 1:
        return float(&quot;nan&quot;), &quot;Insufficient Data&quot;
    
    # 线性回归拟合
    slope, _ = np.polyfit(np.arange(len(series)), series, 1)
    
    # 转化成人类语言给 LLM（消除歧义）
    if slope &gt; 0.5:
        return slope, &quot;Rapidly Rising (快速上升)&quot;
    elif slope &gt; 0.05:
        return slope, &quot;Slowly Rising (缓慢上升)&quot;
    elif slope &lt; -0.5:
        return slope, &quot;Rapidly Falling (快速下降)&quot;
    elif slope &lt; -0.05:
        return slope, &quot;Slowly Falling (缓慢下降)&quot;
    else:
        return slope, &quot;Stable (平稳)&quot;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="预处理后的数据结构" tabindex="-1"><a class="header-anchor" href="#预处理后的数据结构"><span>预处理后的数据结构</span></a></h4><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code>{
  &quot;cpu_metrics&quot;: {
    &quot;cpu_percentage&quot;: {
      &quot;mean&quot;: 45.2,
      &quot;std&quot;: 3.8,
      &quot;min&quot;: 38.1,
      &quot;max&quot;: 56.7,
      &quot;p95&quot;: 52.3,
      &quot;current&quot;: 48.5,
      &quot;trend_desc&quot;: &quot;Stable (平稳)&quot;
    }
  }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="这样做的优势" tabindex="-1"><a class="header-anchor" href="#这样做的优势"><span>这样做的优势</span></a></h4><table><thead><tr><th>对比维度</th><th>原始时序数据</th><th>预处理后的统计摘要</th></tr></thead><tbody><tr><td><strong>Token 消耗</strong></td><td>数千 tokens</td><td>约 100 tokens</td></tr><tr><td><strong>大模型理解难度</strong></td><td>高（需要数值计算）</td><td>低（直接读结论）</td></tr><tr><td><strong>幻觉风险</strong></td><td>高（容易误判趋势）</td><td>低（趋势已预计算）</td></tr><tr><td><strong>诊断准确性</strong></td><td>依赖大模型数学能力</td><td>由代码保证正确性</td></tr></tbody></table><p>大模型拿到预处理后的数据，可以直接输出：</p><blockquote><p>&quot;CPU 使用率平均 45.2%，P95 为 52.3%，当前 48.5%，整体<strong>趋势平稳</strong>，属于正常水平。&quot;</p></blockquote><p>而不是在一堆数据点里迷失方向。</p><h2 id="四、prompt-工程实践" tabindex="-1"><a class="header-anchor" href="#四、prompt-工程实践"><span>四、Prompt 工程实践</span></a></h2><h3 id="system-prompt-核心结构" tabindex="-1"><a class="header-anchor" href="#system-prompt-核心结构"><span>System Prompt 核心结构</span></a></h3><div class="language-markdown line-numbers-mode" data-ext="md" data-title="md"><pre class="language-markdown"><code>你是一位专业的云计算运维专家。请协助用户诊断实例。

## 诊断流程
1. 收集基本信息（检查实例状态）
2. 监控数据分析（CPU、磁盘、网络）
3. 综合诊断报告（健康检查、安全评估）
4. 串口日志分析（检查 OOM、Panic、Failed 等关键词）

## 诊断原则
- **数据驱动**：基于实际监控数据分析，避免主观臆断
- **可操作性**：提供具体、可执行的解决方案

## ⚠️ 注意事项
- 如果日志信息不足以判断，请直接回答&quot;信息不足，无法确诊&quot;

## 输出格式
### 🩺 诊断结论
[用简短的语言描述核心问题]

### 🔍 证据分析
- **现象**：[描述你看到的指标或日志]
- **根因**：[解释技术原因]

### � 修复建议
1. [建议一]
2. [建议二]
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="prompt-设计心得" tabindex="-1"><a class="header-anchor" href="#prompt-设计心得"><span>Prompt 设计心得</span></a></h3><h4 id="核心原则-提供完整的输出格式模板" tabindex="-1"><a class="header-anchor" href="#核心原则-提供完整的输出格式模板"><span>核心原则：提供完整的输出格式模板</span></a></h4><p>大模型每次生成的内容具有一定随机性。如果不约束输出格式，同一个问题可能得到风格迥异的诊断报告。</p><p><strong>解决方案</strong>：在 Prompt 中提供<strong>完整的输出格式模板</strong>，包括：</p><ul><li>固定的章节标题（🩺 诊断结论、🔍 证据分析、🛠 修复建议）</li><li>每个章节的内容占位符</li><li>明确的格式要求（结构化 Markdown）</li></ul><p>这样可以：</p><ol><li><strong>降低输出不一致的概率</strong>：大模型会严格按照模板填充内容</li><li><strong>方便前端渲染</strong>：固定结构的报告更容易做 UI 展示</li><li><strong>提升用户体验</strong>：用户每次看到的报告格式一致，更专业</li></ol><h4 id="其他设计要点" tabindex="-1"><a class="header-anchor" href="#其他设计要点"><span>其他设计要点</span></a></h4><table><thead><tr><th>设计点</th><th>做法</th><th>原因</th></tr></thead><tbody><tr><td><strong>诊断流程</strong></td><td>明确列出步骤</td><td>引导大模型按顺序调用工具，避免遗漏</td></tr><tr><td><strong>诊断原则</strong></td><td>强调&quot;数据驱动&quot;</td><td>减少大模型主观臆断，降低幻觉</td></tr><tr><td><strong>注意事项</strong></td><td>允许回答&quot;信息不足&quot;</td><td>避免大模型在信息不足时强行给出错误结论</td></tr><tr><td><strong>关键词提示</strong></td><td>列出 OOM、Panic、Failed</td><td>帮助大模型在日志中快速定位问题</td></tr></tbody></table><h3 id="工具调用链示例" tabindex="-1"><a class="header-anchor" href="#工具调用链示例"><span>工具调用链示例</span></a></h3><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>用户输入: i-bp1xxxxxxxxxx

Step 1: 收集基本信息
→ 调用 get_instance_status     # 检查实例状态

Step 2: 监控数据分析  
→ 调用 get_monitor_data        # 获取 CPU/磁盘/网络监控

Step 3: 综合诊断报告
→ 调用 create_diagnostic_report # 获取阿里云官方诊断

Step 4: 串口日志分析
→ 调用 get_console_log         # 获取控制台日志

Agent 综合分析，输出结构化诊断报告
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="五、开发心得与最佳实践" tabindex="-1"><a class="header-anchor" href="#五、开发心得与最佳实践"><span>五、开发心得与最佳实践</span></a></h2><h3 id="_1-工具粒度的把握" tabindex="-1"><a class="header-anchor" href="#_1-工具粒度的把握"><span>1. 工具粒度的把握</span></a></h3><p><strong>踩坑</strong>：最初我们设计了一个&quot;一键诊断&quot;工具，返回所有信息。结果发现：</p><ul><li>Token 消耗巨大</li><li>大模型信息过载，分析质量下降</li><li>不够灵活，无法针对性诊断</li></ul><p><strong>改进</strong>：拆分为多个细粒度工具，让大模型按需调用。</p><h3 id="_2-返回数据的预处理" tabindex="-1"><a class="header-anchor" href="#_2-返回数据的预处理"><span>2. 返回数据的预处理</span></a></h3><p><strong>踩坑</strong>：直接返回 API 原始响应，包含大量冗余字段。</p><p><strong>改进</strong>：</p><ul><li>只返回诊断相关的核心字段</li><li>对时序数据做统计聚合</li><li>添加人类可读的描述（如趋势判断）</li></ul><h3 id="_3-错误处理的优雅降级" tabindex="-1"><a class="header-anchor" href="#_3-错误处理的优雅降级"><span>3. 错误处理的优雅降级</span></a></h3><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>@tool.tool(description=&quot;...&quot;)
async def get_instance_status(instance_id: str) -&gt; dict[str, Any]:
    try:
        result = await fetch_status(instance_id)
        return result.to_dict()
    except APIError as e:
        # 返回结构化错误，而不是抛异常
        return {&quot;error_msg&quot;: f&quot;查询实例状态失败: {e.message}&quot;}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这样大模型可以理解&quot;这个工具调用失败了&quot;，并尝试其他途径。</p><h3 id="_4-认证与安全" tabindex="-1"><a class="header-anchor" href="#_4-认证与安全"><span>4. 认证与安全</span></a></h3><p>MCP Server 通过中间件栈处理安全问题：</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code># 中间件执行顺序
app.add_middleware(AuthMiddleware())      # 1. 验证 Token
app.add_middleware(RateLimitMiddleware()) # 2. 限流保护
app.add_middleware(ErrorHandlingMiddleware()) # 3. 统一错误处理
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>关键安全措施：</p><ul><li>Token 透传到下游 API，不做存储</li><li>基于用户 ID 的请求限流</li><li>敏感信息不写入日志</li></ul>`,98),d=[l];function a(r,o){return n(),i("div",null,d)}const c=e(s,[["render",a],["__file","llm-大模型-阿里云实例诊断-ai-赋能云运维的实践与心得.html.vue"]]),v=JSON.parse('{"path":"/posts/2026/01/29/llm-%E5%A4%A7%E6%A8%A1%E5%9E%8B-%E9%98%BF%E9%87%8C%E4%BA%91%E5%AE%9E%E4%BE%8B%E8%AF%8A%E6%96%AD-ai-%E8%B5%8B%E8%83%BD%E4%BA%91%E8%BF%90%E7%BB%B4%E7%9A%84%E5%AE%9E%E8%B7%B5%E4%B8%8E%E5%BF%83%E5%BE%97.html","title":"大模型 + 阿里云实例诊断: AI 赋能云运维的实践与心得","lang":"zh-CN","frontmatter":{"draft":false,"permalinkPattern":"/posts/:year/:month/:day/:slug.html","type":"post","filePathRelative":"_posts/llm/2026-01-29-[LLM] 大模型 + 阿里云实例诊断: AI 赋能云运维的实践与心得.md","date":"2026-01-29T00:00:00.000Z","title":"大模型 + 阿里云实例诊断: AI 赋能云运维的实践与心得","sidebarDepth":1,"category":"llm","tags":["llm"],"description":"大模型 + 阿里云实例诊断：AI 赋能云运维的实践与心得 本文介绍我们如何利用大模型（LLM）结合 MCP Server 技术构建智能化的阿里云实例诊断系统。 文章重点分享了 MCP 工具设计的三个核心原则：使用 TOON 格式优化 Token 消耗、通过显式标注单位消除大模型幻觉、对时序监控数据进行预计算统计摘要。 同时介绍了 Prompt 工程实践...","head":[["meta",{"property":"og:url","content":"https://blog.shabbywu.cn/posts/2026/01/29/llm-%E5%A4%A7%E6%A8%A1%E5%9E%8B-%E9%98%BF%E9%87%8C%E4%BA%91%E5%AE%9E%E4%BE%8B%E8%AF%8A%E6%96%AD-ai-%E8%B5%8B%E8%83%BD%E4%BA%91%E8%BF%90%E7%BB%B4%E7%9A%84%E5%AE%9E%E8%B7%B5%E4%B8%8E%E5%BF%83%E5%BE%97.html"}],["meta",{"property":"og:site_name","content":"个人技术文章分享"}],["meta",{"property":"og:title","content":"大模型 + 阿里云实例诊断: AI 赋能云运维的实践与心得"}],["meta",{"property":"og:description","content":"大模型 + 阿里云实例诊断：AI 赋能云运维的实践与心得 本文介绍我们如何利用大模型（LLM）结合 MCP Server 技术构建智能化的阿里云实例诊断系统。 文章重点分享了 MCP 工具设计的三个核心原则：使用 TOON 格式优化 Token 消耗、通过显式标注单位消除大模型幻觉、对时序监控数据进行预计算统计摘要。 同时介绍了 Prompt 工程实践..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2026-01-29T11:24:09.000Z"}],["meta",{"property":"article:author","content":"shabbywu"}],["meta",{"property":"article:tag","content":"llm"}],["meta",{"property":"article:published_time","content":"2026-01-29T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2026-01-29T11:24:09.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"大模型 + 阿里云实例诊断: AI 赋能云运维的实践与心得\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2026-01-29T00:00:00.000Z\\",\\"dateModified\\":\\"2026-01-29T11:24:09.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"shabbywu\\",\\"url\\":\\"https://github.com/shabbywu\\"}]}"],["link",{"rel":"alternate","type":"application/atom+xml","href":"https://blog.shabbywu.cn/atom.xml","title":"个人技术文章分享 Atom Feed"}],["link",{"rel":"alternate","type":"application/json","href":"https://blog.shabbywu.cn/feed.json","title":"个人技术文章分享 JSON Feed"}],["link",{"rel":"alternate","type":"application/rss+xml","href":"https://blog.shabbywu.cn/rss.xml","title":"个人技术文章分享 RSS Feed"}]]},"headers":[{"level":2,"title":"一、背景与动机","slug":"一、背景与动机","link":"#一、背景与动机","children":[{"level":3,"title":"传统云运维的痛点","slug":"传统云运维的痛点","link":"#传统云运维的痛点","children":[]},{"level":3,"title":"我们的方案","slug":"我们的方案","link":"#我们的方案","children":[]}]},{"level":2,"title":"二、技术架构","slug":"二、技术架构","link":"#二、技术架构","children":[{"level":3,"title":"整体架构","slug":"整体架构","link":"#整体架构","children":[]},{"level":3,"title":"技术栈","slug":"技术栈","link":"#技术栈","children":[]},{"level":3,"title":"为什么选择 MCP？","slug":"为什么选择-mcp","link":"#为什么选择-mcp","children":[]}]},{"level":2,"title":"三、MCP 工具设计与实现","slug":"三、mcp-工具设计与实现","link":"#三、mcp-工具设计与实现","children":[{"level":3,"title":"工具分层设计","slug":"工具分层设计","link":"#工具分层设计","children":[]},{"level":3,"title":"MCP Server ≠ OpenAPI 透传","slug":"mcp-server-openapi-透传","link":"#mcp-server-openapi-透传","children":[]},{"level":3,"title":"监控数据的智能预处理","slug":"监控数据的智能预处理","link":"#监控数据的智能预处理","children":[]}]},{"level":2,"title":"四、Prompt 工程实践","slug":"四、prompt-工程实践","link":"#四、prompt-工程实践","children":[{"level":3,"title":"System Prompt 核心结构","slug":"system-prompt-核心结构","link":"#system-prompt-核心结构","children":[]},{"level":3,"title":"Prompt 设计心得","slug":"prompt-设计心得","link":"#prompt-设计心得","children":[]},{"level":3,"title":"工具调用链示例","slug":"工具调用链示例","link":"#工具调用链示例","children":[]}]},{"level":2,"title":"五、开发心得与最佳实践","slug":"五、开发心得与最佳实践","link":"#五、开发心得与最佳实践","children":[{"level":3,"title":"1. 工具粒度的把握","slug":"_1-工具粒度的把握","link":"#_1-工具粒度的把握","children":[]},{"level":3,"title":"2. 返回数据的预处理","slug":"_2-返回数据的预处理","link":"#_2-返回数据的预处理","children":[]},{"level":3,"title":"3. 错误处理的优雅降级","slug":"_3-错误处理的优雅降级","link":"#_3-错误处理的优雅降级","children":[]},{"level":3,"title":"4. 认证与安全","slug":"_4-认证与安全","link":"#_4-认证与安全","children":[]}]}],"readingTime":{"minutes":10.75,"words":3224},"filePathRelative":"_posts/llm/2026-01-29-llm-大模型-阿里云实例诊断-ai-赋能云运维的实践与心得.md","localizedDate":"2026年1月29日","autoDesc":true,"git":{"createdTime":1769682560000,"updatedTime":1769685849000,"contributors":[{"name":"shabbywu(伍镜滔)","email":"wujingtao01@corp.netease.com","commits":8}]}}');export{c as comp,v as data};
