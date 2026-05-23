import { AuthForm } from "@/app/components/auth-form";

export default function RegisterPage() {
  return (
    <section className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
      <AuthForm mode="register" />
    </section>
  );
}
