import{_ as e,o as i,c as n,e as a}from"./app-C9ZkQdtL.js";const s={},l=a(`<h2 id="背景介绍" tabindex="-1"><a class="header-anchor" href="#背景介绍"><span>背景介绍</span></a></h2><h3 id="重构前架构" tabindex="-1"><a class="header-anchor" href="#重构前架构"><span>重构前架构</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>.
├── apiserver &gt; apiserver(paas-ng) 承担与 webfe(UI)、workloads(反向代理) 交互的职责  
├── workloads &gt; workloads(engine-ng) 承担与 k8s/operator 交互的职责  
├── operator &gt; operator 承担云原生应用调度的职责   
└── webfe &gt; UI
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>由于部署相关功能需下沉至 operator, 旧架构中与 operator 交互的功能开发繁琐, 所以需要重构。</p><h3 id="重构目的" tabindex="-1"><a class="header-anchor" href="#重构目的"><span>重构目的</span></a></h3><ol><li>减少无意义的内部接口开发(apiserver 与 workloads 之间通讯的接口)</li><li>降低功能开发的复杂度(workloads 需回调 apiserver 查询应用信息)</li></ol><h2 id="项目合并方案" tabindex="-1"><a class="header-anchor" href="#项目合并方案"><span>项目合并方案</span></a></h2><p>项目合并, 需要合并什么？</p><ul><li>代码</li><li>数据</li></ul><h3 id="_1-代码合并" tabindex="-1"><a class="header-anchor" href="#_1-代码合并"><span>1. 代码合并</span></a></h3><ol><li>蚂蚁搬家, 逐个模块迁移?</li></ol><p>项目合并最大的痛点是要降低云原生应用功能的开发复杂度, 因此代码迁移时首先需要迁移的是云原生应用模块的代码。 然而, 蚂蚁搬家的方案在实施后会发现<strong>实施难度大</strong>, 例如下面是云原生应用模块下的某个文件的 <code>import</code> 语句。</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>## https://github.com/TencentBlueKing/blueking-paas/blob/wl-refactor/workloads/paas_wl/paas_wl/cnative/specs/resource.py
from paas_wl.cnative.specs import credentials
from paas_wl.cnative.specs.addresses import AddrResourceManager, save_addresses
from paas_wl.cnative.specs.constants import (
    IMAGE_CREDENTIALS_REF_ANNO_KEY,
    ConditionStatus,
    DeployStatus,
    MResConditionType,
    MResPhaseType,
)
from paas_wl.cnative.specs.models import default_bkapp_name
from paas_wl.cnative.specs.v1alpha1.bk_app import BkAppResource, MetaV1Condition
from paas_wl.platform.applications.models import EngineApp
from paas_wl.platform.applications.struct_models import ModuleEnv
from paas_wl.resources.base import crd
from paas_wl.resources.base.exceptions import ResourceMissing
from paas_wl.resources.base.kres import KNamespace
from paas_wl.resources.utils.basic import get_client_by_env
from paas_wl.workloads.images.entities import ImageCredentials
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>代码之间的互相引用简直是牵一发动全身，如果要完整迁移 <code>resource.py</code> 这个文件, 还需要处理间接引用的 <code>paas_wl.resources.base</code>、<code>paas_wl.resources.utils</code> 和 <code>paas_wl.workloads.images.entities</code>。 然而, 间接引用的代码依然会依赖更多的其他代码。由于无法区分模块迁移的边界，以蚂蚁搬家方式的逐个模块迁移<strong>几乎不存在协同开发的可能性</strong>。</p><hr><p>2.以代码库形式共用代码, 逐步迁移代码(类似于用户管理的原来开发模式)</p><p>蚂蚁搬家方案的难点在于模块之间存在着互相引用，如果能有一种方式可以解决<code>代码引用</code>的难题, 那最大的问题就不复存在。依然以上述代码为例。</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>## https://github.com/TencentBlueKing/blueking-paas/blob/wl-refactor/workloads/paas_wl/paas_wl/cnative/specs/resource.py
from paas_wl.platform.applications.models import EngineApp
from paas_wl.platform.applications.struct_models import ModuleEnv
from paas_wl.resources.base import crd
from paas_wl.resources.base.exceptions import ResourceMissing
from paas_wl.resources.base.kres import KNamespace
from paas_wl.resources.utils.basic import get_client_by_env
from paas_wl.workloads.images.entities import ImageCredentials

from paasng.cnative.specs import credentials
from paasng.cnative.specs.addresses import AddrResourceManager, save_addresses
from paasng.cnative.specs.constants import (
    IMAGE_CREDENTIALS_REF_ANNO_KEY,
    ConditionStatus,
    DeployStatus,
    MResConditionType,
    MResPhaseType,
)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>理想中的代码合并是可以将文件的 <code>import</code> 语句修改上面的方式, 只有 <code>cnative</code> 模块迁移至 <code>apiserver(paas-ng)</code>, 而其他间接引用的模块依然保持原路径的方式引用。<br> 只要能保证可以通过这样的方式引用到代码, 就可以继续实施蚂蚁搬家的代码迁移方案。</p><p>新问题: 如何能在一个项目中引用另一个项目的代码呢？</p><p>首先想到的方案就是 <strong>将 workloads(engine-ng) 以代码库形式打包发布, apiserver(paas-ng)以依赖库形式引用代码</strong></p><p>看起来挺靠谱🤔, 但仔细探究会发现这个曲线救国的方案复杂度也不低:</p><ul><li>打包发布 workloads(engine-ng) 需要增加维护 setup.py/pyproject.toml 的工作量</li><li>需要额外的包管理成本, 项目完成合并这些临时代码库也变得无意义</li><li>代码迁移过程中, 首先完成迁移的文件需要重新调整 <code>import</code> 语句</li></ul><p>以代码库形式共用代码不可行, 难道就只能<s>以纯手工古法</s>迁移代码吗？</p><hr><ol start="3"><li>大仓软链, 共享代码</li></ol><p>正当我一筹莫展之际, 突然想起了 python 包引用的规则不局限于引用外部库, 项目内的代码也是可以正常引用的。 只要将 workloads(engine-ng) 代码<strong>完整复制</strong>到 apiserver(paas-ng), 就不用做代码迁移咯？</p><p>考虑到短期内仍然需要保留 workloads(engine-ng) 单独发布的能力, 不可能马上将 workloads(engine-ng) 项目代码<code>移(mv)</code>至 apiserver(paas-ng)。<br> 但是如果用<code>复制(cp)</code>命令的话, 又会引入更多无意义的 git 代码提交历史。<br> 这时候<strong>大仓</strong>的灵活性就体现出来了 --&gt; 大仓内的项目可以通过<code>软链(ln -s)</code>的方式链接文件。</p><blockquote><p>ln -s ../../workloads/paas_wl/paas_wl paas_wl</p></blockquote><p>✅ 一“步”到位, 迁移完都不知道发生了什么😅</p><h3 id="_2-数据合并" tabindex="-1"><a class="header-anchor" href="#_2-数据合并"><span>2. 数据合并</span></a></h3><p>考虑到项目已经外发, 短期内不考虑进行数据库合并, 决定使用 DataBase Router 解决多库读写问题。</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>class WorkloadsDBRouter:
    &quot;&quot;&quot;
    A router to control all database operations on workloads models
    &quot;&quot;&quot;

    _workloads_db_name = &quot;workloads&quot;

    def db_for_read(self, model, **hints):
        &quot;&quot;&quot;Route the db for read&quot;&quot;&quot;
        if self._model_form_wl(model):
            return self._workloads_db_name
        return None

    def db_for_write(self, model, **hints):
        &quot;&quot;&quot;Route the db for write&quot;&quot;&quot;
        if self._model_form_wl(model):
            return self._workloads_db_name
        return None

    def allow_relation(self, obj1, obj2, **hint):
        &quot;&quot;&quot;allow relations if obj1 and obj2 are both workloads models&quot;&quot;&quot;
        if self._model_form_wl(obj1) and self._model_form_wl(obj2):
            return True
        return None

    def allow_migrate(self, db, app_label, **hints):
        app_config = apps.get_app_config(app_label)
        if self._app_from_wl(app_config):
            ## workloads db migrations are forbidden except apply to workloads db
            return db == self._workloads_db_name

        ## other migrations can not apply to workloads db
        if db == self._workloads_db_name:
            return False
        ## This DBRouter can&#39;t handle the input args, return None (which means not participating in the decision)
        return None

    def _model_form_wl(self, model) -&gt; bool:
        return model.__module__.startswith(&quot;paas_wl&quot;)

    def _app_from_wl(self, app_config) -&gt; bool:
        return app_config.module.__name__.startswith(&quot;paas_wl&quot;)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>DataBase Router 的重点包括:</p><ul><li><code>db_for_read</code> 函数控制读操作</li><li><code>db_for_write</code> 函数控制写操作库</li><li><code>allow_relation</code> 函数控制是否允许关联查询</li><li><code>allow_migrate</code> 函数控制是否真正执行 migrate 语句</li></ul><hr><p>总结:</p><ul><li>代码合并问题, 已解决✅</li><li>数据合并问题, 已解决✅</li></ul><details class="hint-container details"><summary>所以, 项目合并就这样结束了吗？</summary><p>🙂你想得真美🙂</p></details><h2 id="坑" tabindex="-1"><a class="header-anchor" href="#坑"><span>坑</span></a></h2><h3 id="_1-django-app-重命名" tabindex="-1"><a class="header-anchor" href="#_1-django-app-重命名"><span>1. Django App 重命名</span></a></h3><p><code>django_migrations</code> 记录与 Django App 名称(label) 息息相关, 修改 Django App 名称会导致 Django 误以为这是一个新模块, 会重新执行所有 migrations 并创建新的表。</p><blockquote><p>Django 默认的数据库表命名规则是 <code>\${app_label}_\${model_name}</code></p></blockquote><p>Django 官方文档没有记载如何重命名 Django App, 通过翻阅源码可以发现, 重命名 Django App 至少需要进行 3 个操作:</p><ul><li><ol><li>重命名 Django App</li></ol></li></ul><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>class IngressConfig(AppConfig):
    name = &#39;paas_wl.networking.ingress&#39;
    ## 模块原来的名字是 &quot;services&quot;, 架构调整后重命名为 &quot;ingress&quot;
    label = &#39;ingress&#39;

## 冲突的 Django App 名称
## 增强服务
class ServicesAppConfig(AppConfig):
    name = &#39;paasng.dev_resources.services&#39;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li><ol start="2"><li>声明 migrations 的重命名历史</li></ol></li></ul><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>class Migration(migrations.Migration):
    ## Migration names in this app that this migration replaces. If this is
    ## non-empty, this migration will only be applied if all these migrations
    ## are not applied.
    replaces = [
        (&quot;services&quot;, &quot;0001_initial&quot;)
    ]

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li><ol start="3"><li>显式指定数据库表名</li></ol></li></ul><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>class AppDomain(AuditedModel):
    class Meta:
        db_table = &quot;services_appdomain&quot;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>进行上述改动后, <strong>一般情况</strong>下就可以避免 Migration 被重复执行, 同时又可以正常访问旧表的数据。</p><p>但是, 一般方案解决不了当 2 个 Django App 名字冲突的问题。<br> 即使用 DBRouter 控制了是否 <strong>真正</strong> 执行数据库 migrations, 但在执行 <strong>migrate</strong> 时仍然会往 django_migrations 写入 migration 记录。<br> 由于 workloads 和 apiserver 有 1 个 Django App 名字冲突重复, 通过一般方案无法让 Django 正常识别出当前数据库的状态。</p><blockquote><p>因为 <code>(&quot;services&quot;, &quot;0001_initial)</code> 记录在 2 个数据库都存在, 通过指定 <strong>replaces</strong> 无法规避 migrations 记录的歧义性。</p></blockquote><p>既然无法通过指定 replaces 来避免重复执行 migrations, 那就只能在不设置 replaces 的情况下, 让 migrations 不重复执行。这时就需要分 2 种场景:</p><h4 id="_1-全新部署" tabindex="-1"><a class="header-anchor" href="#_1-全新部署"><span>1. 全新部署</span></a></h4><p>对于全新部署的场景, Django 必然会重新执行所有 migrate 操作(不存在重复创建数据库表的问题), 所以不设置 replaces 也不影响部署。</p><h4 id="_2-升级部署" tabindex="-1"><a class="header-anchor" href="#_2-升级部署"><span>2. 升级部署</span></a></h4><p>对于升级部署的场景, 此时 migrations 实际上已执行, 只是通过 Django 无法正常判断出数据库状态。<br> 最直接的办法就是<strong>修改 django_migrations 记录</strong>, 让 Django 认为记录已执行, 但是这会引入非标准的运维流程, 不适合用于外发版本。</p><p>既然不能通过运维手段解决问题, 只能继续挖掘 Django 源码, 通过类似于 <code>DBRouter.allow_migrate</code> 的协议绕过 migrations 的真正执行, 最后得出的方案如下:</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>## https://github.com/TencentBlueKing/blueking-paas/blob/d12ad66b0cbb0316224ca46d16b101647864bd37/apiserver/paasng/paasng/platform/core/storages/dbrouter.py
def skip_if_found_record(sentinel: Tuple[str, str]):
    &quot;&quot;&quot;patch \`Migration.operations\` to control whether to apply database_forwards on workloads db.&quot;&quot;&quot;

    def migration_decorator(cls: Type[Migration]):
        cls.operations = [_patch_operation(op, sentinel) for op in cls.operations]
        return cls

    return migration_decorator


def _patch_operation(op: Operation, sentinel: Tuple[str, str]):
    &quot;&quot;&quot;patch operation to control whether to apply database_forwards on workloads db.

    由于架构调整, workloads.services(k8s ingress 模块) 重命名为 ingress, 以避免与 apiserver 中的 services(增强服务模块) 重名冲突
    应用重命名会导致 migrations 重复执行, 因此需要 patch \`Operation.allow_migrate_model\` 方法, 在哨兵记录存在时跳过操作

    哨兵值为 \`django_migrations\` 表的记录, 用于判断重命名前的 migrations 是否已执行
    如在 0005_auto_20221212_1810.py 中应该使用 (&quot;services&quot;, &quot;0005_auto_20221212_1810&quot;) 作为哨兵值

    Note:
    1. 无论是否跳过 operation 的执行, 在执行 db migrate 后均会产生 ingress app 的 migrations 记录
    2. 新增的 migrations 无需进行 patch
    &quot;&quot;&quot;
    origin_allow_migrate_model = op.allow_migrate_model

    def allow_migrate_model(self, connection_alias, model):
        if connection_alias != WorkloadsDBRouter()._workloads_db_name:
            return False

        connection = connections[connection_alias]
        ## 如果哨兵记录已存在, 表示该环境并未全新部署. 跳过执行 operation
        if MigrationRecorder(connection).migration_qs.filter(app=sentinel[0], name=sentinel[1]).exists():
            logger.info(_(&quot;检测到重命名前的 migration 记录 {}, 跳过执行当前 migration&quot;).format(str(sentinel)))
            return False
        return origin_allow_migrate_model(connection_alias, model)

    op.allow_migrate_model = MethodType(allow_migrate_model, op)
    return op
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-lazy-query-多数据库关联" tabindex="-1"><a class="header-anchor" href="#_2-lazy-query-多数据库关联"><span>2. Lazy Query - 多数据库关联</span></a></h3><p>Django QuerySet 的实现是懒查询, 只有真正取值时才会发起 SQL 请求。这个优化机制在多数据库关联查询时有漏洞 -- 通过关联查询触发的懒查询不会调用 <code>DBRouter</code> 获取正确的数据库实例, 而是直接复用了触发查询时的对象的数据库实例。</p><p>说起来有点绕, 直接看代码就一目了然:</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>    ## application.modules 是 apiserver(paas-ng) 项目的模型
    ## Domain 是 workloads(engine-ng) 项目的模型
    ## 这里不能用 Domain.objects.filter(module_id__in=application.modules.values_list(&quot;id&quot;, flat=True)
    ## 否则会触发 Django Lazy Query 的优化漏洞
    module_ids = list(application.modules.values_list(&quot;id&quot;, flat=True))
    return Domain.objects.filter(module_id__in=module_ids)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-单元测试-多数据库" tabindex="-1"><a class="header-anchor" href="#_3-单元测试-多数据库"><span>3. 单元测试-多数据库</span></a></h3><p>在单元测试中默认只会对 <code>default</code> 数据库开启事务, 如果需要访问其他数据库, 需要在测试用例中显示声明, 例如:</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>## https://docs.djangoproject.com/en/3.2/topics/testing/tools/#testing-multi-db
from django.test import TransactionTestCase

class MultipleDBTest(TransactionTestCase):
    databases = {&#39;default&#39;, &#39;other&#39;} ## 也可以用 {&#39;__all__&#39;} 来指定使用所有数据库
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果项目使用了 pytest, 那么久需要将 pytest-django 升级到 &gt;=4.3.0 以上的版本, 同时在标记 django_db 时需要指定 databases 参数, 例如:</p><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code>## https://pytest-django.readthedocs.io/en/latest/database.html#tests-requiring-multiple-databases
@pytest.mark.django_db(databases=[&#39;default&#39;, &#39;other&#39;])
def test_multiple_db():
    ...
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span>总结</span></a></h2><p>项目合并的需求主要是<strong>代码合并</strong>和<strong>数据合并</strong>。<br> 对于大仓项目, 可以轻松的使用软链完成代码复用的环节。如果并非大仓项目, 也可以使用 <code>submodule</code> 等版本控制技巧来实现。<br> 相对而言, 数据合并需要考虑的问题更多, 如果不进行停机数据迁移的话, 可以使用 <code>DBRouter</code> 解决多数据库读写的问题。<br> 如果很不巧遇到 Django App 名称冲突, 亦可以通过“技术”手段解决问题。</p>`,71),r=[l];function o(d,t){return i(),n("div",null,r)}const c=e(s,[["render",o],["__file","bkpaas-refactor-experience.html.vue"]]),u=JSON.parse('{"path":"/posts/2023/03/23/bkpaas-refactor-experience.html","title":"蓝鲸智云 PaaS 平台重构小结 - Django 项目合并心得","lang":"zh-CN","frontmatter":{"draft":false,"permalinkPattern":"/posts/:year/:month/:day/:slug.html","type":"post","filePathRelative":"_posts/python/2023-03-23-bkpaas-refactor-experience.md","date":"2023-03-23T00:00:00.000Z","title":"蓝鲸智云 PaaS 平台重构小结 - Django 项目合并心得","sidebarDepth":2,"category":"python","tags":["django","python"],"feed":{"description":"本文分享了在对蓝鲸 PaaS（蓝鲸智云开发平台）进行重构过程中的经验和教训。\\n"},"description":"背景介绍 重构前架构 由于部署相关功能需下沉至 operator, 旧架构中与 operator 交互的功能开发繁琐, 所以需要重构。 重构目的 减少无意义的内部接口开发(apiserver 与 workloads 之间通讯的接口) 降低功能开发的复杂度(workloads 需回调 apiserver 查询应用信息) 项目合并方案 项目合并, 需要合并...","head":[["meta",{"property":"og:url","content":"https://blog.shabbywu.cn/posts/2023/03/23/bkpaas-refactor-experience.html"}],["meta",{"property":"og:site_name","content":"个人技术文章分享"}],["meta",{"property":"og:title","content":"蓝鲸智云 PaaS 平台重构小结 - Django 项目合并心得"}],["meta",{"property":"og:description","content":"背景介绍 重构前架构 由于部署相关功能需下沉至 operator, 旧架构中与 operator 交互的功能开发繁琐, 所以需要重构。 重构目的 减少无意义的内部接口开发(apiserver 与 workloads 之间通讯的接口) 降低功能开发的复杂度(workloads 需回调 apiserver 查询应用信息) 项目合并方案 项目合并, 需要合并..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-02-24T07:10:47.000Z"}],["meta",{"property":"article:author","content":"shabbywu"}],["meta",{"property":"article:tag","content":"django"}],["meta",{"property":"article:tag","content":"python"}],["meta",{"property":"article:published_time","content":"2023-03-23T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-02-24T07:10:47.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"蓝鲸智云 PaaS 平台重构小结 - Django 项目合并心得\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2023-03-23T00:00:00.000Z\\",\\"dateModified\\":\\"2024-02-24T07:10:47.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"shabbywu\\",\\"url\\":\\"https://github.com/shabbywu\\"}]}"],["link",{"rel":"alternate","type":"application/atom+xml","href":"https://blog.shabbywu.cn/atom.xml","title":"个人技术文章分享 Atom Feed"}],["link",{"rel":"alternate","type":"application/json","href":"https://blog.shabbywu.cn/feed.json","title":"个人技术文章分享 JSON Feed"}],["link",{"rel":"alternate","type":"application/rss+xml","href":"https://blog.shabbywu.cn/rss.xml","title":"个人技术文章分享 RSS Feed"}]]},"headers":[{"level":2,"title":"背景介绍","slug":"背景介绍","link":"#背景介绍","children":[{"level":3,"title":"重构前架构","slug":"重构前架构","link":"#重构前架构","children":[]},{"level":3,"title":"重构目的","slug":"重构目的","link":"#重构目的","children":[]}]},{"level":2,"title":"项目合并方案","slug":"项目合并方案","link":"#项目合并方案","children":[{"level":3,"title":"1. 代码合并","slug":"_1-代码合并","link":"#_1-代码合并","children":[]},{"level":3,"title":"2. 数据合并","slug":"_2-数据合并","link":"#_2-数据合并","children":[]}]},{"level":2,"title":"坑","slug":"坑","link":"#坑","children":[{"level":3,"title":"1. Django App 重命名","slug":"_1-django-app-重命名","link":"#_1-django-app-重命名","children":[]},{"level":3,"title":"2. Lazy Query - 多数据库关联","slug":"_2-lazy-query-多数据库关联","link":"#_2-lazy-query-多数据库关联","children":[]},{"level":3,"title":"3. 单元测试-多数据库","slug":"_3-单元测试-多数据库","link":"#_3-单元测试-多数据库","children":[]}]},{"level":2,"title":"总结","slug":"总结","link":"#总结","children":[]}],"readingTime":{"minutes":9.23,"words":2769},"filePathRelative":"_posts/python/2023-03-23-bkpaas-refactor-experience.md","localizedDate":"2023年3月23日","autoDesc":true,"git":{"createdTime":1708758647000,"updatedTime":1708758647000}}');export{c as comp,u as data};
