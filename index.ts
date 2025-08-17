import { SignalingServer } from "./utils/signalingServer";

const port: number = Number(process.env.PORT) || 8080;

const signalingServer = SignalingServer.getInstance({ port });

signalingServer.start()

