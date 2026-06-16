# PhD Application Tracker

一个轻量的博士申请期自律记录工具，用来追踪每天的科研阅读、英语学习和套磁申请进展。

## 功能

- 记录每天看了多少篇文章、阅读时长、文章标题和科研收获
- 记录英语学习时长、学习类型、学习内容和复习点
- 记录套磁老师数量、申请进度、老师名单和备注
- 自动汇总今日指标、近 7 天统计和历史记录
- 支持导出/导入 JSON 备份数据

## 在线使用

GitHub Pages 地址通常是：

```text
https://0612Leo.github.io/phd-application-tracker/
```

## 本地使用

直接用浏览器打开 `index.html`，或启动一个本地静态服务器：

```bash
python3 -m http.server 8765
```

然后访问：

```text
http://localhost:8765/index.html
```

## 关于多设备数据

当前版本使用浏览器本地存储。部署到 GitHub Pages 后，不同设备都能访问同一个网页，但每台设备的数据不会自动同步。

临时方案：在一台设备点击“导出 JSON”，到另一台设备点击“导入 JSON”。

长期方案：如果需要真正自动同步，可以接入 Supabase 或 Firebase。
