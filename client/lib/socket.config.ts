import {io, Socket} from "socket.io-client"
import { getEnv } from "./utils"


let socket:Socket
export const getSocket = () => {
    if(!socket) {
        socket = io(getEnv("NEXT_PUBLIC_BACKEND_URL"), {
            autoConnect: false,
        })

    }

    return socket
}