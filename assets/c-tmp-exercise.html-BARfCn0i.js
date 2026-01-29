import{_ as l,r as s,o as a,c as r,f as e,g as n,i as t,e as d}from"./app-C9ZkQdtL.js";const o={},u=e("h2",{id:"背景",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#背景"},[e("span",null,"背景")])],-1),c=e("p",null,[n("在编写脚本语言的 c++ binding 库时, 最繁琐的工序是实现类型转换。具体来说就是将脚本语言中的某个类型转换成 c++ 等价类型。 对于一般的数值类型而言，在不考虑精度损失的情况下，可能直接用 "),e("code",null,"static_cast"),n(" 就能完成类型转换。但是对于复杂类型如字符串或指针，类型转换将是一个复杂问题。")],-1),v={href:"https://github.com/shabbywu/sqbind17",target:"_blank",rel:"noopener noreferrer"},m={href:"https://en.cppreference.com/w/cpp/language/templates",target:"_blank",rel:"noopener noreferrer"},b=e("h2",{id:"c-模板与问题",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#c-模板与问题"},[e("span",null,"c++模板与问题")])],-1),p={href:"https://github.com/shabbywu/sqbind17",target:"_blank",rel:"noopener noreferrer"},g=d(`<p>以下是实现将 squirrel-lang 对象转换成 integer 的模板代码:</p><div class="language-c++ line-numbers-mode" data-ext="c++" data-title="c++"><pre class="language-c++"><code>template&lt;typename To&gt;
To cast(SQObjectPtr from) {
    if (from._type == tagSQObjectType::OT_INTEGER) {
        // _integer 是宏, 展开后是 from._unVal.nInteger; 其中 _unVal 是 union 联合体.
        return (To)_integer(from);
    }
    // error-handling
    throw sqbind17::value_error(&quot;unsupported value&quot;);
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>接下来, 我们可以继续编写转换成 floating point(浮点数) 的模板:</p><div class="language-c++ line-numbers-mode" data-ext="c++" data-title="c++"><pre class="language-c++"><code>template&lt;typename To&gt;
To cast(SQObjectPtr from) {
    if (from._type == tagSQObjectType::OT_FLOAT) {
        // _float 是宏, 展开后是 from._unVal.fFloat; 其中 _unVal 是 union 联合体.
        return (To)_float(from);
    }
    // error-handling
    throw sqbind17::value_error(&quot;unsupported value&quot;);
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>恭喜, 接下来就会出现<strong>编译错误</strong>: <code>error: redefinition of &#39;cast&#39;</code>。这是因为这两个模板在类型替换(Substitution)后获得的<strong>函数签名</strong>是完全一样的, 以 <code>int</code> 为例, 替换后将得到以下 2 个函数。</p><div class="language-c++ line-numbers-mode" data-ext="c++" data-title="c++"><pre class="language-c++"><code>int cast(SQObjectPtr from) {
    if (from._type == tagSQObjectType::OT_INTEGER) {
        // _integer 是宏, 展开后是 from._unVal.nInteger; 其中 _unVal 是 union 联合体.
        return (int)_integer(from);
    }
    // error-handling
    throw sqbind17::value_error(&quot;unsupported value&quot;);
}

int cast(SQObjectPtr from) {
    if (from._type == tagSQObjectType::OT_FLOAT) {
        // _float 是宏, 展开后是 from._unVal.fFloat; 其中 _unVal 是 union 联合体.
        return (int)_float(from);
    }
    // error-handling
    throw sqbind17::value_error(&quot;unsupported value&quot;);
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>我们的本意是希望 integer 和 floating point 分别使用不同的模板, 但 c++ 代码生成并不能<strong>智能地</strong>分辨出我们的<strong>意图</strong>。</p><p>所以, 我们需要一种协议来告诉编译器对于 integer 和 floating point 分别使用不同的模板。这个协议就是 <code>SFINAE(Substitution Failure Is Not An Error)</code>。</p><blockquote><p>p.s. 对于简单数值类型而言, 将这 2 个模板合并成一个并非不可行。但在处理复杂类型(如指针)则不能简单地合并, 否则极容易出现编译错误。 同时, if/else 虽然能控制运行期不会执行个别分支逻辑的代码，但函数体是实打实占着空间的。</p></blockquote><h2 id="sfinae-substitution-failure-is-not-an-error" tabindex="-1"><a class="header-anchor" href="#sfinae-substitution-failure-is-not-an-error"><span>SFINAE - Substitution Failure Is Not An Error</span></a></h2><p>SFINAE 是 Substitution Failure Is Not An Error 这句话的首字母缩写, 直译成中文是 <strong>替换失败不是错误</strong>。 想要明白这句话，首先要弄懂 2 个概念，<strong>Substitution Failure</strong> 和 <strong>Error</strong>。</p><ul><li><p><strong>Error</strong> 在这里特指的是<strong>编译失败</strong>, SFINAE 意味着当发生 <strong>Substitution Failure</strong> 时, 编译器不认为这是编译失败, 取而代之的是编译器会从模板重载中移除 <strong>Substitution Failure</strong> 的特化实例，简单点理解就是 <strong>编译器会忽略替换失败的模板, 而不是直接返回编译失败</strong>。</p></li><li><p><strong>Substitution Failure</strong> 是指模板特化失败。这句话的重点是区分<strong>失败</strong>与<strong>错误</strong>的含义，笔者的个人见解是 <strong>失败是指某个行为的结果，错误是对某个行为的结果的定性判断。</strong>。</p></li></ul><p>在进入实例前最后总结下笔者的理解，SFINAE 是指编译器并不会根据单个模板替换失败而直接判断编译失败。相反，判断编译成功的唯一条件是<strong>针对某个特化实例，在所有可能模板中，有且仅有一个模板替换成功</strong>。</p><p>重新回到上面针对 integer 和 floating point 转换的模板, 我们的目标是实现:</p><ul><li>integer 模板只有在当 To 是 integer 类型如 short, int, long 等时才能替换成功。</li><li>floating point 模板只有在当 To 是 floating point 类型如 float, double 等时才能替换成功。</li></ul><p>为了实现上述目标，我们需要使用 c++ 11 引入的元编程库 <code>type_traits</code>。</p><p><code>type_traits</code> 提供了模板结构体 <code>std::enable_if&lt;bool condition, class T = void&gt;</code>, 当且仅当 condition 为 true 时, 这个 std::enable_if 才有 <code>type</code> 字段。</p><p>最后，当编译器在特化模板时遇到无法访问的 <code>type</code> 字段时, 这就叫 <strong>替换失败(Substitution Failure)</strong>。</p><p>综上所述, 我们将上面的代码改成符合 SFINAE 定义中的应用场景则可编译通过，例如</p><h3 id="_1-函数类型中使用的所有类型-包括返回类型和所有形参的类型" tabindex="-1"><a class="header-anchor" href="#_1-函数类型中使用的所有类型-包括返回类型和所有形参的类型"><span>1. 函数类型中使用的所有类型（包括返回类型和所有形参的类型）</span></a></h3><h4 id="_1-1-在函数返回值类型中使用-sfinae" tabindex="-1"><a class="header-anchor" href="#_1-1-在函数返回值类型中使用-sfinae"><span>1.1 在函数返回值类型中使用 SFINAE</span></a></h4><div class="language-c++ line-numbers-mode" data-ext="c++" data-title="c++"><pre class="language-c++"><code>#include &lt;type_traits&gt;

// std::is_integral 是 \`type_traits\` 中的工具函数, 可用于判断类型是否整数类型
template&lt;typename To&gt;
std::enable_if_t&lt;std::is_integral_v&lt;To&gt;, To&gt; cast(SQObjectPtr from) {
    if (from._type == tagSQObjectType::OT_INTEGER) {
        // _integer 是宏, 展开后是 from._unVal.nInteger; 其中 _unVal 是 union 联合体.
        return (To)_integer(from);
    }
    // error-handling
    throw sqbind17::value_error(&quot;unsupported value&quot;);
}

// std::is_floating_point 是 \`type_traits\` 中的工具函数, 可用于判断类型是否浮点数类型
template&lt;typename To&gt;
std::enable_if_t&lt;std::is_floating_point_v&lt;To&gt;, To&gt; cast(SQObjectPtr from) {
    if (from._type == tagSQObjectType::OT_FLOAT) {
        // _float 是宏, 展开后是 from._unVal.fFloat; 其中 _unVal 是 union 联合体.
        return (To)_float(from);
    }
    // error-handling
    throw sqbind17::value_error(&quot;unsupported value&quot;);
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_1-2-在函数参数中使用-sfinae" tabindex="-1"><a class="header-anchor" href="#_1-2-在函数参数中使用-sfinae"><span>1.2 在函数参数中使用 SFINAE</span></a></h4><div class="language-c++ line-numbers-mode" data-ext="c++" data-title="c++"><pre class="language-c++"><code>#include &lt;type_traits&gt;

// std::is_integral 是 \`type_traits\` 中的工具函数, 可用于判断类型是否整数类型
template&lt;typename To&gt;
TO cast(SQObjectPtr from, std::enable_if_t&lt;std::is_integral_v&lt;To&gt;, To&gt;* = nullptr) {
    if (from._type == tagSQObjectType::OT_INTEGER) {
        // _integer 是宏, 展开后是 from._unVal.nInteger; 其中 _unVal 是 union 联合体.
        return (To)_integer(from);
    }
    // error-handling
    throw sqbind17::value_error(&quot;unsupported value&quot;);
}

// std::is_floating_point 是 \`type_traits\` 中的工具函数, 可用于判断类型是否浮点数类型
template&lt;typename To&gt;
To cast(SQObjectPtr from, std::enable_if_t&lt;std::is_floating_point_v&lt;To&gt;, To&gt; = nullptr) {
    if (from._type == tagSQObjectType::OT_FLOAT) {
        // _float 是宏, 展开后是 from._unVal.fFloat; 其中 _unVal 是 union 联合体.
        return (To)_float(from);
    }
    // error-handling
    throw sqbind17::value_error(&quot;unsupported value&quot;);
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-各个模板形参声明中使用的所有表达式" tabindex="-1"><a class="header-anchor" href="#_2-各个模板形参声明中使用的所有表达式"><span>2.各个模板形参声明中使用的所有表达式</span></a></h3><h4 id="_2-1-在非类型模板参数中使用-sfinae" tabindex="-1"><a class="header-anchor" href="#_2-1-在非类型模板参数中使用-sfinae"><span>2.1 在非类型模板参数中使用 SFINAE</span></a></h4><p>在非类型模板参数中使用 SFINAE 的原理是让 SFINAE 发生在非类型模板参数的默认值。</p><div class="language-c++ line-numbers-mode" data-ext="c++" data-title="c++"><pre class="language-c++"><code>#include &lt;type_traits&gt;

template&lt;typename To, std::enable_if_t&lt;std::is_integral_v&lt;To&gt;, To&gt;* = nullptr&gt;
To cast(SQObjectPtr from) {
    if (from._type == tagSQObjectType::OT_INTEGER) {
        // _integer 是宏, 展开后是 from._unVal.nInteger; 其中 _unVal 是 union 联合体.
        return (To)_integer(from);
    }
    // error-handling
    throw sqbind17::value_error(&quot;unsupported value&quot;);
}

template&lt;typename To, std::enable_if_t&lt;std::is_floating_point_v&lt;To&gt;, To&gt;* = nullptr&gt;
To cast(SQObjectPtr from) {
    if (from._type == tagSQObjectType::OT_FLOAT) {
        // _float 是宏, 展开后是 from._unVal.fFloat; 其中 _unVal 是 union 联合体.
        return (To)_float(from);
    }
    // error-handling
    throw sqbind17::value_error(&quot;unsupported value&quot;);
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p><code>[type] [name] = [default value]</code> 是非类型模板参数的声明方式, 其中 <code>[name]</code> 可省略。 SFINAE 的常见用法是设置成默认值为 nullptr 的指针类型</p></blockquote><h4 id="_2-2-在类型模板参数中使用-sfinae" tabindex="-1"><a class="header-anchor" href="#_2-2-在类型模板参数中使用-sfinae"><span>2.2 在类型模板参数中使用 SFINAE</span></a></h4><p>在类型模板参数中使用 SFINAE 的原理是让 SFINAE 发生在类型模板参数的默认值。 需要注意一点, <strong>c++ 不允许定义模板标识一致，但默认值不一样的模板</strong>，因此，在类型模板参数中使用 SFINAE 只能做到编译期的类型校验。</p><div class="language-c++ line-numbers-mode" data-ext="c++" data-title="c++"><pre class="language-c++"><code>#include &lt;type_traits&gt;

template&lt;typename To, typename SFINAE = std::enable_if_t&lt;std::is_integral_v&lt;To&gt;, To&gt;&gt;
To cast(SQObjectPtr from) {
    if (from._type == tagSQObjectType::OT_INTEGER) {
        // _integer 是宏, 展开后是 from._unVal.nInteger; 其中 _unVal 是 union 联合体.
        return (To)_integer(from);
    }
    // error-handling
    throw sqbind17::value_error(&quot;unsupported value&quot;);
}

// 不能同时定义具有相同签名，但默认参数不一样的模板。
// 以下模板编译时会报错: error: template parameter redefines default argument
// template&lt;typename To, typename SFINAE = std::enable_if_t&lt;std::is_floating_point_v&lt;To&gt;, To&gt;&gt;
// To cast(SQObjectPtr from) {
//     if (from._type == tagSQObjectType::OT_FLOAT) {
//         // _float 是宏, 展开后是 from._unVal.fFloat; 其中 _unVal 是 union 联合体.
//         return (To)_float(from);
//     }
//     // error-handling
//     throw sqbind17::value_error(&quot;unsupported value&quot;);
// }
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p><code>typename [name] = [default value]</code> 是带有默认值的类型模板参数声明方式, 其中 <code>[name]</code> 可省略。 在类型模板参数中使用 SFINAE 只能做到编译期的类型校验。</p></blockquote><h3 id="_3-部分特化的模板实参列表中使用的所有类型" tabindex="-1"><a class="header-anchor" href="#_3-部分特化的模板实参列表中使用的所有类型"><span>3. 部分特化的模板实参列表中使用的所有类型</span></a></h3><p>模板函数不支持部分特化, 只有模板类支持部分特化。</p><p>以下通过将上述函数声明成模板类中的静态方法来演示如何在部分特化中使用 SFINAE。</p><div class="language-c++ line-numbers-mode" data-ext="c++" data-title="c++"><pre class="language-c++"><code>#include &lt;type_traits&gt;

template&lt;typename To, typename Enable = void&gt;
struct Transformer;

template&lt;typename To&gt;
struct Transformer&lt;To, std::enable_if_t&lt;std::is_integral_v&lt;To&gt;&gt;&gt; {
    static inline To cast(SQObjectPtr from) {
    if (from._type == tagSQObjectType::OT_INTEGER) {
        // _integer 是宏, 展开后是 from._unVal.nInteger; 其中 _unVal 是 union 联合体.
        return (To)_integer(from);
    }
    // error-handling
    throw sqbind17::value_error(&quot;unsupported value&quot;);
    }
};


template&lt;typename To&gt;
struct Transformer&lt;To, std::enable_if_t&lt;std::is_floating_point_v&lt;To&gt;&gt;&gt; {
    static inline To cast(SQObjectPtr from) {
    if (from._type == tagSQObjectType::OT_FLOAT) {
        // _float 是宏, 展开后是 from._unVal.fFloat; 其中 _unVal 是 union 联合体.
        return (To)_float(from);
    }
    // error-handling
    throw sqbind17::value_error(&quot;unsupported value&quot;);
    }
};
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="常见的-sfinae-错误使用方式-硬错误" tabindex="-1"><a class="header-anchor" href="#常见的-sfinae-错误使用方式-硬错误"><span>常见的 SFINAE 错误使用方式(硬错误)</span></a></h2><h3 id="_1-在偏特化模板声明中使用-sfinae" tabindex="-1"><a class="header-anchor" href="#_1-在偏特化模板声明中使用-sfinae"><span>1. 在偏特化模板声明中使用 SFINAE</span></a></h3><p>这是一种常见 <strong>部分特化 SFINAE</strong> 错误写法:</p><div class="language-c++ line-numbers-mode" data-ext="c++" data-title="c++"><pre class="language-c++"><code>#include &lt;type_traits&gt;

template&lt;typename To&gt;
struct Transformer;

// error: default template argument in a class template partial specialization
template&lt;typename To, std::enable_if_t&lt;std::is_integral_v&lt;To&gt;&gt;* = nullptr&gt;
struct Transformer&lt;To&gt; {
    static inline To cast(SQObjectPtr from) {
    if (from._type == tagSQObjectType::OT_INTEGER) {
        // _integer 是宏, 展开后是 from._unVal.nInteger; 其中 _unVal 是 union 联合体.
        return (To)_integer(from);
    }
    // error-handling
    throw sqbind17::value_error(&quot;unsupported value&quot;);
    }
};

// error: default template argument in a class template partial specialization
template&lt;typename To, std::enable_if_t&lt;std::is_floating_point_v&lt;To&gt;&gt;* = nullptr&gt;
struct Transformer&lt;To&gt; {
    static inline To cast(SQObjectPtr from) {
    if (from._type == tagSQObjectType::OT_FLOAT) {
        // _float 是宏, 展开后是 from._unVal.fFloat; 其中 _unVal 是 union 联合体.
        return (To)_float(from);
    }
    // error-handling
    throw sqbind17::value_error(&quot;unsupported value&quot;);
    }
};
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>编译错误的原因是<strong>偏特化模板不支持默认参数</strong>, 正确写法在 <strong>3. 部分特化的模板实参列表中使用的所有类型</strong> 中已展示。</p><h3 id="_2-在类-结构体模板声明使用-sfinae" tabindex="-1"><a class="header-anchor" href="#_2-在类-结构体模板声明使用-sfinae"><span>2. 在类/结构体模板声明使用 SFINAE</span></a></h3><p>在类/结构体模板声明使用 SFINAE 时有 2 种常见的 <strong>redefinition</strong> 错误。</p><h4 id="_2-1-非类型模板参数中使用-sfinae-的错误用法" tabindex="-1"><a class="header-anchor" href="#_2-1-非类型模板参数中使用-sfinae-的错误用法"><span>2.1 <strong>非类型模板参数中使用 SFINAE</strong> 的错误用法:</span></a></h4><div class="language-c++ line-numbers-mode" data-ext="c++" data-title="c++"><pre class="language-c++"><code>#include &lt;type_traits&gt;

template&lt;typename To, std::enable_if_t&lt;std::is_integral_v&lt;To&gt;&gt;* = nullptr&gt;
struct Transformer{
    static inline To cast(SQObjectPtr from) {
    if (from._type == tagSQObjectType::OT_INTEGER) {
        // _integer 是宏, 展开后是 from._unVal.nInteger; 其中 _unVal 是 union 联合体.
        return (To)_integer(from);
    }
    // error-handling
    throw sqbind17::value_error(&quot;unsupported value&quot;);
    }
};

// error: template non-type parameter has a different type &#39;std::enable_if_t&lt;std::is_floating_point_v&lt;To&gt;&gt; *&#39; (aka &#39;typename enable_if&lt;std::is_floating_point_v&lt;To&gt;, void&gt;::type *&#39;) in template redeclaration
template&lt;typename To, std::enable_if_t&lt;std::is_floating_point_v&lt;To&gt;&gt;* = nullptr&gt;
struct Transformer{
    static inline To cast(SQObjectPtr from) {
    if (from._type == tagSQObjectType::OT_FLOAT) {
        // _float 是宏, 展开后是 from._unVal.fFloat; 其中 _unVal 是 union 联合体.
        return (To)_float(from);
    }
    // error-handling
    throw sqbind17::value_error(&quot;unsupported value&quot;);
    }
};
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>编译错误的原因是 c++ 不允许在 2 个相同顺位的形参使用不同的非类型参数类型。</p><blockquote><p>注: 该编译错误优先于模板替换, 此时仍未进行模板替换。换句话说这个错误的原因与 SFINAE 无关。即使将 std::enable_if_t 替换成其他类型, 也会编译出错。</p></blockquote><h4 id="_2-2-类型模板参数中使用-sfinae-的错误用法" tabindex="-1"><a class="header-anchor" href="#_2-2-类型模板参数中使用-sfinae-的错误用法"><span>2.2 <strong>类型模板参数中使用 SFINAE</strong> 的错误用法:</span></a></h4><div class="language-c++ line-numbers-mode" data-ext="c++" data-title="c++"><pre class="language-c++"><code>#include &lt;type_traits&gt;

template&lt;typename To, typename = std::enable_if_t&lt;std::is_integral_v&lt;To&gt;&gt;&gt;
struct Transformer{
    static inline To cast(SQObjectPtr from) {
    if (from._type == tagSQObjectType::OT_INTEGER) {
        // _integer 是宏, 展开后是 from._unVal.nInteger; 其中 _unVal 是 union 联合体.
        return (To)_integer(from);
    }
    // error-handling
    throw sqbind17::value_error(&quot;unsupported value&quot;);
    }
};

// error: redefinition of &#39;Transformer&#39;
template&lt;typename To, typename = std::enable_if_t&lt;std::is_floating_point_v&lt;To&gt;&gt;&gt;
struct Transformer{
    static inline To cast(SQObjectPtr from) {
    if (from._type == tagSQObjectType::OT_FLOAT) {
        // _float 是宏, 展开后是 from._unVal.fFloat; 其中 _unVal 是 union 联合体.
        return (To)_float(from);
    }
    // error-handling
    throw sqbind17::value_error(&quot;unsupported value&quot;);
    }
};
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>编译错误的原因是上述 2 个模板重复定义，因为 c++ 不以默认参数来区分不同的模板声明。</p><h3 id="_3-在替换后发生的求值错误" tabindex="-1"><a class="header-anchor" href="#_3-在替换后发生的求值错误"><span>3. 在替换后发生的求值错误</span></a></h3><p>函数体或类成员/方法中的求值错误是硬错误，例如:</p><div class="language-c++ line-numbers-mode" data-ext="c++" data-title="c++"><pre class="language-c++"><code>#include &lt;type_traits&gt;

template &lt;typename T&gt;
void sample(T*) {
    std::enable_if_t&lt;std::is_integral_v&lt;T&gt;&gt;* error;
}

int main() {
    sample&lt;int&gt;(nullptr);
    // sample&lt;float&gt;(nullptr); // 硬错误,  error: no type named &#39;type&#39; in &#39;std::enable_if&lt;false&gt;&#39;; &#39;enable_if&#39; cannot be used to disable this declaration
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>补充说明一点, 嵌套 SFINAE 是<strong>不支持</strong>的, 例如:</p><div class="language-c++ line-numbers-mode" data-ext="c++" data-title="c++"><pre class="language-c++"><code>#include &lt;type_traits&gt;
template&lt;typename A&gt;
struct B { using type = typename A::type; };


template &lt;typename T&gt;
void sample(typename B&lt;std::enable_if&lt;std::is_integral_v&lt;T&gt;&gt;&gt;::type* = nullptr) {}


int main() {
    sample&lt;int&gt;(nullptr);
    // sample&lt;float&gt;(nullptr); // 硬错误, error: no type named &#39;type&#39; in &#39;std::enable_if&lt;false&gt;&#39;
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>同理, 以下模板也会编译错误:</p><div class="language-c++ line-numbers-mode" data-ext="c++" data-title="c++"><pre class="language-c++"><code>#include &lt;type_traits&gt;
template&lt;typename A&gt;
struct B { using type = typename A::type; };


template &lt;typename T&gt;
void sample(typename B&lt;std::enable_if&lt;std::is_integral_v&lt;T&gt;&gt;&gt;::type* = nullptr) {}


// error: no type named &#39;type&#39; in &#39;std::enable_if&lt;false&gt;&#39;
template &lt;typename T&gt;
void sample(typename B&lt;std::enable_if&lt;std::is_floating_point_v&lt;T&gt;&gt;&gt;::type* = nullptr) {}


int main() {
    sample&lt;int&gt;(nullptr);
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="小结" tabindex="-1"><a class="header-anchor" href="#小结"><span>小结</span></a></h2><p>这篇文章以笔者在编写脚本语言 c++ binding 库时遇到的类型转换为引子, 先介绍了 c++ 模板的使用方式和遇到的问题，再以此引申出 SFINAE 的概念，SFINAE 的正确用法以及 SFINAE 的错误用法。 模板编译错误的主要原因是 <strong>redefinition(重复定义)</strong>, 在定义同名模板时需严格保证模板实例化后的模板标识是不同的。 总之，想要正确使用 SFINAE，关键要点是先定义出<strong>正确的模板</strong>，再在<strong>模板替换</strong>时应用 SFINAE。</p>`,60);function _(f,h){const i=s("ExternalLinkIcon");return a(),r("div",null,[u,c,e("p",null,[n("以下以笔者开源的 "),e("a",v,[n("squirrel-lang c++ binding"),t(i)]),n(" 为例, 介绍在模板元编程(Template metaprogramming, TMP)遇到的一些经验与教训。")]),e("blockquote",null,[e("p",null,[n("注: 更系统化的介绍可以在 "),e("a",m,[n("cppreference"),t(i)]),n(" 中找到。")])]),b,e("p",null,[n("在编写 "),e("a",p,[n("sqbind17"),t(i)]),n(" 时遇到的第一个问题就是数据类型转换。 squirrel-lang 使用 union + type 来存储所有对象，而 c++ 是强类型语言，以最常见的数值类型 integer(整数) 而言, c++ 可以使用 char, short, int, long, long long 表示有符合整数，因此在将 squirrel-lang 对象转换成 c++ integer 时, 无可避免要使用模板。(否则将要写很多重复代码)。")]),g])}const y=l(o,[["render",_],["__file","c-tmp-exercise.html.vue"]]),S=JSON.parse('{"path":"/posts/2024/09/18/c-tmp-exercise.html","title":"C++ 模板元编程实践总结(Template, SFINAE, Type Traits)","lang":"zh-CN","frontmatter":{"draft":false,"permalinkPattern":"/posts/:year/:month/:day/:slug.html","type":"post","filePathRelative":"_posts/cpp/2024-09-18-C++ TMP exercise .md","date":"2024-09-18T00:00:00.000Z","title":"C++ 模板元编程实践总结(Template, SFINAE, Type Traits)","sidebarDepth":2,"category":"c++","tags":["c++","template"],"feed":{"description":"本文分享了在编写脚本语言的 c++ binding 库时使用模板元编程时的经验与教训。\\n"},"description":"背景 在编写脚本语言的 c++ binding 库时, 最繁琐的工序是实现类型转换。具体来说就是将脚本语言中的某个类型转换成 c++ 等价类型。 对于一般的数值类型而言，在不考虑精度损失的情况下，可能直接用 static_cast 就能完成类型转换。但是对于复杂类型如字符串或指针，类型转换将是一个复杂问题。 以下以笔者开源的 squirrel-lang...","head":[["meta",{"property":"og:url","content":"https://blog.shabbywu.cn/posts/2024/09/18/c-tmp-exercise.html"}],["meta",{"property":"og:site_name","content":"个人技术文章分享"}],["meta",{"property":"og:title","content":"C++ 模板元编程实践总结(Template, SFINAE, Type Traits)"}],["meta",{"property":"og:description","content":"背景 在编写脚本语言的 c++ binding 库时, 最繁琐的工序是实现类型转换。具体来说就是将脚本语言中的某个类型转换成 c++ 等价类型。 对于一般的数值类型而言，在不考虑精度损失的情况下，可能直接用 static_cast 就能完成类型转换。但是对于复杂类型如字符串或指针，类型转换将是一个复杂问题。 以下以笔者开源的 squirrel-lang..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-09-24T08:05:05.000Z"}],["meta",{"property":"article:author","content":"shabbywu"}],["meta",{"property":"article:tag","content":"c++"}],["meta",{"property":"article:tag","content":"template"}],["meta",{"property":"article:published_time","content":"2024-09-18T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-09-24T08:05:05.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"C++ 模板元编程实践总结(Template, SFINAE, Type Traits)\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2024-09-18T00:00:00.000Z\\",\\"dateModified\\":\\"2024-09-24T08:05:05.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"shabbywu\\",\\"url\\":\\"https://github.com/shabbywu\\"}]}"],["link",{"rel":"alternate","type":"application/atom+xml","href":"https://blog.shabbywu.cn/atom.xml","title":"个人技术文章分享 Atom Feed"}],["link",{"rel":"alternate","type":"application/json","href":"https://blog.shabbywu.cn/feed.json","title":"个人技术文章分享 JSON Feed"}],["link",{"rel":"alternate","type":"application/rss+xml","href":"https://blog.shabbywu.cn/rss.xml","title":"个人技术文章分享 RSS Feed"}]]},"headers":[{"level":2,"title":"背景","slug":"背景","link":"#背景","children":[]},{"level":2,"title":"c++模板与问题","slug":"c-模板与问题","link":"#c-模板与问题","children":[]},{"level":2,"title":"SFINAE - Substitution Failure Is Not An Error","slug":"sfinae-substitution-failure-is-not-an-error","link":"#sfinae-substitution-failure-is-not-an-error","children":[{"level":3,"title":"1. 函数类型中使用的所有类型（包括返回类型和所有形参的类型）","slug":"_1-函数类型中使用的所有类型-包括返回类型和所有形参的类型","link":"#_1-函数类型中使用的所有类型-包括返回类型和所有形参的类型","children":[]},{"level":3,"title":"2.各个模板形参声明中使用的所有表达式","slug":"_2-各个模板形参声明中使用的所有表达式","link":"#_2-各个模板形参声明中使用的所有表达式","children":[]},{"level":3,"title":"3. 部分特化的模板实参列表中使用的所有类型","slug":"_3-部分特化的模板实参列表中使用的所有类型","link":"#_3-部分特化的模板实参列表中使用的所有类型","children":[]}]},{"level":2,"title":"常见的 SFINAE 错误使用方式(硬错误)","slug":"常见的-sfinae-错误使用方式-硬错误","link":"#常见的-sfinae-错误使用方式-硬错误","children":[{"level":3,"title":"1. 在偏特化模板声明中使用 SFINAE","slug":"_1-在偏特化模板声明中使用-sfinae","link":"#_1-在偏特化模板声明中使用-sfinae","children":[]},{"level":3,"title":"2. 在类/结构体模板声明使用 SFINAE","slug":"_2-在类-结构体模板声明使用-sfinae","link":"#_2-在类-结构体模板声明使用-sfinae","children":[]},{"level":3,"title":"3. 在替换后发生的求值错误","slug":"_3-在替换后发生的求值错误","link":"#_3-在替换后发生的求值错误","children":[]}]},{"level":2,"title":"小结","slug":"小结","link":"#小结","children":[]}],"readingTime":{"minutes":11.13,"words":3339},"filePathRelative":"_posts/cpp/2024-09-18-c-tmp-exercise.md","localizedDate":"2024年9月18日","autoDesc":true,"git":{"createdTime":1727163585000,"updatedTime":1727165105000,"contributors":[{"name":"shabbywu","email":"shabbywu@qq.com","commits":2}]}}');export{y as comp,S as data};
