import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  // Secret for Next-auth, without this JWT encryption/decryption won't work
  secret: process.env.NEXTAUTH_SECRET,

  // Configure one or more authentication providers
  providers: [
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_APP_CLIENT_ID as string,
    //   clientSecret: process.env.GOOGLE_APP_CLIENT_SECRET as string,
    //   httpOptions: {
    //     timeout: 10000 // 增加到 10 秒
    //   }
    // }),
    CredentialsProvider({
      name: 'Local',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("[Auth] Authorize function called with credentials:", credentials);
        // 在这里实现简单的身份验证逻辑
        if (credentials?.username === 'wxkls' && credentials?.password === 'Kailitianxia321.wxkls') {
          console.log("[Auth] Credentials matched for test user.");
          return {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            image: 'https://avatar.vercel.sh/test'
          }
        }
        console.log("[Auth] Credentials did not match or were not provided correctly.");
        return null
      }
    })
  ]
}
