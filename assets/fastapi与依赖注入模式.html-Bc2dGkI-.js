import{_ as a,r as t,o as l,c as r,f as e,g as n,i as s,e as d}from"./app-C9ZkQdtL.js";const o={},c=e("h2",{id:"序言",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#序言"},[e("span",null,"序言")])],-1),v=e("blockquote",null,[e("p",null,"如果说我看得比别人更远些，那是因为我站在巨人的肩膀上。 —— 牛顿")],-1),u={href:"https://fastapi.tiangolo.com/",target:"_blank",rel:"noopener noreferrer"},m={href:"https://www.starlette.io/",target:"_blank",rel:"noopener noreferrer"},p={href:"https://pydantic-docs.helpmanual.io/",target:"_blank",rel:"noopener noreferrer"},b=e("h2",{id:"场景演示",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#场景演示"},[e("span",null,"场景演示")])],-1),g={href:"https://fastapi.tiangolo.com/zh/tutorial/",target:"_blank",rel:"noopener noreferrer"},h=e("strong",null,"FastAPI",-1),f=d(`<h3 id="使用-django-rest-framework" tabindex="-1"><a class="header-anchor" href="#使用-django-rest-framework"><span>使用 Django REST framework</span></a></h3><p>常见的 Django View 主体逻辑一般可以划分为 3 个部分：<strong>参数校验与类型转换</strong>、<strong>业务逻辑</strong>、<strong>返回值序列化</strong>。如果要实现虚构常见中的需求，我们需要一个 APIView、一个 DSLSerializer、一个 ResponseSerializer 和一个 ESClient。同时，为了启动项目，还需要一个 urlconf、django app......</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>## serializers.py
from rest_framework import serializers


class QuerySerializer(serializers.Serializer):
    query_string = serializers.CharField(help_text=&quot;使用 \`query_string\` 语法进行搜索&quot;)
    terms = serializers.DictField(help_text=&quot;使用 \`terms\` 精准匹配&quot;)
    exclude = serializers.DictField(help_text=&quot;使用 \`terms\` 精准匹配, 但条件取反&quot;)


class DSLSerializer(serializers.Serializer):
    query = QuerySerializer()
    sort = serializers.DictField(help=&quot;key为排序字段, value 为 desc 或 asc&quot;)


class LogSerializer(serializers.Serializer):
    ts = serializers.CharField(help=&quot;日志产生的时间戳&quot;)
    message = serializers.DictField(help=&quot;日志信息&quot;)


class ResponseSerializer(serializers.Serializer):
    logs = LogSerializer(many=True)


## client.py
from elasticsearch import Elasticsearch
from django.conf import settings

class ESClient:
    def __init__(self):
        self.client = Elasticsearch(settings.ELASTICSEARCH_HOSTS)
        self.indexes = settings.ELASTICSEARCH_INDEXES
    
    def query(self, dsl):
        q = Search(using=self.client, index=self.indexes).query(dsl)
        resp = q.execute()
        return resp


## view.py
from rest_framework.views import APIView
from rest_framework.response import Response
from elasticsearch_dsl import Index, Search


class LogQueryView(APIView):
    def post(self, request):
        ## 参数校验
        dsl_serializer = DSLSerializer(request.data)
        dsl_serializer.is_valid(raise_exception=True)
        dsl = dsl_serializer.data
        ## 获取 ES client并查询
        client = ESClient()
        logs = client.query(dsl)
        ## 返回值序列化
        return Response(ResponseSerializer(logs=logs).data)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="使用-fastapi" tabindex="-1"><a class="header-anchor" href="#使用-fastapi"><span>使用 FastAPI</span></a></h3><p>FastAPI 的关键特性在于其<strong>通过不同的参数声明实现丰富功能，使代码重复最小化。</strong> 与 DRF 相比，FastAPI 可以省下较多累赘的代码，提高开发效率。</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>## schemas.py
from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from fastapi import Depends, FastAPI


class DSLQueryItem(BaseModel):
    query_string: str = Field(None, description=&quot;使用 \`query_string\` 语法进行搜索&quot;)
    terms: Dict[str, List[str]] = Field({}, description=&quot;多值精准匹配&quot;)
    exclude: Dict[str, List[str]] = Field({}, description=&quot;terms取反, 非标准 DSL&quot;)


class SimpleDomainSpecialLanguage(BaseModel):
    query: DSLQueryItem
    sort: Optional[Dict] = Field({}, description=&#39;排序，e.g. {&quot;response_time&quot;: &quot;desc&quot;, &quot;other&quot;: &quot;asc&quot;}&#39;)


class LogLine(BaseModel):
    ts: str = Field(..., description=&quot;日志产生的时间戳&quot;)
    message: str = Field(..., description=&quot;日志信息&quot;)

## client.py
from elasticsearch import Elasticsearch
from starlette.config import Config

## 从环境变量或文件读取配置
config = Config(env_file=None)


class ESClient:
    def __init__(self):
        self.client = Elasticsearch(config.ELASTICSEARCH_HOSTS)
        self.indexes = config.ELASTICSEARCH_INDEXES
    
    def query(self, dsl) -&gt; List[LogLine]:
        q = Search(using=self.client, index=self.indexes).query(dsl)
        resp = q.execute()
        return [LogLine.parse_obj(line) for line in resp]

## view.py
app = FastAPI()


@app.post(&quot;/logs/&quot;, response_model=List[LogLine])
async def query_log(dsl: SimpleDomainSpecialLanguage, client: ESClient = Depends(ESClient)):
    return client.query(dsl)


if __name__ == &#39;__main__&#39;:
    import uvicorn
    uvicorn.run(app)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>与常见的 web 框架不同，FastAPI 的接口函数，给人一种写了没写的感觉，因为实在是太简单了。 它不使用 <strong>request</strong> 对象来描述单次请求的上下文，而是接口需要什么参数，即声明具体的依赖，不冗余，不累赘。框架在启动前分析出具体接口的依赖关系，在接收请求时即构造对应的依赖对象，最后调用对应的API，完成整个请求调用流程。</p><h2 id="fastapi-是怎样做到的" tabindex="-1"><a class="header-anchor" href="#fastapi-是怎样做到的"><span>FastAPI 是怎样做到的？</span></a></h2><p>FastAPI 的这种\b\b行为模式被称之为<strong>依赖注入</strong>，依赖注入是依据<strong>控制反转</strong>原则而产生的一种设计模式。想了解依赖注入的原理，就需要先了解控制反转原则。</p><h3 id="控制反转" tabindex="-1"><a class="header-anchor" href="#控制反转"><span>控制反转</span></a></h3><blockquote><p>不要打电话给我们，我们会打电话给您。 —— 好莱坞原则</p></blockquote><p>控制反转是设计框架中常见的设计模式，实际上，<strong>控制反转通常被视为框架的定义特征</strong>。 一般而言，用户定义的函数应该被用户自身的代码所调用，而<strong>控制反转</strong>模式则提倡用户函数应该被开发框架本身调用，框架在整个应用中充当了<strong>主程序</strong>的角色，函数调用的控制权被反转了。 例如，在编写 CLI 程序中，如果不使用<strong>控制反转</strong>原则，常见的流程如下:</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>import argparse


def summation():
    &quot;&quot;&quot;输入一个整数列表并计算总和&quot;&quot;&quot;
    parser = argparse.ArgumentParser(description=&#39;Process some integers.&#39;)
    parser.add_argument(&#39;integers&#39;, metavar=&#39;N&#39;, type=int, nargs=&#39;+&#39;,
                        help=&#39;an integer for the accumulator&#39;)
    args = parser.parse_args()
    print(sum(args.integers))


if __name__ == &#39;__main__&#39;:
    summation()
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果使用<strong>控制反转</strong>, 相关的代码就变成:</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>import typer  ## typer 是基于 type hints 的 CLI 程序框架
from typing import List


app = typer.Typer()

@app.command()
def summation(intergers: List[int] = typer.Argument(..., help=&#39;an integer for the accumulator&#39;)):
    &quot;&quot;&quot;输入一个整数列表并计算总和&quot;&quot;&quot;
    print(sum(intergers))


if __name__ == &#39;__main__&#39;:
    app()
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这两个程序之间的控制流程最大的差异在于，何时执行 <em>summation</em>，当使用框架编程时，调用 <em>summation</em> 的控制权被转移至框架手上，只有参数传递正确时，<em>summation</em> 才会被框架调用，这种现象就是所谓的<strong>控制反转</strong>。</p><h3 id="依赖注入与组成根模式" tabindex="-1"><a class="header-anchor" href="#依赖注入与组成根模式"><span>依赖注入与组成根模式</span></a></h3><p><strong>依赖注入</strong>和<strong>控制反转</strong>常被相提并论，实际上两则并非同样的概念。<strong>控制反转</strong>强调的是<strong>代码控制流程的反转</strong>，而<strong>依赖注入</strong>强调的是<strong>对象初始化的控制权反转</strong>。因此，我们可以认为依赖注入是控制转移的具体实现之一。<br><strong>依赖注入</strong>的核心思想是由框架提供一种与类定义无关的构造依赖图的机制，由框架保证依赖的构造时机和顺序。一般而言，依赖注入分为两大步骤，分别是<strong>对象构造</strong>和<strong>对象注入</strong>。</p><h4 id="对象构造" tabindex="-1"><a class="header-anchor" href="#对象构造"><span>对象构造</span></a></h4><p>依据<strong>对象构造</strong>的实现方式可以将分成两大类型，分别是 <strong>Constructor Injection(基于构造函数注入)</strong>， <strong>Interface Injection(基于接口注入)</strong>。</p><h5 id="constructor-injection" tabindex="-1"><a class="header-anchor" href="#constructor-injection"><span>Constructor Injection</span></a></h5><p>在基于构造函数注入中，类所需的依赖项作为构造函数的参数提供（FastAPI 实现了该类型的依赖注入）。例如，我们可以如下声明一个接口和对应的依赖:</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>import datetime
from pydantic import BaseModel
from fastapi import Depends, FastAPI
from typing import Optional, List


class LimitOffsetPagination:
    def __init__(self, limit: Optional[int] = 20, offset: Optional[int] = 10):
        self.limit = limit
        self.offset = offset


app = FastAPI()


@app.get(&quot;/list_something/&quot;)
async def list_something(pagination: LimitOffsetPagination = Depends(LimitOffsetPagination)):
    ...


if __name__ == &#39;__main__&#39;:
    import uvicorn
    uvicorn.run(app)

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在 FastAPI 框架中，使用构造函数来决定如何注入一个依赖，在该案例中则是如何构造一个 LimitOffsetPagination 对象。<br> 在接口调用的过程中，依赖的构造和传递均是由 FastAPI 框架完成的，简化了接口调用前置的初始化工作（参数校验和类型转换等), 保证了接口只会出现相应的业务逻辑代码，提高了开发效率，对此 FastAPI 号称能<strong>提高功能开发速度约 200％ 至 300％</strong>。</p><h5 id="interface-injection" tabindex="-1"><a class="header-anchor" href="#interface-injection"><span>Interface Injection</span></a></h5><p>在基于接口注入中，类所需的依赖项由预先定义的接口进行赋值。与基于构造函数注入最大的不同点在于，基于接口注入的类对象允许为该属性<strong>预设默认值</strong>。</p><div class="hint-container tip"><p class="hint-container-title">提示</p><p>在基于接口注入的具体实现中，常见的一类型是基于 <strong>setter</strong> 进行赋值，因而也会细分成 <strong>Setter Injection</strong> 或 <strong>Property Injection</strong>。<br> 由于具体依赖注入的实现的差异，会有人将类似 <strong>obj.property = value</strong> 这样的属性注入认为是不同于 <strong>Interface Injection</strong> 的另一种实现方式。实际上两则的差异仅在于编程语言的具体实现细节之上，如果认为类属性也是对象，而对属性赋值是隐式调用该属性的 <strong>setter</strong> 方法时，那么在形式上两则是等同的。</p></div><p>在 Java 等静态语言中，基于接口的依赖注入最为常见，也由此诞生了一个专有名词：<strong>JavaBean</strong>。所谓 JavaBean，是指遵循以下规范定义的类：</p><ul><li>提供一个默认的无参构造函数</li><li>包含若干属于 <code>private</code> 级别的实例字段</li><li>包含若干属于 <code>public</code> 的 getter 或 setter 方法</li><li>可被序列化并实现 Serializable 接口</li></ul><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code>public class School {
    private String name;
    public String getName() {return this.name;}
    public String setName(String name) {this.name = name;}
}

public class Graduate {
    private String name;
    private School school;
    private Date graduationDate;

    public String getName() {return this.name;}
    public void setName(String name) {this.name = name;}

    public School getSchool() {return this.school;}
    public void setSchool(School school) {this.school = school;}

    public Date getGraduationDate() {return this.graduationDate;}
    public void setGraduationDate(Date graduationDate) {this.graduationDate = graduationDate;}
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在 Spring 框架中，最常见的依赖注入方式则是 <strong>Setter Injection</strong>。Spring 框架支持通过多种方式声明对象配置，常见的方案是使用 XML 文件进行配置，例如:</p><div class="language-xml line-numbers-mode" data-ext="xml" data-title="xml"><pre class="language-xml"><code>&lt;beans&gt;
    &lt;bean id=&quot;School&quot; class=&quot;School&quot;&gt;
        &lt;property name=&quot;name&quot;&gt;
            &lt;value&gt;some school name&lt;/value&gt;
        &lt;/property&gt;
    &lt;/bean&gt;
    &lt;bean id=&quot;Graduate&quot; class=&quot;Graduate&quot;&gt;
        &lt;property name=&quot;name&quot;&gt;
            &lt;value&gt;some body name&lt;/value&gt;
        &lt;/property&gt;
        &lt;property name=&quot;school&quot;&gt;
            &lt;ref local=&quot;School&quot;/&gt;
        &lt;/property&gt;
        &lt;property name=&quot;graduationDate&quot;&gt;
            &lt;value&gt;yyyy-MM-dd&lt;/value&gt;
        &lt;/property&gt;
    &lt;/bean&gt;
&lt;/beans&gt;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="组成根模式" tabindex="-1"><a class="header-anchor" href="#组成根模式"><span>组成根模式</span></a></h4><p>在<strong>对象构造</strong>流程中，每个类都通过构造函数或接口声明了其所需的依赖，但这却将注入具体依赖项的行为委托于第三方实现，那这应该由谁维护这些依赖关系呢？为了解决这个问题，<strong>依赖注入模式</strong>提出了<strong>The Composition Root Pattern(组成根模式)</strong>。<br><strong>组成根模式</strong>认为，应当在最接近应用程序入口的地方提供唯一的组合各模块的切面，也就是说，组成根模式的核心思想在于在程序启动之初即维护一个依赖容器(也可称之为上下文)，<strong>该容器应当具有构建所有依赖项所需的配置</strong>。 在实际实现中，每个类仅负责通过构造函数、接口或其他方式声明所需依赖，当程序启动时实例化依赖容器，借助依赖容器将依赖图“<strong>编译</strong>”成对象图。 以 FastAPI 框架为例，在程序启动时，FastAPI 会依据接口声明的依赖(Depends)构造依赖图。当请求进入时，FastAPI 依据 OpenAPI 定义的接口规范，解析请求参数，构造出相应的依赖容器，并依据依赖图中的依赖关系构造相应的对象，再传递进接口函数，完成整个调用流程。</p><div class="language-plantuml line-numbers-mode" data-ext="plantuml" data-title="plantuml"><pre class="language-plantuml"><code><img src="https://www.plantuml.com/plantuml/svg/R9D5UXmn48NtVGg5apRimypCMpEpvQ0PXydCp1vclaoNf5db2gcnskoPHi5xzVsl-a4xBMsZ7OqDIkVRqjgcDytDBPtA_fZIWfTQMjlSHFZO8ZCuc6qTxAjyPb3Bp8lm1Cnco5-5uE-Ms5nb2muHzK9cKCikipvl8M5s1zWdI4ifhI7SduG5C-u4UpyRzzq-lWj6qZZ4tHbmM0zsyTaGcaaRVJ7uXgMAr1VfFMPTmQ98o--AqYPQMrxyjhcYik5PRML3XRubrsS5sx1KoIt7KTnYLDMyYc5NLS6G5_oNia0yakjrGTe5QuFSCPoRFExTfTpYRYDaXaHs0OTlAvsN7g9RQqVbzvfQMjdvehIfeg6IVAh4aNRQgHJTGrX-yXa1DbHIMab4Q564LgNqRUMMy4QPlrzaPs5elP180kJ5boyV23EjiucHsyUeOwsf2U5rgkeXS9qt6EPXqmoM2Nt24uVfhUiLjUNqnW5RMnGvdasia6Z9THRrGs93Iqt1a85x9bbm70k1uU3XAbq4tvdLSnvXWfeo3d1PC3Y-wTEIDj8cCH1cc237IzDZFH4eCX3B5YaYqomakg6gFcvkQgTj7UMqkOsyRAghBCy3KLK4DYWi0snXCDUx1Dwuy2_hQZmPOgQruvvQp8r5GcgSZst1K907a_jf2jy03aWmilKm5KZOmJ29FB4NH7OCPXTk7_ySzDJaJ26H3Q75p5giLulj_1z4qfehDI-5om580FCI0000
"></code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span>总结</span></a></h2><p>在实际编程中，使用依赖注入可以大大<strong>简化参数校验和类型转换的代码</strong>，使得接口的代码几乎完全是业务的核心逻辑，不仅能<strong>提高开发效率，还能降低代码的维护成本</strong>。<br> 同时，对于接口的集成测试，也无需像一般的 Web 框架一样构造 request 对象，只需构造 API 所需的依赖对象，即<strong>可直接进行集成测试</strong>。<br> 虽然引入依赖注入的好处明显，但是会<strong>使得调用链路复杂化</strong>。同时引入“<strong>图</strong>”的概念会提高业务模块划分的要求，需避免依赖图中出现“<strong>环</strong>”，否则将使得依赖关系无法解决，因此该类型框架<strong>不适合应用于复杂场景</strong>。</p><h2 id="附录" tabindex="-1"><a class="header-anchor" href="#附录"><span>附录:</span></a></h2><h3 id="基于-openapi-的接口文档自动生成" tabindex="-1"><a class="header-anchor" href="#基于-openapi-的接口文档自动生成"><span>基于 OpenAPI 的接口文档自动生成</span></a></h3><p>在生成依赖图的过程中，FastAPI 将输入、输出参数转换为 <strong>Pydantic.ModelField</strong>。借助 Pydantic 将 ModelField 转换为 JSON Schema，而这恰好也是 OpenAPI 所兼容的一种类型描述，因此相对于依赖注入功能，基于 OpenAPI 的接口文档自动生成能力更像是一个附赠品，或者说是<strong>依赖图</strong>的一种可视化形式。</p>`,40);function y(_,q){const i=t("ExternalLinkIcon");return l(),r("div",null,[c,v,e("p",null,[e("a",u,[n("FastAPI"),s(i)]),n(" 是一个完全兼容 OpenAPI 开放标准，主要用于编写 API 的高性能 web 框架。 之所以说 FastAPI 站在巨人的肩膀之上，是因为虽然 FastAPI 是一个 web 框架，但实际上作为 Web 框架所需要的基础设施(Session、Cookie、CORS、ASGI...)完全由底层的 "),e("a",m,[n("Starlette"),s(i)]),n(" 提供，而对于类型校验和文档生成又依托于 "),e("a",p,[n("Pydantic"),s(i)]),n(" 来实现，自身则充当了两者的粘合剂。")]),b,e("p",null,[n("由于 FastAPI 设计精简，文档国际化完善，本文不会介绍 "),e("a",g,[n("如何使用 FastAPI"),s(i)]),n("，而是从一个虚构的应用场景介绍 "),h,n(" 的特性。 设想一个应用场景: 需要封装一个往 Elasticsearch 查询日志的接口，并需要支持部分 DSL 查询语法。")]),f])}const I=a(o,[["render",y],["__file","fastapi与依赖注入模式.html.vue"]]),P=JSON.parse('{"path":"/posts/2020/11/24/fastapi%E4%B8%8E%E4%BE%9D%E8%B5%96%E6%B3%A8%E5%85%A5%E6%A8%A1%E5%BC%8F.html","title":"FastAPI与依赖注入模式","lang":"zh-CN","frontmatter":{"draft":false,"permalinkPattern":"/posts/:year/:month/:day/:slug.html","type":"post","filePathRelative":"_posts/python/2020-11-24-FastAPI与依赖注入模式.md","date":"2020-11-24T00:00:00.000Z","title":"FastAPI与依赖注入模式","sidebarDepth":3,"category":"python","tags":["python","fastapi","django"],"feed":{"description":"本文简单介绍了 FastAPI 的使用方式和依赖注入模式。\\n"},"description":"序言 如果说我看得比别人更远些，那是因为我站在巨人的肩膀上。 —— 牛顿 FastAPI 是一个完全兼容 OpenAPI 开放标准，主要用于编写 API 的高性能 web 框架。 之所以说 FastAPI 站在巨人的肩膀之上，是因为虽然 FastAPI 是一个 web 框架，但实际上作为 Web 框架所需要的基础设施(Session、Cookie、CO...","head":[["meta",{"property":"og:url","content":"https://blog.shabbywu.cn/posts/2020/11/24/fastapi%E4%B8%8E%E4%BE%9D%E8%B5%96%E6%B3%A8%E5%85%A5%E6%A8%A1%E5%BC%8F.html"}],["meta",{"property":"og:site_name","content":"个人技术文章分享"}],["meta",{"property":"og:title","content":"FastAPI与依赖注入模式"}],["meta",{"property":"og:description","content":"序言 如果说我看得比别人更远些，那是因为我站在巨人的肩膀上。 —— 牛顿 FastAPI 是一个完全兼容 OpenAPI 开放标准，主要用于编写 API 的高性能 web 框架。 之所以说 FastAPI 站在巨人的肩膀之上，是因为虽然 FastAPI 是一个 web 框架，但实际上作为 Web 框架所需要的基础设施(Session、Cookie、CO..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-02-24T07:10:47.000Z"}],["meta",{"property":"article:author","content":"shabbywu"}],["meta",{"property":"article:tag","content":"python"}],["meta",{"property":"article:tag","content":"fastapi"}],["meta",{"property":"article:tag","content":"django"}],["meta",{"property":"article:published_time","content":"2020-11-24T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-02-24T07:10:47.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"FastAPI与依赖注入模式\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2020-11-24T00:00:00.000Z\\",\\"dateModified\\":\\"2024-02-24T07:10:47.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"shabbywu\\",\\"url\\":\\"https://github.com/shabbywu\\"}]}"],["link",{"rel":"alternate","type":"application/atom+xml","href":"https://blog.shabbywu.cn/atom.xml","title":"个人技术文章分享 Atom Feed"}],["link",{"rel":"alternate","type":"application/json","href":"https://blog.shabbywu.cn/feed.json","title":"个人技术文章分享 JSON Feed"}],["link",{"rel":"alternate","type":"application/rss+xml","href":"https://blog.shabbywu.cn/rss.xml","title":"个人技术文章分享 RSS Feed"}]]},"headers":[{"level":2,"title":"序言","slug":"序言","link":"#序言","children":[]},{"level":2,"title":"场景演示","slug":"场景演示","link":"#场景演示","children":[{"level":3,"title":"使用 Django REST framework","slug":"使用-django-rest-framework","link":"#使用-django-rest-framework","children":[]},{"level":3,"title":"使用 FastAPI","slug":"使用-fastapi","link":"#使用-fastapi","children":[]}]},{"level":2,"title":"FastAPI 是怎样做到的？","slug":"fastapi-是怎样做到的","link":"#fastapi-是怎样做到的","children":[{"level":3,"title":"控制反转","slug":"控制反转","link":"#控制反转","children":[]},{"level":3,"title":"依赖注入与组成根模式","slug":"依赖注入与组成根模式","link":"#依赖注入与组成根模式","children":[]}]},{"level":2,"title":"总结","slug":"总结","link":"#总结","children":[]},{"level":2,"title":"附录:","slug":"附录","link":"#附录","children":[{"level":3,"title":"基于 OpenAPI 的接口文档自动生成","slug":"基于-openapi-的接口文档自动生成","link":"#基于-openapi-的接口文档自动生成","children":[]}]}],"readingTime":{"minutes":10.57,"words":3170},"filePathRelative":"_posts/python/2020-11-24-fastapi与依赖注入模式.md","localizedDate":"2020年11月24日","autoDesc":true,"git":{"createdTime":1708758647000,"updatedTime":1708758647000,"contributors":[{"name":"shabbywu","email":"shabbywu@tencent.com","commits":1}]}}');export{I as comp,P as data};
