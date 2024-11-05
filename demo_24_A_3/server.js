import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { Client } from "https://deno.land/x/postgres/mod.ts";
import sodium from "https://deno.land/x/sodium/basic.ts";
import * as djwt from "https://deno.land/x/djwt@v2.4/mod.ts";

// 配置PostgreSQL连接
const client = new Client({
  user: 'postgres',
  password: '123456',
  hostname: '127.0.0.1',
  database: 'ITECH3108_30407230_a2',
  port: 5432,
});

await client.connect();
await sodium.ready;

// 配置JWT
const secretKey = await crypto.subtle.generateKey(
  { name: "HMAC", hash: "SHA-512" },
  true,
  ["sign", "verify"]
);

// 用户认证使用JWT
const jwtAlgorithm = "HS512";


// 启动应用
const app = new Application();

// CORS 以及 处理 JWT 的中间件，让API接口支持跨域请求
app.use(async (ctx, next) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  ctx.response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (ctx.request.method === "OPTIONS") {
    ctx.response.status = 204;
  } else {

    if (ctx.request.headers.has("Authorization")) {
      // 如果请求的header中携带了 Authorization
      const authHeader = ctx.request.headers.get("Authorization");
      const [type, token] = authHeader.split(" ");
  
      try {
        const payload = await djwt.verify(token, secretKey, jwtAlgorithm);
        const {username, fullname} = payload.auth;
        ctx.loggedUserInfo = {username, fullname};  // 在ctx上记录下登录了的用户信息，如果没登录，这里会是 null
      } catch (ex) {
        console.log(ex);
        ctx.response.body = {error: 'Token is invalid'};
        return;
      }
    }

    await next();
  }
});

// 创建路由
const router = new Router();

// 注册接口
router.post("/register", async (ctx) => {
  const { username, fullname, password } = await ctx.request.body.json();
  try {
    const userExists = await client.queryArray(`SELECT * FROM users WHERE username = '${username}' `);
    if (userExists.rows.length > 0) {
      ctx.response.status = 409;
      ctx.response.body = { error: "Username already exists" };
      return;
    }
    const encryptPassword = sodium.crypto_pwhash_str(password,
      sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
      sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE);

    const newUser = await client.queryObject(`INSERT INTO users (username, fullname, password) VALUES ('${username}', '${fullname}', '${encryptPassword}')`);
    ctx.response.status = 201;
    ctx.response.body = { data: newUser.rows[0]};
  } catch (error) {
    console.error(error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to register user" };
  }
});

// 登录接口
router.post("/login", async (ctx) => {
  const { username, password } = await ctx.request.body.json();

  try {
    const result = await client.queryObject(`SELECT * FROM users WHERE username = '${username}' `);

    if (result.rows.length > 0) {
      const encryptPassword = result.rows[0].password;
      const passwordPass = sodium.crypto_pwhash_str_verify(
        encryptPassword,
        password,
      );
      if (!passwordPass) {
        // 密码错误
        ctx.response.status = 401;
        ctx.response.body = { error: "Invalid username or password" };
        return;
      }
      // 登录成功
      const jwt = await djwt.create(
        { alg: jwtAlgorithm, typ: "JWT" },
        {
          exp: djwt.getNumericDate(60), 
          auth: {
            username: username,
            fullname: result.rows[0].fullname,
          }, 
        },
        secretKey
      );
      ctx.response.status = 200;
      ctx.response.body = { token: jwt, fullname: result.rows[0].fullname };
    } else {
      ctx.response.status = 401;
      ctx.response.body = { error: "Invalid username or password" };
    }
  } catch (error) {
    console.error(error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to login" };
  }
});

// 获取所有link接口
router.get("/links", async (ctx) => {
  // 数据按照发布时间倒序排列
  const loggedUserInfo = ctx.loggedUserInfo;
  let sql = `SELECT * FROM links ORDER BY pub_time DESC`;
  if (loggedUserInfo) {
    // 如果登录了，需要隐藏用户不想看见的链接
    sql = `SELECT * FROM links WHERE link NOT IN (SELECT link FROM user_hidden_links WHERE username='${loggedUserInfo.username}' ) ORDER BY pub_time DESC`
  }
  const result = await client.queryObject(sql)
  ctx.response.body = result.rows;
  ctx.status = 200;
})

// 新建link接口
router.post("/links", async (ctx) => {
  // 用户创建link
  const loggedUserInfo = ctx.loggedUserInfo;
  if (!loggedUserInfo) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Please login" };
    return;
  }
  const { title, link, description } = await ctx.request.body.json();
  if (!title) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Title is required" };
    return;
  }
  if (!link) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Link is required" };
    return;
  }
  if (!description) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Description is required" };
  }
  const existsLink = await client.queryArray(`SELECT * FROM links WHERE link = '${link}' `);
  if (existsLink.rows.length > 0) {
    ctx.response.status = 409;
    ctx.response.body = { error: "Link already exists" };
    return;
  }
  const newLink = await client.queryObject(`INSERT INTO links (title, link, description, username, fullname) VALUES ('${title}', '${link}', '${description}', '${loggedUserInfo.username}', '${loggedUserInfo.fullname}')`);
  ctx.response.status = 201;
  ctx.response.body = { data: newLink.rows[0]};
})


