---
date: 2020-04-16
title: pydantic × drf-yasg, 使用 pydantic 简化 API 文档生成的思路
sidebarDepth: 5
category: python
tags:
-   python
-   drf-yasg
-   pydantic
-   docs

draft: false
feed:
    description: |
        本文分享了使用 pydantic 完成 drf 文档自动生成的思路和代码实现。
---
## 使用 pydantic 简化 API 文档生成的思路
### 前言-Type Hints简介
前段时间介绍过 **dry-yasg** 这款 API 文档自动生成工具, 对于 **Django Models**, drf-yasg 能够自动探测并生成对应的 **Schema**, 但是随着项目功能的丰富, 返回值的对象结构往往会更加复杂, 这时候只能定义一大坨累赘用于描述数据结构的 **Serializer** 。   
另一方面, 随着 **[PEP 484 -- Type Hints](https://www.python.org/dev/peps/pep-0484/)** 的提出, Python 已经支持通过简单的语法进行数据结构描述, 相对于累赘的 **Serializer** 而言, 完全就是解放生产力的工具, 两者的用法上的相似性可以从以下的代码看出。
```python
## Type Hints 与 Serializer 的对比
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
```
从上面的代码可以看出, 由于 **Type Hints** 有官方的支持, 语法比起 **Serializer** 而言要简单许多, 美中不足的只有官方实现的 **dataclass** 并不支持序列化。   
如果项目里已经有使用 **Type Hints** 进行数据建模, 同时又需要使用 **Serializer** 做参数校验和序列化操作, 这个时候就可以尝试使用 **pydantic** 解放自己的双手。   
> pydantic 在支持 **Type Hints** 进行类型注解的同时, 还具备了 **Serializer** 提供的 **序列化**, **类型校验** 功能, [性能](https://pydantic-docs.helpmanual.io/benchmarks/)也更加优秀, 更重要的是, 它原生支持了 **Swagger/OpenAPI** 规范, 能够用于 **Swagger API** 文档生成。

### 回顾初衷-为何选择 **drf-yasg**
常见的文档自动化生成工具都是基于代码注释进行的, 而 **drf-yasg** 并没有走代码注释的老路, 另辟蹊径选择了基于 **Serializer** 和 **Models** 推导出对应的 API 文档的方案。   
与 *apidoc* 等基于**代码注释**的文档自动化生成工具相比, **drf-yasg** 具有以下的优势:

- 组件复用, 避免多处重复定义相同的数据结构
  - e.g. **drf-yasg** 复用了 **Serializer** 和 **Models** 中的类型描述符, 避免在代码注释中重复定义相同的数据结构
- 敏捷开发, 避免花大量精力在维护接口文档上
  - e.g. 使用 **Serializer** 和 **Models** 进行自动化文档生成, 可以在修改代码的同时, 自动更新相对于的接口文档
- 统一文档规范
  - e.g. 目前自动生成的文档符合 **Swagger/OpenAPI** 规范

### **dataclass** 与 **drf-Serializer** 存在的不足
众所周知, Python语言是动态脚本语言, 为了应付日益复杂的工程项目, Python 引入了 **Type Hints** 等规范解决了返回值和变量类型的不确定性。   
对于*成熟/工程化*的项目而言, 都不会推荐直接将 **dict** 用作函数的入参和返回值; 相对的, 一般都会将所需的数据结构进行抽象建模, 转换为具有一定语义性的 Python 对象, 常见的用法就是使用 **dataclass** 进行建模。

> 对于简单的数据建模而言, 轻量级的 **dataclass** 能做到开箱即用, 但是正由于 PEP 过于保守, 过于轻量的 **dataclass** 不能满足 Web 项目开发的基础需求:
>  - dataclass 不支持序列化成 json
>  - dataclass 不支持类型校验
>  - dataclass 不支持文档生成
 
我们知道, 定义 **dataclass** 时已经描述了数据结构的类型, 但是为了实现**序列化**、**类型校验**和**文档生成**等功能, 我们又要为此特地编写繁琐的 **Serializer**, 这显而易见的违背了我们的初衷: **组件复用**。   
同时, 这个额外编写的 **Serializer** 用处很有限, 很可能会用于也仅用于做数据的序列化/类型校验操作, 转换输出的结果是 **Dict** 或 **List**, 处理产物无法用于 **Type Hint**, 注定了只能在视图函数中使用, 不能将其复用到后端的其他逻辑上去。   
最后, 抛开 **Serializer** 繁琐累赘的语法不提, 将 **dataclass** 与 **Serializer** 结合使用, 虽然一定程度上弥补了 **dataclass** 的短板, 但是项目里往往会出现 **成双成对** 的 **dataclass** 和 **Serializer**。

如果能将两者合二为一, 即能通过一个类就实现**数据建模**、**序列化**、**类型校验**和**文档生成**, 这将能节省很大的代码量。当我在机缘巧合之下接触到 **pydantic** 这个项目, 总有一种相见恨晚的感觉。
> 虽然 **dataclass** 有所不足, 但是 **drf-Serializer** 也足以弥补起短板, 如果不想额外引入 **pydantic**, 事实上**dataclass** × **Serializer** 也能满足项目开发的需求。  

### pydantic 解放了生产力
pydantic 支持使用 **Type Hints** 进行数据建模, 同时其也实现了**序列化**和**类型校验**的功能, 更重要的是, 它原生支持了 **Swagger/OpenAPI** 规范。
```python
import datetime
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
post = Post(title="title", 
            content="content", 
            author="author", 
            created=datetime.datetime.min,
            updated=datetime.datetime.min,
            visit="9",
            comments=[
              dict(title="title", content="content", author="author",
                   created=datetime.datetime.min, updated=datetime.datetime.min,)
            ])
>>> post
Post(title='title', content='content', author='author', created=datetime.datetime(1, 1, 1, 0, 0), updated=datetime.datetime(1, 1, 1, 0, 0), visit=9, comments=[Comment(title='title', content='content', author='author', created=datetime.datetime(1, 1, 1, 0, 0), updated=datetime.datetime(1, 1, 1, 0, 0))])

## 序列化
>>> post.json()
'{"title": "title", "content": "content", "author": "author", "created": "0001-01-01T00:00:00", "updated": "0001-01-01T00:00:00", "visit": 9, "comments": [{"title": "title", "content": "content", "author": "author", "created": "0001-01-01T00:00:00", "updated": "0001-01-01T00:00:00"}]}'
>>> post.dict()
{'title': 'title', 'content': 'content', 'author': 'author', 'created': datetime.datetime(1, 1, 1, 0, 0), 'updated': datetime.datetime(1, 1, 1, 0, 0), 'visit': 9, 'comments': [{'title': 'title', 'content': 'content', 'author': 'author', 'created': datetime.datetime(1, 1, 1, 0, 0), 'updated': datetime.datetime(1, 1, 1, 0, 0)}]}

## 原生支持 **Swagger/OpenAPI** 规范
>>> post.schema()
{'title': 'Post', 'type': 'object', 'properties': {'title': {'title': 'Title', 'type': 'string'}, 'content': {'title': 'Content', 'type': 'string'}, 'author': {'title': 'Author', 'type': 'string'}, 'created': {'title': 'Created', 'type': 'string', 'format': 'date-time'}, 'updated': {'title': 'Updated', 'type': 'string', 'format': 'date-time'}, 'visit': {'title': 'Visit', 'type': 'integer'}, 'comments': {'title': 'Comments', 'type': 'array', 'items': {'$ref': '#/definitions/Comment'}}}, 'required': ['title', 'content', 'author', 'created', 'updated', 'visit', 'comments'], 'definitions': {'Comment': {'title': 'Comment', 'type': 'object', 'properties': {'title': {'title': 'Title', 'type': 'string'}, 'content': {'title': 'Content', 'type': 'string'}, 'author': {'title': 'Author', 'type': 'string'}, 'created': {'title': 'Created', 'type': 'string', 'format': 'date-time'}, 'updated': {'title': 'Updated', 'type': 'string', 'format': 'date-time'}}, 'required': ['title', 'content', 'author', 'created', 'updated']}}}
```

### 当 pydantic 遇上了 drf-yasg
事实上 drf 框架本身就提供了基础的 API 文档生成能力, 但是 drf-yasg 在其基础上完善了对 Serializers 的支持, 使得可以通过 Serializers 输出 **Swagger/OpenAPI 2.0** 的文档。   
既然 **pydantic** 原生支持 **Swagger/OpenAPI** 规范, 只需要经过恰当改造, **drf-yasg** 理论上是能直接**复用 pydantic 模型**来生成 API 文档的。恰好 **drf-yasg** 能在配置文件中自定义 `SwaggerAutoSchema`, 只需要重载对应的逻辑, 即可实现所需的功能。
```python
## IN somewhere
## -*- coding: utf-8 -*-
from drf_yasg import openapi
from drf_yasg.inspectors import SwaggerAutoSchema
from pydantic import BaseModel


class ExtraDefinitionsInspectorMixin:
    """把自定义Responses中的schema definition添加到全局的Definitions"""

    def get_response_serializers(self):
        overrides_responses = self.overrides.get("responses", None)
        if overrides_responses:
            for sc, resp in overrides_responses.items():
                ## 判断是否继承自 BaseModel
                if issubclass(resp, BaseModel):
                    ## 得益于 pydantic 原生支持 Swagger/OpenAPI 规范, 这里的类型转换完全兼容
                    schema = openapi.Schema(**resp.schema())
                    overrides_responses[sc] = schema
                    if "definitions" in schema:
                        ## drf_yasg 目前只能获取 serializers 的 definitions
                        ## 因此需要在这里补上 pydantic 的 definitions
                        self.components["definitions"].update(schema["definitions"])

        return super().get_response_serializers()


class BaseModelRequestBodyInspectorMixin:
    """将 swagger_auto_schema 中继承自 pydantic.BaseModel 的 request_body 转换成 drf_yasg.openapi.Schema"""

    def _get_request_body_override(self):
        body_override = self.overrides.get('request_body', None)
        ## 判断是否继承自 BaseModel
        if body_override and issubclass(body_override, BaseModel):
            ## 得益于 pydantic 原生支持 Swagger/OpenAPI 规范, 这里的类型转换完全兼容
            schema = openapi.Schema(**body_override.schema())
            if "definitions" in schema:
                ## drf_yasg 目前只能获取 serializers 的 definitions
                ## 因此需要在这里补上 pydantic 的 definitions
                self.components["definitions"].update(schema["definitions"])
            return schema
        return super()._get_request_body_override()


class ExtendedSwaggerAutoSchema(BaseModelRequestBodyInspectorMixin, ExtraDefinitionsInspectorMixin, SwaggerAutoSchema):
    """自定义的 schema 生成器"""

...
## IN settings.py
## 自定义 drf-yasf 配置
SWAGGER_SETTINGS = {
  ...
  'DEFAULT_AUTO_SCHEMA_CLASS': 'somewhere.ExtendedSwaggerAutoSchema',
  ...
}

```
### 项目场景
在实际开发中, 可以完全使用 **pydantic** 取代了 **dataclass** 和 **drf-Serializer**，也可以只使用 **pydantic** 进行取代 **dataclass** 进行数据建模, 省去了编写 **Serializer** 的开销。
#### 经验分享
##### 自定义返回值结构[全局]
在 **career** 项目中, 整个项目定义了特地的返回值结构, 形如:
```yaml
Response:
  result: bool
  data: Any
  code: Enum
  message: str
```
由于 career 项目是通过实现自定义Reponse类达到对返回值的再封装, 同时又由于具有 Any 类型, 针对每个接口的返回类型都需要定制的调整，因此项目里借助了 pydantic 优秀特性, 轻易实现了自定义Response结构的文档生成功能。
```python []
import copy
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
    """将 Response 的 schema 修改成规范中的格式
    """

    def get_responses(self):
        raw_responses = super().get_responses()
        for sc, response in raw_responses.items():
            if "schema" in response:
                ## 保存原 Response 的 schema 
                data_schema = response["schema"].as_odict()
                ## 使用 `SpecificationResponse` 的 schema 覆盖
                response["schema"] = openapi.Schema(
                    **copy.deepcopy(SpecificationResponse.schema())
                )
                ## 将原 Response 的 schema 直接放在 `data` 上
                response["schema"]["properties"]["data"] = data_schema
                if "definitions" in response["schema"]:
                    self.components["definitions"].update(
                        response["schema"]["definitions"]
                    )
            else:
                response["schema"] = openapi.Schema(**SpecificationResponse.schema())

        return raw_responses

```

##### 支持 **多层级取值** 和 **函数动态取值**
我们知道, **drf-Serializer** 在设计之初是为了序列化 **Models**, 因此在**对象取值**上做了很大功夫, **Serializer**支持通过设置`source`属性来指定对应数据的来源, 数据来源可以是另外一个字段或者是从更深的层级取值, 甚至还支持从对象方法中取值。   
然而, pydantic 在设计上并未考虑到层级对象或函数来源取值的问题, 对于需要**多层级取值**或**函数动态取值**的场景会明显吃力。   
不过所幸的是, 由于 **pydantic** 对于在支持 orm 方面上是留了一手的, 目前来可以通过自定义 `GetterDict` 来实现
```python
from typing import Any
from pydantic.utils import GetterDict
from pydantic import BaseModel, Field
from rest_framework.fields import get_attribute

class ExtendedGetterDict(GetterDict):
    def get(self, key: str, default: Any = None) -> Any:
        try:
            return get_attribute(self._obj, key.split("."))
        except:
            return default


class Test(BaseModel):
    a: int
    b: int = Field(..., alias="B")
    c: int = Field(..., alias="get_c")
    d: int = Field(..., alias="d.d")

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


>>> Test.from_orm(TestClass())
Test(a=1, b=2, c=3, d=4)
```

#### 短板和不足
##### 自定义返回值结构[局部]
由于不知道什么原因, PaaSNG 某些功能的接口具有自定义的返回值结构, 例如最近在重构的日志搜索功能, 所有接口都被封装成:
```yaml
Response:
    code: int
    data: Any
```
虽然针对全局的返回值结构能够通过全局的中间件做统一处理, 但是若某些 API 接口由于某些原因需要定义不一样的结构时, 按照目前的方案就无法兼顾的, 目前有个想法是扩展 **drf-yasg** 的 **overrides** 协议, 使其支持局部的自定义返回值结构。