interface ToolSelectorProps {
  tools: { name: string; icon: string }[];
  selectedTools: string[];
  onToggle: (tool: string) => void;
}

export function ToolSelector({ tools, selectedTools, onToggle }: ToolSelectorProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {tools.map((tool) => {
        const isSelected = selectedTools.includes(tool.name);
        return (
          <button
            key={tool.name}
            onClick={() => onToggle(tool.name)}
            className={`flex flex-col items-center gap-2 px-4 py-3 rounded-2xl min-w-24 transition-all ${
              isSelected
                ? 'bg-green-500 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-300'
            }`}
          >
            <span className="text-3xl">{tool.icon}</span>
            <span className="text-sm font-medium text-center">{tool.name}</span>
          </button>
        );
      })}
    </div>
  );
}
