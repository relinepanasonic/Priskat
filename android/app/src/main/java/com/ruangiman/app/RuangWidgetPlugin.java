package com.ruangiman.app;

import android.content.Context;
import android.content.SharedPreferences;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * The web app tells the home-screen widget what to show: the prayer streak, the last day the
 * person prayed, and today's verse. Stored on the phone so the widget works while the app is closed.
 */
@CapacitorPlugin(name = "RuangWidget")
public class RuangWidgetPlugin extends Plugin {

    static final String PREFS = "ruang_widget";

    @PluginMethod
    public void update(PluginCall call) {
        Context ctx = getContext();
        SharedPreferences.Editor e = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit();
        e.putInt("streak", call.getInt("streak", 0));
        e.putString("lastDay", call.getString("lastDay", ""));
        e.putString("verseText", call.getString("verseText", ""));
        e.putString("verseRef", call.getString("verseRef", ""));
        e.putBoolean("isEn", Boolean.TRUE.equals(call.getBoolean("isEn", false)));
        e.apply();
        RuangWidgetProvider.refreshAll(ctx);
        call.resolve();
    }
}
