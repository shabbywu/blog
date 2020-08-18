---
date: 2020-01-13
title: yield, yield from 以及 await 有什么的差异在哪里?
sidebarDepth: 3
category: python
tags:
-   python
-   coroutine

draft: true
---
`yield`, `yield from` 以及 `await`之间的差异, 估计已经被很多人探讨过。 但既然`yield`和`send`已经实现了协程的基本原语, 为何又需要引入`await`与`yield from`这样额外的语法呢？   
以下内容就为此展开了讨论和分析。

## 协程初步: `yeild`、`yield from`之间差了些什么?

```python 
def co_a(*args, **kwargs):
    print("running in co_a")
    for i in range(3):
        print("yield `{}` from co_a".format(i))
        co_args = yield i
        print("accept args", co_args)
    return 1


def co_b(*args, **kwargs):
    print("running in co_b")
    co_args = yield co_a()
    print("accept args", co_args)


def co_c(*args, **kwargs):
    print("running in co_c")
    co_args = yield from co_a()
    print("accept args", co_args)


def co_d(*args, **kwargs):
    print("running in co_d")
    sub_co = co_a()
    args = yield next(sub_co)
    while True:
        try:
            args = yield sub_co.send(args)
        except StopIteration:
            print("sub_co in co_d is stopped")
            break


b=co_b()
c=co_c()
d=co_d()

assert b.gi_yieldfrom is None
assert c.gi_yieldfrom is None
assert d.gi_yieldfrom is None

print(next(b))
# >>> print(next(b))
# running in co_b
# <generator object co_a at 0x1028a2cd0>

print(next(c))
# >>> print(next(c))
# running in co_c
# running in co_a
# yield `0` from co_a
# 0

print(next(d))
# >>> print(next(d))
# running in co_d
# running in co_a
# yield `0` from co_a
# 0

assert b.gi_yieldfrom is None
# Q: Where to store generator object co_a
# A: generator object co_c.gi_yieldfrom
assert c.gi_yieldfrom is not None
# Q: Where to store generator object co_a
# A: Local Variable in co_d
assert d.gi_yieldfrom is None
assert d.gi_frame.f_locals.get("sub_co") is not None

try:
    b.send(1)
except StopIteration:
    print("run here")
else:
    pass

try:
    c.send(1)
    d.send(1)
except StopIteration:
    pass
else:
    print("run here")
```
我们知道, Python实现的是非对称式协程, 需要通过`yield/send`两个原语来实现协程的控制权转移操作。既然通过原语即可实现协程的相关操作, 为何又要在Python3.3里引入了额外的语法糖`yield from`呢, 我们通过上面的例子进行具体分析。
从上面的例子可以看出, `yield` 与 `yield from`的核心差异在于, `yield`严格准守了他的语义, 含有`yield`语句的生成器(或称之为协程), 在执行到 `yield` 语句时, 会立刻将程序的控制权转移到其`调用链的上一层`中去，具体的执行顺序如下:
@startuml
title 协程执行生命周期
[-> Coroutine: Call
activate Coroutine
hnote over Coroutine: Coroutine running
[<-- Coroutine: Yield to outer
... Blocked ...
[-> Coroutine: Resume  
hnote over Coroutine: Coroutine running again
[<-- Coroutine: Return result
@enduml
虽然`yield from`并非实现协程的必需品, 但通过引入`yield from`能极大程度地简化`协程与协程`之间的交互(将内部协程与外部控制链路直接打通), 使得控制权能更方便地在协程之间转移，这也为后继在python中实现实现异步(async)埋下铺垫。


## 协程与异步: `yield`、`yield from`、`await`之间差了些什么?
```python
import asyncio
@asyncio.coroutine
def co_a(loop=None):
    print("running in co_a")
    yield from asyncio.sleep(1, loop=loop)
    # We can also call like that as below
    # yield from asyncio.sleep(1).__await__()
    # Syntax Error
    # print("will block 1s here")
    # await asyncio.sleep(1)
    return 1

@asyncio.coroutine
def co_b(loop=None):
    print("running in co_b")
    awaitable = asyncio.sleep(1, loop=loop).__await__()
    yield awaitable.send(None)
    # We can also call like that as below
    # yield from 
    # Syntax Error
    # print("will block 1s here")
    # await asyncio.sleep(1)
    return 1

async def co_c(loop=None):
    print("running in co_c")
    # Syntax Error
    # print("will block 1s here")
    # yield from asyncio.sleep(1)
    await asyncio.sleep(1, loop=loop)
    return 1

def co_d(loop=None):
    print("running in co_d")
    # we can't call `yield from asyncio.sleep(1)` because we don't wraper this function with @asyncio.coroutine
    # NOTE: yield from will make a ref to `asyncio.sleep(1, loop=loop)` by `gi_yieldfrom`
    yield from asyncio.sleep(1, loop=loop).__await__()
    return 1

def co_e(loop=None):
    print("running in co_e")
    # can't call asyncio.sleep(1, loop=loop).send(None)
    # because nobody ref to `asyncio.sleep(1, loop=loop)`, So `GC` will cancle the task
    awaitable = asyncio.sleep(1, loop=loop)
    yield awaitable.send(None)
    return 1


asyncio.run(co_a())
# >>> asyncio.run(co_a())
# running in co_a
# 1
asyncio.run(co_b())
# >>> asyncio.run(co_b())
# running in co_b
# 1
asyncio.run(co_c())
# >>> asyncio.run(co_c())
# running in co_c
# 1
asyncio.run(co_d())
# running in co_d
# 1
asyncio.run(co_e())
# running in co_e
# 1

def simulate_event_loop():
    loop = asyncio.new_event_loop()
    # 模拟运行`协程`函数
    co_list = [co_a(loop), co_b(loop), co_d(loop), co_e(loop)]
    for co in co_list:
        fut = next(co)
        # 协程事实上并未被堵塞, 只是被提早返回
        while not fut.done():
            loop._run_once()
        try:
            next(co)
        except StopIteration as e:
            print(e)
    # 模拟运行`异步函数`
    awaitable = co_c(loop).__await__()
    fut = awaitable.send(None)
    while not fut.done():
        loop._run_once()
    try:
        next(co)
    except StopIteration as e:
        print(e)
```
我们知道, 在Python3.4之后引入了 `asyncio` 模块, 并于Python3.5之后又引入了`async/await`语法, 大大方便的异步函数的编写, 但这些关于协程的语法糖`async/await`、`yeild from`与协程原语`yield/send`又有何种关联呢?以下则为大家揭晓。
上文有介绍到Python的 `yield from`语句是
当使用`@asyncio.coroutine`修饰函数时, `yield from` 和 `await` 的表现基本上是一致的, 都会`阻塞`当前函数继续执行, 直到异步的函数被返回。   
