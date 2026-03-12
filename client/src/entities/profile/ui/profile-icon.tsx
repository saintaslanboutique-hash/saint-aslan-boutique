import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";


export default function ProfileIcon() {
    const router = useRouter();
    const session = useSession();
    const user = session.data?.user;
    if (!user) return null;
    return (

        <HoverCard openDelay={10} closeDelay={100}>
            <HoverCardTrigger asChild>
                <Link href="/profile" className="cursor-pointer">
                    <Avatar className="w-10 h-10 -mt-4">
                       
                        <AvatarFallback>
                            {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </Link>
            </HoverCardTrigger>

            <HoverCardContent className="flex w-64 flex-col gap-0.5">
                <div className="font-semibold">{user.username}</div>
                <Button variant="link" onClick={()=>router.push('/profile')} className="w-full">Profile</Button>
                <Button variant="link" onClick={()=>signOut()} className="w-full">Logout</Button>
                
            </HoverCardContent>

        </HoverCard>


    )
}