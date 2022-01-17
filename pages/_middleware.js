import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  //the token will exist id the user is logged in
  const token = await getToken({ req, secret: process.env.JWT_SECRET });

  const { pathname } = req.nextUrl;

  //Allow the request if
  //1. it is a request for next-auth session and provider fetching
  //2. the token exists
  //than continue regularly
  if (pathname.includes("/api/auth") || token) {
    return NextResponse.next();
  }

  //other wise if token doensnot exist redirect the user to login and if the DONT have a token
  //and ARE requestinf a preotected route
  if (!token && pathname !== "/Login") {
    return NextResponse.redirect("/Login");
  }
}
