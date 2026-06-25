# Repository Guidelines

## 项目结构与模块组织

本仓库是一个 VuePress 2 静态博客。主要内容位于 `src/`：中文文章放在 `src/_posts/<topic>/`，英文文章放在 `src/en/_posts/<topic>/`，首页与简历页分别是 `src/README.md`、`src/en/README.md`、`src/resume/` 和 `src/en/resume/`。VuePress 配置与自定义主题代码位于 `src/.vuepress/`，包括 `config.ts`、`theme.ts`、`navbar/`、`theme/`、`styles/` 和 `libs/`。静态资源放在 `src/.vuepress/public/`，常用图片路径为 `src/.vuepress/public/img/`。部署清单在 `runtime/`，GitHub Actions 工作流在 `.github/workflows/`。

## 构建、测试与本地开发命令

- `npm install`：按 `package-lock.json` 安装依赖。
- `npm run docs:dev`：启动本地 VuePress 开发服务。
- `npm run docs:clean-dev`：清理缓存后启动开发服务。
- `npm run docs:build`：构建生产站点到 `src/.vuepress/dist`，也是主要校验命令。
- `npm run docs:update-package`：运行 VuePress 包更新工具。
- `./build.sh`：使用 Docker 构建 `shabbywu/blog` 镜像。

本地建议使用 Node.js 20，与 GitHub Pages 工作流保持一致。

## 编码风格与命名约定

VuePress 配置和主题代码使用 TypeScript ES Modules，修改时遵循相邻代码的格式。Markdown 文章使用 YAML frontmatter，常见字段包括 `date`、`title`、`category`、`tags` 和 `draft`。文章文件名沿用 `YYYY-MM-DD-Title.md` 格式，并按主题目录归类。文章图片放入 `src/.vuepress/public/img/`，引用路径示例为 `/img/example.png`。仅将未发布内容设置为 `draft: true`，这类内容会进入加密草稿路径。

## 测试与验证要求

当前没有独立测试框架。提交前至少运行 `npm run docs:build`。如果修改导航、主题组件、样式或简历页，还应运行 `npm run docs:dev`，检查中英文首页、文章页和简历页。注意链接与资源文件大小写，CI 运行在 Linux 环境。

## 提交与 Pull Request 规范

近期提交多使用简短祈使句或轻量 conventional 前缀，例如 `update resume`、`enhance: 移动端隐藏无关信息`。提交标题保持简洁，必要时说明影响范围。PR 应说明内容或主题变更、列出已执行的验证、关联相关 issue；涉及可见布局或简历改动时，请附截图。生产部署由 `master` 分支触发 GitHub Pages 工作流。

## 安全与配置提示

不要提交密钥或私有部署参数。GitHub Actions 依赖仓库 secrets 提供镜像仓库、CDN 和 Kubernetes 凭据。修改 `runtime/*.yaml` 或 VuePress 配置时，避免写入环境专属 token，并保持部署清单易于审查。
