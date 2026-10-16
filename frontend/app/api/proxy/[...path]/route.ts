import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

async function proxyRequest(request: NextRequest, pathSegments: string[], method: string) {
  const path = "/" + pathSegments.join("/")
  const targetUrl = `${BACKEND_URL}${path}${new URL(request.url).search}`

  try {
    const headers = new Headers()
    headers.set("Content-Type", request.headers.get("content-type") || "application/json")
    const cookie = request.headers.get("cookie")
    if (cookie) headers.set("Cookie", cookie)
    const body = method === "GET" || method === "HEAD" ? undefined : await request.text()
    const upstream = await fetch(targetUrl, { method, headers, body, cache: "no-store" })
    const responseHeaders = new Headers()
    responseHeaders.set("Cache-Control", "no-store")
    for (const name of ["content-type", "content-disposition", "set-cookie"]) {
      const value = upstream.headers.get(name)
      if (value) responseHeaders.set(name, value)
    }
    return new NextResponse(await upstream.arrayBuffer(), { status: upstream.status, headers: responseHeaders })
  } catch (error) {
    console.error("Backend connection failed", error)
    return NextResponse.json({ error: "Failed to connect to backend" }, { status: 502 })
  }
}

type Context = { params: Promise<{ path: string[] }> }
export async function GET(request: NextRequest, context: Context) {
  return proxyRequest(request, (await context.params).path, "GET")
}
export async function POST(request: NextRequest, context: Context) {
  return proxyRequest(request, (await context.params).path, "POST")
}
export async function PUT(request: NextRequest, context: Context) {
  return proxyRequest(request, (await context.params).path, "PUT")
}
export async function DELETE(request: NextRequest, context: Context) {
  return proxyRequest(request, (await context.params).path, "DELETE")
}
