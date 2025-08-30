"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Paperclip, ImageIcon, File, CheckCheck, Phone, Video, MoreVertical } from "lucide-react"

interface Message {
  id: number
  sender: string
  senderName: string
  content: string
  timestamp: Date
  type: "text" | "image" | "file"
  fileUrl?: string
  fileName?: string
  read: boolean
}

interface MessagingSystemProps {
  serviceId: number
  currentUser: string
  otherUser: string
  otherUserName: string
  otherUserAvatar?: string
}

export function MessagingSystem({
  serviceId,
  currentUser,
  otherUser,
  otherUserName,
  otherUserAvatar,
}: MessagingSystemProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock messages for demonstration
  useEffect(() => {
    const mockMessages: Message[] = [
      {
        id: 1,
        sender: otherUser,
        senderName: otherUserName,
        content: "Hola, he revisado los detalles del proyecto. ¿Cuándo podemos comenzar?",
        timestamp: new Date(Date.now() - 3600000),
        type: "text",
        read: true,
      },
      {
        id: 2,
        sender: currentUser,
        senderName: "Tú",
        content: "Perfecto, podemos comenzar la próxima semana. ¿Necesitas algún material específico?",
        timestamp: new Date(Date.now() - 3000000),
        type: "text",
        read: true,
      },
      {
        id: 3,
        sender: otherUser,
        senderName: otherUserName,
        content: "Sí, necesitaré algunos materiales. Te envío la lista.",
        timestamp: new Date(Date.now() - 2400000),
        type: "text",
        read: true,
      },
      {
        id: 4,
        sender: otherUser,
        senderName: otherUserName,
        content: "Lista de materiales para el proyecto",
        timestamp: new Date(Date.now() - 2400000),
        type: "file",
        fileName: "materiales_proyecto.pdf",
        read: false,
      },
    ]
    setMessages(mockMessages)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: messages.length + 1,
        sender: currentUser,
        senderName: "Tú",
        content: newMessage.trim(),
        timestamp: new Date(),
        type: "text",
        read: true,
      }

      setMessages([...messages, message])
      setNewMessage("")

      // Simulate typing indicator and response
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        // Add mock response
        const response: Message = {
          id: messages.length + 2,
          sender: otherUser,
          senderName: otherUserName,
          content: "Perfecto, gracias por la información. Procederé según lo acordado.",
          timestamp: new Date(),
          type: "text",
          read: false,
        }
        setMessages((prev) => [...prev, response])
      }, 2000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Hoy"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ayer"
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={otherUserAvatar || "/placeholder.svg"} alt={otherUserName} />
              <AvatarFallback>
                {otherUserName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{otherUserName}</CardTitle>
              <p className="text-sm text-gray-500">Servicio #{serviceId}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, index) => {
              const showDate =
                index === 0 || formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp)

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="text-center my-4">
                      <Badge variant="secondary" className="text-xs">
                        {formatDate(message.timestamp)}
                      </Badge>
                    </div>
                  )}

                  <div className={`flex ${message.sender === currentUser ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] ${message.sender === currentUser ? "order-2" : "order-1"}`}>
                      <div
                        className={`rounded-lg p-3 ${
                          message.sender === currentUser ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        {message.type === "text" && <p className="text-sm">{message.content}</p>}

                        {message.type === "file" && (
                          <div className="flex items-center space-x-2">
                            <File className="h-4 w-4" />
                            <span className="text-sm">{message.fileName}</span>
                          </div>
                        )}

                        {message.type === "image" && (
                          <div className="space-y-2">
                            <img
                              src={message.fileUrl || "/placeholder.svg"}
                              alt="Shared image"
                              className="rounded max-w-full h-auto"
                            />
                            {message.content && <p className="text-sm">{message.content}</p>}
                          </div>
                        )}
                      </div>

                      <div
                        className={`flex items-center mt-1 text-xs text-gray-500 ${
                          message.sender === currentUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        <span>{formatTime(message.timestamp)}</span>
                        {message.sender === currentUser && (
                          <CheckCheck className={`h-3 w-3 ml-1 ${message.read ? "text-blue-500" : "text-gray-400"}`} />
                        )}
                      </div>
                    </div>

                    {message.sender !== currentUser && (
                      <Avatar className="h-8 w-8 order-1 mr-2">
                        <AvatarImage src={otherUserAvatar || "/placeholder.svg"} alt={otherUserName} />
                        <AvatarFallback className="text-xs">
                          {otherUserName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              )
            })}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={otherUserAvatar || "/placeholder.svg"} alt={otherUserName} />
                    <AvatarFallback className="text-xs">
                      {otherUserName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <ImageIcon className="h-4 w-4" />
            </Button>

            <Input
              placeholder="Escribe un mensaje..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />

            <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
