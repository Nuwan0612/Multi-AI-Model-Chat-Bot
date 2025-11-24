'use client'

import React, { useEffect, useState } from 'react'
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './_components/AppSidebar'
import AppHeader from './_components/AppHeader'
import { useUser } from '@clerk/nextjs'
import { db } from '@/config/FirebaseConfig'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { AiSelectedModelContext } from '@/context/AiSelectedModelContext'
import { DefaultModel } from '@/shared/AiModelsShared'
import { UserDetailContext } from '@/context/UserDetailsContext'

function Provider({ children, ...props}) {

  // const user = useUser();

  const { user, isLoaded, isSignedIn } = useUser();

  const [aiSelectedModels, setAiSelectedModels] = useState(DefaultModel)
  const [userDetail, setUserDetail] = useState()

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
      const userInfo = userSnap.data();
      setAiSelectedModels(userInfo?.selectedModelPref);
      setUserDetail(userInfo)
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
      setUserDetail(userData)
    }
  }

  return (
    <NextThemesProvider 
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}>
      <UserDetailContext.Provider value={{userDetail, setUserDetail}}>
        <AiSelectedModelContext.Provider value={{aiSelectedModels, setAiSelectedModels}}>
          <SidebarProvider>
              <AppSidebar />
              <div className="flex-1 w-full">
                <AppHeader />
                {children}
              </div>
          </SidebarProvider>
        </AiSelectedModelContext.Provider>
      </UserDetailContext.Provider>
    </NextThemesProvider>
  )
}

export default Provider