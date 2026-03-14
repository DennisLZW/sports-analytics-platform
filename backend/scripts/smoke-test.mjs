#!/usr/bin/env node
/**
 * 认证 API 冒烟测试（需先启动后端：npm run dev）
 * 使用：node scripts/smoke-test.mjs  或  npm run test:smoke
 */
const BASE = process.env.API_BASE || 'http://localhost:3001/api';
const email = `smoke-${Date.now()}@example.com`;
const password = 'test123456';

async function request(method, path, body = null, token = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  if (token) opts.headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, opts);
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  return { ok: res.ok, status: res.status, data };
}

async function main() {
  console.log('API 冒烟测试:', BASE);
  let token = null;

  // 1. 健康检查
  const health = await request('GET', '/health');
  if (!health.ok || !health.data?.ok) {
    console.error('❌ GET /health 失败', health.status, health.data);
    process.exit(1);
  }
  console.log('✅ GET /health');

  // 2. 注册
  const reg = await request('POST', '/auth/register', { email, password, name: 'Smoke' });
  if (reg.status === 201 && reg.data?.success && reg.data?.data?.token) {
    token = reg.data.data.token;
    console.log('✅ POST /auth/register');
  } else if (reg.status === 409) {
    console.log('⚠️ 注册 409（邮箱已存在），改用登录取 token');
    const login = await request('POST', '/auth/login', { email: 'smoke@example.com', password });
    if (login.ok && login.data?.data?.token) token = login.data.data.token;
  } else {
    console.error('❌ POST /auth/register', reg.status, reg.data);
    if (reg.status === 500) {
      console.error('提示：500 多为数据库连接或 Prisma 问题，请确认 Docker Postgres 已启动且 backend/.env 中 DATABASE_URL 正确，并在运行后端终端查看报错。');
    }
    process.exit(1);
  }

  if (!token) {
    console.error('❌ 无 token，无法测试 /auth/me');
    process.exit(1);
  }

  // 3. 当前用户
  const me = await request('GET', '/auth/me', null, token);
  if (!me.ok || !me.data?.data?.user) {
    console.error('❌ GET /auth/me', me.status, me.data);
    process.exit(1);
  }
  console.log('✅ GET /auth/me');

  console.log('\n全部通过.');
}

main().catch((e) => {
  if (e.cause?.code === 'ECONNREFUSED') {
    console.error('连接被拒绝，请先启动后端：cd backend && npm run dev');
  } else {
    console.error(e);
  }
  process.exit(1);
});
