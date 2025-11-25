"use client"

import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { SignInButton, useUser } from "@clerk/nextjs"
import { Bolt, Moon, Sun, User2, Zap } from "lucide-react"
import { useTheme } from "next-themes"
import Image from "next/image"
import UsageCreditProgress from "./UsageCreditProgress"
import { collection, getDoc, getDocs, query, where } from "firebase/firestore"
import { db } from "@/config/FirebaseConfig"
import { useEffect, useState } from "react"
import moment from "moment"
import Link from "next/link"



export function AppSidebar() {
  const {theme, setTheme} = useTheme();
  const { user, isLoaded, isSignedIn } = useUser();
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    user && GetChartHistory();
  },[user])


  const GetChartHistory = async () => {
    let email = user?.primaryEmailAddress?.emailAddress;
    if(!email) return;
    const q = query(collection(db,'chatHistory'),where("userEmail","==", email));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      console.log(doc.id, doc.data())
      setChatHistory(prev => [...prev, doc.data()])
    });
  }

  const getLastUserMessageFromChat = (chat) => {
    const allMessages = Object.values(chat.messages).flat();
    const userMessages = allMessages.filter(msg => msg.role == 'user');

    const lastUserMsg = userMessages[userMessages.length-1]?.content || null;

    const lastUpdated = chat.lastUpdated || Date.now();
    const formattedDate = moment(lastUpdated).fromNow();

    return {
      chatId: chat.chatId,
      message: lastUserMsg,
      lastMsgDate: formattedDate
    }
  }

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // prevents hydration error

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Image src={"/logo.svg"} alt='logo' width={60} height={60} className = 'w-[40px] h-[40px]'/>
              <h2 className="font-bold text-xl">Multi AI Chat Bot</h2>
            </div>
            <div>
              {theme =='light' ?
                <Button variant={ 'ghost' } onClick = {() => setTheme('dark')}><Sun /></Button> : 
                <Button variant={ 'ghost' } onClick = {() => setTheme('light')}><Moon /></Button>
              }
            </div>
          </div>
          {user ?
            <Link href={'/'}>
              <Button className='mt-7 w-full' size="lg">+ New Chat</Button>
            </Link>
            :
            <SignInButton>
              <Button className='mt-7 w-full' size="lg">+ New Chat</Button>
            </SignInButton>
          }
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <div className="p-3">
            <h2 className="font-bold text-lg">Chat</h2> 
            { !user && <p className="text-sm text-gray-40">Sign in to start chatting with multiple AI Models</p> }

            <div className="overflow-auto">
              {chatHistory.map((chat, index) => (
                <Link href={'?chatId='+chat.chatId} key={index} className="mt-2 ">
                  <div className="hover:bg-gray-100 cursor-pointer p-3">
                    <h2 className="text-sm text-gray-400">{getLastUserMessageFromChat(chat).lastMsgDate}</h2>
                    <h2 className="text-lg line-clamp-1">{getLastUserMessageFromChat(chat).message}</h2>
                  </div>
                  <hr className="my-3"/>
                </Link>
              ))}
            </div>
          </div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-3 mb-10">
          { !user ? 
            <SignInButton mode="modal">
              <Button className='w-full' size={'lg'}>Sign In/Sign Up</Button>
            </SignInButton>
            :
            <div>
              <UsageCreditProgress />
              <Button className={'w-full mb-3'}> <Zap /> Upgrade Plan </Button>
              <Button className="flex w-full" variant={'ghost'}>
                <User2 /> <h2>Settings</h2>
              </Button>
            </div>
          }
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}