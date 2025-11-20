"use client"

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export default function Home() {
  const {setTheme} = useTheme();
  return (
    <div>
      <h2>Hello</h2>
      <Button>Subscribe</Button>
      <Button onClick = {() => setTheme('dark')}>Dark mode</Button>
      <Button onClick = {() => setTheme('light')}>Light mode</Button>
    </div>
  );
}
