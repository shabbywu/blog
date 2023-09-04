---
date: 2023-09-04
title: "OAuth2.0 Client: 细说服务端应用如何使用 OAuth2.0 完成用户授权验证"
sidebarDepth: 2
category: 基础技术
tags:
- OAuth2.0

draft: true
---

# 前言
OAuth2.0 是行业标准的用户授权框架，针对不同的使用场景提供了多种授权方式。关于 OAuth2.0 认证框架的所有细节都可以在 [RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749) 找到对应的详细说明，然而阅读规范并不是了解 OAuth2.0 工作流程的最佳方式。   
本文以接入 GitHub 授权作为使用场景，针对性介绍服务端应用(Server-Side Apps)如何使用 OAuth2.0 完成用户授权验证。

# 接入 GitHub

想要集成 GitHub 到你的平台、或者获取用户在 GitHub 的数据甚至是实现自动化工作流程，就需要使用 GitHub API。在调用 API 前需要完成用户对第三方平台的授权，这个流程就是 OAuth2.0。

## 1. 创建 OAuth App
在开始所有流程之前, 我们首先需要在 GitHub 创建 **OAuth App**, 这也是 OAuth2.0 流程中的客户端(`client`)。

::: details 延伸阅读: OAuth2.0 中的角色
`client` 是指在资源所有者(`resource owner`)授权后, 使用从授权服务器(`authorization server`)获取到的代表资源所有者身份的访问令牌访问存储在资源服务器(`resource server`)的受保护资源的应用程序。   

以 GitHub 为例:   
客户端(`client`)即 GitHub OAuth App;   
资源所有者(`resource owner`)即任一 GitHub 用户;   
资源服务器(`resource server`)即 GitHub;
授权服务器(`authorization server`)即 GitHub;
:::

创建 GitHub OAuth App 很简单, 首先在 [「Settings」](https://github.com/settings) 页找到 [「Developer Settings」](https://github.com/settings/developers), 再点击 [「New OAuth App」](https://github.com/settings/applications/new) 即可创建。
> 如果您之前没有创建过应用程序，此按钮会显示“Register a new application”。   

创建 OAuth App 需要填写应用的基本信息, 除了基本的应用名称(Application name), 应用主页(Homepage URL) 和应用描述(Application description)以外, 最重要的是一项是**授权回调地址(Authorization callback URL)**, 这也常被简称`重定向地址(Redirect URL)`。

## 2. 规划重定向地址(Redirect URL)

重定向(Redirect)是 `authorization server` 对 `client` 发起的授权请求(Authorization Request)进行鉴权的重要措施。主要用途是防止攻击者拦截授权代码或访问令牌的重定向攻击。

为了安全起见, 重定向地址(Redirect URL)应当尽量使用 HTTPS 地址以防止在授权过程中遭受被中间人拦截泄露授权码(`authorization code`)。

::: details 什么是授权码(`authorization code`)?
在 OAuth2.0 中授权码(`authorization code`)有两层含义:   
1. 字面上的含义是由授权服务器(`authorization server`)签发给客户端(`client`), 供其获取访问令牌的临时代码。   
2. 另一层含义是指 OAuth2.0 中定义的最主要的授权流程 - ***Authorization Code Grant***。   
---
与其他授权类型相比, *Authorization Code Grant* 具有以下优势:
- 授权服务器(`authorization server`)确认授权后将重定向到与客户端(`client`)事先约定的重定向地址, 这个步骤完成了授权码的交付。使用 HTTPS 作为重定向地址可以有效保护授权码不被恶意软件拦截。
- 客户端(`client`)只在服务器后台向授权服务器(`authorization server`)申请访问令牌, 可避免客户端密钥和访问令牌的泄露。
:::

设置重定向地址后即完成成功创建 GitHub OAuth App。

## 3. 发起授权请求(Authorization Request)

创建 OAuth 应用后, GitHub 会给每个 OAuth 应用分配唯一的客户端标识(Client ID) 和客户端密钥(Client secret), 接下来即可向授权服务器(`authorization server`)发起授权请求 -- 即**将用户重定向到授权服务器**。

重定向到授权服务的 URL 需要按照一定规则构造, 以 GitHub 为例则需要构造如下的 URL:
> https://github.com/login/oauth/authorize?
> client_id=3934c6721961da9062bf
> &redirect_uri=https%3A%2F%2Fblog.shabbywu.cn
> &scope=public_repo
> &state=WkZRRNbeEMZEpBxRLopS

URL中涉及 4 个参数, 分别是:
- client_id: GitHub OAuth App 的客户端标识(Client ID)
- redirect_uri: 用户授权后将重定向到该页面
- scope: 需要用户授权的资源请求范围, public_repo 即需要授权访问 GitHub 中的公开仓库
- state: 描述重定向前应用状态的字符串, 授权服务器会将 state 原样返回到授权成功后跳转的 redirect_uri

正确拼接 URL 后打开即可看到如下所示的界面:
![GitHub OAuth 授权示例](/img/GitHub-OAuth-Authrozation-Example.png)



## 4. 获取资源访问令牌(Access Token)

点击绿色按钮确认授权后，将从 GitHub 重定向到 redirect_uri, 此时重定向的 URL 中的 params 部分会有 2 个重要的参数, 分别是:
- code: 授权码(`authorization code`), 客户端(`client`)需要用授权码(`authorization code`)从授权服务器(`authorization server`)换取访问令牌
- state: 描述重定向前应用状态的字符串, 与构造的授权地址中的 state 一致

以下是一个示例地址(其中的 code 已脱敏):
```
https://blog.shabbywu.cn/?code=ABCDEFG&state=WkZRRNbeEMZEpBxRLopS
```

授权服务器(`authorization server`)将浏览器重定向到重定向地址后, 客户端(`client`)所在的服务器即可发起令牌交换请求, 以 GitHub 为例, 则是如下所示的 POST 请求(其中的 code 与 client_secret 已脱敏)

```
POST /oauth/access_token HTTP/1.1
Host: github.com
 
code=ABCDEFG
&client_id=3934c6721961da9062bf
&client_secret=ABCDEFG
```

授权服务器(`authorization server`)验证客户端标识(Client ID) 和客户端密钥(Client secret)后将返回访问令牌和刷新令牌(可选, 并非所有授权服务器都实现该特性), 以 GitHub 为例将返回如下所示的响应(其中的 access_token 已脱敏):
```
{
    "access_token": "gho_ABCDEFG",
    "token_type": "bearer",
    "scope": "public_repo"
}
```

## 5. 访问相关资源

完成以上步骤后, 客户端已成功获取到代表用户授权的访问令牌, 可以通过 [GitHub 接口文档](https://docs.github.com/en/rest/overview/api-versions) 中约定的方式访问授权范围(`scope`)内资源。

# 总结
本文以接入 GitHub 平台为例, 详细讲述了服务端应用接入 OAuth2.0 授权框架涉及到的知识要点，主要步骤可概括成 4 个步骤:
1. 在资源服务器中注册客户端(创建 OAuth App)
2. 引导资源所有者前往授权服务器授权客户端访问指定范围内的资源
3. 用户授权后, 客户端使用授权码向授权服务器交换访问令牌
4. 使用访问令牌从资源服务器获取相应的资源