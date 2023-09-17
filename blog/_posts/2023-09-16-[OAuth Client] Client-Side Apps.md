---
date: 2023-09-16
title: "OAuth2.0 Client: 细说客户端应用如何使用 OAuth2.0 完成用户授权验证"
sidebarDepth: 2
category: 基础技术
tags:
- OAuth2.0

draft: false
---

# 前言
OAuth2.0 是行业标准的用户授权框架，针对不同的使用场景提供了多种授权方式。关于 OAuth2.0 认证框架的所有细节都可以在 [RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749) 找到对应的详细说明，然而阅读规范并不是了解 OAuth2.0 工作流程的最佳方式。   
本文以接入 GitHub 授权作为使用场景，针对性介绍 客户端应用(*Client-Side Apps*) 如何使用 OAuth2.0 完成用户授权验证。

# 客户端应用如何接入 GitHub？

想要集成 GitHub 到你的平台、或者获取用户在 GitHub 的数据甚至是实现自动化工作流程，就需要使用 GitHub API。在调用 API 前需要完成用户对第三方平台的授权，这个流程就是 OAuth2.0。

## 1. 创建 OAuth App
在开始所有流程之前, 我们首先需要在 GitHub 创建 **OAuth App**, 这也是 OAuth2.0 流程中的客户端(*client*)。

::: details 延伸阅读: OAuth2.0 中的角色
**客户端(*client*)** 是指在获得 **资源所有者(*resource owner*)** 授权后, 使用从 **授权服务器(*authorization server*)** 获取到的代表资源所有者身份的访问令牌访问存储在 **资源服务器(*resource server*)** 的受保护资源的应用程序。   

以接入 GitHub 为例:   
客户端(*client*)即 GitHub OAuth App;   
资源所有者(*resource owner*)即任一 GitHub 用户;   
资源服务器(*resource server*)即 GitHub;   
授权服务器(*authorization server*)即 GitHub;
:::

