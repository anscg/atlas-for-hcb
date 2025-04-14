import React from 'react';

interface ReceiptsListItemProps {
  amount: string;
  memo: string;
  orgIcon: string;
  source: string;
  itemColor?: string;
  itemIcon: React.ReactNode; // SVG icon as React component
}

const ReceiptsListItem: React.FC<ReceiptsListItemProps> = ({
  amount,
  memo,
  orgIcon,
  source,
  itemColor = '#E5E7EB', // default light gray if no color provided
  itemIcon,
}) => {
  return (
    <div className="flex w-full items-center justify-between p-4">
      <div className="flex items-center space-x-4">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center" 
          style={{ backgroundColor: itemColor }}
        >
          {itemIcon}
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{memo}</span>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 relative">
              {orgIcon && (
                <img 
                  src={orgIcon} 
                  alt={`${source} icon`} 
                  className="w-4 h-4 rounded-full"
                />
              )}
            </div>
            <span className="text-sm text-gray-500">{source}</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <span className="font-medium text-[#E23434]">-${amount}</span>
      </div>
    </div>
  );
};

export default ReceiptsListItem;
