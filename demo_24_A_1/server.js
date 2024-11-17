import { Client } from "https://deno.land/x/postgres@v0.19.3/mod.ts";
import { serve } from "https://deno.land/std@0.90.0/http/server.ts";
import {
  getCookies,
  setCookie,
} from "https://deno.land/std@0.90.0/http/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";

const databaseInfo = {
  user: "postgres",
  password: "123456",
  database: "ITECH3108_30407210_a2",
  hostname: "localhost",
  port: 5432,
};  // 连接数据库的配置

const serverPort = 8080;

// 会话存储
var sessions = {};

// 连接postgresql数据库
const client = new Client(databaseInfo);

const decoder = new TextDecoder();
const headers = new Headers();

// 这里是设置允许跨域的响应头，这里允许所有来源的跨域请求
headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD, PUT");
headers.set("Access-Control-Allow-Headers", "Content-Type");
headers.set("content-type", "application/json");
headers.set("Access-Control-Allow-Credentials", true);

function generateRandomString(length = 16) {
  // 生成随机的字符串，用来作为 session 的key
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

async function readJson(req) {
  // 这个方法是去请求中读取JSON格式的数据，返回一个对象
  const buf = await Deno.readAll(req.body);
  return JSON.parse(decoder.decode(buf));
}

async function OptionsResponse(req) {
  // 这是返回状态码是 204 的response，用于处理 OPTIONS 请求
  req.respond({
    headers,
    status: 204,
  });
}

async function createUser(req) {
  // 创建用户，也就是注册用户的操作
  // 用户点击注册用户，就是这里进行验证
  const { username, password } = await req.json(req);  // 从请求中读取JSON数据
  if (!username || !password) {
    // 如果没有账号或者密码，就返回400响应
    return req.respond({
      headers,
      status: 400,
      body: JSON.stringify({
        message: "Username or password cannot be empty!",
      }),
    });
  }
  // 去数据库中查找，看是否已经有这个用户了！！！
  const result = await client.queryArray(
    `SELECT id,username,password FROM users WHERE username = '${username}'`
  );
  if (result.rows.length > 0) {
    // 如果有就返回403 响应
    return req.respond({
      headers,
      status: 403,
      body: JSON.stringify({ message: "User already exists!" }),
    });
  }
  // 密码加密存储，不是明文存储，加密使用的是 bcrypt
  const hashedPassword = await bcrypt.hash(password); // 密码使用 bcrypt 加密
  await client.queryArray(
    `INSERT INTO users (username, password) VALUES ('${username}', '${hashedPassword}');`
  ); // 插入到数据库中
  await client.queryArray("COMMIT");
  return req.respond({
    headers,
    status: 201,
    body: JSON.stringify({ message: "User created successfully!" }),
  });
}

async function login(req) {
  // 登录请求的处理，这里是登录的过程，这里需要验证账号和密码是否正确
  const { username, password } = await req.json(req);
  console.log(`username: ${username}`);
  // 检查 username 和 password 是否存在
  if (!username || !password) {
    return req.respond({
      headers,
      status: 400,
      body: JSON.stringify({
        message: "Username and password are required fields!",
      }),
    });
  }
  const result = await client.queryArray(
    `SELECT id,username,password FROM users WHERE username = '${username}'`
  );
  if (result.rows.length === 0) {
    // 用户不存在
    return req.respond({
      headers,
      status: 404,
      body: JSON.stringify({ message: "User does not exist!" }),
    });
  }

  const userInfo = result.rows[0];
  // 验证输入密码与存储的哈希密码是否匹配
  const isPasswordCorrect = await bcrypt.compare(password, userInfo[2]);
  if (isPasswordCorrect) {
    // 登录成功
    const sessionId = generateRandomString();
    sessions[sessionId] = {
      username: userInfo[1],
      isLoggedIn: true,
      id: userInfo[0],
    };
    // console.log('login success, ', sessions)
    return req.respond({
      headers: headers,
      status: 200,
      body: JSON.stringify({
        message: "Login successful!",
        data: { username: username, id: userInfo[0], token: sessionId },
      }),
    });
  }
  // 登录失败
  return req.respond({
    headers,
    status: 401,
    body: JSON.stringify({ message: "Incorrect password!" }),
  });
}

async function createNewLink(req) {
  // 创建新的链接，也就是用户分享链接的后端请求
  const { title, desc, link } = await req.json(req);
  const currentUserID = req.currentUserID;  // 这里是看用户是否登录了，登录了的话，这里再req中就会有这个 currentUserID 这个参数
  console.log(currentUserID)
  await client.queryArray(
    `INSERT INTO links (link, title, "desc", user_id) VALUES ('${link}', '${title}', '${desc}', ${currentUserID});`
  );  // 把数据插入到数据库中
  await client.queryArray("COMMIT");
  return req.respond({  // 返回201状态码，表示创建成功
    headers,
    status: 201,
    body: JSON.stringify({
      message: "Link created successfully!",
      data: { title, desc, link },
    }),
  });
}

async function getLinks(req) {
  // 获取所有链接，也就是获取所有的用户分享的链接
  // 但是这里登录 or 未登录，返回的数据不是一致的
  // 因为登录了，需要把用户隐藏掉的链接去掉，不能显示给用户看
  // 这里比较简单，就是直接去数据库中查询数据即可
  const currentUserID = req.currentUserID;
  let result = [];
  if (currentUserID) {
    // 登录状态
    result = await client.queryObject(
      `SELECT a.id,link,title,"desc",score, u.username FROM links a join users u on u.id = a.user_id
      where a.id not in (select link_id from bad_link c where c.user_id=${currentUserID})
      order by score desc;`
    );
  } else {
    // 未登录状态
    result = await client.queryObject(
      `SELECT a.id,link,title,"desc",score, u.username FROM links a join users u on u.id = a.user_id order by score desc;`
    );
  }

  return req.respond({
    headers,
    status: 200,
    body: JSON.stringify({
      message: "Links fetched successfully!",
      data: result.rows,
    }),
  });
}

async function updateLinkScore(req, linkID) {
  // 评分，分数是 1-5分， 其中 1，2 代表 差评，3，4，5 代表好评
  /*
  规则：
      如果评分是1，那就是扣分的，扣2分
      评分是2，扣1分
      评分是3，不扣不加
      评分是4，加1分
      评分是5，加2分


  而且，
    如果评分是 4，5，还需要把这个link加入到收藏表中，也就是我们的收藏夹中
  */
  const { score } = await req.json(req);

  const currentUserID = req.currentUserID;
  await client.queryArray("BEGIN");

  const result = await client.queryArray(`
    SELECT * FROM score_detail WHERE user_id = ${currentUserID} AND link_id = ${linkID}
    `);   // 这里是查询用户是否已经评价过这个link了

  if (result.rows.length > 0) {
    // 如果评价过了，那就只能更新数据，不能新建！！！ 是用UPDATE 语句，更新数据！！！
    await client.queryArray(`
        UPDATE score_detail SET score = ${score} WHERE user_id = ${currentUserID} AND link_id = ${linkID}
        `);
  } else {
    // 没有评价过，那就直接插入到 score_detail 表中
    await client.queryArray(`
        INSERT INTO score_detail (user_id, link_id, score) VALUES (${currentUserID}, ${linkID}, ${score})
        `);
  }
  // 计算总分
  const commentData = await client.queryObject(`
    SELECT score FROM score_detail WHERE link_id = ${linkID}
    `);
  let totalScore = 0;
  // 把这个link的所有用户的评分汇总，按规则汇总，然后
  for (let i = 0; i < commentData.rows.length; i++) {
    const currentScore = commentData.rows[i].score;
    if (currentScore === 1) {
      totalScore -= 2;
    } else if (currentScore === 2) {
      totalScore -= 1;
    } else if (currentScore === 3) {
      totalScore += 0;
    } else if (currentScore === 4) {
      totalScore += 1;
    } else if (currentScore === 5) {
      totalScore += 2;
    }
  }
  // 然后 更新 links 表中的 score 字段
  await client.queryArray(
    `UPDATE links SET score = ${totalScore} WHERE id = ${linkID};`
  );

  // 这里是把用户的好评数据删除，然后重新插入
  await client.queryArray(
    `DELETE FROM good_link WHERE user_id = ${currentUserID} AND link_id = ${linkID};`
  );
  if (score > 3) {
    await client.queryArray(
      `INSERT INTO good_link (user_id, link_id) VALUES (${currentUserID}, ${linkID});`
    );
  }
  await client.queryArray("COMMIT");
  req.respond({
    headers,
    status: 201,
    body: JSON.stringify({
      message: "Score successfully!",
      data: { id: linkID, score: score },
    }),
  });
}


async function getLinkPersonalScore(req, linkID) {
  // 获取用户对该link的评分
  const currentUserID = req.currentUserID;
  // 直接去 score_detail 表中 查询对应的数据即可
  const result = await client.queryObject(
    `SELECT score FROM score_detail WHERE user_id = ${currentUserID} AND link_id = ${linkID}`
  );
  return req.respond({
    headers,
    status: 200,
    body: JSON.stringify({
      message: "Link personal score fetched successfully!",
      data: result.rows.length > 0 ? result.rows[0] : null,
    }),
  });
}

async function hideLink(req, linkID) {
  // 隐藏链接，也就是把链接加入到 bad_link 表中
  // 这个接口需要用户登录
  const currentUserID = req.currentUserID;
  // 先查询这个链接是否已经在这个数据表中
  const result = await client.queryArray(
    `SELECT * FROM bad_link WHERE link_id = ${linkID} and user_id = ${currentUserID};`
  );
  if (result.rows.length < 1) {
    // 不存在才能插入到这个表中，防止数据重复
    await client.queryArray(
      `INSERT INTO bad_link (user_id, link_id) VALUES (${currentUserID}, ${linkID});`
    );
    
  } 
  return req.respond({
    headers,
    status: 201,
    body: JSON.stringify({
      message: "Link hidden successfully!",
      data: { id: linkID },
    }),
  });
}

async function getFavouriteLinks(req) {
  // 获取用户的收藏夹
  const currentUserID = req.currentUserID;
  // 这里直接去表中查询即可，这里是三张表关联查询，也就是 sql的join操作
  // good_link 表是中间表，关联两个表，links 和 users
  // 因为要显示用户名，所以要关联 users 表，还要显示 link 的描述
  const result = await client.queryObject(
    `SELECT a.id,link,title,"desc",score, u.username FROM good_link b join links a on a.id = b.link_id join users u on u.id = a.user_id where b.user_id=${currentUserID} order by score desc;`
  );
  console.log('fav: ', result)
  return req.respond({
    headers,
    status: 200,
    body: JSON.stringify({
      message: "Favourite links fetched successfully!",
      data: result.rows,
    }),
  });
}

async function main() {
  // 启动函数，也就是 http 服务的启动函数，这是后端的入口
  await client.connect(); // 连接数据库
  const server = serve({ port: serverPort });

  for await (const req of server) {
    const pathname = req.url;
    const method = req.method;
    const now = new Date();
    // 设置响应头，允许前端跨域访问
    headers.set("Access-Control-Allow-Origin", req.headers.get("origin"));

    console.log(`(${now.toISOString()}) Request: ${method} ${pathname}`);
    req.json = readJson;
    // console.log(req)
    const requestCookies = getCookies(req);
    const currentUserSession = requestCookies.sessionID;
    console.log("currentUserSession: ", currentUserSession);
    if (sessions[currentUserSession]) {
      // 已登录的用户，就在这里设置下 currentUserID 
      req.currentUserID = sessions[currentUserSession].id;
    }
    // console.log(sessions)
    console.log("current user id: ", req.currentUserID);

    // 下面是判断请求的路径，也就是 pathname
    try {
      if (method === "OPTIONS") {
        // 预检请求，直接返回 204 No Content
        await OptionsResponse(req);
      } else if (pathname === "/register" && method === "POST") {
        // 注册
        await createUser(req);
      } else if (pathname === "/login" && method === "POST") {
        // 登录
        await login(req);
      } else if (pathname.startsWith('/link/hidden') && req.currentUserID) {
        // 隐藏某个link
        const linkID = pathname.split("/")[3];
        await hideLink(req, linkID)
      } else if (pathname === "/links") {
        // 提交带有标题和描述的新链接
        if (method === "POST") {
          await createNewLink(req);
        } else if (method === "GET") {
          await getLinks(req);
        } else {
          req.respond({ headers, status: 405 });
        }
      } else if (pathname.startsWith("/link/score") && req.currentUserID) {
        const linkID = pathname.split("/")[3];
        if (method === "POST") {
          // 用户给这个链接评分
          await updateLinkScore(req, linkID);
        } else {
          await getLinkPersonalScore(req, linkID);
        }
      } else if (pathname.startsWith("/link/favourites") && req.currentUserID) {
        await getFavouriteLinks(req);
      } else {
        req.respond({ headers, status: 404 });
      }
    } catch (error) {
      console.log(error);
      req.respond({ headers, status: 500, body: error.message });
    }
  }
}

if (import.meta.main) {
  main();
  console.log(`Server running on port ${serverPort}`);
}

// deno run --allow-net --allow-read server.js
