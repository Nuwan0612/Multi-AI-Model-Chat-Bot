import { aj } from "@/config/Arcjet";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress

  let token = 0;

  try {
    const body = await req.json().catch(() => null);
    token = body?.token ?? 0;
  } catch (e) {
    token = 0;
  }

  if(token){
    const decision = await aj.protect(
      req, 
      { 
        userId: email, 
        requested: token 
      }); 
    if(decision.isDenied()){
      return NextResponse.json({
        error: 'Too many Request',
        remainingToken: decision.reason.remaining
      })
    }
    return NextResponse.json({allowed: true, remainingToken: decision.reason.remaining})
  } else {
    const decision = await aj.protect(
      req, 
      { 
        userId: email, 
        requested: 0 
      }); 
    const remainingToken = decision.reason.remaining;

    return NextResponse.json({remainingToken: remainingToken})
  }
}