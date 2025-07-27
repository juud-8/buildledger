// Temporarily disabled MCP functionality
// import {
//   protectedResourceHandler,
//   metadataCorsOptionsRequestHandler,
// } from "mcp-handler";

// const handler = protectedResourceHandler({
//   authServerUrls: ["https://your-auth-server.com"], // Replace with your auth server
// });

// export { handler as GET, metadataCorsOptionsRequestHandler as OPTIONS };

// Temporary placeholder response
export async function GET() {
  return new Response('MCP functionality temporarily disabled', { status: 503 });
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
} 