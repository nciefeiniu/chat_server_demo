// Monkey Site Services
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { Client } from "https://deno.land/x/postgres/mod.ts";
import sodium from "https://deno.land/x/sodium/basic.ts";
import { Session } from "https://deno.land/x/oak_sessions@v4.1.11/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

const dbClient = new Client({
  user: "postgres",
  database: "ITECH3108_30407223_a2",
  hostname: "localhost",
  password: "123456",
  port: 5432,
});

const app = new Application();
app.use(oakCors({
  origin: 'http://127.0.0.1:4507',
  credentials: true,
  optionsSuccessStatus: 200,
})); // 开启跨域，这里的参考来自：https://deno.land/x/cors@v1.2.2#configuring-cors
app.use(Session.initMiddleware()); // Hook it up as middleware
const router = new Router();
const port = 8000;

router.post("/api/users/", async (ctx) => {
  // 新建用户，携带json数据 {"username":"xxx","password":"xxx","fullname":"xxx"}
  const jsonData = await ctx.request.body.json();
  const { username, password, fullname } = jsonData;

  const results = await dbClient.queryObject`SELECT
    username, fullname, password
    FROM users WHERE username=${username}`;

  ctx.response.headers.set("Content-Type", "application/json");

  if (results.rows.length > 0) {
    ctx.response.status = 400;
    ctx.response.body = { message: "Username exists!" };
    return;
  }
  const hash = sodium.crypto_pwhash_str(
    password,
    sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE
  );
  await dbClient.queryObject`INSERT INTO users (username, fullname, password)
    VALUES (${username}, ${fullname}, ${hash})`;
  ctx.response.status = 201;
  ctx.response.body = { message: "User created!", data: {username, fullname} };
});

router.post("/api/login/", async (ctx) => {
  const jsonData = await ctx.request.body.json();
  const { username, password } = jsonData;
  ctx.response.headers.set("Content-Type", "application/json");
  const result = await dbClient.queryObject`SELECT
    id, username, fullname, password
    FROM users WHERE username=${username}`;
  if (result.rows.length === 0) {
    ctx.response.status = 404;
    ctx.response.body = { message: "User does not exist!" };
    return;
  }
  const hash = result.rows[0].password;
  const matches = sodium.crypto_pwhash_str_verify(hash, password);
  if (!matches) {
    ctx.response.status = 401;
    ctx.response.body = { message: "Invalid password!" };
    return;
  }
  await ctx.state.session.set("userID", result.rows[0].id);
  ctx.response.status = 200;
  ctx.response.body = { message: "Login successful!", data: result.rows[0] };
});

await dbClient.connect(); // 连接数据库
await sodium.ready;

app.use(router.routes());
app.use(router.allowedMethods());
app.addEventListener("error", (e) => console.log(e));
app.addEventListener("listen", (e) =>
  console.log(`Listening on port ${e.port}`)
);

await app.listen({ port: port });
