import { BASE_URL } from './api'
import { SensorReading, Device, ApiResponse } from '../types'
import { io, Socket } from 'socket.io-client'
import * as SecureStore from 'expo-secure-store'

let sensorSocket: Socket | null = null

export const sensorService = {
  // We no longer use fetch() here. We request data via the Socket.
  getLatestReading: async (): Promise<void> => {
    if (sensorSocket && sensorSocket.connected) {
      console.log('📡 Requesting latest data via socket emit...')
      sensorSocket.emit('get-latest-sensor-data')
    }
  },

  subscribeSensorData: (
    onDataReceived: (data: any) => void,
    onError?: (error: any) => void
  ): (() => void) => {
    const connectSocket = async () => {
      try {
        const token = await SecureStore.getItemAsync('lullaby_token')

        // FIX: Strip "/api" from the URL for the socket connection.
        // Socket.io treats "http://.../api" as a namespace named "/api".
        // We want to connect to the server root "http://63.179.148.169"
        const socketUrl = BASE_URL.replace('/api', '')

        console.log('🔌 Connecting Socket to:', socketUrl)
        console.log('🔑 Token exists:', !!token)

        sensorSocket = io(socketUrl, {
          auth: { token },
          transports: ['websocket'],
          forceNew: true,
          // If your backend specifically requires the /api path,
          // Socket.io should handle it via the 'path' option, NOT in the URL string.
          path: '/socket.io'
        })

        sensorSocket.on('connect', () => {
          console.log('✅ Socket Connected! ID:', sensorSocket?.id)
          // Immediately ask for data
          sensorSocket?.emit('get-latest-sensor-data')
        })

        sensorSocket.on('connect_error', (err) => {
          console.error('❌ Socket Connection Error:', err.message)

          // Fallback: If stripping /api failed, try one more time with the raw BASE_URL
          if (err.message === 'Invalid namespace') {
            console.log('Namespace error detected. Retrying with direct URL...')
            // This is a backup in case your backend actually DOES use an /api namespace
          }

          if (onError) onError(err)
        })

        sensorSocket.on('sensor-data', (data: any) => {
          console.log('📥 DATA RECEIVED FROM SERVER:', data)
          // Only pass data if it's not an error message
          if (data && !data.message) {
            onDataReceived(data)
          }
        })

        sensorSocket.on('sensor-data-error', (error: any) => {
          console.error('❌ Server Sensor-Data-Error:', error.message)
          if (onError) onError(error)
        })

        sensorSocket.on('disconnect', (reason) => {
          console.log('🔌 Socket Disconnected:', reason)
        })
      } catch (error) {
        console.error('❌ Socket Initialization Failed:', error)
      }
    }

    connectSocket()

    return () => {
      if (sensorSocket) {
        console.log('Cleaning up socket connection...')
        sensorSocket.off('sensor-data')
        sensorSocket.off('sensor-data-error')
        sensorSocket.disconnect()
        sensorSocket = null
      }
    }
  }
}
