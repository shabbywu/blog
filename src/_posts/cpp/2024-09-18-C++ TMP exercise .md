---
date: 2024-09-18
title: C++ 模板元编程实践总结(Template, SFINAE, Type Traits)
sidebarDepth: 2
category: c++
tags:
  - c++
  - template

draft: false
feed:
  description: |
    本文分享了在编写脚本语言的 c++ binding 库时使用模板元编程时的经验与教训。
---

# 背景

在编写脚本语言的 c++ binding 库时, 最繁琐的工序是实现类型转换。具体来说就是将脚本语言中的某个类型转换成 c++ 等价类型。
对于一般的数值类型而言，在不考虑精度损失的情况下，可能直接用 `static_cast` 就能完成类型转换。但是对于复杂类型如字符串或指针，类型转换将是一个复杂问题。

以下以笔者开源的 [squirrel-lang c++ binding](https://github.com/shabbywu/sqbind17) 为例, 介绍在模板元编程(Template metaprogramming, TMP)遇到的一些经验与教训。

> 注: 更系统化的介绍可以在 [cppreference](https://en.cppreference.com/w/cpp/language/templates) 中找到。

# c++模板与问题

在编写 [sqbind17](https://github.com/shabbywu/sqbind17) 时遇到的第一个问题就是数据类型转换。
squirrel-lang 使用 union + type 来存储所有对象，而 c++ 是强类型语言，以最常见的数值类型 integer(整数) 而言, c++ 可以使用 char, short, int, long, long long 表示有符合整数，因此在将 squirrel-lang 对象转换成 c++ integer 时, 无可避免要使用模板。(否则将要写很多重复代码)。

以下是实现将 squirrel-lang 对象转换成 integer 的模板代码:

```c++
template<typename To>
To cast(SQObjectPtr from) {
    if (from._type == tagSQObjectType::OT_INTEGER) {
        // _integer 是宏, 展开后是 from._unVal.nInteger; 其中 _unVal 是 union 联合体.
        return (To)_integer(from);
    }
    // error-handling
    throw sqbind17::value_error("unsupported value");
}
```

接下来, 我们可以继续编写转换成 floating point(浮点数) 的模板:

```c++
template<typename To>
To cast(SQObjectPtr from) {
    if (from._type == tagSQObjectType::OT_FLOAT) {
        // _float 是宏, 展开后是 from._unVal.fFloat; 其中 _unVal 是 union 联合体.
        return (To)_float(from);
    }
    // error-handling
    throw sqbind17::value_error("unsupported value");
}
```

恭喜, 接下来就会出现**编译错误**: `error: redefinition of 'cast'`。这是因为这两个模板在类型替换(Substitution)后获得的**函数签名**是完全一样的, 以 `int` 为例, 替换后将得到以下 2 个函数。

```c++
int cast(SQObjectPtr from) {
    if (from._type == tagSQObjectType::OT_INTEGER) {
        // _integer 是宏, 展开后是 from._unVal.nInteger; 其中 _unVal 是 union 联合体.
        return (int)_integer(from);
    }
    // error-handling
    throw sqbind17::value_error("unsupported value");
}

int cast(SQObjectPtr from) {
    if (from._type == tagSQObjectType::OT_FLOAT) {
        // _float 是宏, 展开后是 from._unVal.fFloat; 其中 _unVal 是 union 联合体.
        return (int)_float(from);
    }
    // error-handling
    throw sqbind17::value_error("unsupported value");
}
```

我们的本意是希望 integer 和 floating point 分别使用不同的模板, 但 c++ 代码生成并不能**智能地**分辨出我们的**意图**。

所以, 我们需要一种协议来告诉编译器对于 integer 和 floating point 分别使用不同的模板。这个协议就是 `SFINAE(Substitution Failure Is Not An Error)`。

> p.s. 对于简单数值类型而言, 将这 2 个模板合并成一个并非不可行。但在处理复杂类型(如指针)则不能简单地合并, 否则极容易出现编译错误。
> 同时, if/else 虽然能控制运行期不会执行个别分支逻辑的代码，但函数体是实打实占着空间的。

# SFINAE - Substitution Failure Is Not An Error

SFINAE 是 Substitution Failure Is Not An Error 这句话的首字母缩写, 直译成中文是 **替换失败不是错误**。
想要明白这句话，首先要弄懂 2 个概念，**Substitution Failure** 和 **Error**。

- **Error** 在这里特指的是**编译失败**, SFINAE 意味着当发生 **Substitution Failure** 时, 编译器不认为这是编译失败, 取而代之的是编译器会从模板重载中移除 **Substitution Failure** 的特化实例，简单点理解就是 **编译器会忽略替换失败的模板, 而不是直接返回编译失败**。

- **Substitution Failure** 是指模板特化失败。这句话的重点是区分**失败**与**错误**的含义，笔者的个人见解是 **失败是指某个行为的结果，错误是对某个行为的结果的定性判断。**。

在进入实例前最后总结下笔者的理解，SFINAE 是指编译器并不会根据单个模板替换失败而直接判断编译失败。相反，判断编译成功的唯一条件是**针对某个特化实例，在所有可能模板中，有且仅有一个模板替换成功**。

重新回到上面针对 integer 和 floating point 转换的模板, 我们的目标是实现:

- integer 模板只有在当 To 是 integer 类型如 short, int, long 等时才能替换成功。
- floating point 模板只有在当 To 是 floating point 类型如 float, double 等时才能替换成功。

为了实现上述目标，我们需要使用 c++ 11 引入的元编程库 `type_traits`。

`type_traits` 提供了模板结构体 `std::enable_if<bool condition, class T = void>`, 当且仅当 condition 为 true 时, 这个 std::enable_if 才有 `type` 字段。

最后，当编译器在特化模板时遇到无法访问的 `type` 字段时, 这就叫 **替换失败(Substitution Failure)**。

综上所述, 我们将上面的代码改成符合 SFINAE 定义中的应用场景则可编译通过，例如

## 1. 函数类型中使用的所有类型（包括返回类型和所有形参的类型）

### 1.1 在函数返回值类型中使用 SFINAE

```c++
#include <type_traits>

// std::is_integral 是 `type_traits` 中的工具函数, 可用于判断类型是否整数类型
template<typename To>
std::enable_if_t<std::is_integral_v<To>, To> cast(SQObjectPtr from) {
    if (from._type == tagSQObjectType::OT_INTEGER) {
        // _integer 是宏, 展开后是 from._unVal.nInteger; 其中 _unVal 是 union 联合体.
        return (To)_integer(from);
    }
    // error-handling
    throw sqbind17::value_error("unsupported value");
}

// std::is_floating_point 是 `type_traits` 中的工具函数, 可用于判断类型是否浮点数类型
template<typename To>
std::enable_if_t<std::is_floating_point_v<To>, To> cast(SQObjectPtr from) {
    if (from._type == tagSQObjectType::OT_FLOAT) {
        // _float 是宏, 展开后是 from._unVal.fFloat; 其中 _unVal 是 union 联合体.
        return (To)_float(from);
    }
    // error-handling
    throw sqbind17::value_error("unsupported value");
}
```

### 1.2 在函数参数中使用 SFINAE

```c++
#include <type_traits>

// std::is_integral 是 `type_traits` 中的工具函数, 可用于判断类型是否整数类型
template<typename To>
TO cast(SQObjectPtr from, std::enable_if_t<std::is_integral_v<To>, To>* = nullptr) {
    if (from._type == tagSQObjectType::OT_INTEGER) {
        // _integer 是宏, 展开后是 from._unVal.nInteger; 其中 _unVal 是 union 联合体.
        return (To)_integer(from);
    }
    // error-handling
    throw sqbind17::value_error("unsupported value");
}

// std::is_floating_point 是 `type_traits` 中的工具函数, 可用于判断类型是否浮点数类型
template<typename To>
To cast(SQObjectPtr from, std::enable_if_t<std::is_floating_point_v<To>, To> = nullptr) {
    if (from._type == tagSQObjectType::OT_FLOAT) {
        // _float 是宏, 展开后是 from._unVal.fFloat; 其中 _unVal 是 union 联合体.
        return (To)_float(from);
    }
    // error-handling
    throw sqbind17::value_error("unsupported value");
}
```

## 2.各个模板形参声明中使用的所有表达式

### 2.1 在非类型模板参数中使用 SFINAE

在非类型模板参数中使用 SFINAE 的原理是让 SFINAE 发生在非类型模板参数的默认值。
```c++
#include <type_traits>

template<typename To, std::enable_if_t<std::is_integral_v<To>, To>* = nullptr>
To cast(SQObjectPtr from) {
    if (from._type == tagSQObjectType::OT_INTEGER) {
        // _integer 是宏, 展开后是 from._unVal.nInteger; 其中 _unVal 是 union 联合体.
        return (To)_integer(from);
    }
    // error-handling
    throw sqbind17::value_error("unsupported value");
}

template<typename To, std::enable_if_t<std::is_floating_point_v<To>, To>* = nullptr>
To cast(SQObjectPtr from) {
    if (from._type == tagSQObjectType::OT_FLOAT) {
        // _float 是宏, 展开后是 from._unVal.fFloat; 其中 _unVal 是 union 联合体.
        return (To)_float(from);
    }
    // error-handling
    throw sqbind17::value_error("unsupported value");
}
```

> `[type] [name] = [default value]` 是非类型模板参数的声明方式, 其中 `[name]` 可省略。
> SFINAE 的常见用法是设置成默认值为 nullptr 的指针类型

### 2.2 在类型模板参数中使用 SFINAE

在类型模板参数中使用 SFINAE 的原理是让 SFINAE 发生在类型模板参数的默认值。
需要注意一点, **c++ 不允许定义模板标识一致，但默认值不一样的模板**，因此，在类型模板参数中使用 SFINAE 只能做到编译期的类型校验。
```c++
#include <type_traits>

template<typename To, typename SFINAE = std::enable_if_t<std::is_integral_v<To>, To>>
To cast(SQObjectPtr from) {
    if (from._type == tagSQObjectType::OT_INTEGER) {
        // _integer 是宏, 展开后是 from._unVal.nInteger; 其中 _unVal 是 union 联合体.
        return (To)_integer(from);
    }
    // error-handling
    throw sqbind17::value_error("unsupported value");
}

// 不能同时定义具有相同签名，但默认参数不一样的模板。
// 以下模板编译时会报错: error: template parameter redefines default argument
// template<typename To, typename SFINAE = std::enable_if_t<std::is_floating_point_v<To>, To>>
// To cast(SQObjectPtr from) {
//     if (from._type == tagSQObjectType::OT_FLOAT) {
//         // _float 是宏, 展开后是 from._unVal.fFloat; 其中 _unVal 是 union 联合体.
//         return (To)_float(from);
//     }
//     // error-handling
//     throw sqbind17::value_error("unsupported value");
// }
```

> `typename [name] = [default value]` 是带有默认值的类型模板参数声明方式, 其中 `[name]` 可省略。
> 在类型模板参数中使用 SFINAE 只能做到编译期的类型校验。

### 3. 部分特化的模板实参列表中使用的所有类型

模板函数不支持部分特化, 只有模板类支持部分特化。

以下通过将上述函数声明成模板类中的静态方法来演示如何在部分特化中使用 SFINAE。

```c++
#include <type_traits>

template<typename To, typename Enable = void>
struct Transformer;

template<typename To>
struct Transformer<To, std::enable_if_t<std::is_integral_v<To>>> {
    static inline To cast(SQObjectPtr from) {
    if (from._type == tagSQObjectType::OT_INTEGER) {
        // _integer 是宏, 展开后是 from._unVal.nInteger; 其中 _unVal 是 union 联合体.
        return (To)_integer(from);
    }
    // error-handling
    throw sqbind17::value_error("unsupported value");
    }
};


template<typename To>
struct Transformer<To, std::enable_if_t<std::is_floating_point_v<To>>> {
    static inline To cast(SQObjectPtr from) {
    if (from._type == tagSQObjectType::OT_FLOAT) {
        // _float 是宏, 展开后是 from._unVal.fFloat; 其中 _unVal 是 union 联合体.
        return (To)_float(from);
    }
    // error-handling
    throw sqbind17::value_error("unsupported value");
    }
};
```

# 常见的 SFINAE 错误使用方式(硬错误)
## 1. 在偏特化模板声明中使用 SFINAE

这是一种常见 **部分特化 SFINAE** 错误写法:

```c++
#include <type_traits>

template<typename To>
struct Transformer;

// error: default template argument in a class template partial specialization
template<typename To, std::enable_if_t<std::is_integral_v<To>>* = nullptr>
struct Transformer<To> {
    static inline To cast(SQObjectPtr from) {
    if (from._type == tagSQObjectType::OT_INTEGER) {
        // _integer 是宏, 展开后是 from._unVal.nInteger; 其中 _unVal 是 union 联合体.
        return (To)_integer(from);
    }
    // error-handling
    throw sqbind17::value_error("unsupported value");
    }
};

// error: default template argument in a class template partial specialization
template<typename To, std::enable_if_t<std::is_floating_point_v<To>>* = nullptr>
struct Transformer<To> {
    static inline To cast(SQObjectPtr from) {
    if (from._type == tagSQObjectType::OT_FLOAT) {
        // _float 是宏, 展开后是 from._unVal.fFloat; 其中 _unVal 是 union 联合体.
        return (To)_float(from);
    }
    // error-handling
    throw sqbind17::value_error("unsupported value");
    }
};
```

编译错误的原因是**偏特化模板不支持默认参数**, 正确写法在 **3. 部分特化的模板实参列表中使用的所有类型** 中已展示。

## 2. 在类/结构体模板声明使用 SFINAE

在类/结构体模板声明使用 SFINAE 时有 2 种常见的 **redefinition** 错误。 

### 2.1 **非类型模板参数中使用 SFINAE** 的错误用法:

```c++
#include <type_traits>

template<typename To, std::enable_if_t<std::is_integral_v<To>>* = nullptr>
struct Transformer{
    static inline To cast(SQObjectPtr from) {
    if (from._type == tagSQObjectType::OT_INTEGER) {
        // _integer 是宏, 展开后是 from._unVal.nInteger; 其中 _unVal 是 union 联合体.
        return (To)_integer(from);
    }
    // error-handling
    throw sqbind17::value_error("unsupported value");
    }
};

// error: template non-type parameter has a different type 'std::enable_if_t<std::is_floating_point_v<To>> *' (aka 'typename enable_if<std::is_floating_point_v<To>, void>::type *') in template redeclaration
template<typename To, std::enable_if_t<std::is_floating_point_v<To>>* = nullptr>
struct Transformer{
    static inline To cast(SQObjectPtr from) {
    if (from._type == tagSQObjectType::OT_FLOAT) {
        // _float 是宏, 展开后是 from._unVal.fFloat; 其中 _unVal 是 union 联合体.
        return (To)_float(from);
    }
    // error-handling
    throw sqbind17::value_error("unsupported value");
    }
};
```

编译错误的原因是 c++ 不允许在 2 个相同顺位的形参使用不同的非类型参数类型。
> 注: 该编译错误优先于模板替换, 此时仍未进行模板替换。换句话说这个错误的原因与 SFINAE 无关。即使将 std::enable_if_t 替换成其他类型, 也会编译出错。


### 2.2 **类型模板参数中使用 SFINAE** 的错误用法:

```c++
#include <type_traits>

template<typename To, typename = std::enable_if_t<std::is_integral_v<To>>>
struct Transformer{
    static inline To cast(SQObjectPtr from) {
    if (from._type == tagSQObjectType::OT_INTEGER) {
        // _integer 是宏, 展开后是 from._unVal.nInteger; 其中 _unVal 是 union 联合体.
        return (To)_integer(from);
    }
    // error-handling
    throw sqbind17::value_error("unsupported value");
    }
};

// error: redefinition of 'Transformer'
template<typename To, typename = std::enable_if_t<std::is_floating_point_v<To>>>
struct Transformer{
    static inline To cast(SQObjectPtr from) {
    if (from._type == tagSQObjectType::OT_FLOAT) {
        // _float 是宏, 展开后是 from._unVal.fFloat; 其中 _unVal 是 union 联合体.
        return (To)_float(from);
    }
    // error-handling
    throw sqbind17::value_error("unsupported value");
    }
};
```

编译错误的原因是上述 2 个模板重复定义，因为 c++ 不以默认参数来区分不同的模板声明。


## 3. 在替换后发生的求值错误
函数体或类成员/方法中的求值错误是硬错误，例如:
```c++
#include <type_traits>

template <typename T>
void sample(T*) {
    std::enable_if_t<std::is_integral_v<T>>* error;
}

int main() {
    sample<int>(nullptr);
    // sample<float>(nullptr); // 硬错误,  error: no type named 'type' in 'std::enable_if<false>'; 'enable_if' cannot be used to disable this declaration
}
```

补充说明一点, 嵌套 SFINAE 是**不支持**的, 例如:
```c++
#include <type_traits>
template<typename A>
struct B { using type = typename A::type; };


template <typename T>
void sample(typename B<std::enable_if<std::is_integral_v<T>>>::type* = nullptr) {}


int main() {
    sample<int>(nullptr);
    // sample<float>(nullptr); // 硬错误, error: no type named 'type' in 'std::enable_if<false>'
}
```


同理, 以下模板也会编译错误:
```c++
#include <type_traits>
template<typename A>
struct B { using type = typename A::type; };


template <typename T>
void sample(typename B<std::enable_if<std::is_integral_v<T>>>::type* = nullptr) {}


// error: no type named 'type' in 'std::enable_if<false>'
template <typename T>
void sample(typename B<std::enable_if<std::is_floating_point_v<T>>>::type* = nullptr) {}


int main() {
    sample<int>(nullptr);
}
```

# 小结

这篇文章以笔者在编写脚本语言 c++ binding 库时遇到的类型转换为引子, 先介绍了 c++ 模板的使用方式和遇到的问题，再以此引申出 SFINAE 的概念，SFINAE 的正确用法以及 SFINAE 的错误用法。
模板编译错误的主要原因是 **redefinition(重复定义)**, 在定义同名模板时需严格保证模板实例化后的模板标识是不同的。
总之，想要正确使用 SFINAE，关键要点是先定义出**正确的模板**，再在**模板替换**时应用 SFINAE。
