package com.ruangiman.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.ContentResolver;
import android.content.Intent;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;

import androidx.activity.OnBackPressedCallback;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Our own plugin: the web app feeds the home-screen widget through it
        registerPlugin(RuangWidgetPlugin.class);
        super.onCreate(savedInstanceState);

        createChatChannel();
        createToneChannels();
        handleBackAsUp();

        // No internet: show our own "Tidak ada koneksi" screen with a retry button
        // instead of Android's grey "Webpage not available" page
        bridge.setWebViewClient(new BridgeWebViewClient(bridge) {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                // Tell the web app this native build supports Facebook-style rich push notifications
                view.evaluateJavascript("window.__RUANG_RICH_PUSH__ = true;", null);
                deliverPendingUrl(view);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                if (request.isForMainFrame()) showOffline(view, request.getUrl().toString());
            }
        });

        captureRichUrl(getIntent());
    }

    private String pendingRichUrl = null;

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        captureRichUrl(intent);
        WebView view = bridge != null ? bridge.getWebView() : null;
        if (view != null) deliverPendingUrl(view);
    }

    private void captureRichUrl(Intent intent) {
        if (intent == null) return;
        String u = intent.getStringExtra("ruang_url");
        if (u != null && u.startsWith("/")) {
            pendingRichUrl = u;
            intent.removeExtra("ruang_url");
        }
    }

    private void deliverPendingUrl(WebView view) {
        if (pendingRichUrl == null) return;
        String target = pendingRichUrl;
        pendingRichUrl = null;
        String js = "(function(){var p=" + JSONObject.quote(target) + ";if(window.location.pathname+window.location.search!==p){window.location.assign(p);}})();";
        view.evaluateJavascript(js, null);
    }

    /**
     * The phone's Back button climbs ONE step up the page ladder (Beranda > section > page > sub page) instead of
     * leaving the app or walking through the browser history, which can go in circles. The web page decides:
     * window.__ruangUp() answers "up" when it moved up (or asked to press once more) and "exit" on Beranda.
     */
    private void handleBackAsUp() {
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                final WebView view = bridge != null ? bridge.getWebView() : null;
                if (view == null) { moveTaskToBack(true); return; }
                view.evaluateJavascript(
                    "(function(){try{return window.__ruangUp?window.__ruangUp():'exit'}catch(e){return 'exit'}})()",
                    value -> {
                        // the answer arrives as a JSON string: "up" or "exit"
                        if (value != null && value.contains("up")) return;
                        moveTaskToBack(true);
                    }
                );
            }
        });
    }

    /**
     * One channel per way a notification can sound. Android fixes a channel's sound when it is made, so "with sound"
     * and "vibrate only" are two channels and the server picks one for each person (their choice in the app):
     *   prayer_sound / prayer_vibrate : prayer reminders (church bell)
     *   chat_sound / chat_vibrate     : chat and friends (chat tone)
     *   auto                          : the automatic ones, with the chat tone; the phone decides: tone when it rings,
     *                                   vibration when it is on vibrate, nothing when it is silent
     */
    private void createToneChannels() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        try {
            NotificationManager nm = getSystemService(NotificationManager.class);
            if (nm == null) return;
            makeChannel(nm, "prayer_sound", "Pengingat doa (dengan suara)", "Lonceng gereja untuk pengingat doa", "church_bell");
            makeChannel(nm, "prayer_vibrate", "Pengingat doa (getar saja)", "Pengingat doa tanpa suara, hanya getar", null);
            makeChannel(nm, "chat_sound", "Pesan dan teman (dengan suara)", "Nada pesan untuk chat dan ajakan pertemanan", "chat_tone");
            makeChannel(nm, "chat_vibrate", "Pesan dan teman (getar saja)", "Chat dan ajakan pertemanan tanpa suara, hanya getar", null);
            makeChannel(nm, "auto", "Notifikasi otomatis", "Kabar otomatis. Nada, getar, atau senyap mengikuti pengaturan HP.", "chat_tone");
        } catch (Exception ignored) {
            // the default channel keeps working
        }
    }

    private void makeChannel(NotificationManager nm, String id, String name, String description, String rawSound) {
        NotificationChannel ch = new NotificationChannel(id, name, NotificationManager.IMPORTANCE_HIGH);
        ch.setDescription(description);
        if (rawSound != null) {
            int res = getResources().getIdentifier(rawSound, "raw", getPackageName());
            if (res != 0) {
                Uri sound = Uri.parse(ContentResolver.SCHEME_ANDROID_RESOURCE + "://" + getPackageName() + "/" + res);
                AudioAttributes attrs = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build();
                ch.setSound(sound, attrs);
            }
        } else {
            ch.setSound(null, null); // vibrate only
        }
        ch.enableVibration(true);
        ch.setLockscreenVisibility(android.app.Notification.VISIBILITY_PRIVATE);
        nm.createNotificationChannel(ch);
    }

    /** Chat and friend notifications get their own channel with the Ruang Iman chime (like a messaging app's tone). */
    private void createChatChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        try {
            NotificationManager nm = getSystemService(NotificationManager.class);
            if (nm == null) return;
            Uri sound = Uri.parse(ContentResolver.SCHEME_ANDROID_RESOURCE + "://" + getPackageName() + "/raw/ruang_chime");
            AudioAttributes attrs = new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build();
            NotificationChannel ch = new NotificationChannel("chat", "Pesan dan teman", NotificationManager.IMPORTANCE_HIGH);
            ch.setDescription("Pesan pribadi dan grup, serta ajakan pertemanan");
            ch.setSound(sound, attrs);
            ch.enableVibration(true);
            ch.setLockscreenVisibility(android.app.Notification.VISIBILITY_PRIVATE);
            nm.createNotificationChannel(ch);
        } catch (Exception ignored) {
            // the default channel keeps working
        }
    }

    private void showOffline(WebView view, String failedUrl) {
        try {
            InputStream in = getAssets().open("offline.html");
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] buf = new byte[4096];
            int n;
            while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
            in.close();
            String url = failedUrl.startsWith("https://apps.ruangiman.com") ? failedUrl : "https://apps.ruangiman.com/";
            String html = out.toString(StandardCharsets.UTF_8.name())
                .replace("<script>", "<script>window.__FAILED_URL__ = " + JSONObject.quote(url) + ";");
            view.loadDataWithBaseURL("https://apps.ruangiman.com/", html, "text/html", "UTF-8", failedUrl);
        } catch (Exception ignored) {
            // keep Android's own error page
        }
    }
}
