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
deno install --allow-read --allow-net https://cdn.jsdelivr.net/gh/ITECH3108FedUni/assignment_api@v2022.05/chat_server.js
```

运行 chat_server

```bash
deno run --allow-read --allow-net 'https://cdn.jsdelivr.net/gh/ITECH3108FedUni/assignment_api@v2022.05/chat_server.js' "$@"
```

注意：因为不能自己创建用户，所以需要根据 chat_server 里面已有的用户登录

查看所有用户 API [http://127.0.0.1:7777/api/users]()



## 3. 安装file_server

```bash
# deno 直接运行file_server，但是注意，这个需要在目录下面，比如 demo_23_1，你需要先cd demo_23_1，然后在执行下面的命令
deno run --allow-net --allow-read --watch https://deno.land/std@0.157.0/http/file_server.ts ./
```

## 4. 用浏览器打开网页

打开这个网址即可 [http://localhost:4507/](http://localhost:4507/)