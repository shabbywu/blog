import{_ as t,r as d,o as r,c,f as n,g as e,i as s,w as l,e as a}from"./app-C9ZkQdtL.js";const o={},u=n("h2",{id:"序言",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#序言"},[n("span",null,"序言")])],-1),v=n("strong",null,"协程本身并未解决异步编程的问题",-1),p=n("strong",null,"由用户主动分配CPU时钟",-1),m=a(`<h2 id="多线程的任务调度" tabindex="-1"><a class="header-anchor" href="#多线程的任务调度"><span>多线程的任务调度</span></a></h2><p>每当我们需要进行异步编程，首先想到的必然是<strong>多线程模型</strong>，毕竟只需要几行代码，就能启动线程执行异步任务。</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>import threading
import time


def task(task_id):
    start_clock = time.process_time()
    print(f&quot;task&lt;{task_id}&gt; start&quot;)
    ## 模拟阻塞
    time.sleep(10)
    print(f&quot;task&lt;{task_id}&gt; end, cost cpu time: {time.process_time() - start_clock}&quot;)

for i in range(5):
    threading.Thread(target=task, args=(i, )).start()
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在探讨协程调度之前, 我们先以上面的多线程异步编程的样例，分析多线程任务的执行顺序。</p><h3 id="操作系统调度" tabindex="-1"><a class="header-anchor" href="#操作系统调度"><span>操作系统调度</span></a></h3><p>当启动一个线程时，线程并非立即执行，而是在等待操作系统的资源调度。当线程被分配到CPU时钟时，线程才真正开始执行。</p><div class="language-plantuml line-numbers-mode" data-ext="plantuml" data-title="plantuml"><pre class="language-plantuml"><code><img src="https://www.plantuml.com/plantuml/svg/TL53aaH14DtdAJ9wFVY8iHe76E_RjdTZsxPjem_pVOgsiQggpCSekS-lyVe33ZluT1gx0Ka2DJuawmXqMy86km_0wz86V7wKgRhwXUbtVd18ba34Nw1pENKMdo6vuZVUfUK3Rd9S6fjB0dhj5fq18Bv2Ym-5gszfuncImyGx0Tzu5QOc0EG9AI89-eu8bpDaC_8hS-pVhl3o8_oa9TcV7sxwI9nuIHgJTJaurOpSv0G_TnnVfYT0rHN8fSVyr8LuDClTp_8FQq3NvM9b46G10kIf2aHXNhAky4qLlUcYTwgpF4whRa-4Zz-QaVsSPZzd-FM9LFGqXifYg8eOEekXos3a1gS-_fSn
"></code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><blockquote><p>CPU能执行那个线程，是通过操作系统设置的调度策略而决定的，如果感兴趣可以阅读操作系统相关的书籍，这里就不展开了。</p></blockquote><p>继续讨论回我们上面给的样例，如果我们重复执行几次这个样例, 就会发现, 多线程任务的调度策略和启动顺序是无关的，在重复执行多次还能发现，每次任务调度的顺序也是无关的。</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>## 第一次执行的输出结果
task&lt;0&gt; start
task&lt;1&gt; start
task&lt;2&gt; start
task&lt;3&gt; start
task&lt;4&gt; start
### 这里等待了 10 秒
task&lt;0&gt; end, cost cpu time: 0.000682000000000002
task&lt;4&gt; end, cost cpu time: 0.0003599999999999992
task&lt;3&gt; end, cost cpu time: 0.0005119999999999986
task&lt;2&gt; end, cost cpu time: 0.0005790000000000031
task&lt;1&gt; end, cost cpu time: 0.0006910000000000041

## 第二次执行的输出结果
task&lt;0&gt; start
task&lt;1&gt; start
task&lt;2&gt; start
task&lt;3&gt; start
task&lt;4&gt; start
### 这里等待了 10 秒
task&lt;0&gt; end, cost cpu time: 0.0005179999999999976
task&lt;2&gt; end, cost cpu time: 0.0005100000000000035
task&lt;3&gt; end, cost cpu time: 0.00044700000000000295
task&lt;1&gt; end, cost cpu time: 0.0006960000000000022
task&lt;4&gt; end, cost cpu time: 0.0003809999999999994
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>由于多线程的任务调度是由操作系统底层的调度算法决定的，这导致用户无法感知和控制<strong>各线程被分配的CPU时间片大小以及执行顺序</strong>，而协程恰好就提供了一套<strong>由用户主动分配CPU时钟</strong>的可行方案。<br> 换句话说, 如果我们能合理地控制协程的执行顺序, 那是不是就等同于实现了一个基于协程的异步框架呢？！</p><h2 id="协程的任务调度" tabindex="-1"><a class="header-anchor" href="#协程的任务调度"><span>协程的任务调度</span></a></h2><h3 id="任务队列-控制线程任务执行顺序的方案" tabindex="-1"><a class="header-anchor" href="#任务队列-控制线程任务执行顺序的方案"><span>任务队列-控制线程任务执行顺序的方案</span></a></h3><p>所谓的<strong>控制协程执行顺序</strong>，实际上就是要在用户态中模拟操作系统针对线程的调度算法，最直观的实现方案就是用<strong>优先队列</strong>将异步任务缓冲起来，再由用户程序<strong>按任务优先级排序</strong>，调度器只需依序执行即可。这种类型的异步任务执行模型如下:</p><div class="language-plantuml line-numbers-mode" data-ext="plantuml" data-title="plantuml"><pre class="language-plantuml"><code><img src="https://www.plantuml.com/plantuml/svg/N4t50S803FndYXi51i0PeEuQmUdgzLVpolbEr6Mrig28tJB4FU7G3V0bZESNjGLGLtBw4xKMscWOqPdJcbDzNsPcwzrly776HHWfj0QdSQ88KWvzJUjgrkOKkcwrZrjBkWgVqnnDD8RPwEf25OBvVY01k0g7rBmKe2S0
"></code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>虽然这个模型在设计上满足需求的，但是在编程实现时又引入了新问题: <strong>何时创建协程执行异步任务？</strong><br> 如果是在创建异步任务时，马上创建新的协程执行任务，那么这个模型和原来的原地创建协程并未任何本质差异，因此不可能同时创建任务和创建协程。<br> 通过分析这个模型可以发现，这是典型的生产者消费者模式，只要生产者(推送任务到队列)和消费者(创建新协程执行任务)分别在两个不同的协程运行，那就可以“避免”同时创建任务和创建协程的问题了，调整后的模型如下：</p><div class="language-plantuml line-numbers-mode" data-ext="plantuml" data-title="plantuml"><pre class="language-plantuml"><code><img src="https://www.plantuml.com/plantuml/svg/NKx5WK913BrF5MbWAjZ5ppW5V7UDuD0w4kRqSuazcnBxo59N9a6_Zc63RIHXZ70pyAcmQYM29ZuTV2hDmpZKecr8wW6A7QINM6Bu4hOw3J6pmRxIlOeJ1cu1ypHZY7ACGyxRHd_AWkVJmJyUtm7-hNKltLTwS5b_26l7UiWmzYCpZPj8wkeD
"></code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>对应的实现代码也很简单:</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>def consumer(queue):
    while True:
        task, args, kwargs = queue.get()
        task.run(*args, **kwargs)
        yield


def producer(queue):
    while True:
        queue.put(task, args, kwargs)
        yield
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>通过将原来的异步任务执行模型改造成上图所示的生产者消费者模式后，看似解决了创建协程的问题，但是再仔细分析新的模型，可以发现: 如果消费者执行完一个任务就马上让出CPU让生产者创建任务，那么本质上与同时创建和执行协程没有任何区别。</p><p>虽然引入队列解决了任务执行优先级的问题，但是并未解决调度协程的时机，我们不妨从竞品(线程)中寻找实现调度算法的灵感，<s>了解业界做法总不会错</s>。</p><h3 id="调度算法的核心职责" tabindex="-1"><a class="header-anchor" href="#调度算法的核心职责"><span>调度算法的核心职责</span></a></h3><p>首先观察一下线程的生命周期，一个线程的生命周期可能会在5个状态中轮转， 分别是创建，就绪，运行，阻塞，终止，这几种关系的状态转移关系入下图所示:</p><div class="language-plantuml line-numbers-mode" data-ext="plantuml" data-title="plantuml"><pre class="language-plantuml"><code><img src="https://www.plantuml.com/plantuml/svg/SYWkIImgAStD0L0vpWOM1M4OpQUAoTO5BFEDjgJListRDfkv_w2AQyOVpa6tu2l2yN27dpxmBSpcz3YuUy5ixIA766iCmUVXxZ0o4hN5hZ5M3yajUhZINb1kiTa_73h8I9nV9BlXsHNrUuc_AwSm2TcAIfFdZb2lA7zZFrpS-FCBasHOE9U8BqE75U7W9-MwSDmWe-dyD-loC_75d1Rqw2FZXkbgAf1f-X7BvZprGwQ_I9f3QbuAC3G0
"></code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>协程调度算法的本质其实就是解决一个问题：<strong>如何调度协程的执行</strong>？如果从任务(协程)的角度看待这个问题，可以将其拆解为以下几点:</p><ul><li>何时让出 CPU？</li><li>CPU 让给了谁？</li><li>何时继续执行？</li></ul><h4 id="何时让出-cpu-控制权转移的时机" tabindex="-1"><a class="header-anchor" href="#何时让出-cpu-控制权转移的时机"><span>何时让出 CPU？-- 控制权转移的时机</span></a></h4><p>协程的最佳使用场景是IO密集型的应用，当需要等待 IO 操作执行时，协程可以主动让出 CPU 的使用权，避免浪费 CPU 资源。因此，协程应当在需要等待其他资源执行的地方主动让出 CPU，用伪代码描述如下:</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>def co():
    result = yield one_blocking()
    handle(result)
    result = yield the_other_blocking()
    handle(result)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="cpu-让给了谁-任务的调度器" tabindex="-1"><a class="header-anchor" href="#cpu-让给了谁-任务的调度器"><span>CPU 让给了谁？-- 任务的调度器</span></a></h4>`,30),b=n("strong",null,"非对称式协程",-1),h=n("code",null,"send",-1),g=n("code",null,"yield",-1),_=n("br",null,null,-1),y=a(`<div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>def scheduler():
    while True:
        ## 获取协程任务列表
        cos = list(task_queue)
        for co in cos:
            ret = co.send()
            if ret is some_blocking:
                ret.callback = co
                task_queue.put(ret)
            elif hasattr(co, &quot;callback&quot;):
                task_queue.put(co.callback)
            else:
                task_queue.pop(co)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>调度器既是生产者, 也是消费者。</p></blockquote><h4 id="何时继续执行-其一-基于回调的事件处理机制" tabindex="-1"><a class="header-anchor" href="#何时继续执行-其一-基于回调的事件处理机制"><span>何时继续执行？ -- 其一: 基于回调的事件处理机制</span></a></h4><p>对于多线程而言，由于任务调度是委托至操作系统完成的，程序无需关心线程被阻塞后的执行情况。<br> 但是对于协程调度系统而言，如果其中一个协程被阻塞，就意味着整个系统都被阻塞，只有当阻塞操作完成后，协程系统才会继续运行下去。 阻塞对整个协程系统是毁灭性的，所有协程都应该只允许使用非阻塞 IO 操作，同时在调用 IO 操作后，需要马上让渡出 CPU 的使用权给调度器，当调度器判断 IO操作完成后，再继续执行该协程。 单个协程的调度流程可以参考以下的时序图:</p><div class="language-plantuml line-numbers-mode" data-ext="plantuml" data-title="plantuml"><pre class="language-plantuml"><code><img src="https://www.plantuml.com/plantuml/svg/SoWkIImgAStDuNgneVdfhcLFPwvGqBLJUDhR_tn5DrTYSabcMM99AfIleEpcvWG4N10kI25SbvM2fxz2Kav-SdPcNZgcHfV4ekpWn9pS_3o4HQZwOSpMRKzsJuFQhwUdnnMTZwhiPSEiv_ENWcnxDhdtoTuvJzVrFEkOWCtvLWhFToz_ldljiyxbBnRsl5Y_56fgIYgQyx3x1w8DPFpwgLZqEAJcfG333G00
"></code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>对于网络IO、磁盘IO等调用，操作系统均提供了异步读写的系统调用(system call)。一般而言，异步 IO 调用会返回文件描述符（句柄），用户程序只需要调用操作系统提供的 API，就可以知道 IO 操作是否完成。<br> 简而言之，只需要在调度器中增加判断 IO 操作是否执行完毕的操作即可，用伪代码描述如下:</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>def scheduler():
    while True:
        ## 获取协程任务列表
        cos = list(task_queue)
        for co in cos:
            ret = co.send()
            if ret is some_blocking:
                ret.callback = co
                task_queue.put(ret)
            elif ret is io_operation:
                ret.callback = co
                register_io_operation(ret)
            elif hasattr(co, &quot;callback&quot;):
                task_queue.put(co.callback)
            else:
                task_queue.pop(co)
        
        ## 获取已完成的 IO 操作
        ops = get_completed_io_operations()
        for op in ops:
            task_queue.put(op.callback)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="何时继续执行-其二-处理与操作系统无关的阻塞" tabindex="-1"><a class="header-anchor" href="#何时继续执行-其二-处理与操作系统无关的阻塞"><span>何时继续执行？ -- 其二: 处理与操作系统无关的阻塞</span></a></h4><p>除了由于IO导致的阻塞以外, 很多时候我们只希望等待几秒钟再执行, 例如在标准库 <code>asyncio</code> 中提供了以下的语法。</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>import time
import asyncio

async def co():
    start = time.time()
    print(&quot;It&#39;s going to sleep 1s.&quot;)
    await asyncio.sleep(1)
    end = time.time()
    print(f&quot;{end - start}s passed.&quot;)


if __name__ == &#39;__main__&#39;:
    ## 输出: 
    ## It&#39;s going to sleep 1s.
    ## 1.0028209686279297s passed.
    asyncio.run(co())

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>上述例子中关键的代码是: <strong>await asyncio.sleep(1)</strong>，其所描述的含义是: <strong>等待1秒, 随后继续执行</strong>。 参考对于 <strong>io_operation</strong> 的处理, 这类型的阻塞可以抽象成 <strong>timeout_operation</strong>, 当满足继续执行的条件后, 再将相应的操作注册会任务队列之中，用伪代码描述如下:</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>def scheduler():
    ...
    ret = co.send()
    if ret is timeout_operation:
        ret.callback = co
        register_timeout_operation(ret)
    
    ...

    ops = get_timeout_operations()
    for op in ops:
        task_queue.put(op.callback)
    ...
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>至此, 我们已经具备实现一个简易的基于协程的异步系统的基本理论知识, 但仍然有一点是我们尚未讨论的, 那就是<strong>如何解决阻塞任务的返回值传递问题</strong>。</p><h3 id="除了调度之外-你还需要了解的一些细节" tabindex="-1"><a class="header-anchor" href="#除了调度之外-你还需要了解的一些细节"><span>除了调度之外, 你还需要了解的一些细节</span></a></h3><p>在 <strong>非对称式协程</strong> 中, <code>send</code> 原语不仅仅是控制权转移至子协程(被调用者)，还充当了参数传递的作用。而 <code>yield</code> 原语也不仅仅是将控制权返回到其父协程(调用者)，还可以将返回值带回父协程，参考以下的代码:</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>def coroutine():
    arg = yield 1
    print(&quot;参数: &quot;, arg)

if __name__ == &quot;__main__&quot;:
    ## 输出:
    ## 返回值:  1
    ## 参数:  2
    co = coroutine()
    print(&quot;返回值: &quot;, co.send(None))
    co.send(2)

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>将该逻辑整合至单个协程的调度流程时序图:</p><div class="language-plantuml line-numbers-mode" data-ext="plantuml" data-title="plantuml"><pre class="language-plantuml"><code><img src="https://www.plantuml.com/plantuml/svg/SoWkIImgAStDuNgneVdfhcLFPwvGqBLJUDhR_tn5DrTYSabcMM99AfIleEpcvWG4N10kI25SbvM2fxz2Kav-SdPcNZgcHfV4ekpWn9pS_3o4HQZwOSpMRKzsJuFQhwUdnnMTZwhiPSEiv_ENWcnxDhdtoTuvJzVrFEkOWCtvLWhFToz_ldljiyxbBnRsl5Y_52Aiew2bzNJdjYTx5hnicEJf3p7b-QoM5_kdF9qzxsd37YqjhfHKD1zWzpB4P90Bra_5eiSXDIy56BG0
"></code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>我们可以发现, 对于<strong>返回值</strong>的处理是属于<strong>调度器</strong>的任务, 因此想要解决阻塞任务的返回值传递问题，只需要调度器在处理回调时，将对应的返回值一并带上即可，用伪代码描述如下:</p><div class="hint-container tip"><p class="hint-container-title">提示</p><p>以下代码仅在于描述核心逻辑。 在实现异步系统返回值处理时, 常见的机制为: Promise/Future。</p></div><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>def scheduler():
    while True:
        cos = list(task_queue)
        for co, args in cos:
            ret = co.send(args)
            if ret is some_blocking:
                ret.callback = co
                task_queue.put(ret)
            elif ret is io_operation:
                ret.callback = co
                register_io_operation(ret)
            elif ret is timeout_operation:
                ret.callback = co
                register_timeout_operation(ret)
            elif hasattr(co, &quot;callback&quot;):
                task_queue.put(co.callback)
            else:
                task_queue.pop(co)
        
        ops = get_completed_io_operations()
        for op, result in ops:
            task_queue.put((op.callback, result))

        ops = get_timeout_operations()
        for op in ops:
            task_queue.put((op.callback, None))
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="总结-协程异步系统的基本要素" tabindex="-1"><a class="header-anchor" href="#总结-协程异步系统的基本要素"><span>总结: 协程异步系统的基本要素</span></a></h2><p>在这篇文章中, 我们首先从<strong>异步编程</strong>这一话题展开, 通过分析操作系统调度多线程的原理, 引申出实现协程异步编程无非就是实现控制协程执行顺序是调度算法。<br> 随后, 我们分别从<strong>任务执行顺序</strong>和<strong>任务生命周期</strong>两个维度探讨应该如何实现协程任务调度系统, 总结出实现协程任务调度系统所需的基本要素为以下几点:</p><ul><li>任务队列</li><li>操作系统IO回调处理机制</li><li>延迟执行机制</li><li>返回值传递机制</li></ul><p>协程异步系统依赖于操作系统提供的异步IO回调(system call), 因此同一门编程语言的协程异步系统, 在不同的操作系统上可能会提供不同的实现方式。同时，由于协程异步系统的本质是在任务(协程)的调度算法, 因此不同的编程语言也有可能实现不同的调度算法。<br> 如果想了解Python, JavaScript 和 Golang 在协程实现上有哪些差异, 不妨继续关注我未来可能会更新的文章。</p>`,25);function k(E,f){const i=d("RouteLink");return r(),c("div",null,[u,n("p",null,[e("在上回 "),s(i,{to:"/posts/2019/10/14/python%E5%BC%82%E6%AD%A5%E5%88%9D%E6%8E%A2-%E5%8D%8F%E7%A8%8B%E7%9A%84%E5%AE%9A%E4%B9%89.html"},{default:l(()=>[e("Python异步初探-协程的定义")]),_:1}),e(" 里，我们探讨了协程的本质，明确了"),v,e("，而是提供了一套"),p,e("的可行方案。 接下来，本文将会从任务调度入手，探讨 Python 实现协程异步编程的细节。")]),m,n("p",null,[e("在上回 "),s(i,{to:"/posts/2019/10/14/python%E5%BC%82%E6%AD%A5%E5%88%9D%E6%8E%A2-%E5%8D%8F%E7%A8%8B%E7%9A%84%E5%AE%9A%E4%B9%89.html#%E5%8D%8F%E7%A8%8B%E7%9A%84%E5%AE%98%E6%96%B9%E5%AE%9E%E7%8E%B0%E4%BB%8B%E7%BB%8D"},{default:l(()=>[e("Python异步初探-协程的定义")]),_:1}),e(" 里，我们讲解了"),b,e("的执行顺序：非对称式协程通过 "),h,e(" 原语将控制权转移至子协程(被调用者)，再通过 "),g,e(" 原语将控制权返回到其父协程(调用者)。"),_,e(" 因此，协程的异步系统需要具备一个调度器负责接收子协程让渡出去的控制权，再从任务队列中挑选合适的协程继续执行。与此同时，这个调度器还需要保证只有当需要等待的 IO 操作执行完毕后，才继续执行上一个协程，用伪代码描述如下:")]),y])}const A=t(o,[["render",k],["__file","python异步进阶-探讨协程实现异步的细节.html.vue"]]),x=JSON.parse('{"path":"/posts/2020/11/22/python%E5%BC%82%E6%AD%A5%E8%BF%9B%E9%98%B6-%E6%8E%A2%E8%AE%A8%E5%8D%8F%E7%A8%8B%E5%AE%9E%E7%8E%B0%E5%BC%82%E6%AD%A5%E7%9A%84%E7%BB%86%E8%8A%82.html","title":"Python异步编程-探讨协程实现异步的细节","lang":"zh-CN","frontmatter":{"draft":false,"permalinkPattern":"/posts/:year/:month/:day/:slug.html","type":"post","filePathRelative":"_posts/python/2020-11-22-Python异步进阶-探讨协程实现异步的细节.md","date":"2020-11-22T00:00:00.000Z","title":"Python异步编程-探讨协程实现异步的细节","sidebarDepth":3,"category":"python","tags":["python","coroutine"],"description":"序言 在上回 里，我们探讨了协程的本质，明确了协程本身并未解决异步编程的问题，而是提供了一套由用户主动分配CPU时钟的可行方案。 接下来，本文将会从任务调度入手，探讨 Python 实现协程异步编程的细节。 多线程的任务调度 每当我们需要进行异步编程，首先想到的必然是多线程模型，毕竟只需要几行代码，就能启动线程执行异步任务。 在探讨协程调度之前, 我们...","head":[["meta",{"property":"og:url","content":"https://blog.shabbywu.cn/posts/2020/11/22/python%E5%BC%82%E6%AD%A5%E8%BF%9B%E9%98%B6-%E6%8E%A2%E8%AE%A8%E5%8D%8F%E7%A8%8B%E5%AE%9E%E7%8E%B0%E5%BC%82%E6%AD%A5%E7%9A%84%E7%BB%86%E8%8A%82.html"}],["meta",{"property":"og:site_name","content":"个人技术文章分享"}],["meta",{"property":"og:title","content":"Python异步编程-探讨协程实现异步的细节"}],["meta",{"property":"og:description","content":"序言 在上回 里，我们探讨了协程的本质，明确了协程本身并未解决异步编程的问题，而是提供了一套由用户主动分配CPU时钟的可行方案。 接下来，本文将会从任务调度入手，探讨 Python 实现协程异步编程的细节。 多线程的任务调度 每当我们需要进行异步编程，首先想到的必然是多线程模型，毕竟只需要几行代码，就能启动线程执行异步任务。 在探讨协程调度之前, 我们..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-02-24T07:10:47.000Z"}],["meta",{"property":"article:author","content":"shabbywu"}],["meta",{"property":"article:tag","content":"python"}],["meta",{"property":"article:tag","content":"coroutine"}],["meta",{"property":"article:published_time","content":"2020-11-22T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-02-24T07:10:47.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"Python异步编程-探讨协程实现异步的细节\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2020-11-22T00:00:00.000Z\\",\\"dateModified\\":\\"2024-02-24T07:10:47.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"shabbywu\\",\\"url\\":\\"https://github.com/shabbywu\\"}]}"],["link",{"rel":"alternate","type":"application/atom+xml","href":"https://blog.shabbywu.cn/atom.xml","title":"个人技术文章分享 Atom Feed"}],["link",{"rel":"alternate","type":"application/json","href":"https://blog.shabbywu.cn/feed.json","title":"个人技术文章分享 JSON Feed"}],["link",{"rel":"alternate","type":"application/rss+xml","href":"https://blog.shabbywu.cn/rss.xml","title":"个人技术文章分享 RSS Feed"}]]},"headers":[{"level":2,"title":"序言","slug":"序言","link":"#序言","children":[]},{"level":2,"title":"多线程的任务调度","slug":"多线程的任务调度","link":"#多线程的任务调度","children":[{"level":3,"title":"操作系统调度","slug":"操作系统调度","link":"#操作系统调度","children":[]}]},{"level":2,"title":"协程的任务调度","slug":"协程的任务调度","link":"#协程的任务调度","children":[{"level":3,"title":"任务队列-控制线程任务执行顺序的方案","slug":"任务队列-控制线程任务执行顺序的方案","link":"#任务队列-控制线程任务执行顺序的方案","children":[]},{"level":3,"title":"调度算法的核心职责","slug":"调度算法的核心职责","link":"#调度算法的核心职责","children":[]},{"level":3,"title":"除了调度之外, 你还需要了解的一些细节","slug":"除了调度之外-你还需要了解的一些细节","link":"#除了调度之外-你还需要了解的一些细节","children":[]}]},{"level":2,"title":"总结: 协程异步系统的基本要素","slug":"总结-协程异步系统的基本要素","link":"#总结-协程异步系统的基本要素","children":[]}],"readingTime":{"minutes":11.54,"words":3463},"filePathRelative":"_posts/python/2020-11-22-python异步进阶-探讨协程实现异步的细节.md","localizedDate":"2020年11月22日","autoDesc":true,"git":{"createdTime":1708758647000,"updatedTime":1708758647000,"contributors":[{"name":"shabbywu","email":"shabbywu@tencent.com","commits":1}]}}');export{A as comp,x as data};
