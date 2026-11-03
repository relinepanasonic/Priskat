package com.ruangiman.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.view.View;
import android.widget.RemoteViews;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Locale;

/**
 * Home-screen widget: the prayer flame with the streak, whether today is done, and the verse of the day.
 * Tapping it opens the app. It redraws every 30 minutes so "today" stays right after midnight.
 */
public class RuangWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        for (int id : ids) manager.updateAppWidget(id, build(context));
    }

    static void refreshAll(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        int[] ids = manager.getAppWidgetIds(new ComponentName(context, RuangWidgetProvider.class));
        for (int id : ids) manager.updateAppWidget(id, build(context));
    }

    private static String day(int offset) {
        Calendar c = Calendar.getInstance();
        c.add(Calendar.DAY_OF_YEAR, offset);
        return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(c.getTime());
    }

    private static RemoteViews build(Context context) {
        SharedPreferences p = context.getSharedPreferences(RuangWidgetPlugin.PREFS, Context.MODE_PRIVATE);
        boolean en = p.getBoolean("isEn", false);
        String lastDay = p.getString("lastDay", "");
        int saved = p.getInt("streak", 0);
        String verse = p.getString("verseText", "");
        String ref = p.getString("verseRef", "");

        boolean prayedToday = day(0).equals(lastDay);
        boolean alive = prayedToday || day(-1).equals(lastDay);
        // The saved streak is only still true if the last prayer was today or yesterday
        int streak = alive ? saved : 0;

        String status;
        if (prayedToday) status = en ? "Prayed today ✓" : "Sudah berdoa hari ini ✓";
        else if (streak > 0) status = en ? "Keep your flame alive today" : "Ayo jaga apimu hari ini";
        else status = en ? "Start praying today" : "Mulai berdoa hari ini";

        RemoteViews v = new RemoteViews(context.getPackageName(), R.layout.widget_ruang);
        v.setTextViewText(R.id.widget_streak, String.valueOf(streak));
        v.setTextViewText(R.id.widget_streak_label, en ? (streak == 1 ? "day" : "days") : "hari");
        v.setTextViewText(R.id.widget_status, status);
        v.setTextColor(R.id.widget_status, prayedToday ? 0xFF86EFAC : 0xFFD6B072);
        v.setTextViewText(R.id.widget_button, prayedToday ? (en ? "Open" : "Buka") : (en ? "Pray" : "Berdoa"));

        if (verse.isEmpty()) {
            v.setViewVisibility(R.id.widget_verse, View.GONE);
            v.setViewVisibility(R.id.widget_ref, View.GONE);
        } else {
            v.setViewVisibility(R.id.widget_verse, View.VISIBLE);
            v.setViewVisibility(R.id.widget_ref, View.VISIBLE);
            v.setTextViewText(R.id.widget_verse, "“" + verse + "”");
            v.setTextViewText(R.id.widget_ref, ref);
        }

        Intent open = new Intent(context, MainActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pi = PendingIntent.getActivity(context, 0, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        v.setOnClickPendingIntent(R.id.widget_root, pi);
        v.setOnClickPendingIntent(R.id.widget_button, pi);
        return v;
    }
}
