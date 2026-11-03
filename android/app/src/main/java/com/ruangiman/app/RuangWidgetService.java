package com.ruangiman.app;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.view.View;
import android.widget.RemoteViews;
import android.widget.RemoteViewsService;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Locale;

/** Draws the three cards of the stack widget from what the web app saved on the phone. */
public class RuangWidgetService extends RemoteViewsService {

    @Override
    public RemoteViewsFactory onGetViewFactory(Intent intent) {
        return new Factory(getApplicationContext());
    }

    static class Factory implements RemoteViewsFactory {
        private static final int CARDS = 3;
        private final Context context;
        private boolean en;
        private String lastDay = "", verse = "", ref = "", celebration = "", readings = "";
        private int saved;

        Factory(Context context) { this.context = context; }

        @Override public void onCreate() { load(); }
        @Override public void onDataSetChanged() { load(); }
        @Override public void onDestroy() {}
        @Override public int getCount() { return CARDS; }
        @Override public long getItemId(int position) { return position; }
        @Override public boolean hasStableIds() { return true; }
        @Override public int getViewTypeCount() { return CARDS; }
        @Override public RemoteViews getLoadingView() { return null; }

        private void load() {
            SharedPreferences p = context.getSharedPreferences(RuangWidgetPlugin.PREFS, Context.MODE_PRIVATE);
            en = p.getBoolean("isEn", false);
            lastDay = p.getString("lastDay", "");
            saved = p.getInt("streak", 0);
            verse = p.getString("verseText", "");
            ref = p.getString("verseRef", "");
            celebration = p.getString("celebration", "");
            readings = p.getString("readings", "");
        }

        private static String day(int offset) {
            Calendar c = Calendar.getInstance();
            c.add(Calendar.DAY_OF_YEAR, offset);
            return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(c.getTime());
        }

        @Override
        public RemoteViews getViewAt(int position) {
            RemoteViews v;
            if (position == 0) v = streakCard();
            else if (position == 1) v = verseCard();
            else v = massCard();
            v.setTextViewText(R.id.card_dots, position == 0 ? "●  ○  ○" : position == 1 ? "○  ●  ○" : "○  ○  ●");
            v.setOnClickFillInIntent(R.id.card_root, new Intent());
            return v;
        }

        private RemoteViews streakCard() {
            boolean prayedToday = day(0).equals(lastDay);
            boolean alive = prayedToday || day(-1).equals(lastDay);
            // The saved streak is only still true if the last prayer was today or yesterday
            int streak = alive ? saved : 0;

            String status;
            if (prayedToday) status = en ? "Prayed today ✓" : "Sudah berdoa hari ini ✓";
            else if (streak > 0) status = en ? "Keep your flame alive today" : "Ayo jaga apimu hari ini";
            else status = en ? "Start praying today" : "Mulai berdoa hari ini";

            RemoteViews v = new RemoteViews(context.getPackageName(), R.layout.widget_card_streak);
            v.setTextViewText(R.id.widget_streak, String.valueOf(streak));
            v.setTextViewText(R.id.widget_streak_label, en ? (streak == 1 ? "day" : "days") : "hari");
            v.setTextViewText(R.id.widget_status, status);
            v.setTextColor(R.id.widget_status, prayedToday ? 0xFF86EFAC : 0xFFD6B072);
            v.setTextViewText(R.id.widget_button, prayedToday ? (en ? "Open" : "Buka") : (en ? "Pray" : "Berdoa"));
            v.setOnClickFillInIntent(R.id.widget_button, new Intent());
            return v;
        }

        private RemoteViews verseCard() {
            RemoteViews v = new RemoteViews(context.getPackageName(), R.layout.widget_card_verse);
            v.setTextViewText(R.id.card_title, en ? "Verse of the day" : "Ayat hari ini");
            if (verse.isEmpty()) {
                v.setTextViewText(R.id.widget_verse, en ? "Open the app to load today's verse." : "Buka aplikasi untuk memuat ayat hari ini.");
                v.setViewVisibility(R.id.widget_ref, View.GONE);
            } else {
                v.setTextViewText(R.id.widget_verse, "“" + verse + "”");
                v.setViewVisibility(R.id.widget_ref, View.VISIBLE);
                v.setTextViewText(R.id.widget_ref, ref);
            }
            return v;
        }

        private RemoteViews massCard() {
            RemoteViews v = new RemoteViews(context.getPackageName(), R.layout.widget_card_mass);
            v.setTextViewText(R.id.card_title, en ? "Today's readings" : "Bacaan hari ini");
            v.setTextViewText(R.id.widget_readings, readings.isEmpty()
                    ? (en ? "Open the app to load today's readings." : "Buka aplikasi untuk memuat bacaan hari ini.")
                    : readings);
            return v;
        }
    }
}
