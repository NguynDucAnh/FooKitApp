interface BudgetSelectorProps {
  options: { label: string; value: number }[];
  selectedBudget: number | null;
  onSelect: (value: number) => void;
}

export function BudgetSelector({ options, selectedBudget, onSelect }: BudgetSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {options.map((option) => {
        const isSelected = selectedBudget === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`p-4 rounded-2xl font-medium transition-all ${
              isSelected
                ? 'bg-gradient-to-br from-green-500 to-yellow-400 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-300'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
