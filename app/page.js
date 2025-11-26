"use client"

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import ChatInputBox from "./_components/ChatInputBox";

export default function Home() {
  return (
    <div className="mt-[53px]">
      <ChatInputBox />
    </div>
  );
}
