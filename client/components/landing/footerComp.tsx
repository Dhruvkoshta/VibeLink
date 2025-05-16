import { Github, Twitter } from "lucide-react";
import { Footer } from "@/components/ui/footer";

function FooterComp() {
	return (
		<div className='w-full'>
			<Footer
				brandName='VibeLink'
				socialLinks={[
					{
						icon: <Twitter className='h-5 w-5' />,
						href: "https://twitter.com/dhruvkoshta04",
						label: "Twitter",
					},
					{
						icon: <Github className='h-5 w-5' />,
						href: "https://github.com/dhruvkoshta",
						label: "GitHub",
					},
				]}
				mainLinks={[
					{ href: "/", label: "Products" },
					{ href: "/", label: "About" },
					{ href: "/", label: "Blog" },
					{ href: "/", label: "Contact" },
				]}
				legalLinks={[
					{ href: "/", label: "Privacy" },
					{ href: "/", label: "Terms" },
				]}
				copyright={{
					text: "© 2025 VibeLink",
					license: "All rights reserved",
				}}
			/>
		</div>
	);
}

export { FooterComp };
