import { Client } from "https://deno.land/x/postgres/mod.ts";
import sodium from "https://deno.land/x/sodium/basic.ts";
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import * as djwt from "https://deno.land/x/djwt@v2.4/mod.ts";

const pgClient = new Client({
  user: "postgres",
  database: "ITECH3108_30407213_a2",
  hostname: "localhost",
  password: "123456",
  port: 5432,
});


await sodium.ready;
await pgClient.connect();  // 连接数据库
const secretKey = await crypto.subtle.generateKey({ name: "HMAC", hash: "SHA-512" }, true, ["sign", "verify"]);
const jwtAlgorithm = "HS512";
const jwtExpire = 60 * 60 * 24;  // 设置JWT的失效时间为 1天

// 创建API接口服务
const app = new Application();
const router = new Router();
const port = 8050;  // 运行在8050端口

async function register(ctx) {
  /**
   * 注册接口
   * 需要用户提交 username/fullname/password
   */
  const reqJson = await ctx.request.body.json();  // 获取请求发送的JSON数据
  const { username, fullname, password } = reqJson;
  const result = await pgClient.queryArray(`SELECT * FROM users WHERE username = '${username}' `);
  if (result.rows.length > 0) {
    ctx.response.status = 409;
    ctx.response.body = { message: "Username already exists" };
    return;
  } 
  // 密码加密，参考自课件 week_09/passwords/auth_simple.js 
  const hashPassword = sodium.crypto_pwhash_str(password,
      sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
      sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE);
  const newUser = await pgClient.queryObject(`INSERT INTO users (username, fullname, password) VALUES ('${username}', '${fullname}', '${hashPassword}')`);
  ctx.response.body = { username: username, fullname: fullname};
  ctx.response.status = 201;
  return;
}


async function login(ctx) {
  /**
   * 登录接口
   * 需要用户提交 username/password
   * password 需要使用 sodium.crypto_pwhash_str_verify() 进行验证
   */
  const reqJson = await ctx.request.body.json();
  const { username, password } = reqJson;
  const result = await pgClient.queryObject(`SELECT * FROM users WHERE username = '${username}' `);
  if (result.rows.length <= 0) {
    ctx.response.status = 404;
    ctx.response.body = { message: "User not found" };
    return;
  } 
  const dbUser = result.rows[0];
  // 密码验证，参考自课件 week_09/passwords/auth_simple.js 
  const passwordIsOk = sodium.crypto_pwhash_str_verify(dbUser.password, password);
  if (!passwordIsOk) {
    ctx.response.status = 401;
    ctx.response.body = { message: "Password is incorrect" };
    return;
  }
  // 生成JWT Token
  const jwt = await djwt.create(
    { alg: jwtAlgorithm, typ: "JWT" }, // header. typ is always JWT
    {
      exp: djwt.getNumericDate(jwtExpire), // set it to expire in 1 day
      auth: {username: username}, // any other keys we like
    },
    secretKey
  );
  ctx.response.body = { jwt: jwt, username: username, fullname: dbUser.fullname };
  ctx.response.status = 200;
}

async function shareLinks(ctx) {
  /**
   * 获取所有分享链接的接口
   * 注意，这里登录了和没登录返回的数据不是一致的
   * 因为登录了，需要隐藏用户不想看见的链接！！！
   * 排序是按照总分降序排列
   */
  let sql = `SELECT * FROM share_links ORDER BY total_score DESC`;
  if (ctx.username) {
    // 登录了的情况
    sql = `SELECT * FROM share_links WHERE id NOT IN (SELECT share_link_id FROM hidden_links WHERE username='${ctx.username}' ) ORDER BY total_score DESC`
  }
  const result = await pgClient.queryObject(sql)
  ctx.response.body = result.rows;
  ctx.status = 200;
}

async function addShareLink(ctx) {
  /**
   * 添加分享链接的接口
   * 注意，这个接口需要用户登录后才能使用！！！也就是ctx.username有值
   * 需要用户提交 link/title/description
   */
  if (!ctx.username) {
    ctx.response.status = 401
    ctx.response.body = { message: "Please login" }
    return
  }
  const reqJson = await ctx.request.body.json();  // 获取请求发送的JSON数据
  const { link, title, description } = reqJson;
  const result = await pgClient.queryObject(`INSERT INTO share_links (link, title, description) VALUES ('${link}','${title}', '${description}')`);
  ctx.response.body = { link, title, description};
  ctx.response.status = 201;
}


