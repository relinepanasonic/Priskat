package com.ruangiman.app;

import android.os.Bundle;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;

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

        // No internet: show our own "Tidak ada koneksi" screen with a retry button
        // instead of Android's grey "Webpage not available" page
        bridge.setWebViewClient(new BridgeWebViewClient(bridge) {
            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                if (request.isForMainFrame()) showOffline(view, request.getUrl().toString());
            }
        });
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
