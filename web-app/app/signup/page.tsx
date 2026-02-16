import { SignUpForm } from "@/components/auth/signup-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Shield } from "lucide-react"

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Join BBSNS</h1>
          <p className="text-muted-foreground mt-2">Secure document notarization on the blockchain</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <SignUpForm />
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
              <p className="text-sm text-muted-foreground">
                Are you a professional?{" "}
                <Link href="/register-notary" className="text-emerald-500 hover:underline font-medium">
                  Apply as a Notary
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