// link评分接口
router.post("/links/:link", async (ctx) => {
  /*
   * 评分规则：如果是好评，就加1分，如果是差评，就减1分；只有好和差两种评价
   */ 
  const loggedUserInfo = ctx.loggedUserInfo;
  if (!loggedUserInfo) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Please login" };
    return;
  }
  const link = ctx.params.link
  const existsScored = await client.queryArray(`SELECT * FROM user_link_scores WHERE link = '${link}' AND username = '${loggedUserInfo.username}' `);
  if (existsScored.rows.length > 0) {
    ctx.response.status = 409;
    ctx.response.body = { error: "You have already scored this link" };
    return;
  }
  const { score } = await ctx.request.body.json();  // 评分接口，1代表 good，0代表 bad
  await client.queryObject(`INSERT INTO user_link_scores (link, username, good) VALUES ('${link}', '${loggedUserInfo.username}', ${score === 1? 'true': 'false'})`);
  if (score === 1) {
    await client.queryObject(`UPDATE links SET score = score + 1 WHERE link = '${link}'`);
    await client.queryObject(`UPDATE users SET points = points + 1 WHERE username = '${loggedUserInfo.username}'`)  // 用户积分
  } else {
    await client.queryObject(`UPDATE links SET score = score - 1 WHERE link = '${link}'`);  
    await client.queryObject(`UPDATE users SET points = points - 1 WHERE username = '${loggedUserInfo.username}'`)  // 用户积分
  }
  ctx.response.status = 201;
  ctx.response.body = { data: {link: link, good: score === 1}};
})


// 隐藏link接口
router.post("/links/:link/hide", async (ctx) => {
  const loggedUserInfo = ctx.loggedUserInfo;
  if (!loggedUserInfo) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Please login" };
    return;
  }
  const link = ctx.params.link
  await client.queryObject(`INSERT INTO user_hidden_links (link, username) VALUES ('${link}', '${loggedUserInfo.username}')`);
  ctx.response.status = 201;
  ctx.response.body = { data: {link: link, hidden: true}};
})

// 我的最爱接口
router.get("/links/favorite", async (ctx) => {
  const loggedUserInfo = ctx.loggedUserInfo;
  if (!loggedUserInfo) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Please login" };
    return;
  }
  const result = await client.queryObject(`SELECT b.* FROM user_link_scores a left join links b on a.link = b.link where a.username = '${loggedUserInfo.username}' and a.good = true ORDER BY b.score`);
  ctx.response.body = result.rows;
  ctx.status = 200;
})

// 使用路由
app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener("error", (e) => console.log(e));
app.addEventListener("listen", (e) => console.log(`Listening on port ${e.port}`));

// 监听端口
const port = 8000;
await app.listen({ port });
