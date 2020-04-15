---
date: 2020-04-15
title: drf-yasg:一款自动生成API文档的工具介绍
sidebarDepth: 5
category: python
tags:
-   python
-   docs

draft: false
---
自动化生成文档的工具有很多, 这里介绍的是一款基于 **Swagger/OpenAPI 2.0** 规范的 API 文档自动化生成工具: **drf-yasg**。
> 如果你不清楚什么是 **Swagger/OpenAPI 2.0** 规范, 没关系, 简单使用这个工具并不需要完全掌握这些规范。
# [drf-yasg](https://drf-yasg.readthedocs.io/en/stable/readme.html) - Yet another Swagger generator
API 文档自动化生成的工具有很多种, 其中大多数都是通过文档注释进行文档自动化生成的(如 APIDOC)。   
然而 drf-yasg 选择了另辟蹊径, 它通过复用 **Serializers** 以及 **Models** 来自动化生成 API 文档。   
> 得益于 drf-yasg 的这项特性, 维护文档注释的工作量将会降低至微乎其微。   
试想一下, 假若需要调整 API 请求参数或返回值结构, 在 coding 时必然会调整对应的 Serializers 或 Models, 这时候自动生成的文档也会同步更新, 这就避免了文档落后于代码的问题。

# [drf-yasg 的使用方法](https://drf-yasg.readthedocs.io/en/stable/readme.html#usage)
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
    # 具体定义详见 [Swagger/OpenAPI规范](https://swagger.io/specification/#infoObject)
    openapi.Info(
        title="Snippets API",
        default_version='v1',
        description="Test description",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@snippets.local"),
        license=openapi.License(name="BSD License"),
    ),
    # public 表示无需鉴权
    public=True,
    # 可以传递 drf 的 BasePermission
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    url(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
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
### a. 1
详细的具体的函数参数解释建议阅读[官方文档](https://drf-yasg.readthedocs.io/en/stable/readme.html#configuration)
