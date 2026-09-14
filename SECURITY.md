# Security policy

## Supported versions

| Version | Supported |
| --- | --- |
| 2.1.x | Yes |
| Earlier versions | No |

## Reporting a vulnerability

请不要在公开 Issue 中披露尚未修复的漏洞。请使用 GitHub 仓库的
**Security → Report a vulnerability** 提交私密报告，并包含：

- 受影响页面或文件；
- 可复现步骤和影响；
- 浏览器与操作系统；
- 如有，建议的缓解方式。

维护者会尽快确认报告，并在完成评估后协商披露时间。请勿提交真实
账号、训练记录或其他敏感资料作为测试样本。

## Security model

这是纯静态教学原型：

- 没有服务端、数据库、真实身份认证或访问控制；
- 演示资料和训练内容保存在当前浏览器的 LocalStorage；
- 页面不会主动上传数据，但同源脚本仍可读取该站点的 LocalStorage；
- 正式部署应启用 HTTPS、合理的 Content Security Policy 与可信托管；
- 不应把演示登录当作安全边界，也不应输入真实密码、健康资料或身份信息。

本项目不是紧急求助、医疗或心理危机服务。若有人处于现实危险中，请
联系当地紧急服务或合格专业人员；不要通过漏洞报告渠道寻求即时支持。