async function addHiddenLink(ctx) {
  /**
   * 隐藏link接口
   * 需要用户提交 link 的 id
   * 这个接口也需要用户登录
   */
  if (!ctx.username) {
    ctx.response.status = 401
    ctx.response.body = { message: "Please login" }
    return
  }
  const reqJson = await ctx.request.body.json();
  const { id } = reqJson;
  const result = await pgClient.queryObject(`INSERT INTO hidden_links (username, share_link_id) VALUES ('${ctx.username}', '${id}')`);
  ctx.response.body = {id, hidden: true};
  ctx.response.status = 201;
}


async function shareLinkScore(ctx) {
  /**
   * 分享链接的评分接口
   * 需要用户提交 link 的 id 和 score
   * score 只有 1 和 -1 两种评分，对应的就是 +1 分 和 -1 分
   * 这个接口也需要用户登录
   */
  if (!ctx.username) {
    ctx.response.status = 401
    ctx.response.body = { message: "Please login" }
    return
  }
  const reqJson = await ctx.request.body.json();
  const { id, score } = reqJson;
  const existsScored = await pgClient.queryObject(`SELECT * FROM scores WHERE username='${ctx.username}' AND share_link_id='${id}'`);
  if (existsScored.rows.length > 0) {
    // 如果该用户已经评分过，就直接返回了
    ctx.response.status = 409;
    ctx.response.body = { message: "You have already scored this link" };
    return;
  }
  const result = await pgClient.queryObject(`INSERT INTO scores (username, share_link_id, score) VALUES ('${ctx.username}', '${id}', '${score}')`);
  const updatedTotalScore = await pgClient.queryObject(`UPDATE share_links SET total_score = total_score + ${score} WHERE id = '${id}'`);
  ctx.response.body = {id, score};
  ctx.response.status = 201;
}


async function positiveShareLinks(ctx) {
  /**
   * 获取用户所有评分大于 0 的分享链接
   * 这里也需要用户登录了才能访问
   */
  if (!ctx.username) {
    ctx.response.status = 401
    ctx.response.body = { message: "Please login" }
    return
  }
  // 数据去 scores 表查询大于0 的分享链接
  const result = await pgClient.queryObject(`SELECT * FROM share_links WHERE id IN (SELECT share_link_id FROM scores WHERE score > 0 AND username='${ctx.username}' )`)
  ctx.response.body = result.rows;
  ctx.status = 200;
}


router.post("/register", register);  // 注册接口 POST
router.post("/login", login);  // 登录接口  POST
router.get("/share_links", shareLinks);  // 获取分享链接接口  GET
router.post("/share_links", addShareLink);  // 添加分享链接接口  POST
router.post("/share_links/hidden", addHiddenLink);  // 隐藏分享链接接口  POST
router.post("/share_links/score", shareLinkScore);  // 分享链接评分接口  POST
router.get("/share_links/positive", positiveShareLinks);  // 获取评分大于0的分享链接接口  GET

app.use(async (ctx, next) => {
  // 跨域支持，参考自：https://github.com/oakserver/oak/issues/154#issuecomment-640657239
  ctx.response.headers.set('Access-Control-Allow-Origin', "*")
  ctx.response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  ctx.response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  ctx.response.headers.set('content-type', 'application/json')  // 这里设置下，返回的数据类型都是JSON
  
  if (ctx.request.method === "OPTIONS") {
    ctx.response.status = 204;
    return
  }

  // 检测是否登录了
  if (ctx.request.headers.has("Authorization") && ctx.request.headers.get("Authorization")) {
    // 如果登录了，需要在这里处理下。
    const authHeader = ctx.request.headers.get("Authorization");
    const [type, token] = authHeader.split(" ");

    try {
      const payload = await djwt.verify(token, secretKey, jwtAlgorithm);
      const currentUser = payload.auth.username
      ctx.username = currentUser  // 把这个用户名保存下来，方便后面使用
    } catch (ex) {
      // 如果验证失败，就返回401，并提示用户需要重新登录
      ctx.response.status = 401;
      ctx.response.body = { message: "Invalid JWT. Please log in again" };
      return
    }
  }
  return next()
})
app.use(router.routes());
app.addEventListener("error", (e) => console.log(e));
app.addEventListener("listen", (e) => console.log(`Listening on port ${e.port}`));

await app.listen({ port: port });
