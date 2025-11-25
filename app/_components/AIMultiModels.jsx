"use client"

import React, { useContext, useState } from 'react'
import AIModelList from './../../shared/AIModelList'
import Image from 'next/image'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from '@/components/ui/switch'
import { Loader, Lock, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AiSelectedModelContext } from '@/context/AiSelectedModelContext'
import { doc, updateDoc } from 'firebase/firestore'
import { useUser } from '@clerk/nextjs'
import { db } from '@/config/FirebaseConfig'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import ReactMarkdown from 'react-markdown'
import { useSearchParams } from 'next/navigation'

function AIMultiModels() {

  const { user, isLoaded, isSignedIn } = useUser();

  const [aiMoldelList, setAiModelList] = useState(AIModelList)
  const { aiSelectedModels, setAiSelectedModels, messages, setMessages } = useContext(AiSelectedModelContext)

  

  const onToggleChange = (model, value) => {
    setAiModelList((prev) => 
      prev.map((m) =>
        m.model === model ? { ...m, enable: value } : m
      ))
    
      setAiSelectedModels((prev) => ({
        ...prev,
        [model] : {
          ...(prev?.[model] ?? {}),
          enable: value
        }
      }))
  }

  console.log(aiSelectedModels)

  const onSelecteValue = async (parentModel, value) => {
    setAiSelectedModels(prev => ({
      ...prev,
      [parentModel]: {
        modelId: value
      }
    }))

    
  }


  return (
    <div className='flex flex-1 h-[75vh] border-b'>
      {aiMoldelList.map((model, index) => (
        <div key={index} className={`flex flex-col border-r h-full overflow-auto  ${model.enable ? 'flex-1 min-w-[400px]' : 'w-[100px] flex-none'}`}>
          <div key={index} className='flex w-full h-[70px] items-center justify-between border-b p-4'> 
            <div className='flex items-center gap-4'>
              <Image src={model.icon} 
                alt='icon'
                width={24}
                height={24}
              />
             {model.enable && 
                <Select defaultValue={aiSelectedModels[model.model].modelId} onValueChange={(value) => onSelecteValue(model.model, value)} disabled={model.premium}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={aiSelectedModels[model.model].modelId} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup className='px-3'>
                      <SelectLabel className={'text-sm text-gray-400'}>Free</SelectLabel>
                      {model.subModel.map((subModel, index) => subModel.premium == false && (
                      <SelectItem key={index} value={subModel.id}>{subModel.name}</SelectItem>
                    ))}
                    </SelectGroup>

                    <SelectGroup className='px-3'>
                      <SelectLabel className={'text-sm text-gray-400'}>Premium</SelectLabel>
                      {model.subModel.map((subModel, index) => subModel.premium == true && (
                      <SelectItem key={index} value={subModel.name} disabled = {subModel.premium}>{subModel.name} {subModel.premium && <Lock className='h-4 w-4'/>}</SelectItem>
                    ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              }
            </div>
            <div>
              {model.enable ? 
                <Switch checked={model.enable}
                  onCheckedChange = {(v) => onToggleChange(model.model, v)}
                /> :
                <MessageSquare onClick={() => onToggleChange(model.model, true)}/>
              }
            </div>
          </div>
          {model.premium && model.enable &&
            <div className='flex items-center justify-center h-full'>
              <Button><Lock />Upgrade to unlock</Button>
            </div>
          } 

          {model.enable &&
            <div className='flex-1 p-4'>
              <div className='flex-1 p-4 space-y-2'>
                {messages[model.model]?.map((m,i) => (
                  <div key={i}
                    className={`p-2 rounded-md ${m.role=='user' ? 
                      "bg-blue-100 text-blue-900" :
                      "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {m.role =='assistant' && (
                      <span className='text-sm text-gray-400'>{m.model ?? model.model}</span>
                    )}
                    <div className='flex gap-3 items-center'>
                      {m.content == 'loading' &&<> <Loader className='animate-spin'/> <span>Thinking...</span> </>}
                    </div>
                    {m?.content !== 'loading' && 
                      m?.content && <ReactMarkdown rehypePlugins={[remarkGfm]}>
                      {m?.content}
                      </ReactMarkdown>
                    }
                  </div>
                ))}
              </div>
            </div>
          }
        </div>
      ))}

    </div>
  )
}

export default AIMultiModels