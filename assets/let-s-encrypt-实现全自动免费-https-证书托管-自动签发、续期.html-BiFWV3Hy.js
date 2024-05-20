import{_ as t,r,o as l,c as d,f as e,g as n,i,e as a}from"./app-B8sGi1tR.js";const c="/img/Chrome不安全演示.png",o="/img/Chrome不安全演示(红色).png",m={},u=a('<h2 id="前言" tabindex="-1"><a class="header-anchor" href="#前言"><span>前言</span></a></h2><p>为了推动更安全的 HTTPS 加密协议普及全网，谷歌 Chrome 浏览器从 2017 年开始逐步对HTTP网站标记 <strong>“不安全”</strong> 警告，并在 2018年7月24日 发布的 Chrome 68 正式版本中将所有 HTTP 网站标记 <strong>“不安全”</strong>。</p><figure><img src="'+c+'" alt="Chrome不安全演示图片" tabindex="0" loading="lazy"><figcaption>Chrome不安全演示图片</figcaption></figure><p>随着 Chrome 68 版本的覆盖范围，HTTP网站上的“不安全”警告将被越来越多的Chrome用户看到。因此，使用 HTTPS 加密协议提高网站安全性是每个网站所有者的义务。<br> 但是，为了确保私钥安全，SSL/TLS 证书都设置了有效期限，最新的国际标准中SSL证书最长有效期为<strong>1年</strong>。如果网站使用的 SSL 证书已过期，那么 Chrome 反而会出现 <strong>红色“不安全”</strong> 警告。</p><figure><img src="'+o+'" alt="Chrome不安全演示(红色)图片" tabindex="0" loading="lazy"><figcaption>Chrome不安全演示(红色)图片</figcaption></figure><p>虽然推动 HTTPS 协议的初衷是好的，但是并非所有网站都需要 HTTPS 协议保护(例如你正在访问的静态网站 -- 博客)。为了避免网站被提示不安全，Chrome 68 的策略无疑大幅提高了网站运营人员的工作量 -- <strong>需要定期检查证书的有效性，避免被标记为更吓人的红色“不安全”警告</strong>。</p><p>基于上述背景，本文介绍一种解放证书维护的工作量的方法 -- 全自动 Let&#39;s Encrypt 证书托管。</p><h2 id="什么是-let-s-encrypt" tabindex="-1"><a class="header-anchor" href="#什么是-let-s-encrypt"><span>什么是 Let&#39;s Encrypt</span></a></h2><p>Let’s Encrypt 是一家全球性非盈利的证书颁发机构（CA），在全球范围内提供了<strong>免费的域名验证型（DV）证书</strong>。网站所有者可以使用 Let&#39;s Encrypt 证书来启用安全的 HTTPS 连接。</p><h2 id="如何申请-let-s-encrypt-证书" tabindex="-1"><a class="header-anchor" href="#如何申请-let-s-encrypt-证书"><span>如何申请 Let&#39;s Encrypt 证书</span></a></h2>',10),v={href:"https://www.rfc-editor.org/rfc/rfc8555",target:"_blank",rel:"noopener noreferrer"},b=e("strong",null,"ACME(Automatic Certificate Management Environment) 协议",-1),h=e("br",null,null,-1),p=a(`<ul><li>首先, 向 Let&#39;s Encrypt 证明 Web 服务域名的<strong>所有权</strong>。<em>(与其他 CA 机构一样, 颁发 DV 证书都需要证明域名所有权)</em></li><li>然后, 调用 Let&#39;s Encrypt 提供的 API 颁发、续期或吊销该域名的证书。</li></ul><h3 id="let-s-encrypt-的工作原理" tabindex="-1"><a class="header-anchor" href="#let-s-encrypt-的工作原理"><span>Let&#39;s Encrypt 的工作原理</span></a></h3><p>Let&#39;s Encrypt 通过公私密钥对验证和区分不同的 ACME 客户端的请求。为了认证域名的所有权, ACME 协议目前提供了 3 种认证的方式，分别是 <code>HTTP 01</code>、<code>DNS 01</code> 和 <code>TLS-ALPN-01</code>。我们可通过下面的流程图了解域名认证的大致流程。</p><div class="language-plantuml line-numbers-mode" data-ext="plantuml" data-title="plantuml"><pre class="language-plantuml"><code><img src="https://www.plantuml.com/plantuml/svg/jLD5bjim6Dxh52eFmwRCpCpSscgUtpXoiB0QPcPcfl1hEBbC93ktg6eD1Clrng8FVZfhjRspsEn66UoHi23RHGHFoef1iPRBo6P5MB1yCTbEPrrYWuG_PnyBo69xh-HuByYANVmWlxEWqm2yiziKR3U-HnO0J4nT4YJJEso3EYby0I3xJkxd4lgcb7twuWbw_m1PFZBWgtIeYAqxm1IjTFJ5smzASyEtVEzIy7q6_jo5MvTAByWImhPCWfHaxP2adEKWId42jkLBJwSI7OVKkqAQEZJV4ctn5rn_SgCGfEgmrnp8Nchn0J8-nLwIRl-Z-pSBgYInC2yjQHaduP3ch4q4bpJ77EaSB10Lupi9bq26-wc8Ou51a_qnshL8-ZeIWHgwCKjhbfDZtNGYH0TT1LZ10ielhpdYoM57AWtjd2FTG_m4FbIg4Fw91tZX7AG3JjfHguurS1mT2f98Dm06Ys8tmQiF7zujhQZKixtRRl18MINKprAywNt6aZAneeQMY6DCypj9h84EnDIeGzsCaPvEfi5DSMIUfFQsgTEBTAAJjCsIqHNYzz3mhFRLozrfJZzrr-a4AQWKUPwKL0V9jGu69DFJp05jhQ4JhNIo7Y0iRiV8slaNGsJJmPh97oPjC_3XquTCp4MYWwJ5bQhtNw9ZodyKsyER3qhFtRnxEq-0_xKIyN5jjkEx0qYxPsbhUqwp1VnKNQvDzYqMSkif9e_cRs3UhIqzf6qwxuWa0krQDCed582pZDrkbBy1
"></code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h3 id="流程演示" tabindex="-1"><a class="header-anchor" href="#流程演示"><span>流程演示</span></a></h3>`,5),y={href:"https://github.com/acmesh-official/acme.sh",target:"_blank",rel:"noopener noreferrer"},g=e("code",null,"DNS-01",-1),f=a(`<h4 id="step-1-发起域名证书申请请求" tabindex="-1"><a class="header-anchor" href="#step-1-发起域名证书申请请求"><span>Step 1. 发起域名证书申请请求</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>## 启动容器 acme.sh 容器
❯ docker run --rm -it neilpang/acme.sh sh
## 注册账号
❯ acme.sh --register-account -m shabbywu@qq.com --server letsencrypt

Create account key ok.
Registering account: https://acme-v02.api.letsencrypt.org/directory
Registered
ACCOUNT_THUMBPRINT=&#39;******&#39;

## 使用手动模式申请域名证书
❯ acme.sh --issue --dns -d test.shabbywu.cn --server letsencrypt --yes-I-know-dns-manual-mode-enough-go-ahead-please

Using CA: https://acme-v02.api.letsencrypt.org/directory
Creating domain key
The domain key is here: /acme.sh/test.shabbywu.cn/test.shabbywu.cn.key
Single domain=&#39;test.shabbywu.cn&#39;
Getting domain auth token for each domain
Getting webroot for domain=&#39;test.shabbywu.cn&#39;
Add the following TXT record:
Domain: &#39;_acme-challenge.test.shabbywu.cn&#39;
TXT value: &#39;zvXo7P0nyVh-4AQ_IZyfbqajoKkpaLCku60W80DFCeI&#39;
Please be aware that you prepend _acme-challenge. before your domain
so the resulting subdomain will be: _acme-challenge.test.shabbywu.cn
Please add the TXT records to the domains, and re-run with --renew.
Please add &#39;--debug&#39; or &#39;--log&#39; to check more details.
See: https://github.com/acmesh-official/acme.sh/wiki/How-to-debug-acme.sh
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="step-2-添加-dns-记录并验证" tabindex="-1"><a class="header-anchor" href="#step-2-添加-dns-记录并验证"><span>Step 2. 添加 DNS 记录并验证</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>## 调用 DNSPOD API 添加 DNS 记录
❯ curl -X POST https://dnsapi.cn/Record.Create -d &quot;login_token=$DP_Id,$DP_Key&amp;format=json&amp;domain=shabbywu.cn&amp;sub_domain=_acme-challenge.test&amp;record_type=TXT&amp;ttl=600&amp;record_line=默认&amp;value=zvXo7P0nyVh-4AQ_IZyfbqajoKkpaLCku60W80DFCeI&quot;
## 验证 DNS 记录
❯ dig -t TXT _acme-challenge.test.shabbywu.cn +short
&quot;zvXo7P0nyVh-4AQ_IZyfbqajoKkpaLCku60W80DFCeI&quot;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="step-3-获取域名证书" tabindex="-1"><a class="header-anchor" href="#step-3-获取域名证书"><span>Step 3. 获取域名证书</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>## 通知 Let&#39;s Encrypt 验证域名所有权并下载证书
❯ acme.sh --renew -d test.shabbywu.cn --server letsencrypt --yes-I-know-dns-manual-mode-enough-go-ahead-please

Renew: &#39;test.shabbywu.cn&#39;
Renew to Le_API=https://acme-v02.api.letsencrypt.org/directory
Using CA: https://acme-v02.api.letsencrypt.org/directory
Single domain=&#39;test.shabbywu.cn&#39;
Getting domain auth token for each domain
Verifying: test.shabbywu.cn
Pending, The CA is processing your order, please just wait. (1/30)
Pending, The CA is processing your order, please just wait. (2/30)
Success
Verify finished, start to sign.
Lets finalize the order.
Le_OrderFinalize=&#39;https://acme-v02.api.letsencrypt.org/acme/finalize/820949067/143403376067&#39;
Downloading cert.
Le_LinkCert=&#39;https://acme-v02.api.letsencrypt.org/acme/cert/03ea91f35baf0a82ffda0d4bffbf2ea76a12&#39;
Cert success.
-----BEGIN CERTIFICATE-----
******
******
-----END CERTIFICATE-----
Your cert is in: /acme.sh/test.shabbywu.cn/test.shabbywu.cn.cer
Your cert key is in: /acme.sh/test.shabbywu.cn/test.shabbywu.cn.key
The intermediate CA cert is in: /acme.sh/test.shabbywu.cn/ca.cer
And the full chain certs is there: /acme.sh/test.shabbywu.cn/fullchain.cer

## [Optional] 调用 DNSPOD API 删除 DNS 记录
❯ curl -X POST https://dnsapi.cn/Record.Remove -d &quot;login_token=$DP_Id,$DP_Key&amp;format=json&amp;domain=shabbywu.cn&amp;record_id=1246824242&quot;

## 验证 HTTPS 证书有效性
### 下载 CA 证书
❯ wget https://letsencrypt.org/certs/lets-encrypt-r3.pem
### 验证证书有效性
❯ openssl verify -CAfile lets-encrypt-r3.pem /acme.sh/test.shabbywu.cn/ca.cer /acme.sh/test.shabbywu.cn/test.shabbywu.cn.cer
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="step-4-optional-吊销域名证书" tabindex="-1"><a class="header-anchor" href="#step-4-optional-吊销域名证书"><span>Step 4. [Optional]吊销域名证书</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>## 吊销证书
❯ acme.sh --remove -d test.shabbywu.cn --server letsencrypt 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>由于签发的证书量太大，因此 Let&#39;s Encrypt 并未提供 CRL(证书吊销列表) 查询功能。也就是说即使吊销了证书，也无法查询到吊销结果😂。</p><h2 id="全自动托管-let-s-encrypt-证书" tabindex="-1"><a class="header-anchor" href="#全自动托管-let-s-encrypt-证书"><span>全自动托管 Let&#39;s Encrypt 证书</span></a></h2><p>ACME 协议使得全自动签发和续签证书成为可能。目前较为热门的 ACME 客户端都提供了全自动托管的配置方式。 以下分别介绍 2 种全自动托管 Let&#39;s Encrypt 证书的方式。</p><h3 id="定时任务-linux-cron" tabindex="-1"><a class="header-anchor" href="#定时任务-linux-cron"><span>定时任务 - linux cron</span></a></h3><p><code>acme.sh</code> 是 Bash 上的 ACME 客户端实现，可轻松借助 <code>linux cron</code> 定时任务实现证书的定时续期操作。<br><code>acme.sh</code> 提供了多种方式实现域名自动化认证，不仅可以与 <code>nginx</code>, <code>apache</code> 等主流 web server 配合自动完成 <code>HTTP-01</code> 认证，还提供了不依赖前端 web server 的 <code>standalone</code> 模式自动完成域名所有权认证(需要监听端口接受网络请求)。<br> 如果域名尚未能提供 HTTP 服务, 亦可以借助 <code>dnsapi</code> 自动完成 <code>DNS-01</code> 认证。</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>## 自动 DNS 认证
❯ acme.sh --issue --dns dns_dp -d test.shabbywu.cn --server letsencrypt 
Using CA: https://acme-v02.api.letsencrypt.org/directory
Create account key ok.
Registering account: https://acme-v02.api.letsencrypt.org/directory
Registered
ACCOUNT_THUMBPRINT=&#39;******&#39;
Creating domain key
The domain key is here: /acme.sh/test.shabbywu.cn/test.shabbywu.cn.key
Single domain=&#39;test.shabbywu.cn&#39;
Getting domain auth token for each domain
Getting webroot for domain=&#39;test.shabbywu.cn&#39;
Adding txt value: TMl-MXa3Wmahajj40mioNb-iiljnTK0XSzUhxNWaulw for domain:  _acme-challenge.test.shabbywu.cn
Adding record
The txt record is added: Success.
Let&#39;s check each DNS record now. Sleep 20 seconds first.
You can use &#39;--dnssleep&#39; to disable public dns checks.
See: https://github.com/acmesh-official/acme.sh/wiki/dnscheck
Checking test.shabbywu.cn for _acme-challenge.test.shabbywu.cn
Domain test.shabbywu.cn &#39;_acme-challenge.test.shabbywu.cn&#39; success.
All success, let&#39;s return
Verifying: test.shabbywu.cn
Pending, The CA is processing your order, please just wait. (1/30)
Success
Removing DNS records.
Removing txt: TMl-MXa3Wmahajj40mioNb-iiljnTK0XSzUhxNWaulw for domain: _acme-challenge.test.shabbywu.cn
Removed: Success
Verify finished, start to sign.
Lets finalize the order.
Le_OrderFinalize=&#39;https://acme-v02.api.letsencrypt.org/acme/finalize/821484497/143530627597&#39;
Downloading cert.
Le_LinkCert=&#39;https://acme-v02.api.letsencrypt.org/acme/cert/03fb7dff89b61c4451664ba11f052eec20b2&#39;
Cert success.
-----BEGIN CERTIFICATE-----
******
******
-----END CERTIFICATE-----
Your cert is in: /acme.sh/test.shabbywu.cn/test.shabbywu.cn.cer
Your cert key is in: /acme.sh/test.shabbywu.cn/test.shabbywu.cn.key
The intermediate CA cert is in: /acme.sh/test.shabbywu.cn/ca.cer
And the full chain certs is there: /acme.sh/test.shabbywu.cn/fullchain.cer

## 安装定时任务脚本
❯ acme.sh --install-cronjob
Installing cron job
21 0 * * * &quot;/root/.acme.sh&quot;/acme.sh --cron --home &quot;/root/.acme.sh&quot; --config-home &quot;/acme.sh&quot;

## 验证定时任务
❯ crontab -l
21 0 * * * &quot;/root/.acme.sh&quot;/acme.sh --cron --home &quot;/root/.acme.sh&quot; --config-home &quot;/acme.sh&quot;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="使用集成-acme-的网关-traefik" tabindex="-1"><a class="header-anchor" href="#使用集成-acme-的网关-traefik"><span>使用集成 ACME 的网关 - traefik</span></a></h3><p>使用 <code>acme.sh</code> 自动签发的证书仍然需要挂载到 Web 服务器(服务网关) 才能正确处理 HTTPS 请求。如果不依赖服务网关提供的额外特性(例如 nginx lua 等), 我们不妨考虑一些集成了 ACME 的网关，例如 traefik。</p><h4 id="docker" tabindex="-1"><a class="header-anchor" href="#docker"><span>Docker</span></a></h4><p><code>traefik</code> 支持使用 labels 为 Docker 容器注入路由配置，以下是一份开启了 <code>ACME</code> 配置样例。</p><div class="language-yaml line-numbers-mode" data-ext="yml" data-title="yml"><pre class="language-yaml"><code>version: &quot;3.3&quot;
services:
  traefik:
    image: &quot;traefik:v2.9&quot;
    container_name: &quot;traefik&quot;
    command:
      - &quot;--api.insecure=true&quot;
      - &quot;--providers.docker=true&quot;
      - &quot;--providers.docker.exposedbydefault=false&quot;
      - &quot;--entrypoints.web.address=:80&quot;
      - &quot;--entrypoints.websecure.address=:443&quot;
      - &quot;--certificatesresolvers.myresolver.acme.dnschallenge=true&quot;
      ## 使用腾讯云 API 完成 DNS-01 认证
      - &quot;--certificatesresolvers.myresolver.acme.dnschallenge.provider=tencentcloud&quot;
      - &quot;--certificatesresolvers.myresolver.acme.email=postmaster@example.com&quot;
      - &quot;--certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json&quot;
    ports:
      - &quot;80:80&quot;
      - &quot;443:443&quot;
      - &quot;8080:8080&quot;
    environment:
    ## 腾讯云 API 的配置
      - &quot;TENCENTCLOUD_SECRET_ID=xxx&quot;
      - &quot;TENCENTCLOUD_SECRET_KEY=xxx&quot;
    volumes:
      - &quot;./letsencrypt:/letsencrypt&quot;
      - &quot;/var/run/docker.sock:/var/run/docker.sock:ro&quot;
  whoami:
    image: &quot;traefik/whoami&quot;
    container_name: &quot;simple-service&quot;
    labels:
      - &quot;traefik.enable=true&quot;
      - &quot;traefik.http.routers.whoami.rule=Host(\`whoami.example.com\`)&quot;
      - &quot;traefik.http.routers.whoami.entrypoints=websecure&quot;
      ## 指定 tls 证书供应商为 myresolver
      - &quot;traefik.http.routers.whoami.tls.certresolver=myresolver&quot;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="k8s" tabindex="-1"><a class="header-anchor" href="#k8s"><span>K8S</span></a></h4>`,20),_=e("code",null,"traefik",-1),E={href:"https://doc.traefik.io/traefik/providers/kubernetes-ingress/",target:"_blank",rel:"noopener noreferrer"},T=e("strong",null,"K8s Ingress",-1),w={href:"https://doc.traefik.io/traefik/providers/kubernetes-crd/",target:"_blank",rel:"noopener noreferrer"},k=e("strong",null,"IngressRoute(CRD)",-1),C=e("code",null,"Ingress",-1),A=e("code",null,"IngressRoute",-1),q=e("code",null,"ACME",-1),P=a(`<div class="language-yaml line-numbers-mode" data-ext="yml" data-title="yml"><pre class="language-yaml"><code>## Ingress 配置样例
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: whoami-ingress
  annotations:
    ## 声明 traefik 路由入口, 默认配置下的 websecure 是 443 端口
    traefik.ingress.kubernetes.io/router.entrypoints: websecure
    ## 声明开启 tls
    traefik.ingress.kubernetes.io/router.tls: &quot;true&quot;
    ## 声明 tls 证书供应商
    traefik.ingress.kubernetes.io/router.tls.certresolver: myresolver
spec:
  rules:
    - host: your.example.com
      http:
        paths:
          - path: /tls
            pathType: Exact
            backend:
              service:
                name:  whoami
                port:
                  number: 80
---
## IngressRoute 配置样例
apiVersion: traefik.containo.us/v1alpha1
kind: IngressRoute
metadata:
  name: simpleingressroute
  namespace: default
spec:
  entryPoints:
    - web
  routes:
  - match: Host(\`your.example.com\`) &amp;&amp; PathPrefix(\`/notls\`)
    kind: Rule
    services:
    - name: whoami
      port: 80

---
apiVersion: traefik.containo.us/v1alpha1
kind: IngressRoute
metadata:
  name: ingressroutetls
  namespace: default
spec:
  entryPoints:
    - websecure
  routes:
  - match: Host(\`your.example.com\`) &amp;&amp; PathPrefix(\`/tls\`)
    kind: Rule
    services:
    - name: whoami
      port: 80
  ## 声明开合 tls 和 tls 证书供应商
  tls:
    certResolver: myresolver
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,1);function x(S,I){const s=r("ExternalLinkIcon");return l(),d("div",null,[u,e("p",null,[n("与其他常见的 CA 机构不同, Let's Encrypt 证书是基于 "),e("a",v,[b,i(s)]),n(" 全自助颁发、续期或吊销的。"),h,n(" 一般而言，申请 Let's Encrypt 证书可拆分成 2 个步骤。")]),p,e("p",null,[n("我们使用 "),e("a",y,[n("acme.sh"),i(s)]),n(" 演示如何通过 "),g,n(" 申请 HTTPS 证书。")]),f,e("p",null,[_,n(" 同时支持 "),e("a",E,[T,i(s)]),n(" 或者 "),e("a",w,[k,i(s)]),n(" 进行路由配置。以下是分别是 "),C,n(" 和 "),A,n(" 开启 "),q,n(" 配置样例。")]),P])}const D=t(m,[["render",x],["__file","let-s-encrypt-实现全自动免费-https-证书托管-自动签发、续期.html.vue"]]),N=JSON.parse(`{"path":"/posts/2022/11/11/let-s-encrypt-%E5%AE%9E%E7%8E%B0%E5%85%A8%E8%87%AA%E5%8A%A8%E5%85%8D%E8%B4%B9-https-%E8%AF%81%E4%B9%A6%E6%89%98%E7%AE%A1-%E8%87%AA%E5%8A%A8%E7%AD%BE%E5%8F%91%E3%80%81%E7%BB%AD%E6%9C%9F.html","title":"Let's Encrypt - 实现全自动免费 HTTPS 证书托管(自动签发、续期)","lang":"zh-CN","frontmatter":{"draft":false,"permalinkPattern":"/posts/:year/:month/:day/:slug.html","type":"post","filePathRelative":"_posts/sre/2022-11-11-Let's Encrypt - 实现全自动免费 HTTPS 证书托管(自动签发、续期).md","date":"2022-11-11T00:00:00.000Z","title":"Let's Encrypt - 实现全自动免费 HTTPS 证书托管(自动签发、续期)","sidebarDepth":2,"category":"运维","tags":["HTTPS","Let's Encrypt","自动化"],"description":"前言 为了推动更安全的 HTTPS 加密协议普及全网，谷歌 Chrome 浏览器从 2017 年开始逐步对HTTP网站标记 “不安全” 警告，并在 2018年7月24日 发布的 Chrome 68 正式版本中将所有 HTTP 网站标记 “不安全”。 Chrome不安全演示图片Chrome不安全演示图片 随着 Chrome 68 版本的覆盖范围，HTTP...","head":[["meta",{"property":"og:url","content":"https://blog.shabbywu.cn/posts/2022/11/11/let-s-encrypt-%E5%AE%9E%E7%8E%B0%E5%85%A8%E8%87%AA%E5%8A%A8%E5%85%8D%E8%B4%B9-https-%E8%AF%81%E4%B9%A6%E6%89%98%E7%AE%A1-%E8%87%AA%E5%8A%A8%E7%AD%BE%E5%8F%91%E3%80%81%E7%BB%AD%E6%9C%9F.html"}],["meta",{"property":"og:site_name","content":"个人技术文章分享"}],["meta",{"property":"og:title","content":"Let's Encrypt - 实现全自动免费 HTTPS 证书托管(自动签发、续期)"}],["meta",{"property":"og:description","content":"前言 为了推动更安全的 HTTPS 加密协议普及全网，谷歌 Chrome 浏览器从 2017 年开始逐步对HTTP网站标记 “不安全” 警告，并在 2018年7月24日 发布的 Chrome 68 正式版本中将所有 HTTP 网站标记 “不安全”。 Chrome不安全演示图片Chrome不安全演示图片 随着 Chrome 68 版本的覆盖范围，HTTP..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:image","content":"https://blog.shabbywu.cn/img/Chrome不安全演示.png"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-02-24T07:10:47.000Z"}],["meta",{"name":"twitter:card","content":"summary_large_image"}],["meta",{"name":"twitter:image:alt","content":"Let's Encrypt - 实现全自动免费 HTTPS 证书托管(自动签发、续期)"}],["meta",{"property":"article:author","content":"shabbywu"}],["meta",{"property":"article:tag","content":"HTTPS"}],["meta",{"property":"article:tag","content":"Let's Encrypt"}],["meta",{"property":"article:tag","content":"自动化"}],["meta",{"property":"article:published_time","content":"2022-11-11T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-02-24T07:10:47.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"Let's Encrypt - 实现全自动免费 HTTPS 证书托管(自动签发、续期)\\",\\"image\\":[\\"https://blog.shabbywu.cn/img/Chrome不安全演示.png\\",\\"https://blog.shabbywu.cn/img/Chrome不安全演示(红色\\"],\\"datePublished\\":\\"2022-11-11T00:00:00.000Z\\",\\"dateModified\\":\\"2024-02-24T07:10:47.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"shabbywu\\",\\"url\\":\\"https://github.com/shabbywu\\"}]}"],["link",{"rel":"alternate","type":"application/atom+xml","href":"https://blog.shabbywu.cn/atom.xml","title":"个人技术文章分享 Atom Feed"}],["link",{"rel":"alternate","type":"application/json","href":"https://blog.shabbywu.cn/feed.json","title":"个人技术文章分享 JSON Feed"}],["link",{"rel":"alternate","type":"application/rss+xml","href":"https://blog.shabbywu.cn/rss.xml","title":"个人技术文章分享 RSS Feed"}]]},"headers":[{"level":2,"title":"前言","slug":"前言","link":"#前言","children":[]},{"level":2,"title":"什么是 Let's Encrypt","slug":"什么是-let-s-encrypt","link":"#什么是-let-s-encrypt","children":[]},{"level":2,"title":"如何申请 Let's Encrypt 证书","slug":"如何申请-let-s-encrypt-证书","link":"#如何申请-let-s-encrypt-证书","children":[{"level":3,"title":"Let's Encrypt 的工作原理","slug":"let-s-encrypt-的工作原理","link":"#let-s-encrypt-的工作原理","children":[]},{"level":3,"title":"流程演示","slug":"流程演示","link":"#流程演示","children":[]}]},{"level":2,"title":"全自动托管 Let's Encrypt 证书","slug":"全自动托管-let-s-encrypt-证书","link":"#全自动托管-let-s-encrypt-证书","children":[{"level":3,"title":"定时任务 - linux cron","slug":"定时任务-linux-cron","link":"#定时任务-linux-cron","children":[]},{"level":3,"title":"使用集成 ACME 的网关 - traefik","slug":"使用集成-acme-的网关-traefik","link":"#使用集成-acme-的网关-traefik","children":[]}]}],"readingTime":{"minutes":7.68,"words":2305},"filePathRelative":"_posts/sre/2022-11-11-let-s-encrypt-实现全自动免费-https-证书托管-自动签发、续期.md","localizedDate":"2022年11月11日","autoDesc":true,"git":{"createdTime":1708758647000,"updatedTime":1708758647000,"contributors":[{"name":"shabbywu","email":"shabbywu@tencent.com","commits":1}]}}`);export{D as comp,N as data};
