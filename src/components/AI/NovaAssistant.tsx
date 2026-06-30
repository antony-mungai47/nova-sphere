'use client';

import React, { useState } from 'react';
// import { useChat } from 'ai/react';
// import { AIProductCard } from './AIProductCard';

export const NovaAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  // const { messages, input, handleInputChange, handleSubmit } = useChat({ api: '/api/chat' });
  
  // Mocking messages for scaffolding
  const messages = [
    { id: '1', role: 'assistant', content: 'Hello! I am Nova. How can I help you today?' }
  ];

  return (
    <div className='fixed bottom-6 right-6 z-50'>
      {/* Assistant Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className='bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-105'
        >
          <span className='text-xl'>✨</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className='w-96 h-[32rem] bg-background-light dark:bg-background-dark border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl flex flex-col overflow-hidden'>
          {/* Header */}
          <div className='p-4 bg-primary-600 text-white flex justify-between items-center'>
            <div className='flex items-center space-x-2'>
              <span className='text-xl'>✨</span>
              <h3 className='font-semibold'>Nova Intelligence</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className='hover:text-gray-200'>
              &times;
            </button>
          </div>

          {/* Messages Area */}
          <div className='flex-1 p-4 overflow-y-auto space-y-4'>
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${m.role === 'user' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-900 dark:text-primary-100' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'}`}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>

          {/* Contextual Prompts (Example for Product Page) */}
          <div className='p-2 flex space-x-2 overflow-x-auto hide-scrollbar border-t border-gray-100 dark:border-gray-800'>
            <button className='whitespace-nowrap text-xs bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full hover:bg-primary-100 transition-colors'>Explain this product</button>
            <button className='whitespace-nowrap text-xs bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full hover:bg-primary-100 transition-colors'>Compare specs</button>
          </div>

          {/* Input Area */}
          <form className='p-4 border-t border-gray-200 dark:border-gray-800 flex space-x-2'>
            <input 
              type='text' 
              placeholder='Ask Nova...'
              className='flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500'
            />
            <button type='submit' className='bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700'>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
