'use client'

import React, { useEffect, useState } from 'react'
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './_components/AppSidebar'
import AppHeader from './_components/AppHeader'
import { useUser } from '@clerk/nextjs'
import { db } from '@/config/FirebaseConfig'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { AiSelectedModelContext } from '@/context/AiSelectedModelContext'
import { DefaultModel } from '@/shared/AiModelsShared'
import { UserDetailContext } from '@/context/UserDetailsContext'

function Provider({ children, ...props}) {

  const { user, isLoaded, isSignedIn } = useUser();

  const [aiSelectedModels, setAiSelectedModels] = useState(DefaultModel)
  const [userDetail, setUserDetail] = useState()
  const [messages, setMessages] = useState({})

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
      setAiSelectedModels(userInfo?.selectedModelPref ?? DefaultModel);
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

  useEffect(() => {
    if(aiSelectedModels){
      // Update to Firebase Databse
      UpdateAIModelSelection()
    }
  }, [aiSelectedModels])

  const UpdateAIModelSelection = async () => {
    if(!user?.primaryEmailAddress?.emailAddress) return;
    const docRef = doc(db, "users", user?.primaryEmailAddress?.emailAddress);
    await updateDoc(docRef, {
      selectedModelPref: aiSelectedModels
    })
  }

  return (
    <NextThemesProvider 
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}>
      <UserDetailContext.Provider value={{userDetail, setUserDetail}}>
        <AiSelectedModelContext.Provider value={{aiSelectedModels, setAiSelectedModels, messages, setMessages}}>
          <SidebarProvider>
              <AppSidebar />
              <div className='flex flex-col'>
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