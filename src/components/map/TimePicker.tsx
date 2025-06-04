import React from 'react';
import { Clock } from 'lucide-react';

interface TimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
}

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange }) => {
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(value);
    const [hours, minutes] = e.target.value.split(':').map(Number);
    newDate.setHours(hours, minutes);
    onChange(newDate);
  };
  
  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    // Preserve the time from the current value
    newDate.setHours(value.getHours(), value.getMinutes());
    onChange(newDate);
  };
  
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  return (
    <div className="flex-grow flex space-x-2">
      <div className="relative flex-grow">
        <input
          type="date"
          value={formatDate(value)}
          onChange={handleDateChange}
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
          <Clock size={18} />
        </div>
      </div>
      <div className="relative">
        <input
          type="time"
          value={formatTime(value)}
          onChange={handleTimeChange}
          className="py-2 px-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
};

export default TimePicker;