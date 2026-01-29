import{_ as a,r as d,o as r,c as l,f as e,g as n,i as s,e as t}from"./app-C9ZkQdtL.js";const o={},c=e("h2",{id:"使用-pydantic-简化-api-文档生成的思路",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#使用-pydantic-简化-api-文档生成的思路"},[e("span",null,"使用 pydantic 简化 API 文档生成的思路")])],-1),u=e("h3",{id:"前言-type-hints简介",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#前言-type-hints简介"},[e("span",null,"前言-Type Hints简介")])],-1),v=e("strong",null,"dry-yasg",-1),m=e("strong",null,"Django Models",-1),p=e("strong",null,"Schema",-1),g=e("strong",null,"Serializer",-1),b=e("br",null,null,-1),h={href:"https://www.python.org/dev/peps/pep-0484/",target:"_blank",rel:"noopener noreferrer"},y=e("strong",null,"Serializer",-1),f=t(`<div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>## Type Hints 与 Serializer 的对比
import datetime
from typing import List
from dataclasses import dataclass


## 使用 Type Hints
@dataclass
class Comment:
    title: str
    content: str
    author: str
    created: datetime.datetime
    updated: datetime.datetime


@dataclass
class Post:
    title: str
    content: str
    author: str
    created: datetime.datetime
    updated: datetime.datetime
    visit: int
    comments: List[Comment]


from rest_framework.serializers import (
    Serializer,
    ListSerializer,
    CharField,
    IntegerField,
    DateTimeField,
)

## 使用 drf-Serializer
class CommentSLZ(Serializer):
    title = CharField()
    content = CharField()
    author = CharField()
    created = DateTimeField()
    updated = DateTimeField()


class PostSLZ(Serializer):
    title = CharField()
    content = CharField()
    author = CharField()
    created = DateTimeField()
    updated = DateTimeField()
    visit = IntegerField()
    comments = ListSerializer(child=CommentSLZ())
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>从上面的代码可以看出, 由于 <strong>Type Hints</strong> 有官方的支持, 语法比起 <strong>Serializer</strong> 而言要简单许多, 美中不足的只有官方实现的 <strong>dataclass</strong> 并不支持序列化。<br> 如果项目里已经有使用 <strong>Type Hints</strong> 进行数据建模, 同时又需要使用 <strong>Serializer</strong> 做参数校验和序列化操作, 这个时候就可以尝试使用 <strong>pydantic</strong> 解放自己的双手。</p>`,2),q=e("strong",null,"Type Hints",-1),_=e("strong",null,"Serializer",-1),S=e("strong",null,"序列化",-1),A=e("strong",null,"类型校验",-1),P={href:"https://pydantic-docs.helpmanual.io/benchmarks/",target:"_blank",rel:"noopener noreferrer"},T=e("strong",null,"Swagger/OpenAPI",-1),w=e("strong",null,"Swagger API",-1),z=t(`<h3 id="回顾初衷-为何选择-drf-yasg" tabindex="-1"><a class="header-anchor" href="#回顾初衷-为何选择-drf-yasg"><span>回顾初衷-为何选择 <strong>drf-yasg</strong></span></a></h3><p>常见的文档自动化生成工具都是基于代码注释进行的, 而 <strong>drf-yasg</strong> 并没有走代码注释的老路, 另辟蹊径选择了基于 <strong>Serializer</strong> 和 <strong>Models</strong> 推导出对应的 API 文档的方案。<br> 与 <em>apidoc</em> 等基于<strong>代码注释</strong>的文档自动化生成工具相比, <strong>drf-yasg</strong> 具有以下的优势:</p><ul><li>组件复用, 避免多处重复定义相同的数据结构 <ul><li>e.g. <strong>drf-yasg</strong> 复用了 <strong>Serializer</strong> 和 <strong>Models</strong> 中的类型描述符, 避免在代码注释中重复定义相同的数据结构</li></ul></li><li>敏捷开发, 避免花大量精力在维护接口文档上 <ul><li>e.g. 使用 <strong>Serializer</strong> 和 <strong>Models</strong> 进行自动化文档生成, 可以在修改代码的同时, 自动更新相对于的接口文档</li></ul></li><li>统一文档规范 <ul><li>e.g. 目前自动生成的文档符合 <strong>Swagger/OpenAPI</strong> 规范</li></ul></li></ul><h3 id="dataclass-与-drf-serializer-存在的不足" tabindex="-1"><a class="header-anchor" href="#dataclass-与-drf-serializer-存在的不足"><span><strong>dataclass</strong> 与 <strong>drf-Serializer</strong> 存在的不足</span></a></h3><p>众所周知, Python语言是动态脚本语言, 为了应付日益复杂的工程项目, Python 引入了 <strong>Type Hints</strong> 等规范解决了返回值和变量类型的不确定性。<br> 对于<em>成熟/工程化</em>的项目而言, 都不会推荐直接将 <strong>dict</strong> 用作函数的入参和返回值; 相对的, 一般都会将所需的数据结构进行抽象建模, 转换为具有一定语义性的 Python 对象, 常见的用法就是使用 <strong>dataclass</strong> 进行建模。</p><blockquote><p>对于简单的数据建模而言, 轻量级的 <strong>dataclass</strong> 能做到开箱即用, 但是正由于 PEP 过于保守, 过于轻量的 <strong>dataclass</strong> 不能满足 Web 项目开发的基础需求:</p><ul><li>dataclass 不支持序列化成 json</li><li>dataclass 不支持类型校验</li><li>dataclass 不支持文档生成</li></ul></blockquote><p>我们知道, 定义 <strong>dataclass</strong> 时已经描述了数据结构的类型, 但是为了实现<strong>序列化</strong>、<strong>类型校验</strong>和<strong>文档生成</strong>等功能, 我们又要为此特地编写繁琐的 <strong>Serializer</strong>, 这显而易见的违背了我们的初衷: <strong>组件复用</strong>。<br> 同时, 这个额外编写的 <strong>Serializer</strong> 用处很有限, 很可能会用于也仅用于做数据的序列化/类型校验操作, 转换输出的结果是 <strong>Dict</strong> 或 <strong>List</strong>, 处理产物无法用于 <strong>Type Hint</strong>, 注定了只能在视图函数中使用, 不能将其复用到后端的其他逻辑上去。<br> 最后, 抛开 <strong>Serializer</strong> 繁琐累赘的语法不提, 将 <strong>dataclass</strong> 与 <strong>Serializer</strong> 结合使用, 虽然一定程度上弥补了 <strong>dataclass</strong> 的短板, 但是项目里往往会出现 <strong>成双成对</strong> 的 <strong>dataclass</strong> 和 <strong>Serializer</strong>。</p><p>如果能将两者合二为一, 即能通过一个类就实现<strong>数据建模</strong>、<strong>序列化</strong>、<strong>类型校验</strong>和<strong>文档生成</strong>, 这将能节省很大的代码量。当我在机缘巧合之下接触到 <strong>pydantic</strong> 这个项目, 总有一种相见恨晚的感觉。</p><blockquote><p>虽然 <strong>dataclass</strong> 有所不足, 但是 <strong>drf-Serializer</strong> 也足以弥补起短板, 如果不想额外引入 <strong>pydantic</strong>, 事实上<strong>dataclass</strong> × <strong>Serializer</strong> 也能满足项目开发的需求。</p></blockquote><h3 id="pydantic-解放了生产力" tabindex="-1"><a class="header-anchor" href="#pydantic-解放了生产力"><span>pydantic 解放了生产力</span></a></h3><p>pydantic 支持使用 <strong>Type Hints</strong> 进行数据建模, 同时其也实现了<strong>序列化</strong>和<strong>类型校验</strong>的功能, 更重要的是, 它原生支持了 <strong>Swagger/OpenAPI</strong> 规范。</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>import datetime
from typing import List
from pydantic import BaseModel


class Comment(BaseModel):
    title: str
    content: str
    author: str
    created: datetime.datetime
    updated: datetime.datetime


class Post(BaseModel):
    title: str
    content: str
    author: str
    created: datetime.datetime
    updated: datetime.datetime
    visit: int
    comments: List[Comment]


## 数据校验
post = Post(title=&quot;title&quot;, 
            content=&quot;content&quot;, 
            author=&quot;author&quot;, 
            created=datetime.datetime.min,
            updated=datetime.datetime.min,
            visit=&quot;9&quot;,
            comments=[
              dict(title=&quot;title&quot;, content=&quot;content&quot;, author=&quot;author&quot;,
                   created=datetime.datetime.min, updated=datetime.datetime.min,)
            ])
&gt;&gt;&gt; post
Post(title=&#39;title&#39;, content=&#39;content&#39;, author=&#39;author&#39;, created=datetime.datetime(1, 1, 1, 0, 0), updated=datetime.datetime(1, 1, 1, 0, 0), visit=9, comments=[Comment(title=&#39;title&#39;, content=&#39;content&#39;, author=&#39;author&#39;, created=datetime.datetime(1, 1, 1, 0, 0), updated=datetime.datetime(1, 1, 1, 0, 0))])

## 序列化
&gt;&gt;&gt; post.json()
&#39;{&quot;title&quot;: &quot;title&quot;, &quot;content&quot;: &quot;content&quot;, &quot;author&quot;: &quot;author&quot;, &quot;created&quot;: &quot;0001-01-01T00:00:00&quot;, &quot;updated&quot;: &quot;0001-01-01T00:00:00&quot;, &quot;visit&quot;: 9, &quot;comments&quot;: [{&quot;title&quot;: &quot;title&quot;, &quot;content&quot;: &quot;content&quot;, &quot;author&quot;: &quot;author&quot;, &quot;created&quot;: &quot;0001-01-01T00:00:00&quot;, &quot;updated&quot;: &quot;0001-01-01T00:00:00&quot;}]}&#39;
&gt;&gt;&gt; post.dict()
{&#39;title&#39;: &#39;title&#39;, &#39;content&#39;: &#39;content&#39;, &#39;author&#39;: &#39;author&#39;, &#39;created&#39;: datetime.datetime(1, 1, 1, 0, 0), &#39;updated&#39;: datetime.datetime(1, 1, 1, 0, 0), &#39;visit&#39;: 9, &#39;comments&#39;: [{&#39;title&#39;: &#39;title&#39;, &#39;content&#39;: &#39;content&#39;, &#39;author&#39;: &#39;author&#39;, &#39;created&#39;: datetime.datetime(1, 1, 1, 0, 0), &#39;updated&#39;: datetime.datetime(1, 1, 1, 0, 0)}]}

## 原生支持 **Swagger/OpenAPI** 规范
&gt;&gt;&gt; post.schema()
{&#39;title&#39;: &#39;Post&#39;, &#39;type&#39;: &#39;object&#39;, &#39;properties&#39;: {&#39;title&#39;: {&#39;title&#39;: &#39;Title&#39;, &#39;type&#39;: &#39;string&#39;}, &#39;content&#39;: {&#39;title&#39;: &#39;Content&#39;, &#39;type&#39;: &#39;string&#39;}, &#39;author&#39;: {&#39;title&#39;: &#39;Author&#39;, &#39;type&#39;: &#39;string&#39;}, &#39;created&#39;: {&#39;title&#39;: &#39;Created&#39;, &#39;type&#39;: &#39;string&#39;, &#39;format&#39;: &#39;date-time&#39;}, &#39;updated&#39;: {&#39;title&#39;: &#39;Updated&#39;, &#39;type&#39;: &#39;string&#39;, &#39;format&#39;: &#39;date-time&#39;}, &#39;visit&#39;: {&#39;title&#39;: &#39;Visit&#39;, &#39;type&#39;: &#39;integer&#39;}, &#39;comments&#39;: {&#39;title&#39;: &#39;Comments&#39;, &#39;type&#39;: &#39;array&#39;, &#39;items&#39;: {&#39;$ref&#39;: &#39;#/definitions/Comment&#39;}}}, &#39;required&#39;: [&#39;title&#39;, &#39;content&#39;, &#39;author&#39;, &#39;created&#39;, &#39;updated&#39;, &#39;visit&#39;, &#39;comments&#39;], &#39;definitions&#39;: {&#39;Comment&#39;: {&#39;title&#39;: &#39;Comment&#39;, &#39;type&#39;: &#39;object&#39;, &#39;properties&#39;: {&#39;title&#39;: {&#39;title&#39;: &#39;Title&#39;, &#39;type&#39;: &#39;string&#39;}, &#39;content&#39;: {&#39;title&#39;: &#39;Content&#39;, &#39;type&#39;: &#39;string&#39;}, &#39;author&#39;: {&#39;title&#39;: &#39;Author&#39;, &#39;type&#39;: &#39;string&#39;}, &#39;created&#39;: {&#39;title&#39;: &#39;Created&#39;, &#39;type&#39;: &#39;string&#39;, &#39;format&#39;: &#39;date-time&#39;}, &#39;updated&#39;: {&#39;title&#39;: &#39;Updated&#39;, &#39;type&#39;: &#39;string&#39;, &#39;format&#39;: &#39;date-time&#39;}}, &#39;required&#39;: [&#39;title&#39;, &#39;content&#39;, &#39;author&#39;, &#39;created&#39;, &#39;updated&#39;]}}}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="当-pydantic-遇上了-drf-yasg" tabindex="-1"><a class="header-anchor" href="#当-pydantic-遇上了-drf-yasg"><span>当 pydantic 遇上了 drf-yasg</span></a></h3><p>事实上 drf 框架本身就提供了基础的 API 文档生成能力, 但是 drf-yasg 在其基础上完善了对 Serializers 的支持, 使得可以通过 Serializers 输出 <strong>Swagger/OpenAPI 2.0</strong> 的文档。<br> 既然 <strong>pydantic</strong> 原生支持 <strong>Swagger/OpenAPI</strong> 规范, 只需要经过恰当改造, <strong>drf-yasg</strong> 理论上是能直接<strong>复用 pydantic 模型</strong>来生成 API 文档的。恰好 <strong>drf-yasg</strong> 能在配置文件中自定义 <code>SwaggerAutoSchema</code>, 只需要重载对应的逻辑, 即可实现所需的功能。</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>## IN somewhere
## -*- coding: utf-8 -*-
from drf_yasg import openapi
from drf_yasg.inspectors import SwaggerAutoSchema
from pydantic import BaseModel


class ExtraDefinitionsInspectorMixin:
    &quot;&quot;&quot;把自定义Responses中的schema definition添加到全局的Definitions&quot;&quot;&quot;

    def get_response_serializers(self):
        overrides_responses = self.overrides.get(&quot;responses&quot;, None)
        if overrides_responses:
            for sc, resp in overrides_responses.items():
                ## 判断是否继承自 BaseModel
                if issubclass(resp, BaseModel):
                    ## 得益于 pydantic 原生支持 Swagger/OpenAPI 规范, 这里的类型转换完全兼容
                    schema = openapi.Schema(**resp.schema())
                    overrides_responses[sc] = schema
                    if &quot;definitions&quot; in schema:
                        ## drf_yasg 目前只能获取 serializers 的 definitions
                        ## 因此需要在这里补上 pydantic 的 definitions
                        self.components[&quot;definitions&quot;].update(schema[&quot;definitions&quot;])

        return super().get_response_serializers()


class BaseModelRequestBodyInspectorMixin:
    &quot;&quot;&quot;将 swagger_auto_schema 中继承自 pydantic.BaseModel 的 request_body 转换成 drf_yasg.openapi.Schema&quot;&quot;&quot;

    def _get_request_body_override(self):
        body_override = self.overrides.get(&#39;request_body&#39;, None)
        ## 判断是否继承自 BaseModel
        if body_override and issubclass(body_override, BaseModel):
            ## 得益于 pydantic 原生支持 Swagger/OpenAPI 规范, 这里的类型转换完全兼容
            schema = openapi.Schema(**body_override.schema())
            if &quot;definitions&quot; in schema:
                ## drf_yasg 目前只能获取 serializers 的 definitions
                ## 因此需要在这里补上 pydantic 的 definitions
                self.components[&quot;definitions&quot;].update(schema[&quot;definitions&quot;])
            return schema
        return super()._get_request_body_override()


class ExtendedSwaggerAutoSchema(BaseModelRequestBodyInspectorMixin, ExtraDefinitionsInspectorMixin, SwaggerAutoSchema):
    &quot;&quot;&quot;自定义的 schema 生成器&quot;&quot;&quot;

...
## IN settings.py
## 自定义 drf-yasf 配置
SWAGGER_SETTINGS = {
  ...
  &#39;DEFAULT_AUTO_SCHEMA_CLASS&#39;: &#39;somewhere.ExtendedSwaggerAutoSchema&#39;,
  ...
}

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="项目场景" tabindex="-1"><a class="header-anchor" href="#项目场景"><span>项目场景</span></a></h3><p>在实际开发中, 可以完全使用 <strong>pydantic</strong> 取代了 <strong>dataclass</strong> 和 <strong>drf-Serializer</strong>，也可以只使用 <strong>pydantic</strong> 进行取代 <strong>dataclass</strong> 进行数据建模, 省去了编写 <strong>Serializer</strong> 的开销。</p><h4 id="经验分享" tabindex="-1"><a class="header-anchor" href="#经验分享"><span>经验分享</span></a></h4><h5 id="自定义返回值结构-全局" tabindex="-1"><a class="header-anchor" href="#自定义返回值结构-全局"><span>自定义返回值结构[全局]</span></a></h5><p>在 <strong>career</strong> 项目中, 整个项目定义了特地的返回值结构, 形如:</p><div class="language-yaml line-numbers-mode" data-ext="yml" data-title="yml"><pre class="language-yaml"><code>Response:
  result: bool
  data: Any
  code: Enum
  message: str
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>由于 career 项目是通过实现自定义Reponse类达到对返回值的再封装, 同时又由于具有 Any 类型, 针对每个接口的返回类型都需要定制的调整，因此项目里借助了 pydantic 优秀特性, 轻易实现了自定义Response结构的文档生成功能。</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>import copy
from typing import Any

from pydantic import BaseModel
from drf_yasg.inspectors import SwaggerAutoSchema
from drf_yasg import openapi

from .errors import ErrorCode


class SpecificationResponse(BaseModel):
    result: bool
    data: Any
    ## 能直接支持枚举类
    code: ErrorCode
    message: str


class SpecificationResponseInspector(SwaggerAutoSchema):
    &quot;&quot;&quot;将 Response 的 schema 修改成规范中的格式
    &quot;&quot;&quot;

    def get_responses(self):
        raw_responses = super().get_responses()
        for sc, response in raw_responses.items():
            if &quot;schema&quot; in response:
                ## 保存原 Response 的 schema 
                data_schema = response[&quot;schema&quot;].as_odict()
                ## 使用 \`SpecificationResponse\` 的 schema 覆盖
                response[&quot;schema&quot;] = openapi.Schema(
                    **copy.deepcopy(SpecificationResponse.schema())
                )
                ## 将原 Response 的 schema 直接放在 \`data\` 上
                response[&quot;schema&quot;][&quot;properties&quot;][&quot;data&quot;] = data_schema
                if &quot;definitions&quot; in response[&quot;schema&quot;]:
                    self.components[&quot;definitions&quot;].update(
                        response[&quot;schema&quot;][&quot;definitions&quot;]
                    )
            else:
                response[&quot;schema&quot;] = openapi.Schema(**SpecificationResponse.schema())

        return raw_responses

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h5 id="支持-多层级取值-和-函数动态取值" tabindex="-1"><a class="header-anchor" href="#支持-多层级取值-和-函数动态取值"><span>支持 <strong>多层级取值</strong> 和 <strong>函数动态取值</strong></span></a></h5><p>我们知道, <strong>drf-Serializer</strong> 在设计之初是为了序列化 <strong>Models</strong>, 因此在<strong>对象取值</strong>上做了很大功夫, <strong>Serializer</strong>支持通过设置<code>source</code>属性来指定对应数据的来源, 数据来源可以是另外一个字段或者是从更深的层级取值, 甚至还支持从对象方法中取值。<br> 然而, pydantic 在设计上并未考虑到层级对象或函数来源取值的问题, 对于需要<strong>多层级取值</strong>或<strong>函数动态取值</strong>的场景会明显吃力。<br> 不过所幸的是, 由于 <strong>pydantic</strong> 对于在支持 orm 方面上是留了一手的, 目前来可以通过自定义 <code>GetterDict</code> 来实现</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>from typing import Any
from pydantic.utils import GetterDict
from pydantic import BaseModel, Field
from rest_framework.fields import get_attribute

class ExtendedGetterDict(GetterDict):
    def get(self, key: str, default: Any = None) -&gt; Any:
        try:
            return get_attribute(self._obj, key.split(&quot;.&quot;))
        except:
            return default


class Test(BaseModel):
    a: int
    b: int = Field(..., alias=&quot;B&quot;)
    c: int = Field(..., alias=&quot;get_c&quot;)
    d: int = Field(..., alias=&quot;d.d&quot;)

    class Config:
        orm_mode = True
        getter_dict = ExtendedGetterDict


class D(BaseModel):
    d: int = 4


class TestClass:
    a: int = 1
    B: int = 2
    orther: int = 3
    d: D = D()
    def get_c(self):
        return 3


&gt;&gt;&gt; Test.from_orm(TestClass())
Test(a=1, b=2, c=3, d=4)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="短板和不足" tabindex="-1"><a class="header-anchor" href="#短板和不足"><span>短板和不足</span></a></h4><h5 id="自定义返回值结构-局部" tabindex="-1"><a class="header-anchor" href="#自定义返回值结构-局部"><span>自定义返回值结构[局部]</span></a></h5><p>由于不知道什么原因, PaaSNG 某些功能的接口具有自定义的返回值结构, 例如最近在重构的日志搜索功能, 所有接口都被封装成:</p><div class="language-yaml line-numbers-mode" data-ext="yml" data-title="yml"><pre class="language-yaml"><code>Response:
    code: int
    data: Any
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>虽然针对全局的返回值结构能够通过全局的中间件做统一处理, 但是若某些 API 接口由于某些原因需要定义不一样的结构时, 按照目前的方案就无法兼顾的, 目前有个想法是扩展 <strong>drf-yasg</strong> 的 <strong>overrides</strong> 协议, 使其支持局部的自定义返回值结构。</p>`,31);function x(I,C){const i=d("ExternalLinkIcon");return r(),l("div",null,[c,u,e("p",null,[n("前段时间介绍过 "),v,n(" 这款 API 文档自动生成工具, 对于 "),m,n(", drf-yasg 能够自动探测并生成对应的 "),p,n(", 但是随着项目功能的丰富, 返回值的对象结构往往会更加复杂, 这时候只能定义一大坨累赘用于描述数据结构的 "),g,n(" 。"),b,n(" 另一方面, 随着 "),e("strong",null,[e("a",h,[n("PEP 484 -- Type Hints"),s(i)])]),n(" 的提出, Python 已经支持通过简单的语法进行数据结构描述, 相对于累赘的 "),y,n(" 而言, 完全就是解放生产力的工具, 两者的用法上的相似性可以从以下的代码看出。")]),f,e("blockquote",null,[e("p",null,[n("pydantic 在支持 "),q,n(" 进行类型注解的同时, 还具备了 "),_,n(" 提供的 "),S,n(", "),A,n(" 功能, "),e("a",P,[n("性能"),s(i)]),n("也更加优秀, 更重要的是, 它原生支持了 "),T,n(" 规范, 能够用于 "),w,n(" 文档生成。")])]),z])}const k=a(o,[["render",x],["__file","pydantic-with-drf-yasg.html.vue"]]),D=JSON.parse('{"path":"/posts/2020/04/16/pydantic-with-drf-yasg.html","title":"pydantic × drf-yasg, 使用 pydantic 简化 API 文档生成的思路","lang":"zh-CN","frontmatter":{"draft":false,"permalinkPattern":"/posts/:year/:month/:day/:slug.html","type":"post","filePathRelative":"_posts/python/2020-04-16-pydantic-with-drf-yasg.md","date":"2020-04-16T00:00:00.000Z","title":"pydantic × drf-yasg, 使用 pydantic 简化 API 文档生成的思路","sidebarDepth":5,"category":"python","tags":["python","drf-yasg","pydantic","docs"],"feed":{"description":"本文分享了使用 pydantic 完成 drf 文档自动生成的思路和代码实现。\\n"},"description":"使用 pydantic 简化 API 文档生成的思路 前言-Type Hints简介 前段时间介绍过 dry-yasg 这款 API 文档自动生成工具, 对于 Django Models, drf-yasg 能够自动探测并生成对应的 Schema, 但是随着项目功能的丰富, 返回值的对象结构往往会更加复杂, 这时候只能定义一大坨累赘用于描述数据结构的 ...","head":[["meta",{"property":"og:url","content":"https://blog.shabbywu.cn/posts/2020/04/16/pydantic-with-drf-yasg.html"}],["meta",{"property":"og:site_name","content":"个人技术文章分享"}],["meta",{"property":"og:title","content":"pydantic × drf-yasg, 使用 pydantic 简化 API 文档生成的思路"}],["meta",{"property":"og:description","content":"使用 pydantic 简化 API 文档生成的思路 前言-Type Hints简介 前段时间介绍过 dry-yasg 这款 API 文档自动生成工具, 对于 Django Models, drf-yasg 能够自动探测并生成对应的 Schema, 但是随着项目功能的丰富, 返回值的对象结构往往会更加复杂, 这时候只能定义一大坨累赘用于描述数据结构的 ..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-02-24T07:10:47.000Z"}],["meta",{"property":"article:author","content":"shabbywu"}],["meta",{"property":"article:tag","content":"python"}],["meta",{"property":"article:tag","content":"drf-yasg"}],["meta",{"property":"article:tag","content":"pydantic"}],["meta",{"property":"article:tag","content":"docs"}],["meta",{"property":"article:published_time","content":"2020-04-16T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-02-24T07:10:47.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"pydantic × drf-yasg, 使用 pydantic 简化 API 文档生成的思路\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2020-04-16T00:00:00.000Z\\",\\"dateModified\\":\\"2024-02-24T07:10:47.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"shabbywu\\",\\"url\\":\\"https://github.com/shabbywu\\"}]}"],["link",{"rel":"alternate","type":"application/atom+xml","href":"https://blog.shabbywu.cn/atom.xml","title":"个人技术文章分享 Atom Feed"}],["link",{"rel":"alternate","type":"application/json","href":"https://blog.shabbywu.cn/feed.json","title":"个人技术文章分享 JSON Feed"}],["link",{"rel":"alternate","type":"application/rss+xml","href":"https://blog.shabbywu.cn/rss.xml","title":"个人技术文章分享 RSS Feed"}]]},"headers":[{"level":2,"title":"使用 pydantic 简化 API 文档生成的思路","slug":"使用-pydantic-简化-api-文档生成的思路","link":"#使用-pydantic-简化-api-文档生成的思路","children":[{"level":3,"title":"前言-Type Hints简介","slug":"前言-type-hints简介","link":"#前言-type-hints简介","children":[]},{"level":3,"title":"回顾初衷-为何选择 drf-yasg","slug":"回顾初衷-为何选择-drf-yasg","link":"#回顾初衷-为何选择-drf-yasg","children":[]},{"level":3,"title":"dataclass 与 drf-Serializer 存在的不足","slug":"dataclass-与-drf-serializer-存在的不足","link":"#dataclass-与-drf-serializer-存在的不足","children":[]},{"level":3,"title":"pydantic 解放了生产力","slug":"pydantic-解放了生产力","link":"#pydantic-解放了生产力","children":[]},{"level":3,"title":"当 pydantic 遇上了 drf-yasg","slug":"当-pydantic-遇上了-drf-yasg","link":"#当-pydantic-遇上了-drf-yasg","children":[]},{"level":3,"title":"项目场景","slug":"项目场景","link":"#项目场景","children":[]}]}],"readingTime":{"minutes":9.42,"words":2826},"filePathRelative":"_posts/python/2020-04-16-pydantic-with-drf-yasg.md","localizedDate":"2020年4月16日","autoDesc":true,"git":{"createdTime":1708758647000,"updatedTime":1708758647000,"contributors":[{"name":"shabbywu","email":"shabbywu@tencent.com","commits":1}]}}');export{k as comp,D as data};
