import { useQuery } from "@tanstack/react-query";
import { messagesApi } from '../api/messagesApi'
import { useAuth } from "../contexts/AuthContext";

export function useUnread() {
    const { isAuthenticated } = useAuth()

    return useQuery({
        queryKey: ['unread'],
        queryFn: messagesApi.unread,
        enabled: isAuthenticated,
        refetchInterval: 30_000,
        refetchIntervalInBackground: false,
    })
}