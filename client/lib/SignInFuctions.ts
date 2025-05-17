"use server"

import { signIn } from "./auth-client";



export const handleGithubSignin = async () => {
		

		await signIn.social({
			provider: "github",
			callbackURL: "/home",
		});
	};
export const handleGoogleSignin = async () => {

		await signIn.social({
			provider: "google",
			callbackURL: "/home",
		});
	};