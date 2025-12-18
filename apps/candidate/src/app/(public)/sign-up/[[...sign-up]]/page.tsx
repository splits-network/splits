import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-[80vh] py-12">
      <SignUp />
    </div>
  );
}
