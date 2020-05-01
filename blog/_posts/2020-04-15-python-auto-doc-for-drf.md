---
date: 2020-04-15
title: drf-yasg:一款自动生成API文档的工具介绍
sidebarDepth: 5
category: python
tags:
-   python
-   docs
-   drf-yasg

draft: false
---
自动化生成文档的工具有很多, 这里介绍的是一款基于 **Swagger/OpenAPI 2.0** 规范的 API 文档自动化生成工具: **drf-yasg**。
::: tip
如果你不清楚什么是 **Swagger/OpenAPI 2.0** 规范, 没关系, 简单使用这个工具并不需要完全掌握这些规范。
:::
# [drf-yasg](https://drf-yasg.readthedocs.io/en/stable/readme.html) - Yet another Swagger generator
API 文档自动化生成的工具有很多种, 其中大多数都是通过文档注释进行文档自动化生成的(如 APIDOC)。   
然而 drf-yasg 选择了另辟蹊径, 它通过复用 **Serializers** 以及 **Models** 来自动化生成 API 文档。   
> 得益于 drf-yasg 的这项特性, 维护文档注释的工作量将会降低至微乎其微。   
试想一下, 假若需要调整 API 请求参数或返回值结构, 在 coding 时必然会调整对应的 Serializers 或 Models, 这时候自动生成的文档也会同步更新, 这就避免了文档落后于代码的问题。

# [drf-yasg 的使用方法](https://drf-yasg.readthedocs.io/en/stable/readme.html#usage)
该节参考官方文档编写, 同时针对部分细节做了更详细的解释。
## 0. 安装
在安装前, 建议先了解一下 drf-yasg 对 drf/django/python 各版本的兼容性。   
```yaml
# drf-yasg 兼容性状况
-   Django Rest Framework: 3.8, 3.9, 3.10, 3.11
-   Django: 1.11, 2.2, 3.0
-   Python: 2.7, 3.6, 3.7, 3.8
```
对于兼容的项目, 直接安装 drf-yasg 即可
```bash
pip install -U drf-yasg
```
## 1. 快速开始
首先, 在 django settings 里的 `INSTALLED_APPS` 添加 `drf_yasg`。
```python
# IN YOUR settings.py
INSTALLED_APPS = [
   ...
   'drf_yasg',
   ...
]
随后, 在 django urls 里添加对应的 url路由
```python
# IN YOUR urls.py
...
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

...

