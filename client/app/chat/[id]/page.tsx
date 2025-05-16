"use client";

import ChatBase from "@/components/chat/ChatBase";
import ChatLoading from "@/components/chat/ChatLoading";
import { useParams } from "next/navigation";
import { Suspense } from "react";

export default function Chat() {
	const params = useParams();
	const id = params.id as string;

	return (
		<div className='flex flex-col h-screen bg-background overflow-x-hidden'>
			<main className='flex-1 overflow-hidden'>
				<Suspense fallback={<ChatLoading />}>
					<ChatBase groupId={id} />
				</Suspense>
			</main>
		</div>
	);
}
