import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Formulaire public de satisfaction et vérification de badges : accès libre
  if (req.nextUrl.pathname.startsWith("/satisfaction")) return NextResponse.next();
  if (req.nextUrl.pathname.startsWith("/verification")) return NextResponse.next();

  return await updateSession(req);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};