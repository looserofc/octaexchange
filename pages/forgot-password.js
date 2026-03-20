import dynamic from "next/dynamic";

const ForgotPasswordPage = dynamic(
  () => import("../src/components/auth/ForgotPasswordPage"),
  { ssr: false }
);

export default function ForgotPasswordRoute() {
  return <ForgotPasswordPage />;
}