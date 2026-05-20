interface TimeFilterProps {
  filters: { label: string; value: number }[];
  selectedTime: number | null;
  onSelect: (value: number) => void;
}

export function TimeFilter({ filters, selectedTime, onSelect }: TimeFilterProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {filters.map((filter) => {
        const isSelected = selectedTime === filter.value;
        return (
          <button
            key={filter.value}
            onClick={() => onSelect(filter.value)}
            className={`px-5 py-2.5 rounded-full font-medium whitespace-nowrap transition-all ${
              isSelected
                ? 'bg-green-500 text-white shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-300'
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
