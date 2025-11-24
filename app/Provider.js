'use client'

import React, { useEffect } from 'react'
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './_components/AppSidebar'
import AppHeader from './_components/AppHeader'
import { useUser } from '@clerk/nextjs'
import { db } from '@/config/FirebaseConfig'
import { doc, getDoc, setDoc } from 'firebase/firestore'

function Provider({ children, ...props}) {

  // const user = useUser();

  const { user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn && user?.primaryEmailAddress?.emailAddress) {
      CreateNewUser();
    }
  }, [isLoaded, isSignedIn, user]);

  const CreateNewUser = async () => {

    const email = user?.primaryEmailAddress?.emailAddress;

    if (!email) {
      console.error("User email is undefined! Cannot create user.");
      console.error('Email', email)
      return; 
    } 

    const userRef = doc(db,"users", email);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()){
      console.log('Existing User')
      return;
    } else {
      const userData = {
        name: user?.fullName,
        email: user?.primaryEmailAddress?.emailAddress,
        createdAt: new Date(),
        remainingMsg: 5, //Free user
        plan: 'Free',
        credits: 1000 //Paid
      }

      await setDoc(userRef, userData);
      console.log('New User data saved')
    }
  }

  return (
    <NextThemesProvider 
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}>
      <SidebarProvider>
        <AppSidebar />
        <div className='w-full'>
          <AppHeader />
          {children}
        </div>
      </SidebarProvider>
    </NextThemesProvider>
  )
}

export default Provider