export const runtime = 'edge'

export async function GET() {
  return new Response('OK Tokproof', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  })
}
