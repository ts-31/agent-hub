import React, { useEffect } from "react";
import { Send } from "lucide-react";

function ChatInput({
  input,
  setInput,
  handleSend,
  handleKeyDown,
  textareaRef,
  autoGrowTextarea,
}) {
  useEffect(() => autoGrowTextarea(), [input]);

  return (
    <div className="border-t border-gray-800 py-4 px-6">
      <div className="mx-auto max-w-3xl w-full flex gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={autoGrowTextarea}
          rows={1}
          placeholder="Send a message..."
          className="flex-1 resize-none rounded-lg border border-gray-700 p-3 text-lg
                     focus:outline-none focus:ring-1 focus:ring-primary
                     placeholder:opacity-60 bg-background text-foreground
                     overflow-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent"
        />
        <button
          onClick={handleSend}
          className="flex-none h-12 w-12 flex items-center justify-center
                     rounded-md border border-foreground text-foreground hover:bg-foreground/10"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}

export default ChatInput;
