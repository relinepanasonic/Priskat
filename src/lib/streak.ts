"use client";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate: string; // YYYY-MM-DD
  weeklyHistory: boolean[]; // 7 elements (0 = Mon, 6 = Sun)
}

const STREAK_STORAGE_KEY = "ruang_iman_streak_data";

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDayOfWeekIndex(dateStr: string): number {
  const date = new Date(dateStr);
  const day = date.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  return day === 0 ? 6 : day - 1; // 0 = Mon, 6 = Sun
}

export function getStoredStreak(): StreakData {
  if (typeof window === "undefined") {
    return {
      currentStreak: 1,
      longestStreak: 1,
      lastCheckInDate: getTodayDateString(),
      weeklyHistory: [false, false, false, false, false, false, false],
    };
  }

  try {
    const raw = localStorage.getItem(STREAK_STORAGE_KEY);
    if (!raw) {
      const today = getTodayDateString();
      const initial: StreakData = {
        currentStreak: 1,
        longestStreak: 1,
        lastCheckInDate: today,
        weeklyHistory: [false, false, false, false, false, false, false],
      };
      initial.weeklyHistory[getDayOfWeekIndex(today)] = true;
      localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }

    const data: StreakData = JSON.parse(raw);
    const today = getTodayDateString();
    
    // Check if streak was broken (missed more than 1 day)
    const lastDate = new Date(data.lastCheckInDate);
    const currDate = new Date(today);
    const diffTime = Math.abs(currDate.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1 && data.lastCheckInDate !== today) {
      // Streak broken, reset to 1 if user logs in today
      data.currentStreak = 1;
    }

    // Auto mark today in weekly history
    const todayIdx = getDayOfWeekIndex(today);
    if (!data.weeklyHistory[todayIdx]) {
      data.weeklyHistory[todayIdx] = true;
      data.lastCheckInDate = today;
      localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(data));
    }

    return data;
  } catch (e) {
    const today = getTodayDateString();
    return {
      currentStreak: 1,
      longestStreak: 1,
      lastCheckInDate: today,
      weeklyHistory: [true, false, false, false, false, false, false],
    };
  }
}

export function recordStreakCheckIn(): StreakData {
  if (typeof window === "undefined") {
    return {
      currentStreak: 1,
      longestStreak: 1,
      lastCheckInDate: getTodayDateString(),
      weeklyHistory: [true, false, false, false, false, false, false],
    };
  }

  const current = getStoredStreak();
  const today = getTodayDateString();

  if (current.lastCheckInDate === today) {
    return current;
  }

  const lastDate = new Date(current.lastCheckInDate);
  const currDate = new Date(today);
  const diffTime = currDate.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  let newStreak = current.currentStreak;
  if (diffDays === 1) {
    newStreak += 1;
  } else if (diffDays > 1) {
    newStreak = 1;
  }

  const newLongest = Math.max(newStreak, current.longestStreak);
  const todayIdx = getDayOfWeekIndex(today);
  
  const updatedHistory = [...current.weeklyHistory];
  updatedHistory[todayIdx] = true;

  const updatedData: StreakData = {
    currentStreak: newStreak,
    longestStreak: newLongest,
    lastCheckInDate: today,
    weeklyHistory: updatedHistory,
  };

  localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(updatedData));
  return updatedData;
}
