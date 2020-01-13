---
date: 2020-01-13
title: yield, yield from 以及 await 有什么核心差异
sidebarDepth: 3
category: python
tags:
-   python
-   coroutine
draft: true
---
`yield`, `yield from` 以及 `await`之间的差异, 估计已经被很多人探讨过。 但既然`yield`和`send`已经实现了协程的基本原语, 为何又需要引入`await`与`yield from`这样额外的语法呢？   
以下内容就为此展开了讨论和分析。

## `yeild`、`yield from`之间差了些什么?
```python 
def co_a(*args, **kwargs):
    print("running in co_a")
    for i in range(10):
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


b=co_b()
c=co_c()

assert b.gi_yieldfrom is None
assert c.gi_yieldfrom is None

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

assert b.gi_yieldfrom is None
# Q: Where to store generator object co_a
# A: generator object co_c.gi_yieldfrom
assert c.gi_yieldfrom is not None

try:
    b.send(1)
except StopIteration:
    print("run here")
else:
    pass

try:
    c.send(1)
except StopIteration:
    pass
else:
    print("run here")
```
从上面的例子可以看出, `yield` 与 `yield from`的核心差异在于, `yield`严格准守了他的语义, 含有`yield`语句的生成器(或称之为协程), 在执行到 `yield` 语句时, 会立刻将程序的控制权转移到其`调用链的上一层`中去，程序的执行顺序如下:
```uml
title 协程执行生命周期(节选)
[-> Coroutine: Call
activate Coroutine
hnote over Coroutine: Coroutine running
[<-- Coroutine: Yield to outer
... Blocked ...
[-> Coroutine: Resume  
hnote over Coroutine: Coroutine running again
[<-- Coroutine: Return result
```