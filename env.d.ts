/// <reference types="@cloudflare/workers-types" />

// Cloudflare Pages 绑定资源类型声明
// KV namespace 绑定名：KV_NAMESPACE（在 Cloudflare Pages 项目设置中绑定）
interface Env {
  KV_NAMESPACE: KVNamespace;
}
