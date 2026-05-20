interface CategoryChipProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export function CategoryChip({ label, isActive, onClick }: CategoryChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2.5 rounded-full font-medium whitespace-nowrap transition-all ${
        isActive
          ? 'bg-green-500 text-white shadow-lg'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );
}
