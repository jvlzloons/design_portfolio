import { useEffect } from "react";

export default function SignInPage() {
  useEffect(() => {
    window.location.replace(
      "https://accounts.jvlzloona.com/sign-in?redirect_url=https://jvlzloona.com/admin"
    );
  }, []);

  return null;
}