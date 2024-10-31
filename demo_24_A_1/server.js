import { Client } from "https://deno.land/x/postgres@v0.19.3/mod.ts";
import { serve } from "https://deno.land/std@0.90.0/http/server.ts";
import { getCookies } from "https://deno.land/std@0.90.0/http/mod.ts"; 
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";

const databaseInfo = {
  user: "postgres",
  password: "123456",
  database: "ITECH3108_30407210_a2",
  hostname: "localhost",
  port: 5432,
};

const serverPort = 8080;

// 会话存储
const sessions = {};

// 连接postgresql数据库
const client = new Client(databaseInfo);

const decoder = new TextDecoder();
const headers = new Headers();

headers.set("Access-Control-Allow-Origin", "*");
headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
headers.set("Access-Control-Allow-Headers", "Content-Type");


function generateRandomString(length=16) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

async function readJson(req) {
  const buf = await Deno.readAll(req.body);
  return JSON.parse(decoder.decode(buf));
}

async function OptionsResponse(req) {
  req.respond({
    headers,
    status: 204,
  });
}

async function createUser(req) {
  // 创建用户，也就是注册用户的操作
  const { username, password } = await req.json(req);
  if (!username || !password) {
    return req.respond({
      headers,
      status: 400,
      body: JSON.stringify({
        message: "Username or password cannot be empty!",
      }),
    });
  }
  const result = await client.queryArray(
    `SELECT id,username,password FROM users WHERE username = '${username}'`
  );
  if (result.rows.length > 0) {
    return req.respond({
      headers,
      status: 403,
      body: JSON.stringify({ message: "User already exists!" }),
    });
  }
  const hashedPassword = await bcrypt.hash(password); // 密码使用 bcrypt 加密
  await client.queryArray(
    `INSERT INTO users (username, password) VALUES ('${username}', '${hashedPassword}');`
  );
  await client.queryArray("COMMIT");
  return req.respond({
    headers,
    status: 201,
    body: JSON.stringify({ message: "User created successfully!" }),
  });
}

async function login(req) {
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
    sessions[sessionId] = { username: userInfo[1], isLoggedIn: true, id: userInfo[0] }
    const loginHeaders = new Headers();
    loginHeaders.set("Access-Control-Allow-Origin", "*");
    loginHeaders.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    loginHeaders.set("Access-Control-Allow-Headers", "Content-Type");
    loginHeaders.set("Set-Cookie", `sessionId=${sessionId}; Path=/; HttpOnly`);
    return req.respond({
      headers: loginHeaders,
      status: 200,
      body: JSON.stringify({
        message: "Login successful!",
        data: { username: username, id: userInfo[0] },
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

async function main() {
  await client.connect(); // 连接数据库
  const server = serve({ port: serverPort });

  for await (const req of server) {
    const pathname = req.url;
    const method = req.method;
    const now = new Date();
    console.log(`(${now.toISOString()}) Request: ${method} ${pathname}`);
    req.json = readJson;
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
      } else if (pathname === "/update" && method === "PUT") {
      } else if (pathname === "/delete" && method === "DELETE") {
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
