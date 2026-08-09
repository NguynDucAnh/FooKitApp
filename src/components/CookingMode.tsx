import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  TimerReset,
  Utensils,
} from 'lucide-react-native';
import { Recipe } from '../types/recipe';

interface CookingModeProps {
  recipe: Recipe;
  onExit: () => void;
}

type CookingPhase = 'prepare' | 'cook' | 'done';

const QUICK_TIMERS = [1, 3, 5, 10];
const FEEDBACK_OPTIONS = ['Dễ thực hiện', 'Vừa sức', 'Cần thử lại'];

function formatTimer(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function CookingMode({ recipe, onExit }: CookingModeProps) {
  const [phase, setPhase] = useState<CookingPhase>('prepare');
  const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [feedback, setFeedback] = useState('');

  const totalSteps = recipe.instructions.length;
  const progress = totalSteps > 0 ? completedSteps.length / totalSteps : 0;
  const allIngredientsReady = recipe.ingredients.length > 0
    && checkedIngredients.length === recipe.ingredients.length;
  const currentInstruction = recipe.instructions[currentStep] ?? '';

  const preparationMessage = useMemo(() => {
    if (recipe.ingredients.length === 0) return 'Kiểm tra dụng cụ và không gian bếp trước khi bắt đầu.';
    if (allIngredientsReady) return 'Tuyệt vời! Nguyên liệu đã sẵn sàng.';
    return `Đã chuẩn bị ${checkedIngredients.length}/${recipe.ingredients.length} nguyên liệu.`;
  }, [allIngredientsReady, checkedIngredients.length, recipe.ingredients.length]);

  useEffect(() => {
    if (!timerRunning || timerSeconds <= 0) return;

    const interval = setInterval(() => {
      setTimerSeconds(current => {
        if (current <= 1) {
          setTimerRunning(false);
          Alert.alert('Đã hết giờ', 'Bạn có thể tiếp tục với bước nấu hiện tại.');
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  function toggleIngredient(index: number) {
    setCheckedIngredients(current => current.includes(index)
      ? current.filter(item => item !== index)
      : [...current, index]);
  }

  function resetTimer() {
    setTimerRunning(false);
    setTimerSeconds(0);
  }

  function selectTimer(minutes: number) {
    setTimerSeconds(minutes * 60);
    setTimerRunning(true);
  }

  function markCurrentStepComplete() {
    setCompletedSteps(current => current.includes(currentStep)
      ? current.filter(step => step !== currentStep)
      : [...current, currentStep]);
  }

  function goToStep(nextStep: number) {
    if (nextStep < 0 || nextStep >= totalSteps) return;
    resetTimer();
    setCurrentStep(nextStep);
  }

  function handleNextStep() {
    setCompletedSteps(current => current.includes(currentStep)
      ? current
      : [...current, currentStep]);

    if (currentStep === totalSteps - 1) {
      resetTimer();
      setPhase('done');
      return;
    }

    goToStep(currentStep + 1);
  }

  function handleExit() {
    if (phase === 'prepare' || phase === 'done') {
      onExit();
      return;
    }

    Alert.alert(
      'Dừng phiên nấu?',
      'Tiến độ của phiên nấu hiện tại sẽ được đặt lại.',
      [
        { text: 'Tiếp tục nấu', style: 'cancel' },
        { text: 'Dừng nấu', style: 'destructive', onPress: onExit },
      ],
    );
  }

  if (phase === 'done') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.doneContainer} testID="cooking-mode">
        <View style={styles.celebrationIcon}>
          <Sparkles size={42} color="#F59E0B" />
        </View>
        <Text style={styles.doneEyebrow}>HOÀN THÀNH</Text>
        <Text style={styles.doneTitle}>Món {recipe.name} đã sẵn sàng!</Text>
        <Text style={styles.doneDescription}>
          Bạn đã hoàn thành {totalSteps} bước. Chúc bạn có một bữa ăn thật ngon miệng.
        </Text>

        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackTitle}>Trải nghiệm nấu món này thế nào?</Text>
          <Text style={styles.feedbackSubtitle}>Phản hồi chỉ được lưu trong phiên này.</Text>
          <View style={styles.feedbackWrap}>
            {FEEDBACK_OPTIONS.map(option => {
              const selected = feedback === option;
              return (
                <Pressable
                  key={option}
                  style={[styles.feedbackChip, selected && styles.feedbackChipSelected]}
                  onPress={() => setFeedback(option)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Text style={[styles.feedbackChipText, selected && styles.feedbackChipTextSelected]}>{option}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable style={styles.primaryButton} onPress={onExit} accessibilityRole="button">
          <Text style={styles.primaryButtonText}>Về trang công thức</Text>
        </Pressable>
      </ScrollView>
    );
  }

  if (phase === 'prepare') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content} testID="cooking-mode">
        <View style={styles.header}>
          <Pressable style={styles.headerButton} onPress={handleExit} accessibilityRole="button" accessibilityLabel="Thoát chế độ nấu">
            <ArrowLeft size={21} color="#0F172A" />
          </Pressable>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerEyebrow}>CHUẨN BỊ NẤU</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>{recipe.name}</Text>
          </View>
          <View style={styles.headerButtonPlaceholder} />
        </View>

        <View style={styles.prepareHero}>
          <View style={styles.prepareIcon}>
            <Utensils size={28} color="#047857" />
          </View>
          <Text style={styles.prepareTitle}>Sẵn sàng vào bếp?</Text>
          <Text style={styles.prepareDescription}>{preparationMessage}</Text>
        </View>

        {recipe.tools.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Dụng cụ cần có</Text>
            <View style={styles.tagWrap}>
              {recipe.tools.map(tool => <View key={tool} style={styles.toolTag}><Text style={styles.toolTagText}>{tool}</Text></View>)}
            </View>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Kiểm tra nguyên liệu</Text>
          <Text style={styles.cardSubtitle}>Chạm vào từng nguyên liệu bạn đã chuẩn bị.</Text>
          {recipe.ingredients.length > 0 ? recipe.ingredients.map((ingredient, index) => {
            const checked = checkedIngredients.includes(index);
            return (
              <Pressable
                key={`${ingredient.name}-${index}`}
                style={[styles.checkRow, checked && styles.checkRowActive]}
                onPress={() => toggleIngredient(index)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked }}
              >
                <View style={[styles.checkbox, checked && styles.checkboxActive]}>
                  {checked && <Check size={15} color="#FFFFFF" />}
                </View>
                <View style={styles.checkTextWrap}>
                  <Text style={[styles.checkName, checked && styles.checkNameActive]}>{ingredient.name}</Text>
                  {!!ingredient.amount && <Text style={styles.checkAmount}>{ingredient.amount}</Text>}
                </View>
              </Pressable>
            );
          }) : <Text style={styles.emptyText}>Công thức chưa có danh sách nguyên liệu. Bạn vẫn có thể bắt đầu nấu.</Text>}
        </View>

        <Pressable
          style={styles.primaryButton}
          onPress={() => setPhase('cook')}
          accessibilityRole="button"
          accessibilityLabel="Bắt đầu bước đầu tiên"
        >
          <Play size={19} color="#FFFFFF" fill="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Bắt đầu bước đầu tiên</Text>
        </Pressable>
      </ScrollView>
    );
  }

  const currentCompleted = completedSteps.includes(currentStep);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} testID="cooking-mode">
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={handleExit} accessibilityRole="button" accessibilityLabel="Thoát chế độ nấu">
          <ArrowLeft size={21} color="#0F172A" />
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerEyebrow}>ĐANG NẤU</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>{recipe.name}</Text>
        </View>
        <Text style={styles.stepCounter}>{currentStep + 1}/{totalSteps}</Text>
      </View>

      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>Tiến độ</Text>
        <Text style={styles.progressValue}>{Math.round(progress * 100)}%</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.stepDots}>
        {recipe.instructions.map((_instruction, index) => {
          const completed = completedSteps.includes(index);
          const active = index === currentStep;
          return (
            <Pressable
              key={index}
              style={[styles.stepDot, completed && styles.stepDotCompleted, active && styles.stepDotActive]}
              onPress={() => goToStep(index)}
              accessibilityRole="button"
              accessibilityLabel={`Mở bước ${index + 1}`}
              accessibilityState={{ selected: active }}
            >
              {completed ? <Check size={13} color="#FFFFFF" /> : <Text style={[styles.stepDotText, active && styles.stepDotTextActive]}>{index + 1}</Text>}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.stepCard}>
        <Text style={styles.stepEyebrow}>BƯỚC {currentStep + 1}</Text>
        <Text style={styles.stepInstruction}>{currentInstruction}</Text>
        <Pressable
          style={[styles.completeButton, currentCompleted && styles.completeButtonActive]}
          onPress={markCurrentStepComplete}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: currentCompleted }}
        >
          <CheckCircle2 size={20} color={currentCompleted ? '#FFFFFF' : '#047857'} />
          <Text style={[styles.completeButtonText, currentCompleted && styles.completeButtonTextActive]}>
            {currentCompleted ? 'Đã hoàn thành bước này' : 'Đánh dấu đã hoàn thành'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.timerCard}>
        <View style={styles.timerHeader}>
          <View>
            <Text style={styles.cardTitle}>Hẹn giờ cho bước này</Text>
            <Text style={styles.cardSubtitle}>Chọn nhanh hoặc tạm dừng khi cần.</Text>
          </View>
          <Clock3 size={23} color="#F59E0B" />
        </View>
        <Text style={styles.timerValue}>{formatTimer(timerSeconds)}</Text>
        <View style={styles.timerQuickRow}>
          {QUICK_TIMERS.map(minutes => (
            <Pressable key={minutes} style={styles.timerQuickButton} onPress={() => selectTimer(minutes)}>
              <Text style={styles.timerQuickText}>+{minutes} phút</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.timerControls}>
          <Pressable
            style={[styles.timerControlButton, timerSeconds === 0 && styles.disabledControl]}
            disabled={timerSeconds === 0}
            onPress={() => setTimerRunning(current => !current)}
            accessibilityRole="button"
          >
            {timerRunning ? <Pause size={18} color="#0F172A" /> : <Play size={18} color="#0F172A" />}
            <Text style={styles.timerControlText}>{timerRunning ? 'Tạm dừng' : 'Tiếp tục'}</Text>
          </Pressable>
          <Pressable style={styles.timerControlButton} onPress={resetTimer} accessibilityRole="button">
            <TimerReset size={18} color="#0F172A" />
            <Text style={styles.timerControlText}>Đặt lại</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.navigationRow}>
        <Pressable
          style={[styles.secondaryButton, currentStep === 0 && styles.disabledControl]}
          disabled={currentStep === 0}
          onPress={() => goToStep(currentStep - 1)}
          accessibilityRole="button"
        >
          <ChevronLeft size={19} color="#0F172A" />
          <Text style={styles.secondaryButtonText}>Bước trước</Text>
        </Pressable>
        <Pressable style={styles.nextButton} onPress={handleNextStep} accessibilityRole="button">
          <Text style={styles.nextButtonText}>{currentStep === totalSteps - 1 ? 'Hoàn thành món' : 'Bước tiếp theo'}</Text>
          {currentStep === totalSteps - 1 ? <Sparkles size={18} color="#FFFFFF" /> : <ChevronRight size={19} color="#FFFFFF" />}
        </Pressable>
      </View>

      {completedSteps.length > 0 && (
        <Pressable style={styles.restartButton} onPress={() => {
          setCompletedSteps([]);
          setCurrentStep(0);
          resetTimer();
        }}>
          <RotateCcw size={16} color="#64748B" />
          <Text style={styles.restartText}>Làm lại từ đầu</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF7' },
  content: { padding: 18, paddingBottom: 48 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
  headerButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  headerButtonPlaceholder: { width: 44 },
  headerTitleWrap: { flex: 1, marginHorizontal: 12, alignItems: 'center' },
  headerEyebrow: { color: '#059669', fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  headerTitle: { color: '#0F172A', fontSize: 16, fontWeight: '800', marginTop: 3 },
  stepCounter: { width: 44, textAlign: 'center', color: '#047857', fontWeight: '900' },
  prepareHero: { alignItems: 'center', backgroundColor: '#ECFDF5', borderRadius: 24, padding: 22, marginBottom: 16 },
  prepareIcon: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#D1FAE5', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  prepareTitle: { fontSize: 23, fontWeight: '900', color: '#0F172A' },
  prepareDescription: { color: '#475569', textAlign: 'center', marginTop: 7, lineHeight: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  cardTitle: { fontSize: 16, fontWeight: '900', color: '#0F172A' },
  cardSubtitle: { color: '#64748B', fontSize: 13, marginTop: 4, lineHeight: 18 },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 11 },
  toolTag: { backgroundColor: '#F1F5F9', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, marginBottom: 8 },
  toolTagText: { color: '#334155', fontWeight: '700' },
  checkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  checkRowActive: { opacity: 0.72 },
  checkbox: { width: 25, height: 25, borderRadius: 8, borderWidth: 2, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  checkboxActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  checkTextWrap: { flex: 1 },
  checkName: { color: '#0F172A', fontWeight: '700' },
  checkNameActive: { color: '#64748B', textDecorationLine: 'line-through' },
  checkAmount: { color: '#64748B', fontSize: 12, marginTop: 3 },
  emptyText: { color: '#64748B', lineHeight: 20, marginTop: 12 },
  primaryButton: { minHeight: 54, borderRadius: 18, backgroundColor: '#10B981', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 16 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  progressLabel: { color: '#475569', fontWeight: '700' },
  progressValue: { color: '#047857', fontWeight: '900' },
  progressTrack: { height: 9, backgroundColor: '#DDE7E2', borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#10B981', borderRadius: 999 },
  stepDots: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 18 },
  stepDot: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' },
  stepDotActive: { borderWidth: 2, borderColor: '#10B981', backgroundColor: '#ECFDF5' },
  stepDotCompleted: { backgroundColor: '#10B981', borderColor: '#10B981' },
  stepDotText: { color: '#64748B', fontSize: 12, fontWeight: '800' },
  stepDotTextActive: { color: '#047857' },
  stepCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#DDEED0', marginBottom: 16 },
  stepEyebrow: { color: '#10B981', fontSize: 12, fontWeight: '900', letterSpacing: 1.2 },
  stepInstruction: { color: '#0F172A', fontSize: 20, fontWeight: '800', lineHeight: 30, marginVertical: 18 },
  completeButton: { minHeight: 48, borderRadius: 15, backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  completeButtonActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  completeButtonText: { color: '#047857', fontWeight: '800' },
  completeButtonTextActive: { color: '#FFFFFF' },
  timerCard: { backgroundColor: '#FFFBEB', borderRadius: 22, padding: 17, borderWidth: 1, borderColor: '#FDE68A', marginBottom: 18 },
  timerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timerValue: { color: '#0F172A', fontSize: 38, fontWeight: '900', textAlign: 'center', marginVertical: 14, fontVariant: ['tabular-nums'] },
  timerQuickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timerQuickButton: { flexGrow: 1, minWidth: '21%', backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: '#FDE68A' },
  timerQuickText: { color: '#92400E', fontSize: 12, fontWeight: '800' },
  timerControls: { flexDirection: 'row', gap: 9, marginTop: 10 },
  timerControlButton: { flex: 1, minHeight: 43, borderRadius: 13, backgroundColor: '#FFFFFF', flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center' },
  timerControlText: { color: '#0F172A', fontSize: 13, fontWeight: '700' },
  navigationRow: { flexDirection: 'row', gap: 10 },
  secondaryButton: { flex: 1, minHeight: 52, borderRadius: 17, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  secondaryButtonText: { color: '#0F172A', fontWeight: '800' },
  nextButton: { flex: 1.35, minHeight: 52, borderRadius: 17, backgroundColor: '#10B981', flexDirection: 'row', gap: 5, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  nextButtonText: { color: '#FFFFFF', fontWeight: '900', fontSize: 13 },
  disabledControl: { opacity: 0.42 },
  restartButton: { flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center', marginTop: 20, padding: 10 },
  restartText: { color: '#64748B', fontWeight: '700' },
  doneContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24, paddingBottom: 50 },
  celebrationIcon: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  doneEyebrow: { color: '#10B981', fontSize: 12, fontWeight: '900', letterSpacing: 1.4 },
  doneTitle: { color: '#0F172A', fontSize: 27, lineHeight: 35, fontWeight: '900', textAlign: 'center', marginTop: 8 },
  doneDescription: { color: '#64748B', lineHeight: 22, textAlign: 'center', marginTop: 10, marginBottom: 24 },
  feedbackCard: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 17, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 18 },
  feedbackTitle: { color: '#0F172A', fontWeight: '900', fontSize: 16, textAlign: 'center' },
  feedbackSubtitle: { color: '#64748B', fontSize: 12, textAlign: 'center', marginTop: 4 },
  feedbackWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 14 },
  feedbackChip: { borderRadius: 999, backgroundColor: '#F1F5F9', paddingHorizontal: 13, paddingVertical: 9 },
  feedbackChipSelected: { backgroundColor: '#10B981' },
  feedbackChipText: { color: '#475569', fontSize: 12, fontWeight: '700' },
  feedbackChipTextSelected: { color: '#FFFFFF' },
});
