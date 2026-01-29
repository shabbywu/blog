import{_ as d,r as l,o as r,c,f as i,g as e,i as s,w as a,e as t}from"./app-C9ZkQdtL.js";const u="/img/Git文件状态.png",v={},o=i("h2",{id:"前言",tabindex:"-1"},[i("a",{class:"header-anchor",href:"#前言"},[i("span",null,"前言")])],-1),m=t(`<h2 id="为什么会发生代码冲突" tabindex="-1"><a class="header-anchor" href="#为什么会发生代码冲突"><span>为什么会发生代码冲突？</span></a></h2><p>当多个开发者试图编辑相同的内容时, 那么就可能发送代码冲突。例如以下就是典型的代码冲突时的场景:</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>## 一开始, 我们实现了一个很简单的 a + b 的函数
def add(a, b):
    try:
        return 0, a + b
    except Exception:
        return -1, None
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>## 然后, 有个开发者希望用 contextlib.suppress 替换这个 try-except
from contextlib import suppress


def add(a, b):
    with suppress(Exception):
        return 0, a + b
    return -1, None
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>## 但是, 另一个开发者又提交了一个 bugfix, 希望修复当 a, b 为字符串时, 结果不符合预期的问题
def add(a, b):
    try:
        return 0, int(a) + int(b)
    except Exception:
        return -1, None
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>当我们分别合并以上两份代码时, 就会出现代码冲突:</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>def add(a, b):
&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD
    with suppress(Exception):
        return 0, a + b
    return -1, None
=======
    try:
        return 0, int(a) + int(b)
    except Exception:
        return -1, None
&gt;&gt;&gt;&gt;&gt;&gt;&gt; bugfix
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="理解冲突的含义" tabindex="-1"><a class="header-anchor" href="#理解冲突的含义"><span>理解冲突的含义</span></a></h2><p>合并和冲突是所有版本管理工具都会存在的正常情况, 在大多数情况下, Git 都可以智能地解决<strong>无歧义</strong>的合并方案, 但是如果合并有歧义(即冲突), 不像其他的版本控制系统, Git 绝对不会尝试智能解决它。我们必须解决所有合并冲突后, 才能真正完成 2 个分支的合并。</p><h2 id="合并冲突的类型" tabindex="-1"><a class="header-anchor" href="#合并冲突的类型"><span>合并冲突的类型</span></a></h2><p>一般情况下, 只有在两个开发者分别修改 1 个文件的相同行时, 或者是一个开发者在修改一份被另一个开发者删除的文件时, 才会出现代码冲突 -- 因为 Git 无法判断哪一个才是正确的。以上这些情况都已经在进行分支合并了, 事实上冲突还可能发生在合并启动之前。</p><h3 id="git-无法启动合并" tabindex="-1"><a class="header-anchor" href="#git-无法启动合并"><span>Git 无法启动合并</span></a></h3><p>当 Git 发现当前项目的工作目录或暂存区域发生更改时, 合并将无法启动。当发生以下情况时, 并不是意味着你的代码与其他开发者发生冲突, 反而是与你本地的其他(未保存的)变更发生冲突。想要解决这种状态也很简单, 以下是针对不同情况使用的指令:</p><ul><li><code>git stash</code> &gt; 贮藏（stash）会处理工作目录的脏的状态 —— 即跟踪文件的修改与暂存的改动 —— 然后将未完成的修改保存到一个栈上， 而你可以在任何时候重新应用这些改动（甚至在不同的分支上）。</li><li><code>git checkout</code> &gt; 检出（checkout）会恢复工作目录中的文件至未修改的状态, 与 <strong>stash</strong> 不同, <strong>checkout</strong> 会直接丢弃当前未完成的修改, 如果你不希望工作内容被丢弃, 请使用 <code>git stash</code>。</li><li><code>git commit</code> &gt; 提交（commit）会将当前暂存区域的所有变更保存至版本变更记录中。</li><li><code>git reset</code> &gt; 重置（reset）会只丢弃当前缓存区域的状态, 而保留工作目录的状态。如果文件不存在于版本库, 那么使用 <code>git reset</code> 即可将该文件的状态设置为 <strong>untracked</strong>。</li></ul><figure><img src="`+u+'" alt="Git文件状态" tabindex="0" loading="lazy"><figcaption>Git文件状态</figcaption></figure><blockquote><p>只有所有文件都处于 unmodified 或 untracked 时, Git 才能启动合并。</p></blockquote><h3 id="git-智能合并失败" tabindex="-1"><a class="header-anchor" href="#git-智能合并失败"><span>Git 智能合并失败</span></a></h3><p>当合并过程发生冲突时, 合并将会中止, 此时的代码处于 <code>合并中</code> 的状态。 当这种情况发生时, 代码库将无法进行 <code>pull</code>、<code>push</code> 等操作，直至开发者解决冲突完成合并后(或者中止合并)。</p><p>典型的代码冲突例子在前文已有提及, 再次强调, 通常情况下只有在两个开发者分别修改 1 个文件的相同行时, 或者是一个开发者在修改一份被另一个开发者删除的文件时, 才会出现代码冲突。但总会有些我们预料之外的非典型冲突。</p><h4 id="git-squash-merge-冲突" tabindex="-1"><a class="header-anchor" href="#git-squash-merge-冲突"><span>Git Squash Merge 冲突</span></a></h4>',20),b=i("code",null,"Squash Merge",-1),g=i("code",null,"Squash Merge",-1),p=t(`<div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>                        H---I---J feature-xxx
                        / 
                E---F---G---K----L&#39; develop (where L&#39; == (H + I +J)
                /
    A---B---C---D master
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>使用 <code>Squash Merge</code> 后, Git 将不能追踪 <strong>feature-xxx 分支</strong> 与 <strong>develop 分支</strong> 之间的关系。如果此时继续在 <strong>feature-xxx 分支</strong> 开发, 那么很可能会产生不必要的冲突。</p><p>最简单的例子, 如果进行 <code>Squash Merge</code> 时代码有冲突, 那么在 <code>Squash Merge</code> 后, 再执行 <code>Rebase</code> 那就会发现相似的冲突需要再次解决。</p><blockquote><p>因为 <code>Squash Merge</code> 会丢失新节点 L&#39; 与原分支的关联关系。 Git 无法判断这两份代码之间的关联性(即使你知道它只是被 Squash 了而已)。</p></blockquote><h4 id="git-rebase-冲突" tabindex="-1"><a class="header-anchor" href="#git-rebase-冲突"><span>Git Rebase 冲突</span></a></h4>`,5),h=i("code",null,"Rebase(变基)",-1),x=t(`<div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>        E---F---G feature-xxx
        /
    A---B---C---D develop
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>将 <strong>feature-xxx 分支</strong> rebase 至 <strong>develop 分支</strong> 时, 事实上经历了以下流程:</p><ol><li>将 E 节点的变更记录提交至 D 节点后</li></ol><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>                E&#39;   rebasing
                /
    A---B---C---D develop
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol start="2"><li>将 F 节点的变更记录提交至 E&#39; 节点后</li></ol><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>                E&#39;---F&#39;   rebasing
                /
    A---B---C---D develop
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol start="3"><li>将 G 节点的变更记录提交至 F&#39; 节点后</li></ol><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>                E&#39;---F&#39;---G&#39;   rebasing
                /
    A---B---C---D develop
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>通常情况下, <code>Rebase(变基)</code> 与 <code>Merge(合并)</code> 是一样的, 遇到无歧义的代码合并时会自动完成变基。当变基过程发送冲突时, 变基将会中止, 此时的代码状态与合并冲突时一致。当开发者解决冲突即可继续变基。</p><p>但是, <code>Rebase</code> 相对于 <code>Merge</code> 而言具有一定的危险性, 如果分支不经常 <strong>Rebase</strong>，<strong>Rebase</strong>期间可能会出现很多合并冲突, 甚至有时候会出现相似的冲突需要解决多次, 甚至出现预期以外的合并结果!</p><p>我们首先展示相似冲突需要解决多次的情况, 以上述的拓扑结构为例, 假设我们在 B 节点具有以下代码:</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>def sum(a, b):
    return a + b
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>并且, 该代码在 D 节点被重构成:</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>def sum(*args):
    result = 0
    for arg in args:
        result += arg
    return arg
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>此时, 我们在 E 节点中将 B 节点的代码进行了安全性重构:</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>def sum(a, b):
    ai, bi = int(a), int(b)
    return ai + bi
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在 F 节点又再次进行了安全性重构:</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>def sum(a, b):
    try:
        ai, bi = int(a), int(b)
    except ValueError:
        return 0
    return ai + bi
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>我们现在开始执行 <code>Rebase(变基)</code> 指令:</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>➜ git rebase master other
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>意料之内的发生合并冲突:</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>++&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD
 +def sum(*args):
 +    result = 0
 +    for arg in args:
 +        result += arg
 +    return arg
++=======
+ def sum(a, b):
+     ai, bi = int(a), int(b)
+     return ai + bi
++&gt;&gt;&gt;&gt;&gt;&gt;&gt; E
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>解决冲突后, E&#39; 节点的代码如下:</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>def sum(*args):
    result = 0
    for arg in args:
        result += int(arg)
    return arg
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>继续变基, 再次发生合并冲突:</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>++&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD
 +def sum(*args):
 +    result = 0
 +    for arg in args:
 +        result += int(arg)
 +    return arg
++=======
+ def sum(a, b):
+     try:
+         ai, bi = int(a), int(b)
+     except ValueError:
+         return 0
+     return ai + bi
++&gt;&gt;&gt;&gt;&gt;&gt;&gt; F
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>再次解决冲突后, <code>Rebase</code> 才真正执行完成。如果我们使用 <code>Merge</code> 进行代码合并, 反而只需要解决 1 次冲突。这种差异的根本原因是由 <code>Rebase</code> 的原理造成的 -- <code>Rebase</code> 可理解为将需要变基的分支的提交在变基目标分支上依次重放。</p><p>因此, 想要减少相似问题解决多次的情况, 有以下的途径:</p><ul><li>遇到冲突时只使用 ours 的改动 &gt; 因为 ours 的改动绝对不会和下一个提交产生冲突 &gt; 不过这种做法有掩耳盗铃的嫌疑。</li><li>先使用 <code>交互式 Rebase</code> 将当前分支的改动 <code>Squash(压缩)</code> 成 1 个提交, 再执行 rebase &gt; 因为这样就只会产生 1 次提交重放</li></ul><p>软件开发中没有银弹, 唯一能避免冲突的方法就是不参与开发。<code>Rebase</code> 虽然灵活, 但是要得到什么就要付出同等的代价 -- <s>这就是炼金术的等价交换原则！</s></p><h4 id="git-智能合并陷阱" tabindex="-1"><a class="header-anchor" href="#git-智能合并陷阱"><span>Git 智能合并陷阱</span></a></h4><p>Git 合并不是万能的, 智能合并不一定能产生符合预期的代码。使用以下的拓扑结构进行介绍:</p><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>        E feature-xxx
        /
    A---B---C---D develop
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中 B 节点具有以下的代码:</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>## -*- coding: utf-8 -*-


def sum(a, b):
    return a + b


def factorial(n):
    ...

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>随后, D 节点对代码进行了重构:</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>## -*- coding: utf-8 -*-


def sum(*args):
    result = 0
    for arg in args:
        result += arg
    return arg


def factorial(n):
    ...

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>与此同时, 在另一个分支 <strong>feature-xxx</strong> 的 E 节点对代码进行了安全性重构, 同时重新编排了代码:</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>## -*- coding: utf-8 -*-


def factorial(n):
    ...


def sum(a, b):
    ai, bi = int(a), int(b)
    return ai + bi

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>此时, 如果我们合并 <strong>feature-xxx 分支</strong> 与 <strong>develop 分支</strong> 会产生冲突, 但是 Git 提示的冲突内容是很奇怪的。</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>❯ cat example.py
## -*- coding: utf-8 -*-


&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD
def sum(*args):
    result = 0
    for arg in args:
        result += arg
    return arg

=======
&gt;&gt;&gt;&gt;&gt;&gt;&gt; other

def factorial(n):
    ...


def sum(a, b):
    ai, bi = int(a), int(b)
    return ai + bi

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>遇到这种情况的代码冲突, 如果不仔细阅读代码将会造成错误的合并结果。</p><h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span>总结</span></a></h2><p>代码冲突在所难免, 在了解冲突发生的原因后精准修复代码是程序员的必备技能之一。通常情况下, Git 已经通过自动合并算法解决了大多数无歧义的代码合并。基本上只有在两个开发者分别修改 1 个文件的相同行时, 或者是一个开发者在修改一份被另一个开发者删除的文件时, 才会出现代码冲突。</p>`,44);function f(y,_){const n=l("RouteLink");return r(),c("div",null,[o,i("p",null,[e("在上一篇文章"),s(n,{to:"/posts/2022/05/27/git-merge-method.html"},{default:a(()=>[e("Git 合并代码的不同方式")]),_:1}),e("中介绍了 Merge Commit、Squash Merge、Cherry-pick、Rebase Merge 等合并方法的差异和使用场景, 接下来我们继续讨论与 Git 密不可分的另一个话题 -- 代码合并冲突。")]),m,i("p",null,[e("在上一篇文章"),s(n,{to:"/posts/2022/05/27/git-merge-method.html"},{default:a(()=>[e("Git 合并代码的不同方式")]),_:1}),e("中有提及, "),b,e(" 会将代码提交记录压缩合并为 1个节点, 并追加至当前分支的末尾。使用 "),g,e(" 会产生以下的拓扑结构:")]),p,i("p",null,[e("在上一篇文章"),s(n,{to:"/posts/2022/05/27/git-merge-method.html"},{default:a(()=>[e("Git 合并代码的不同方式")]),_:1}),e("中有提及, "),h,e(" 即变更当前分支的根节点。对于以下的拓扑结构而言:")]),x])}const k=d(v,[["render",f],["__file","git-merge-conflicts.html.vue"]]),M=JSON.parse('{"path":"/posts/2022/06/08/git-merge-conflicts.html","title":"Git Merge Conflicts","lang":"zh-CN","frontmatter":{"draft":false,"permalinkPattern":"/posts/:year/:month/:day/:slug.html","type":"post","filePathRelative":"_posts/common/2022-06-08-Git Merge Conflicts.md","date":"2022-06-08T00:00:00.000Z","title":"Git Merge Conflicts","sidebarDepth":2,"category":"基础技术","tags":["git"],"description":"前言 在上一篇文章中介绍了 Merge Commit、Squash Merge、Cherry-pick、Rebase Merge 等合并方法的差异和使用场景, 接下来我们继续讨论与 Git 密不可分的另一个话题 -- 代码合并冲突。 为什么会发生代码冲突？ 当多个开发者试图编辑相同的内容时, 那么就可能发送代码冲突。例如以下就是典型的代码冲突时的场景:...","head":[["meta",{"property":"og:url","content":"https://blog.shabbywu.cn/posts/2022/06/08/git-merge-conflicts.html"}],["meta",{"property":"og:site_name","content":"个人技术文章分享"}],["meta",{"property":"og:title","content":"Git Merge Conflicts"}],["meta",{"property":"og:description","content":"前言 在上一篇文章中介绍了 Merge Commit、Squash Merge、Cherry-pick、Rebase Merge 等合并方法的差异和使用场景, 接下来我们继续讨论与 Git 密不可分的另一个话题 -- 代码合并冲突。 为什么会发生代码冲突？ 当多个开发者试图编辑相同的内容时, 那么就可能发送代码冲突。例如以下就是典型的代码冲突时的场景:..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:image","content":"https://blog.shabbywu.cn/img/Git文件状态.png"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-02-24T07:10:47.000Z"}],["meta",{"name":"twitter:card","content":"summary_large_image"}],["meta",{"name":"twitter:image:alt","content":"Git Merge Conflicts"}],["meta",{"property":"article:author","content":"shabbywu"}],["meta",{"property":"article:tag","content":"git"}],["meta",{"property":"article:published_time","content":"2022-06-08T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-02-24T07:10:47.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"Git Merge Conflicts\\",\\"image\\":[\\"https://blog.shabbywu.cn/img/Git文件状态.png\\"],\\"datePublished\\":\\"2022-06-08T00:00:00.000Z\\",\\"dateModified\\":\\"2024-02-24T07:10:47.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"shabbywu\\",\\"url\\":\\"https://github.com/shabbywu\\"}]}"],["link",{"rel":"alternate","type":"application/atom+xml","href":"https://blog.shabbywu.cn/atom.xml","title":"个人技术文章分享 Atom Feed"}],["link",{"rel":"alternate","type":"application/json","href":"https://blog.shabbywu.cn/feed.json","title":"个人技术文章分享 JSON Feed"}],["link",{"rel":"alternate","type":"application/rss+xml","href":"https://blog.shabbywu.cn/rss.xml","title":"个人技术文章分享 RSS Feed"}]]},"headers":[{"level":2,"title":"前言","slug":"前言","link":"#前言","children":[]},{"level":2,"title":"为什么会发生代码冲突？","slug":"为什么会发生代码冲突","link":"#为什么会发生代码冲突","children":[]},{"level":2,"title":"理解冲突的含义","slug":"理解冲突的含义","link":"#理解冲突的含义","children":[]},{"level":2,"title":"合并冲突的类型","slug":"合并冲突的类型","link":"#合并冲突的类型","children":[{"level":3,"title":"Git 无法启动合并","slug":"git-无法启动合并","link":"#git-无法启动合并","children":[]},{"level":3,"title":"Git 智能合并失败","slug":"git-智能合并失败","link":"#git-智能合并失败","children":[]}]},{"level":2,"title":"总结","slug":"总结","link":"#总结","children":[]}],"readingTime":{"minutes":8.6,"words":2579},"filePathRelative":"_posts/common/2022-06-08-git-merge-conflicts.md","localizedDate":"2022年6月8日","autoDesc":true,"git":{"createdTime":1708758647000,"updatedTime":1708758647000,"contributors":[{"name":"shabbywu","email":"shabbywu@tencent.com","commits":1}]}}');export{k as comp,M as data};
