import { redirect } from "next/navigation"

// Redirect to login page by default
export default function AuthPage() {
  redirect("/auth/login")
}
