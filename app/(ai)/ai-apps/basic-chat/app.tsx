"use client"

import { useChat } from "@ai-sdk/react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, Loader2 } from "lucide-react"
import { TypingIndicator } from "@/app/(ai)/components/typing-indicator"
import { ChatMessage } from "@/app/(ai)/components/chat-message"
import { motion } from "framer-motion"
import { container, item } from "@/lib/animation"
import { APP_CONFIG } from "./config"

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    api: "../ai-apps/basic-chat/api"
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageContainerRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight
    }
  }, [messages])

  // Set mounted state
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  // Get the last assistant message to determine if it's streaming
  const lastAssistantMessageIndex =
    messages.length > 0 ? [...messages].reverse().findIndex((m) => m.role === "assistant") : -1

  const isLastAssistantMessageStreaming = status === "streaming" && lastAssistantMessageIndex !== -1

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-8">
      <motion.div variants={item} className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{APP_CONFIG.name}</h1>
        <p className="text-muted-foreground">{APP_CONFIG.description}</p>
      </motion.div>

      <motion.div variants={item}>
        <Card className="w-full max-w-2xl h-[600px] flex flex-col">
          <CardHeader className="border-b p-4 flex-shrink-0">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              AI Assistant
            </CardTitle>
          </CardHeader>

          <CardContent 
            ref={messageContainerRef} 
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{ height: 'calc(600px - 130px)' }}
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Bot className="h-12 w-12 mb-4 text-primary/50" />
                <p className="text-lg font-medium">How can I help you today?</p>
                <p className="text-sm">Ask me anything and I'll do my best to assist you.</p>
              </div>
            ) : (
              <div className="space-y-4 pb-2">
                {messages.map((message, index) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    streaming={isLastAssistantMessageStreaming && index === messages.length - 1 - lastAssistantMessageIndex}
                  />
                ))}

                {status === "submitted" && (
                  <div className="flex items-start gap-3 animate-in fade-in-0 slide-in-from-bottom-3 duration-300">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary">AI</AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg px-4 py-2 text-sm">
                      <TypingIndicator className="text-muted-foreground" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </CardContent>

          <CardFooter className="border-t p-4 flex-shrink-0">
            <form onSubmit={handleSubmit} className="flex w-full gap-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="flex-1"
                disabled={status !== "ready"}
                autoComplete="off"
                autoFocus
              />
              <Button 
                type="submit" 
                size="icon" 
                className="shrink-0"
                disabled={status !== "ready" || input.trim() === ""}
              >
                {status === "submitted" || status === "streaming" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="sr-only">Send message</span>
              </Button>
            </form>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  )
}