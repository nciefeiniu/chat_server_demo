import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { Client } from "https://deno.land/x/postgres/mod.ts";
import { v4 } from "https://deno.land/std@0.138.0/uuid/mod.ts";
import sodium from "https://deno.land/x/sodium/basic.ts";


const pgConn = new Client({
  user: "postgres",
  database: "ITECH3108_30407215_a2",
  hostname: "localhost",
  password: "123465",
  port: 5432,
});

await pgConn.connect();  // 连接postgresql数据库
await sodium.ready;

// Add a route to /login, that sets a variable in the session
router.post("/login", async (ctx) => {  // post 请求方法
  const jsonData = await ctx.request.body.json();  // 获取前端请求发送过来的JSON数据
  const { username, password } = jsonData;
  const result = await pgConn.queryArray(`SELECT * FROM users WHERE username='${username}'`);
  if (result.rows.length == 0) {
    ctx.response.body = { code: 404, message: "User not found" };
  } else {
    const user = result.rows[0];
    const hash = user[2]
    if (sodium.crypto_pwhash_str_verify(hash, password)) {
      ctx.response.body = { code: 200, message: "Login successful" };
    } else {
      ctx.response.body = { code: 401, message: "Invalid password" };
    }
  }
});



const app = new Application();
const router = new Router();
const port = 8000;





app.use(router.routes());

app.addEventListener("error", (e) => console.log(e));
app.addEventListener("listen", (e) => console.log(`Listening on port ${e.port}`));

await app.listen({ port: port });
