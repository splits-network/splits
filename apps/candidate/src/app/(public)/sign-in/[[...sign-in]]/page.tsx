import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-[80vh] py-12">
      <SignIn />
    </div>
  );
}
