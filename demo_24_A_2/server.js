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
app.use(
  oakCors({
    origin: "http://127.0.0.1:4507",
    credentials: true,
    optionsSuccessStatus: 200,
  })
); // 开启跨域，这里的参考来自：https://deno.land/x/cors@v1.2.2#configuring-cors
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
  ctx.response.body = {
    message: "User created!",
    data: { username, fullname },
  };
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
  await ctx.state.session.set("fullname", result.rows[0].fullname);

  ctx.response.status = 200;
  ctx.response.body = { message: "Login successful!", data: result.rows[0] };
});

router.post("/api/links", async (ctx) => {
  // 创建一个link
  /**
   * 注意，这里link的总分，默认是10分，也就是创建一个link，他的total_score就是10分
   * 如果用户给这个link打分，1分就是扣2分，2分那就是扣1分，3分就是不扣不加，4分就是加1分，5分就是加2分，如果总分低于0，那就不再扣减
   * 数据排序是按照 pub_time 倒序
   */
  ctx.response.headers.set("Content-Type", "application/json");
  const userID = await ctx.state.session.get("userID");
  const fullname = await ctx.state.session.get("fullname");
  if (!userID) {
    // 没登录，如果没登录，那么查询的数据是没有 用户评分的，但是有总分
    ctx.response.status = 401;
    ctx.response.body = { message: "Please login first!" };
    return;
  }
  const jsonData = await ctx.request.body.json();
  const { title, link, describe } = jsonData;
  await dbClient.queryObject`INSERT INTO links (title, link, describe, total_score, user_id, pub_time, user_fullname)
    VALUES (${title}, ${link}, ${describe}, 10, ${userID}, NOW(), ${fullname})`;
  ctx.response.status = 201;
  ctx.response.body = { message: "Link created!", data: jsonData };
});

router.get("/api/links", async (ctx) => {
  // 获取所有的link

  ctx.response.headers.set("Content-Type", "application/json");
  const userID = await ctx.state.session.get("userID");
  let result = [];
  if (!userID) {
    // 没登录，如果没登录，那么查询的数据是没有 用户评分的，但是有总分
    console.log('user not login')
    result = await dbClient.queryObject`SELECT
    id, title, link, describe, pub_time, user_fullname, total_score
    FROM links ORDER BY pub_time DESC`;
  } else {
    console.log('user  logged, userID: ', userID)
    result = await dbClient.queryObject`SELECT id,
          title,
          link,
          describe,
          pub_time,
          user_fullname,
          total_score,
          score
        FROM links a
         left join (select score, link_id from link_score where user_id = ${userID}) b on a.id = b.link_id
         where id not in (select link_id from hidden_link where user_id=${userID}) ORDER BY a.pub_time DESC
         ;`;
  }
  ctx.response.body = { message: "Links fetched successfully!", data: result.rows };
  ctx.response.status = 200;
});


router.post("/api/links/:id/score", async (ctx) => {
  //* 如果用户给这个link打分，1分就是扣2分，2分那就是扣1分，3分就是不扣不加，4分就是加1分，5分就是加2分，如果总分低于0，那就不再扣减
  ctx.response.headers.set("Content-Type", "application/json");
  const userID = await ctx.state.session.get("userID");
  const jsonData = await ctx.request.body.json();
  const { score } = jsonData;
  if (!userID) {
    ctx.response.status = 401;
    ctx.response.body = { message: "Please login first!" };
    return;
  }
  const exists = await dbClient.queryObject`SELECT
    id
    FROM link_score WHERE user_id=${userID} and link_id=${ctx.params.id}`;
  if (exists.rows.length > 0) {
    // 只能评价一次
    ctx.response.status = 403;
    ctx.response.body = { message: "You have already rated it, you cannot rate it again!" };
    return
  } else {
    await dbClient.queryObject`INSERT INTO link_score (score, user_id, link_id)
      VALUES (${score}, ${userID}, ${ctx.params.id})`;
  }
  if (score == 1) {
    await dbClient.queryObject`UPDATE links SET total_score=total_score-2 WHERE id=${ctx.params.id}`;
  } else if (score == 2) {
    await dbClient.queryObject`UPDATE links SET total_score=total_score-1 WHERE id=${ctx.params.id}`;
  } else if (score == 4) {
    await dbClient.queryObject`UPDATE links SET total_score=total_score+1 WHERE id=${ctx.params.id}`;
  } else if (score == 5) {
    await dbClient.queryObject`UPDATE links SET total_score=total_score+2 WHERE id=${ctx.params.id}`;
  }

  ctx.response.status = 200;
  ctx.response.body = { message: "Score updated successfully!" };
})


router.get("/api/links/hidden/:id", async (ctx) => {
  // 把数据插入到hidden_link表中
  ctx.response.headers.set("Content-Type", "application/json");
  const userID = await ctx.state.session.get("userID");
  const linkID = ctx.params.id
  if (!userID) {
    ctx.response.status = 401;
    ctx.response.body = { message: "Please login first!" };
    return;
  }
  await dbClient.queryObject`INSERT INTO hidden_link (user_id, link_id)
    VALUES (${userID}, ${linkID})`;
    ctx.response.status = 200;
    ctx.response.body = { message: "Link hidden successfully!" };
})


router.get('/api/favourites', async (ctx) => {
  // 哪种数据是用户喜欢的，打分 > 3 的都是用户喜欢的
  ctx.response.headers.set("Content-Type", "application/json");
  const userID = await ctx.state.session.get("userID");
  if (!userID) {
    ctx.response.status = 401;
    ctx.response.body = { message: "Please login first!" };
    return;
  }
  const result = await dbClient.queryObject`select l.*
    from link_score a
            left join links l on a.link_id = l.id
    where l.user_id=${userID} and a.score > 3;`
    ctx.response.body = { message: "Favourites fetched successfully!", data: result.rows };
    ctx.response.status = 200;
})

await dbClient.connect(); // 连接数据库
await sodium.ready;

app.use(router.routes());
app.use(router.allowedMethods());
app.addEventListener("error", (e) => console.log(e));
app.addEventListener("listen", (e) =>
  console.log(`Listening on port ${e.port}`)
);

await app.listen({ port: port });
