# 在线聊天

## 1. 安装 deno

> 下面列举的方式按照系统任选其一

使用 Shell (macOS 和 Linux):

```
curl -fsSL https://deno.land/x/install/install.sh | sh
```

使用 PowerShell (Windows):

```
iwr https://deno.land/x/install/install.ps1 -useb | iex
```

使用 Scoop (Windows):

```
scoop install deno
```

使用 Chocolatey (Windows):

```
choco install deno
```

使用 Homebrew (macOS):

```
brew install deno
```

使用 Cargo (Windows, macOS, Linux):

```
cargo install deno
```

## 2. 安装 chat_server

```bash
deno install --allow-read --allow-net https://cdn.jsdelivr.net/gh/ITECH3108FedUni/assignment_api/chat_server.js
```

运行 chat_server

```bash
deno run --allow-read --allow-net 'https://cdn.jsdelivr.net/gh/ITECH3108FedUni/assignment_api/chat_server.js' "$@"
```

然后用浏览器打开 `demo1/login.html`

注意：因为不能自己创建用户，所以需要根据 chat_server 里面已有的用户登录

查看所有用户 API [http://127.0.0.1:7777/api/users]()
