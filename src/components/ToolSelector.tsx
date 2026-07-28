import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';

interface ToolSelectorProps {
  tools: { name: string; icon: string }[];
  selectedTools: string[];
  onToggle: (tool: string) => void;
}

export function ToolSelector({ tools, selectedTools, onToggle }: ToolSelectorProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {tools.map((tool) => {
        const isSelected = selectedTools.includes(tool.name);
        return (
          <Pressable
            key={tool.name}
            onPress={() => onToggle(tool.name)}
            style={[styles.toolButton, isSelected ? styles.toolButtonActive : styles.toolButtonInactive]}
            android_ripple={{ color: '#D1FAE5' }}
          >
            <Text style={styles.toolIcon}>{tool.icon}</Text>
            <Text style={[styles.toolLabel, isSelected && styles.toolLabelActive]}>{tool.name}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: 6
  },
  toolButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 24,
    marginRight: 12,
    minWidth: 96,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  toolButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981'
  },
  toolButtonInactive: {
    backgroundColor: '#FFFFFF'
  },
  toolIcon: {
    fontSize: 24,
    marginBottom: 6
  },
  toolLabel: {
    fontSize: 12,
    color: '#374151',
    textAlign: 'center'
  },
  toolLabelActive: {
    color: '#FFFFFF'
  }
});
