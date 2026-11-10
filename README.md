# Kick & Keys · 足球打字学院

面向小学键盘初学者的足球主题打字游戏。

- **玩游戏：** https://siliconlabcn-lab.github.io/edu/kick-keys/
- **源码：** https://github.com/siliconlabcn-lab/kick-keys
- **发布状态：** https://github.com/siliconlabcn-lab/kick-keys/actions

## 开发和更新

使用 Node.js 24 LTS：

```sh
npm ci
npm run dev
```

打开终端提示的地址，并访问 `/edu/kick-keys/`。

```sh
npm test
npm run build
npm run preview
```

将修改推送到本仓库 `main` 分支，即触发 `Publish game to EDU`。流程检查、构建后，仅更新 `siliconlabcn-lab/edu` 仓库的 `kick-keys/` 文件夹。EDU 首页和其他项目不受影响。GitHub Pages 随后发布，整个过程通常需要几分钟；以两个仓库的 Actions 成功状态为准。

`edu/kick-keys/` 是生成文件，请不要直接在那里修改游戏。需要回退时，在本源码仓库 revert 对应提交，再推送 main。`build-info.json` 记录线上版本对应的源码提交。

## 功能

- A–Z 每个字母单独一课，再练数字 0–9、组合复习及指法巩固。
- 彩色键盘与足球手套同步提示，支持逐渐隐藏提示、按键音效、传球射门动效。
- 足球世界地图、国家贴纸、球员故事和规则问答。
- 公开版本只显示小球员。拼音、英语、符号、成长测试和足球打字游戏暂时锁定，所有入口遵循同一规则。

## 存档和换网址

进度保存在当前浏览器的 `kick-and-keys-v2:child` 中，不上传 GitHub。稳定网址下更新程序不会清除存档；清除网站数据、换浏览器或换设备后，需要导入备份。

从原来的 Sites 网址迁移：

1. 在原来玩游戏的浏览器、个人资料中，打开旧网址的「成长记录」。
2. 在「存档小背包」点击「导出存档」。
3. 打开新网址，在「成长记录」点击「导入存档」，选择刚下载的 JSON 文件并确认合并。

导入会合并课程和记录、保留较高的累计星星；不会重复奖励，最多显示最近 100 次练习。导入前的进度保存在浏览器的 `kick-and-keys-v2:child:before-import` 备份键。家长测试档案不展示、不合并。存档版本与游戏版本独立，后续格式调整必须保留兼容迁移。

## 自动发布权限

`EDU_DEPLOY_KEY` 是本仓库 Actions Secret，对应 EDU 仓库的专用写入 Deploy Key。它只授权访问 EDU 仓库，不能访问账号的其他仓库；工作流仅同步 `kick-keys/`。私钥不在源码或构建产物中。官方 Actions 固定到提交 SHA，使用 GitHub 官方公布的 SSH 主机密钥。

若撤销该 Deploy Key 或 Secret，已上线游戏仍可访问，但后续自动发布会失败。重新配置一对专用 Deploy Key/Secret 即可恢复。不要把个人 GitHub Token 写入代码。

## 素材与范围

本项目不包含登录或云端存档，也不能识别孩子实际使用哪根手指。拼音模块目前练习字母序列，尚未包含中文输入法候选字教学。

素材说明见 [ARTWORK.md](ARTWORK.md)，足球知识和地图出处见 [SOURCES.md](SOURCES.md)。
