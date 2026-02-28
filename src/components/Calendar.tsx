import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

interface CalendarProps {
  year: number;
  month: number;
  memoriesDates: Set<string>;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const SCREEN_WIDTH = Dimensions.get('window').width;
const CALENDAR_PADDING = 16;
const CELL_SIZE = Math.floor((SCREEN_WIDTH - 40 - CALENDAR_PADDING * 2) / 7);

export default function Calendar({ year, month, memoriesDates, selectedDate, onSelectDate, onPrevMonth, onNextMonth }: CalendarProps) {
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    return days;
  }, [year, month]);

  const formatDate = (day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onPrevMonth} style={styles.navBtn}>
          <Text style={styles.navText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{MONTHS[month]} {year}</Text>
        <TouchableOpacity onPress={onNextMonth} style={styles.navBtn}>
          <Text style={styles.navText}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.daysHeader}>
        {DAYS.map(day => (
          <View key={day} style={[styles.dayHeaderCell, { width: CELL_SIZE }]}>
            <Text style={styles.dayHeaderText}>{day}</Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <View key={`empty-${index}`} style={[styles.cell, { width: CELL_SIZE, height: CELL_SIZE }]} />;
          }

          const dateStr = formatDate(day);
          const hasMemory = memoriesDates.has(dateStr);
          const isSelected = selectedDate === dateStr;
          const isToday = dateStr === todayStr;

          return (
            <TouchableOpacity
              key={dateStr}
              style={[
                styles.cell,
                { width: CELL_SIZE, height: CELL_SIZE },
              ]}
              onPress={() => onSelectDate(dateStr)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.cellInner,
                isSelected && styles.selectedCell,
                isToday && !isSelected && styles.todayCell,
              ]}>
                <Text style={[
                  styles.dayText,
                  isSelected && styles.selectedDayText,
                  isToday && !isSelected && styles.todayText,
                ]}>
                  {day}
                </Text>
                {hasMemory && <View style={[styles.dot, isSelected && styles.selectedDot]} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    backgroundColor: 'rgba(255,255,255,0.03)', 
    borderRadius: 20, 
    padding: CALENDAR_PADDING, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.06)' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  navBtn: { 
    width: 40, 
    height: 40, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: 20, 
    backgroundColor: 'rgba(91,79,196,0.15)' 
  },
  navText: { fontSize: 24, color: '#A78BFA', fontWeight: '300' },
  monthTitle: { fontSize: 18, fontWeight: '600', color: '#FFF' },
  daysHeader: { flexDirection: 'row', marginBottom: 8 },
  dayHeaderCell: { alignItems: 'center', paddingVertical: 8 },
  dayHeaderText: { fontSize: 12, color: '#6B6B8D', fontWeight: '500' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 2,
  },
  cellInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  selectedCell: { backgroundColor: '#5B4FC4' },
  todayCell: { backgroundColor: 'rgba(91,79,196,0.2)' },
  dayText: { fontSize: 15, color: '#CCC', fontWeight: '500' },
  selectedDayText: { color: '#FFF', fontWeight: '700' },
  todayText: { color: '#A78BFA', fontWeight: '600' },
  dot: { 
    width: 5, 
    height: 5, 
    borderRadius: 2.5, 
    backgroundColor: '#A78BFA', 
    marginTop: 2,
    position: 'absolute',
    bottom: 6,
  },
  selectedDot: { backgroundColor: '#FFF' },
});
