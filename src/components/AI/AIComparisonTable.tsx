import React from 'react';

export const AIComparisonTable: React.FC<{ items: any[] }> = ({ items }) => {
  return (
    <div className='overflow-x-auto my-2 rounded-lg border border-gray-200 dark:border-gray-800'>
      <table className='min-w-full text-sm text-left'>
        <thead className='bg-gray-50 dark:bg-gray-900 text-xs uppercase'>
          <tr>
            <th className='px-4 py-3'>Feature</th>
            {items.map((item, i) => <th key={i} className='px-4 py-3'>{item.name}</th>)}
          </tr>
        </thead>
        <tbody>
          <tr className='border-t border-gray-200 dark:border-gray-800'>
            <td className='px-4 py-3 font-medium'>Price</td>
            {items.map((item, i) => <td key={i} className='px-4 py-3'>${item.price}</td>)}
          </tr>
        </tbody>
      </table>
    </div>
  );
};
