import { motion } from "framer-motion"

export function QuestionSkeleton() {
  return (
    <motion.div 
      className="border rounded-lg overflow-hidden bg-background"
      initial={{ opacity: 0.6 }}
      animate={{ 
        opacity: [0.6, 0.8, 0.6],
        transition: { 
          repeat: Infinity, 
          duration: 1.5 
        }
      }}
    >
      <div className="p-3">
        <div className="flex gap-3">
          {/* Left side arrows */}
          <div className="flex flex-col justify-center gap-1">
            <div className="h-6 w-6 bg-muted rounded-md"></div>
            <div className="h-6 w-6 bg-muted rounded-md"></div>
          </div>
          
          {/* Question content */}
          <div className="flex-1">
            {/* Question text */}
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
              <div className="h-4 bg-muted rounded w-4/6"></div>
            </div>
            
            {/* Bottom row with badges and actions */}
            <div className="flex justify-between items-center mt-3">
              {/* Badges */}
              <div className="flex gap-2">
                <div className="h-5 w-20 bg-muted rounded-full"></div>
                <div className="h-5 w-16 bg-muted rounded-full"></div>
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-1">
                <div className="h-7 w-7 bg-muted rounded-md"></div>
                <div className="h-7 w-7 bg-muted rounded-md"></div>
                <div className="h-7 w-7 bg-muted rounded-md"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
