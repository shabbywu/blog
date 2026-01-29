import{_ as s,r as t,o as r,c as d,f as e,g as n,i as a,e as i}from"./app-C9ZkQdtL.js";const o={},c=i(`<h2 id="序言" tabindex="-1"><a class="header-anchor" href="#序言"><span>序言</span></a></h2><p>由于很多文章对协程的介绍都很精简，在探讨Python异步编程之前，我们先来明确协程的概念，避免以后混淆了<strong>异步</strong>和<strong>协程</strong>的概念。</p><h3 id="什么是协程" tabindex="-1"><a class="header-anchor" href="#什么是协程"><span>什么是协程</span></a></h3><blockquote><p>协程，又称微线程，英文名为 Coroutine。</p></blockquote><p><strong>协程(Coroutine)<strong>的概念提出的很早，在操作系统层面上，与它关联的是</strong>线程(Thread)</strong>, <strong>进程(Process)</strong>。从设计理念出发，<strong>协程</strong>、<strong>线程</strong>和<strong>进程</strong>都是为了更好的分配和利用CPU和内存资源。<br> 在早期的操作系统中，<strong>进程</strong> 是程序执行的基本实体，随着支持多线程CPU的出现，程序执行的基本实体被 <strong>线程</strong> 所取代，但资源的分配单位仍然为<strong>进程</strong>。<br> 一般而言，<strong>进程</strong> 是操作系统进行资源分配和调度的单位，<strong>线程</strong> 是操作系统进行CPU分配和调度的单位，而 <strong>协程</strong> 则隶属于 <strong>线程</strong> ，由用户自主控制任务的调度, 而非依赖操作系统的抢占式机制。</p><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>+---------+   +---------+   +---------+    +---------+              +---------+
|Coroutine|   |Coroutine|   |Coroutine|    |Coroutine|  ..........  |Coroutine|
+----+----+   +----+----+   +----+----+    +----+----+              +----+----+
     |             |             |              |                        |
     +---------------------------+              +------+-----------------+
                   |                                   |
            +------v-------+                   +-------v------+
            |              |                   |              |
            |    Thread    |                   |    Thread    |
            |              |                   |              |
            +------+-------+                   +-------+------+
                   |                                   |
                   +-----------------+-----------------+
                                     |
                                     |
        +----------------------------v------------------------------+
        |                                                           |
        |                         Process                           |
        |                                                           |
        +-----------------------------------------------------------+
                        ## 协程、线程、进程 之间的关系
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="协程的实现" tabindex="-1"><a class="header-anchor" href="#协程的实现"><span>协程的实现</span></a></h2><p>由于协程的执行需要用户自动调度，因此实现协程的主要难题是<strong>恢复</strong>和<strong>挂起</strong>, 针对<strong>恢复</strong>和<strong>挂起</strong>的实现方式，协程的实现又可以区分为两类，分别是:</p><ul><li>对称式协程(symmetric coroutine)</li><li>非对称式协程(asymmetric coroutine)</li></ul><blockquote><p><strong>对称式协程</strong>, 是指所有协程之间是等价的，因此对称式协程之间允许互相交换(<code>transfer/switch</code>)控制权，拥有极大的自由，但该操作与 <code>goto</code> 类似, 虽然能让程序跳转到任何地方, 但这样的代码却十分不好维护。<br><strong>非对称式协程</strong> 认为协程之间存在父子关系, 协程只支持两类控制权转移原语, 分别是 <code>yield</code> 和 <code>resume</code>。非对称协程通过 <code>yield</code> 将控制权返回到其父协程(调用者), <code>resume</code> 则将控制权转移至 子协程(被调用者)</p></blockquote><p>由于协程可以实现<strong>恢复</strong>和<strong>挂起</strong>，因此协程(Coroutine)的生命周期与通常的函数(Function)不大一样, 函数依循堆栈式的调用，<em>进入函数-&gt;执行函数体-&gt;函数返回</em>，这就是函数的生命周期。但是协程不一样，协程的执行可以挂起，让出CPU的控制权执行别处的代码，当协程被唤醒并完全运行结束后，协程才真正退出。</p><div class="language-plantuml line-numbers-mode" data-ext="plantuml" data-title="plantuml"><pre class="language-plantuml"><code><img src="https://www.plantuml.com/plantuml/svg/SoWkIImgAStDuIh9BCb9LNZQllVPr0tFEfU_MDZpVChyfnFtFfsuujcS-LpHkdOARgLvoIMP-NbM2iw9EJbSYK1EMM99AboSgwQc1empylA1mlbbgKK8FN2MGb5fNbvcNZfSTRIDhYwIkg3Kaj8YeAhKujAS4Yw7rBmKeFC0
"></code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><div class="language-plantuml line-numbers-mode" data-ext="plantuml" data-title="plantuml"><pre class="language-plantuml"><code><img src="https://www.plantuml.com/plantuml/svg/SYWkIImgAStDuIh9BCb9LNZQs_zyHVUppkKl5lOydpB_wSIzJoUkU3PdFg0HghPY68YXlQRG0dOVfWrS1Hep74Zl7QqVPgx4-W2RQ8mBDknTHrKV5vbIa1Mk2vchRWDeYVSrXyeyR5zID9weemOsmoYwtrXrbIhHCUuRbO4uZd6kk91LYVly6JsfhDSLuhzmc3LPHo-WIUMy8JJxRyh1jA9oRyGE
"></code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><div class="language-plantuml line-numbers-mode" data-ext="plantuml" data-title="plantuml"><pre class="language-plantuml"><code><img src="https://www.plantuml.com/plantuml/svg/SYWkIImgAStDuIh9BCb9LNY-Q__p5TtFEfU_MDZpVChyfnFtFfsuujcS-Lo0mgVQ068O1lQUGWlO_JCkyD2bCYWSAGpJFsELHgm3JoxX79QetHHsEas5jdNKwXfVKn4ItnfkiVpSFJEK3L54WV3cKdvsfwRAaHmwC0DmZgMk8oQeXgh6J2YbO9koJMxxM_t7ViIgoH1Wd15qe2FwvzqpeLWZkPldAm00
"></code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>从函数和协程的生命周期可以看出，协程的<strong>恢复</strong>和<strong>挂起</strong>本质上就是 <strong>用户态的上下文切换</strong>，也就意味着需要实现的是调用堆栈的保存和恢复。<br> 同时，<strong>对称式协程</strong> 和 <strong>非对称式协程</strong> 对于堆栈的保存和恢复的实现方案也有所差异，前者由于支持所有协程之间相互跳转，因此切换时需要对整个堆栈进行保存，切入时需要将整个堆栈进行恢复，同时有可能需要合并现有的堆栈与缓存堆栈的状态；后者由于只支持层级关系之间的跳转，只需要保存栈顶的堆栈和恢复栈顶的堆栈即可。</p><h3 id="协程的官方实现介绍" tabindex="-1"><a class="header-anchor" href="#协程的官方实现介绍"><span>协程的官方实现介绍</span></a></h3><p>在历史上, Python 首先是通过<code>生成器(generator)</code>实现<code>协程(coroutine)</code>的 <em>单层</em> 虚拟机栈帧的保存和复原，属于 <em>非对称式协程</em>。</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>import random
def factorial_generator(n):
    v = n
    while n &gt; 0:
        n -= 1
        yield v*n
    return v

def random_add(num_producer, factor=0.5):
    _s = 0
    while True:
        try:
            ## resume a coroutine
            xc = next(num_producer)
            if random.random() &gt;= factor:
                _s += xc
        except StopIteration as e:
            ## return value of coroutine
            print(e.value)
            break
    return _s

def main():
    result = random_add(factorial_generator(10))
    print(result)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-plantuml line-numbers-mode" data-ext="plantuml" data-title="plantuml"><pre class="language-plantuml"><code><img src="https://www.plantuml.com/plantuml/svg/SYW6b4eCk155mHZl51FMjdkJpKlVjwVpcpIgRGTLs0sxGQtBB6_HgSrDCZP88iMUAyWYLuF2pcxcy2ntaCfSBcKMbdB9kNngBBUUp6uTPywNXEmZQq2I1fwqV767eAhxNcY7xEvuONWVTFO9q99kmj1y3IKBpuueVHLu2QbKEppaVQKI1WPn-4hnw9A_cU8sdaj_Mk3P-2hT2ykbFujg1zJwO-_JZALrjMNY4prKlHjZqD9S1NMrHPPh-rirA8SsKLrTNUoGVwxQoj32qCpGnD38qC1Gpr0dbFRjbL2Z6FrNgUzxSqbeldhtJ25QFfK-cCj4BplmZzu2
"></code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>从协程调用的时序图可以看出，<code>factorial_generator</code> 和 <code>random_add</code> 在主函数中均只调用了一次，但程序的执行却是在 <code>factorial_generator</code> 和 <code>random_add</code> 之间穿插着进行，这就是非对称协程之间的控制权转移。</p><h3 id="协程的社区实现介绍" tabindex="-1"><a class="header-anchor" href="#协程的社区实现介绍"><span>协程的社区实现介绍</span></a></h3>`,21),u=e("em",null,"CPython",-1),v=e("em",null,"Python",-1),m={href:"https://tech.blog.aknin.name/tag/block-stack/",target:"_blank",rel:"noopener noreferrer"},p=e("strong",null,"虚拟机栈帧",-1),b=e("code",null,"yield",-1),g=e("strong",null,"一层",-1),h=e("em",null,"Stackless Python",-1),_=e("strong",null,"greenlet",-1),y=e("br",null,null,-1),f=e("strong",null,"greenlet",-1),w=i(`<ul><li>每个线程均有线程内唯一的 <em>main greenlet</em> 对象</li><li>除了 main greenlet 以外, 任意 greenlet 均有唯一的 <em>parent</em> (greenlet对象)</li><li>创建 greenlet 对象时, 如不指定 parent, 默认指定当前在执行的协程为 parent, 且最外层的 parent 为 main greenlet</li><li>greenlet 执行完毕后, 返回 <em>parent</em> 继续执行</li><li>使用 switch 切换至非子协程后, 需用户 <strong>手动switch</strong> 返回该协程或该协程的子协程, 该协程才继续执行</li></ul><p>基于以上的规约, <strong>greenlet</strong> 解决了堆栈如何保存和复原的问题，其实现的原理可以简单描述为一下几步:</p><ul><li>将 function 封装为 greenlet 对象, 并返回 greenlet 句柄, 用于指定特定的协程上下文状态。</li><li>使用 greenlet.switch(*args, **kwargs) 进行任意协程的切换 <ul><li>切出时保存当前协程的栈帧到堆内存</li><li>切入时, 重新将协程的栈帧推入到堆栈, 协程即重新运行</li><li>当目标协程未执行时, 传入参数作为函数的标准参数</li><li>当目标协程已执行但被挂起，协程被唤醒，且传入参数作为上次被挂起的语句的返回值</li><li>当目标协程已终止，递归至其父协程</li></ul></li><li>协程执行完毕 <ul><li>标记协程状态为<code>DEAD</code>, switch 返回父协程继续执行</li><li>当父协程为 main greenlet 时, 协程执行链结束</li></ul></li></ul><div class="language-plantuml line-numbers-mode" data-ext="plantuml" data-title="plantuml"><pre class="language-plantuml"><code><img src="https://www.plantuml.com/plantuml/svg/SYWkIImgAStDuIh9BCb9LNYwVkVpvHkUxkb_sjl_V4NtYmtDpwUiU3PzszDT_LmPUVabgGhvPQb52hc9cNbM2i_cjRniMA2GNcJukA4HK2SPx3O8ms3upbDOd5Q97iXk7AQzoMI1WQXPg1mpshTV7DGgAUe5Y6t-___04vjq_Qoq2USlYCyTXCrAFuFrie0siHVxXq9wo1NJy9NZt4VDg_VMJre351Wj1wbFbHxFIRVjKcyW71h0LPR2vefCNgg1Wl1oVtLjIzSarKBw3B0jV8d6bLPs9zD5Lh-YUm4nkQGf9SqJf4Vd5AIVhHlg1f2dqC1bqxloc9p799u2vm1pD6iBCy1HY9z-FwS7octF9No792ysPr7psoDAPgxrFK03Co633JhoBW5JM7yflJMYTKM0VMLq_Drlqu7O9_AESk3sk7YZzJRCrJVv8QxkFm00
"></code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h2 id="协程的使用场景" tabindex="-1"><a class="header-anchor" href="#协程的使用场景"><span>协程的使用场景</span></a></h2><p>由于<strong>协程</strong>的设计理念强调了由用户控制任务的执行和调度，因此<strong>协程</strong>为协同任务提供了一种运行时抽象，这种抽象非常适合于协同多任务调度和数据流处理。同时，因为用户态的上下文切换代价比内核态的上下文切换要小，<strong>协程</strong>也成为了一种轻量级的多任务模型。</p><h3 id="_1-数据流处理" tabindex="-1"><a class="header-anchor" href="#_1-数据流处理"><span>1. 数据流处理</span></a></h3><p>所谓的数据流处理，其实可以抽象成<code>生产者/消费者</code>问题，这也是典型的多线程并发合作问题。如果使用多线程模型解决生产者/消费者问题，由于竞争的存在，往往需要使用锁或信号进行同步。如果使用协程解决该问题，由于协程是基于<code>单线程模型</code>设计的，协程之间无竞争条件，反而是处于协助的关系。</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>from greenlet import greenlet
from collections import Counter
word_counter = Counter()

def FileReader(fh):
    while 1:
         ## 从数据流中产生数据 
        line = fh.readline()
        for word in lines.split():
            ## 推送给消费者
            consumer_instance.switch(word)

def WordProcessor(word):
    while 1:
        ## 消费数据
        process(word)
        word = producer_instance.switch()

def process(word):
    word_counter[str(word).lower()]+=1

producer_instance = greenlet(FileReader)
consumer_instance = greenlet(WordProcessor)

with open(&quot;/dev/random&quot;, mode=&quot;rb&quot;) as fh:
    producer_instance.switch(fh)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-实现尾递归优化-避免堆栈溢出" tabindex="-1"><a class="header-anchor" href="#_2-实现尾递归优化-避免堆栈溢出"><span>2. 实现尾递归优化，避免堆栈溢出</span></a></h3><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>import types
def fibonaci(n):
    &quot;&quot;&quot;fibonaci 尾递归优化&quot;&quot;&quot;
    def fibonaci_core(n, n1=1, n2=1):
        if n == 1:
            yield n2
        ## Tips: 其实是由于Python解释器未实现尾递归优化, 才需要这样的膜法
        yield fibonaci_core(n-1, n2, n1+n2)
    g = fibonaci_core(n)
    while isinstance(g, types.GeneratorType):
        g = next(g)
    return g
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-多任务模型" tabindex="-1"><a class="header-anchor" href="#_3-多任务模型"><span>3. 多任务模型</span></a></h3><p>目前主流的多任务模型的解决方案是使用多线程，由于线程之间的切换是由操作系统在内核态中完成，其切换开销比在用户态进行上下文操作要大。同时，<em>CPython</em>的实现上具有<strong>GIL</strong>, <strong>全局解释器锁</strong>，导致<em>CPython</em>上的多线程实际上同时只运行单个线程，因此使用协程的开销比使用多线程要低，而对CPU的利用程度却几乎是一样的。<br> 同时，由于协程是单线程运行的关系，如果使用协程执行CPU密集型的应用，那么协程特有的<strong>挂起</strong>和<strong>恢复</strong>就毫无用处，无法通过切换协程来换取更有效的CPU执行效率，这意味着协程的最佳使用场景是IO密集型的应用，典型的应用场景如解决网络IO问题。</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>from greenlet import greenlet
import socket
from urllib.parse import urlparse


#使用非阻塞io完成http请求
def get_url(url):
    #通过socket请求html
    url = urlparse(url)
    host = url.netloc
    path = url.path
    if path == &quot;&quot;:
        path = &quot;/&quot;
    #建立socket连接
    client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client.setblocking(False)       ## 这里设置成非阻塞
    try:
        client.connect((host, 80)) ## 阻塞不会消耗cpu
    except BlockingIOError as e:
        pass
    while True:
        try:
            client.send(&quot;GET {} HTTP/1.1\\r\\nHost:{}\\r\\nConnection:close\\r\\n\\r\\n&quot;.format(path, host).encode(&quot;utf8&quot;))
            break
        except OSError as e:
            ## 数据在发送, 主动让出cpu
            scheduler_instance.switch()
            continue
    data = b&quot;&quot;
    while True:
        try:
            d = client.recv(1024)
        except BlockingIOError as e:
            ## 数据未接收, 主动让出cpu
            scheduler_instance.switch()
            continue
        if d:
            data += d
        else:
            break
    data = data.decode(&quot;utf8&quot;)
    html_data = data.split(&quot;\\r\\n\\r\\n&quot;)[1]
    results.append({url: html_data})
    client.close()


def scheduler():
    while not all([job.dead for job in jobs]):
        for i, job in enumerate(jobs):
            job.switch(urls[i])

scheduler_instance = greenlet(scheduler)

urls = [&quot;http://www.baidu.com/&quot;, &quot;http://www.qq.com/&quot;]
jobs = [greenlet(get_url, scheduler_instance) for i in range(len(urls))]
results = []

scheduler_instance.switch()

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="总结-协程的本质-与异步编程的关系" tabindex="-1"><a class="header-anchor" href="#总结-协程的本质-与异步编程的关系"><span>总结: 协程的本质, 与异步编程的关系</span></a></h2><p>在这篇文章里，我们首先介绍了协程的定义和具体的实现方案，从本质上来看，<strong>协程就是一套在用户态进行上下文切换的解决方案</strong>。<br> 随后，我们介绍了协程的使用场景，通过对协程调度的合理安排，我们可以实现无竞争的生产者消费者模型以及复用函数堆栈避免堆栈溢出的问题，最后借助操作系统的支持，我们甚至可以实现并行的IO操作。<br> 至于协程与异步编程的关系，这里明确告诉大家一点，<strong>协程本身并未解决异步编程的问题</strong>，而是提供了一套<strong>由用户主动分配CPU时钟</strong>的可行方案。</p><p>既然协程并不能实现异步编程，那为何异步编程与协程有着千丝万缕的关系呢？<br> 其实答案很简单，虽然协程不是解决异步问题，但是可以通过合理的<code>调度算法</code>和适当的<code>编程规约</code>，从而实现异步编程。<br> 至于协程与异步编程的关系，有请下回分解 😃</p>`,17);function k(x,P){const l=t("ExternalLinkIcon");return r(),d("div",null,[c,e("p",null,[n("虽然 "),u,n(" 能借助生成器实现非对称式协程，但"),v,n("的"),e("a",m,[p,a(l)]),n("本身并不是为了协程而设计的，语言层级上通过 "),b,n(" 关键字最多只能保留"),g,n("的栈帧，也就是说在语言层级上并没有提供处理栈帧的挂起与恢复的机制，社区对该实现并不满意，因此从 "),h,n(" 抽离出协程的实现，并命名为 "),_,n("。"),y,f,n("实现的基本原理很简单, 为了简化栈帧的保存和恢复，其主要遵循以下几点规约:")]),w])}const q=s(o,[["render",k],["__file","python异步初探-协程的定义.html.vue"]]),A=JSON.parse('{"path":"/posts/2019/10/14/python%E5%BC%82%E6%AD%A5%E5%88%9D%E6%8E%A2-%E5%8D%8F%E7%A8%8B%E7%9A%84%E5%AE%9A%E4%B9%89.html","title":"Python异步初探-协程的定义","lang":"zh-CN","frontmatter":{"draft":false,"permalinkPattern":"/posts/:year/:month/:day/:slug.html","type":"post","filePathRelative":"_posts/python/2019-10-14-Python异步初探-协程的定义.md","date":"2019-10-14T00:00:00.000Z","title":"Python异步初探-协程的定义","sidebarDepth":3,"category":"python","tags":["python","coroutine"],"description":"序言 由于很多文章对协程的介绍都很精简，在探讨Python异步编程之前，我们先来明确协程的概念，避免以后混淆了异步和协程的概念。 什么是协程 协程，又称微线程，英文名为 Coroutine。 协程(Coroutine)的概念提出的很早，在操作系统层面上，与它关联的是线程(Thread), 进程(Process)。从设计理念出发，协程、线程和进程都是为了...","head":[["meta",{"property":"og:url","content":"https://blog.shabbywu.cn/posts/2019/10/14/python%E5%BC%82%E6%AD%A5%E5%88%9D%E6%8E%A2-%E5%8D%8F%E7%A8%8B%E7%9A%84%E5%AE%9A%E4%B9%89.html"}],["meta",{"property":"og:site_name","content":"个人技术文章分享"}],["meta",{"property":"og:title","content":"Python异步初探-协程的定义"}],["meta",{"property":"og:description","content":"序言 由于很多文章对协程的介绍都很精简，在探讨Python异步编程之前，我们先来明确协程的概念，避免以后混淆了异步和协程的概念。 什么是协程 协程，又称微线程，英文名为 Coroutine。 协程(Coroutine)的概念提出的很早，在操作系统层面上，与它关联的是线程(Thread), 进程(Process)。从设计理念出发，协程、线程和进程都是为了..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-02-24T07:10:47.000Z"}],["meta",{"property":"article:author","content":"shabbywu"}],["meta",{"property":"article:tag","content":"python"}],["meta",{"property":"article:tag","content":"coroutine"}],["meta",{"property":"article:published_time","content":"2019-10-14T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-02-24T07:10:47.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"Python异步初探-协程的定义\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2019-10-14T00:00:00.000Z\\",\\"dateModified\\":\\"2024-02-24T07:10:47.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"shabbywu\\",\\"url\\":\\"https://github.com/shabbywu\\"}]}"],["link",{"rel":"alternate","type":"application/atom+xml","href":"https://blog.shabbywu.cn/atom.xml","title":"个人技术文章分享 Atom Feed"}],["link",{"rel":"alternate","type":"application/json","href":"https://blog.shabbywu.cn/feed.json","title":"个人技术文章分享 JSON Feed"}],["link",{"rel":"alternate","type":"application/rss+xml","href":"https://blog.shabbywu.cn/rss.xml","title":"个人技术文章分享 RSS Feed"}]]},"headers":[{"level":2,"title":"序言","slug":"序言","link":"#序言","children":[{"level":3,"title":"什么是协程","slug":"什么是协程","link":"#什么是协程","children":[]}]},{"level":2,"title":"协程的实现","slug":"协程的实现","link":"#协程的实现","children":[{"level":3,"title":"协程的官方实现介绍","slug":"协程的官方实现介绍","link":"#协程的官方实现介绍","children":[]},{"level":3,"title":"协程的社区实现介绍","slug":"协程的社区实现介绍","link":"#协程的社区实现介绍","children":[]}]},{"level":2,"title":"协程的使用场景","slug":"协程的使用场景","link":"#协程的使用场景","children":[{"level":3,"title":"1. 数据流处理","slug":"_1-数据流处理","link":"#_1-数据流处理","children":[]},{"level":3,"title":"2. 实现尾递归优化，避免堆栈溢出","slug":"_2-实现尾递归优化-避免堆栈溢出","link":"#_2-实现尾递归优化-避免堆栈溢出","children":[]},{"level":3,"title":"3. 多任务模型","slug":"_3-多任务模型","link":"#_3-多任务模型","children":[]}]},{"level":2,"title":"总结: 协程的本质, 与异步编程的关系","slug":"总结-协程的本质-与异步编程的关系","link":"#总结-协程的本质-与异步编程的关系","children":[]}],"readingTime":{"minutes":10.06,"words":3018},"filePathRelative":"_posts/python/2019-10-14-python异步初探-协程的定义.md","localizedDate":"2019年10月14日","autoDesc":true,"git":{"createdTime":1708758647000,"updatedTime":1708758647000,"contributors":[{"name":"shabbywu","email":"shabbywu@tencent.com","commits":1}]}}');export{q as comp,A as data};
