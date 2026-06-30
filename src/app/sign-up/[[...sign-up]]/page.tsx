import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center relative p-4">
      <div className="absolute inset-0 bg-background/50 backdrop-blur-3xl z-0" />
      <div className="z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Create an Account</h1>
          <p className="text-nova-silver">Join Nova Sphere to start shopping.</p>
        </div>
        <SignUp 
          appearance={{
            elements: {
              card: "bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-8",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: "bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors",
              socialButtonsBlockButtonText: "text-white font-medium",
              dividerLine: "bg-white/10",
              dividerText: "text-nova-silver bg-transparent",
              formFieldLabel: "text-nova-silver font-medium",
              formFieldInput: "bg-black/50 border border-white/10 text-white focus:border-nova-blue rounded-xl px-4 py-3",
              formButtonPrimary: "bg-nova-blue hover:bg-nova-blue/80 text-white py-3 rounded-xl font-bold shadow-glow-primary transition-all",
              footerActionText: "text-nova-silver",
              footerActionLink: "text-nova-blue hover:text-nova-blue/80 font-medium",
              identityPreviewText: "text-white",
              identityPreviewEditButtonIcon: "text-nova-blue",
            }
          }}
        />
      </div>
    </div>
  );
}
