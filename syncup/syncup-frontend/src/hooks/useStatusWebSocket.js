import { useEffect, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAuth } from '../context/AuthContext'

/**
 * Connects to the SyncUp STOMP WebSocket and subscribes to /topic/status.
 * Calls `onStatusUpdate` whenever a member updates their status.
 */
export function useStatusWebSocket(onStatusUpdate) {
  const { token } = useAuth()
  const clientRef = useRef(null)

  const connect = useCallback(() => {
    if (!token) return

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/topic/status', message => {
          try {
            const update = JSON.parse(message.body)
            onStatusUpdate(update)
          } catch (e) {
            console.error('WS parse error', e)
          }
        })
      },
      onStompError: frame => {
        console.error('STOMP error', frame)
      },
    })

    client.activate()
    clientRef.current = client
  }, [token, onStatusUpdate])

  useEffect(() => {
    connect()
    return () => {
      clientRef.current?.deactivate()
    }
  }, [connect])
}
