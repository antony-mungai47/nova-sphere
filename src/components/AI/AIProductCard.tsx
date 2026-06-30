import React from 'react';

export const AIProductCard: React.FC<{ name: string; price: number; description: string }> = ({ name, price, description }) => {
  return (
    <div className='border border-primary-200 dark:border-primary-900/50 rounded-lg p-4 my-2 bg-white dark:bg-background-dark shadow-sm'>
      <h4 className='font-bold text-lg mb-1'>{name}</h4>
      <p className='text-gray-500 text-sm mb-3'>{description}</p>
      <div className='flex justify-between items-center'>
        <span className='font-semibold text-primary-600'>${price.toFixed(2)}</span>
        <button className='bg-primary-600 text-white text-xs px-3 py-1.5 rounded hover:bg-primary-700'>Add to Cart</button>
      </div>
    </div>
  );
};
