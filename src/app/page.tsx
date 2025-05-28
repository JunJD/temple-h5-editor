import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth" // 导入 authOptions


export default async function Page() { // 将函数修改为异步函数
  const session = await getServerSession(authOptions) // 传递 authOptions

  if (!session) {
    // 如果没有会话，重定向到登录页面
    // 假设登录页面路由为 /auth/signin，如果不是，请替换为正确的路由
    redirect('/api/auth/signin') 
  } else {
    // 如果有会话，重定向到 /client
    redirect('/client')
  }
}
