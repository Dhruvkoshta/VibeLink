import { io, Socket } from "socket.io-client"

let socket: Socket
export const getSocket = () => {
    if(!socket) {
        socket = io(process.env.NEXT_PUBLIC_BACKEND_URL!, {
            autoConnect: false,
            withCredentials: true,
            transports: ['websocket', 'polling'],
            extraHeaders: {
                "my-custom-header": "abcd"
            }
        })
    }
    return socket
}