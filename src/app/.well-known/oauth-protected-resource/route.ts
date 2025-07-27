import {
  protectedResourceHandler,
  metadataCorsOptionsRequestHandler,
} from "mcp-handler";

const handler = protectedResourceHandler({
  authServerUrls: ["https://your-auth-server.com"], // Replace with your auth server
});

export { handler as GET, metadataCorsOptionsRequestHandler as OPTIONS }; 