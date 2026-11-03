package com.ruangiman.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.widget.RemoteViews;

/**
 * Home-screen widget: a stack of three cards you swipe up and down (prayer streak, verse of the day,
 * today's Mass readings). Tapping a card opens the app. The cards are drawn by RuangWidgetService.
 * Android redraws it every 30 minutes so "today" stays right after midnight.
 */
public class RuangWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        for (int id : ids) manager.updateAppWidget(id, build(context, id));
        manager.notifyAppWidgetViewDataChanged(ids, R.id.widget_stack);
    }

    static void refreshAll(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        int[] ids = manager.getAppWidgetIds(new ComponentName(context, RuangWidgetProvider.class));
        for (int id : ids) manager.updateAppWidget(id, build(context, id));
        manager.notifyAppWidgetViewDataChanged(ids, R.id.widget_stack);
    }

    private static RemoteViews build(Context context, int widgetId) {
        RemoteViews v = new RemoteViews(context.getPackageName(), R.layout.widget_ruang);

        Intent svc = new Intent(context, RuangWidgetService.class);
        svc.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, widgetId);
        svc.setData(Uri.parse(svc.toUri(Intent.URI_INTENT_SCHEME)));
        v.setRemoteAdapter(R.id.widget_stack, svc);
        v.setEmptyView(R.id.widget_stack, R.id.widget_empty);

        // One template for every card; each card adds an empty fill-in intent so its taps count
        Intent open = new Intent(context, MainActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 31 ? PendingIntent.FLAG_MUTABLE : 0);
        PendingIntent template = PendingIntent.getActivity(context, 0, open, flags);
        v.setPendingIntentTemplate(R.id.widget_stack, template);
        v.setOnClickPendingIntent(R.id.widget_empty, PendingIntent.getActivity(context, 1, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
        return v;
    }
}
