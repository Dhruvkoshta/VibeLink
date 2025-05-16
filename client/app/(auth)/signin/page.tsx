"use client";

import { Button } from "@/components/ui/button";
import { FaGithub } from "react-icons/fa";
import { FaGoogle } from "react-icons/fa";
import { usePostHog } from "posthog-js/react";
import { signIn } from "@/lib/auth-client";

export default function SigninPage() {
	return <Signin />;
}

function Signin() {
	const posthog = usePostHog();

	const handleGithubSignin = async () => {
		posthog.capture("signin_attempt", {
			method: "github",
		});

		await signIn.social({
			provider: "github",
			callbackURL: "/home",
		});
	};
	const handleGoogleSignin = async () => {
		posthog.capture("signin_attempt", {
			method: "google",
		});

		await signIn.social({
			provider: "google",
			callbackURL: "/home",
		});
	};

	return (
		<div className='w-full max-w-md space-y-8 rounded-xl border border-border bg-card/20 p-6 backdrop-blur-sm'>
			<div className='text-center'>
				<h2 className='text-3xl font-bold tracking-tight text-foreground'>
					Sign in to your account
				</h2>
				<p className='mt-2 text-sm text-muted-foreground'>
					Welcome back to Chat Pulse
				</p>
			</div>

			<div className='relative'>
				<div className='absolute inset-0 flex items-center'>
					<div className='w-full border-t border-border'></div>
				</div>
			</div>

			<Button
				onClick={handleGithubSignin}
				className='w-full flex cursor-pointer items-center justify-center gap-2 bg-background/50 hover:bg-background/80 text-foreground border border-border'
			>
				<FaGithub className='h-5 w-5' />
				<span>Github</span>
			</Button>
			<Button
				onClick={handleGoogleSignin}
				className='w-full flex cursor-pointer items-center justify-center gap-2 bg-background/50 hover:bg-background/80 text-foreground border border-border'
			>
				<FaGoogle className='h-5 w-5' />
				<span>Google</span>
			</Button>
		</div>
	);
}