schema_view = get_schema_view(
    # 具体定义详见 [Swagger/OpenAPI 规范](https://swagger.io/specification/#infoObject)
    openapi.Info(
        title="Snippets API",
        default_version='v1',
        description="Test description",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@snippets.local"),
        license=openapi.License(name="BSD License"),
    ),
    # public 表示文档完全公开, 无需针对用户鉴权
    public=True,
    # 可以传递 drf 的 BasePermission
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    url(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-spec'),
    url(r'^swagger/$', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    url(r'^redoc/$', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    ...
]
```
drf-yasg 提供 4 种默认路径(endpoints), 分别为:
- `/swagger.json`, JSON 格式的 API 定义
- `/swagger.yaml`, YAML 格式的 API 定义
- `/swagger/`, 基于原生 swagger-ui 样式的前端页面
- `/redoc/`, 基于 ReDoc 样式的前端页面

## 2. 常用配置
这一节简单介绍 **drf-yasg** 的配置参数，其他参数的详细解释建议阅读[官方文档](https://drf-yasg.readthedocs.io/en/stable/readme.html#configuration)
> 如果仅需简单应用, 参考 `1. 快速开始` 配置后即可通过对应的 `endpoints` 访问到自动生成的 API 文档。

### a. `get_schema_view` 的配置
函数 **get_schema_view** 的作用是返回自动生成 API 文档的视图类, 该函数接受以下参数:
- **info**: Swagger API Info 对象, 具体定义详见 [Swagger/OpenAPI 规范](https://swagger.io/specification/#infoObject), 如果缺省, **drf-yasg** 默认会用 `DEFAULT_INFO` 进行填充。
- **url**: 项目API的基础地址, 如果缺省, 则根据视图所在的位置进行推导。
- **patterns**: 自定义的 urlpatterns, 该参数直接透传至 SchemaGenerator。
- **urlconf**: 描述从哪个文件获取路由配置, 缺省值是 "urls", 该参数直接透传至 SchemaGenerator。
- **public**: 描述API文档是否公开, 如果未 `False`, 则仅返回当前用户具有权限的接口(endpoints)的 API 文档。
- **validators**: 用于校验自动生成的 Schema 的校验器, 目前仅支持 `ssv` 和 `flex`。
- **generator_class**: 自定义 OpenAPI schema 生成器类, 该类应该继承自 `OpenAPISchemaGenerator`
- **authentication_classes**: 用于 schema view 进行登录认证的类
- **permission_classes**: 用于 schema view 进行权限校验的类

### b. `SchemaView` 的配置
通过函数 **get_schema_view** 可以获取对应的 **SchemaView**, 调用该类的 **with_ui** 或 **without_ui** 方法可生成对应的**视图函数**, 将其添加进 **urlpatterns** 即可访问到自动生成的 API 文档。
- **SchemaView.with_ui(renderer, cache_timeout, cache_kwargs)**: 返回使用指定 UI 渲染器的视图函数, 可选的 UI 渲染器有: `swagger`, `redoc`。
- **SchemaView.without_ui(cache_timeout, cache_kwargs)**: 返回无 UI 的视图函数, 该函数可以返回 json/yaml 格式的 swagger 文档。

以上两个函数均支持通过 `cache_timeout` 或 `cache_kwargs` 配置缓存参数, 详见下一节。

## 3. 缓存
由于 schema 通常在服务运行期间不会发生改变, 因此 **drf-yasg** 使用 django 内置的 `cache_page` 实现开箱即用的缓存功能, 只需要配置对应的参数即可启用, 对应参数解释如下:   
- **cache_timeout**: 用于指定缓存的生存时间
- **cache_kwargs**: 用于传递 **cache_page** 允许接受的非位置参数, 如 `cache`(指定 cache backend), `key_prefix`(缓存 key 的前缀) 等等, 详见 django 官方文档。

> 需要注意的是, 由于 **drf-yasg** 支持针对不同用户返回不一样的 API 文档(通过**public**、**authentication_classes**、**permission_classes**等参数配置), 因此对于不同用户(通过HTTP 请求头中的 **Cookie** 和 **Authorization** 进行区分), 会在内存中分别进行缓存。

## 4. 校验文档有效性
为保证自动生成文档的有效性, 可以通过在 **get_schema_view** 中设置 `validators` 参数开启校验自动化生成文档是否符合 OpenAPI2.0 规范的功能。
> 该功能可能会降低文档生成的效率, 鉴于 schema 通常在服务运行期间不会发生改变, 该选项可仅在本地开发期间开启。

## 5. 代码自动生成
使用 Swagger/OpenAPI 规范生成文档的好处之一, 就是能通过 API 文档自动生成 **不同语言** 的 SDK，该功能由 **[swagger-codegen](https://github.com/swagger-api/swagger-codegen)** 提供。

# drf-yasg 自动生成 API 文档的流程
虽然在 Django Rest Framework 3.7 已经内置了自动生成 OpenAPI 2.0 Schema 的功能, 但是这个功能实际上是基于 [CoreAPI](https://www.coreapi.org/) 标准, 就功能和社区生态(周边工具)而言, 目前是远不如 [OpenAPI](https://djangoadventures.com/coreapi-vs-openapi/)。   
因此, **drf-yasg** 基于 drf 的路由生成器(EndpointEnumerator), 用 OpenAPI 2.0 规范重新实现了一遍文档生成的流程。   
鉴于文档生成的流程比较复杂, 这里笔者尝试将核心的流程用流程图记录如下。

@startuml
|WebAPI|
partition Init_APIView {
    :get_schema_view;
    :serving;
}
fork 
:userA request;
fork again
:userB request;
end fork
:SchemaView.get()|
detach
:SchemaView.get()|
:init generator(default is **OpanAPISchemaGenerator**);

:call generator.get_schema(request, public);
|#fcefe8|CoreProcess|
    :init_endpoints_enumerator(default is **EndpointEnumerator**.);
    :init_reference_resolvers(default is **ReferenceResolver**.);;
    :init_consumers;
    :init_producers;
    #HotPink:get_endpoints_from_enumerator;
    |#e3f9fd|ImplementationDetail|
    while (no more urlpattern?) is (False)
    :get an urlpattern;
    :get url path from pattern;
    :mark relationshop between path and view as **Endpoint**;
    endwhile
    |CoreProcess|
    #HotPink:get **Path** from endpoint;
    |ImplementationDetail|
    while (no more **EndPoint**?) is (False)
    :get an endpoint;
    :init inspector(default is **SwaggerAutoSchema**);
    :generate operation id;
    :parsing **request body parameters** with **inspector**;
    :parsing **query parameters** with **inspector**;
    :parsing **path parameters**;
    :parsing docstring as description;
    :get tags;
    :parsing **response schema** with **inspector**;
    :assemble **Operation**;
    endwhile
    |CoreProcess|
    
    #c2ccd0:get **SecurityDefinitions**;
    #c2ccd0:parse **SecurityRequirements**;
    :return OpenAPI Document;
|WebAPI|

:render OpenAPI Document with Swagger/Redoc OR return JSON/YAML format str straightly;
end
@enduml

**drf-yasg** 自动生成文档的大致流程如上, 由于如何通过 **inspector** 从 **Endpoint** 解析出 **RequestBodyParameters**、**QueryParameters** 以及 **ResponseSchema** 的流程涉及到较多的 **Swagger/OpenAPI** 规范的知识, 这里的流程图省略了这些实现细节。
::: tip
建议感兴趣的读者先了解 OpenAPI2.0 规范, 再阅读对应的实现源码。
:::

# 结语
得益于 **drf-yasg** 选择了基于 drf-Serializer 和 Model 生成 API 文档, 不但复用了代码组件, 还降低了额外维护一份代码文档的开销成本，虽然文档生成流程中存在写瑕疵, 但瑕不掩瑜, **drf-yasg** 在目前还是 django/drf API 文档自动生成的最好用的工具库。