"use client"

import { useChat } from "@ai-sdk/react"
import { useState, useEffect } from "react"
import { ChatContainer } from "../../components/chat/chat-container"
import { ErrorMessage } from "../../components/chat/error-message"
import { APP_CONFIG } from "./config"
import { toast } from "sonner"
import { useErrorHandler } from "@/app/(ai)/lib/error-handling/client-error-handler"
import { nanoid } from "nanoid"
import type { Message } from "ai"

export default function ChatPage() {
  const { error: errorHandler, handleError } = useErrorHandler('basic-chat')
  const [lastErrorMessage, setLastErrorMessage] = useState<Message | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [errorState, setErrorState] = useState<{
    visible: boolean;
    code: string;
    message: string;
    details?: string;
  } | null>(null)

  const { messages, input, handleInputChange, handleSubmit, status, setMessages, reload, error } = useChat(
    {
      api: APP_CONFIG.apiRoute,
      onError: (error: any) => {
        // Extract the error message
        const errorMessage = error?.message || "Something went wrong. Please try again."
        console.error("Chat API error:", error)
        
        // Extract error details if they exist
        let errorCode = 'unknown_error'
        let errorDetails = {}
        let formattedErrorMessage = errorMessage
        
        try {
          // Try to parse the JSON response from the server
          if (error.response) {
            const responseData = error.response.data || {}
            if (responseData.error) {
              errorCode = responseData.error.code || errorCode
              errorDetails = responseData.error.details || {}
              formattedErrorMessage = responseData.error.message || errorMessage
            }
          }
        } catch (e) {
          console.error("Error parsing error response:", e)
        }
        
        // Set the error state for the error alert - with user-friendly formatting
        const userFriendlyMessage = (() => {
          // Create user-friendly messages based on error code
          switch(errorCode) {
            case 'rate_limit_exceeded':
            case 'user_rate_limit_exceeded':
            case 'global_rate_limit_exceeded':
              return 'You have sent too many messages in a short period. Please wait a moment before trying again.';
            case 'moderation_flagged':
              return 'Your message contains content that doesn\'t comply with our usage policies.';
            case 'blacklisted_keywords':
              return 'Your message contains prohibited keywords or phrases.';
            case 'validation_error':
              return 'There was a problem with your message format.';
            case 'input_too_long':
              return 'Your message is too long. Please shorten it and try again.';
            case 'ai_detection':
              return 'Your message appears to be AI-generated content.';
            case 'language_not_supported':
              return 'The language you\'re using is not currently supported.';
            case 'sanitization_error':
              return 'Your message contains potentially unsafe content that has been blocked.';
            default:
              // For unknown errors, give a generic friendly message rather than showing technical details
              return 'Something went wrong. Please try again or refresh the page.';
          }
        })();
        
        setErrorState({
          visible: true,
          code: errorCode,
          message: userFriendlyMessage,
          details: undefined // Don't show raw details to users
        })
        
        // Create a system message to display the error - but in a cleaner, more user-friendly format
        const systemErrorMessage: Message = {
          id: nanoid(),
          role: 'assistant',
          content: `⚠️ **I'm unable to respond right now**\n\n${userFriendlyMessage}`
        }
        
        // Update the last error message state
        setLastErrorMessage(systemErrorMessage)
        
        // Handle the error with our error handler
        handleError(error)
      }
    }
  )

  const handleNewChat = () => {
    setMessages([])
    setLastErrorMessage(null)
    setErrorState(null)
  }
  
  const dismissError = () => {
    setErrorState(null)
  }
  
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
      <div className="flex flex-col w-full max-w-2xl space-y-4">
        {errorState?.visible && (
          <div className="px-4">
            <ErrorMessage
              message={errorState.message}
              code={errorState.code}
              onDismiss={dismissError}
              autoHide={false}
              className="mb-2"
            />
          </div>
        )}
        <ChatContainer
          messages={messages}
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          status={error ? "error" : status}
          setMessages={setMessages}
          reload={reload}
          lastErrorMessage={lastErrorMessage}
          handleNewChat={handleNewChat}
          onDismissError={dismissError}
          hasError={!!errorState?.visible}
        />
      </div>
  )
}