创建 GitHub OAuth App 很简单, 首先在 [「Settings」](https://github.com/settings) 页找到 [「Developer Settings」](https://github.com/settings/developers), 再点击 [「New OAuth App」](https://github.com/settings/applications/new) 即可创建。
> 如果您之前没有创建过应用程序，此按钮会显示“Register a new application”。   

创建 OAuth App 需要填写应用的基本信息, 除了基本的应用名称(Application name), 应用主页(Homepage URL) 和应用描述(Application description)以外, 最重要的是一项是**授权回调地址(*Authorization callback URL*)**, 这也常被简称**重定向地址(*Redirect URL*)**。


## 2. 重定向地址(*Redirect URL*)

**重定向(*Redirect*)** 是 授权服务器(*authorization server*) 对 客户端(*client*) 发起的 **授权请求(*Authorization Request*)** 进行鉴权的重要措施。主要用途是防止攻击者拦截授权代码或访问令牌的重定向攻击。

但由于客户端应用一般无后台服务器，无法提供固定的重定向地址。因此 OAuth 2.0 允许 客户端(*client*) 将本地回环地址(如 127.0.0.1)设为重定向地址, 用户授权后 授权服务器(*authorization server*) 将用户重定向到 客户端(*client*) 提前运行在用户本地的服务。 

将重定向地址设置成 `http://127.0.0.1` 后即完成成功创建 GitHub OAuth App。

## 3. 发起授权请求(Authorization Request) & 获取资源访问令牌(Access Token)

**客户端应用(*Client-Side Apps*)** 获取到 **授权码(*authorization code*)** 后, 余下流程与 **服务端应用(*Server-Side Apps*)** 完全一致, 读者可前往 [OAuth2.0 Client: 细说服务端应用如何使用 OAuth2.0 完成用户授权验证](/posts/2023/09/04/oauth-client-server-side-apps.html) 阅读相关的流程，这里不再重复讲述。

---

敏感的读者很可能已经意识到, ***Authorization Code Grant*** 从设计上就要求用户授权必须在浏览器中完成, 这导致在无浏览器的设备无法完成授权码流程。   
为了让此类设备(如无图形用户界面的服务器、会议大屏甚至是智能音箱等)能实现用户授权,  OAuth 2.0 提出了新的认证流程扩展 - [***Device Authorization Grant***](https://datatracker.ietf.org/doc/html/rfc8628)。

# Device Authorization Grant

OAuth 2.0 的 「Device Flow」扩展适用于能联网但无法或难以使用浏览器完成 「Authorization Code Flow」的设备，接下来以 GitHub 为接入场景展示如何使用 Device Flow 完成 OAuth 2.0 授权流程。

## 1. 开启 Device Flow 认证

GitHub OAuth App 默认不打开 Device Flow 认证, 如果创建 OAuth App 时未勾选 「Enable Device Flow」, 则需要前往 [「Developer Settings」](https://github.com/settings/developers) 更新你的 OAuth App 配置。   

只需要勾选「Enable Device Flow」即可开启 Device Flow 认证功能。

## 2. 发起授权请求(Authorization Request)

**发起授权请求(*Authorization Request*)** 是 OAuth 2.0 授权框架的标准流程, 但是不同授权流程具体的实现并不一致。 ***Device Authorization Grant*** 的授权流程主要分为 2 个步骤:
1. 向 授权服务器(*authorization server*) 申请 **设备验证码(*Device Code*)** 和 **用户验证码(*User Code*)**
2. 引导用户前往 授权服务器(*authorization server*) 输入 **用户验证码(*User Code*)** 完成授权

完整的授权流程可以在 [RFC 8628](https://datatracker.ietf.org/doc/html/rfc8628) 找到对应的详细说明, 接下来以 GitHub 为例演示如何发起 *Device Authorization Grant* 的 *授权请求*。

## 2.1 申请设备码(*Device Code*)
申请 **设备码(*Device Code*)** 需要 客户端(*client*) 向 授权服务器(*authorization server*) 提供的 API 发起 Post 请求, 以 GitHub 为例则是发起以下请求:

```http
POST /login/device/code HTTP/1.1
Host: github.com
Accept: application/json
 
client_id=3934c6721961da9062bf
&scope=public_repo
```

请求涉及 2 个参数, 分别是:
- client_id: GitHub OAuth App 的客户端标识(Client ID)
- scope: 需要用户授权的资源请求范围, public_repo 即需要授权访问 GitHub 中的公开仓库

如果不指定请求头 `Accept`, 默认情况 GitHub 会以以下形式返回响应(其中的 device_code 已脱敏):
```
device_code=ABCDEF&expires_in=900&interval=5&user_code=WDJB-MJHT&verification_uri=https%3A%2F%github.com%2Flogin%2Fdevice
```

在指定请求头 `Accept: application/json` 后, GitHub 将会以 json 形式返回响应:
```json
{
	"device_code": "ABCDEF",
	"user_code": "WDJB-MJHT",
	"verification_uri": "https://github.com/login/device",
	"expires_in": 899,
	"interval": 5
}
```
以上返回参数的含义分别是:
- device_code:  设备验证码
- user_code: 用户验证码
- verification_uri: 用户输入用户验证码完成授权的地址
- expires_in: 设备验证码和用户验证码的有效时间(单位, 秒)
- interval: 客户端轮询授权服务器的最小时间间隔

## 2.2 用户授权
向 授权服务器(*authorization server*) 发起授权请求换取 *设备验证码* 和 *用户验证码* 后, 将需要引导用户前往 *授权验证地址* 输入用户验证码。   
需要注意的是, OAuth 2.0 的 「Device Flow」扩展只约定了授权流程, 并未约定具体的展示层(UI)的实现细节，所以我们不妨参考其他系统已有的实现。


常见的客户端应用(*Client-Side Apps*)可分为 2 类:
- 仅终端(terminal)的客户端应用
- 具有图形界面(GUI)的客户端应用

对于仅终端(terminal)的客户端应用, 可参考 GitHub 官方提供的 SDK [cli/oauth](https://github.com/cli/oauth) 实现展示层(UI):
```bash
❯ myapp auth

First, copy your one-time code: WDJB-MJHT
Then visiting that URL: https://github.com/login/device to continue in the web browser...
```

对于具有图形界面(GUI)的客户端应用, 可参考 GitHub Device Activation 页面实现展示层(UI):

<DeviceFlow userCode="WDJB-MJHT" verificationUri="https://github.com/login/device"/>

用户在授权页面正确输入用户验证码后将看到以下界面:
![GitHub OAuth 授权示例](/img/GitHub-OAuth-Device-Flow-Example.png)


## 3. 获取资源访问令牌(Access Token)

点击绿色按钮确认授权后, 客户端(*client*)即可向授权服务器(*authorization server*)获取资源访问令牌。

与 **Authorization Code Grant** 授权流程不同的是, **Device Authorization Grant** 并未使用*重定向*回调来通知客户端(*client*) 用户已完成授权。 相对的, 使用「Device Flow」授权流程的客户端(*client*)需要定时**轮询**授权服务器(*authorization server*) 提供的 API 端点确认授权进度。

以 GitHub 为例, 则是如下所示的 POST 请求(其中的 device_code 已脱敏):

```http
POST /login/oauth/access_token HTTP/1.1
Host: github.com
Accept: application/json
 
device_code=ABCDEF
&client_id=3934c6721961da9062bf
&grant_type=urn:ietf:params:oauth:grant-type:device_code
```

请求涉及 3 个参数, 分别是:
- device_code: 以前申请到的设备验证码
- client_id: GitHub OAuth App 的客户端标识(Client ID)
- grant_type: 授权类型, 目前必须是 "urn:ietf:params:oauth:grant-type:device_code"

> 轮询该接口时需要注意必须控制轮询间隔大于或等于**申请设备码**接口返回的轮询间隔(interval), 否则将容易触发 API 速率限制。

当用户确认授权后, 该接口将以以下形式返回响应(其中的 access_token 已脱敏):

```json
{
    "access_token": "gho_ABCDEFG",
    "token_type": "bearer",
    "scope": "public_repo"
}
```

::: details 延伸阅读: <em>Device Authorization Grant</em> 的特点
与其他授权类型相比, *Device Authorization Grant* 具有以下优势:
- 用户使用可信设备完全授权确认, 可有效保护用户账号安全。
- 授权流程完全不需要 **客户端密钥(*Client secret*)**, 可避免客户端密钥的泄露。
- 无需服务器后台服务或域名服务。
:::

## 4. 访问相关资源

完成以上步骤后, 客户端已成功获取到代表用户授权的访问令牌, 可以通过 [GitHub 接口文档](https://docs.github.com/en/rest/overview/api-versions) 中约定的方式访问授权范围(*scope*)内资源。

# 总结
本文以接入 GitHub 平台为例, 详细讲述了客户端应用接入 OAuth2.0 授权框架涉及到的知识要点，主要介绍了 2 种授权流程, 分别是:
1. Authorization Code Grant
2. Device Authorization Grant

两种授权流程各有优点, 但显然 **Device Authorization Grant** 更适合客户端应用。
