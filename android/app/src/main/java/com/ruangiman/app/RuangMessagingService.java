package com.ruangiman.app;

import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffXfermode;
import android.graphics.Rect;
import android.graphics.RectF;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;

import com.capacitorjs.plugins.pushnotifications.MessagingService;
import com.google.firebase.messaging.RemoteMessage;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Map;

/**
 * Facebook-style rich push notifications for Ruang Iman (Build 12+):
 *   - Circular avatar (large icon)
 *   - Expandable BigPicture photo
 *   - Up to 2 bottom action buttons (e.g. "Tambah Teman", "Lihat Profil")
 * Falls back cleanly to Capacitor's MessagingService for normal notifications.
 */
public class RuangMessagingService extends MessagingService {

    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        Map<String, String> data = remoteMessage.getData();
        if (!"1".equals(data.get("rich"))) {
            super.onMessageReceived(remoteMessage);
            return;
        }

        String title = data.get("title");
        if (title == null || title.isEmpty()) title = "Ruang Iman";
        String body = data.get("body");
        if (body == null) body = "";
        String url = data.get("url");
        if (url == null || !url.startsWith("/")) url = "/";
        String channelId = data.get("channel_id");
        if (channelId == null || channelId.isEmpty()) channelId = "chat_sound";

        Bitmap avatarBmp = downloadBitmap(data.get("avatar"), 192);
        Bitmap imageBmp = downloadBitmap(data.get("image"), 900);
        Bitmap circleAvatar = avatarBmp != null ? toCircle(avatarBmp) : null;

        int notifId = (int) (System.currentTimeMillis() & 0x7fffffff);

        Intent openIntent = new Intent(this, MainActivity.class);
        openIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        openIntent.putExtra("ruang_url", url);
        PendingIntent contentPi = PendingIntent.getActivity(
            this, notifId, openIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setColor(0xFFD6B072)
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(contentPi);

        if (circleAvatar != null) {
            builder.setLargeIcon(circleAvatar);
        }

        if (imageBmp != null) {
            NotificationCompat.BigPictureStyle style = new NotificationCompat.BigPictureStyle()
                .bigPicture(imageBmp)
                .setBigContentTitle(title)
                .setSummaryText(body);
            // Keep the circular avatar visible in the expanded view (Facebook style)
            if (circleAvatar != null) {
                style.bigLargeIcon(circleAvatar);
            }
            builder.setStyle(style);
        } else if (body.length() > 45) {
            builder.setStyle(new NotificationCompat.BigTextStyle().bigText(body));
        }

        // Up to 2 bottom action buttons (e.g. "Tambah Teman" | "Lihat Profil")
        String actionsJson = data.get("actions");
        if (actionsJson != null && !actionsJson.isEmpty()) {
            try {
                JSONArray arr = new JSONArray(actionsJson);
                int count = Math.min(2, arr.length());
                for (int i = 0; i < count; i++) {
                    JSONObject obj = arr.getJSONObject(i);
                    String label = obj.optString("label", "");
                    String actUrl = obj.optString("url", url);
                    if (label.isEmpty() || !actUrl.startsWith("/")) continue;
                    Intent actIntent = new Intent(this, MainActivity.class);
                    actIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                    actIntent.putExtra("ruang_url", actUrl);
                    PendingIntent actPi = PendingIntent.getActivity(
                        this, notifId + i + 1, actIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                    );
                    builder.addAction(0, label, actPi);
                }
            } catch (Exception ignored) {
                // Skip malformed actions
            }
        }

        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        if (nm != null) {
            nm.notify(notifId, builder.build());
        }
    }

    private Bitmap downloadBitmap(String urlStr, int maxDim) {
        if (urlStr == null || !urlStr.startsWith("https://")) return null;
        HttpURLConnection conn = null;
        try {
            conn = (HttpURLConnection) new URL(urlStr).openConnection();
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(6000);
            conn.setDoInput(true);
            conn.connect();
            if (conn.getResponseCode() != 200) return null;
            try (InputStream in = conn.getInputStream()) {
                Bitmap raw = BitmapFactory.decodeStream(in);
                if (raw == null) return null;
                int w = raw.getWidth();
                int h = raw.getHeight();
                if (w <= maxDim && h <= maxDim) return raw;
                float scale = Math.min((float) maxDim / w, (float) maxDim / h);
                Bitmap scaled = Bitmap.createScaledBitmap(raw, Math.max(1, Math.round(w * scale)), Math.max(1, Math.round(h * scale)), true);
                if (scaled != raw) raw.recycle();
                return scaled;
            }
        } catch (Exception ignored) {
            return null;
        } finally {
            if (conn != null) conn.disconnect();
        }
    }

    private Bitmap toCircle(Bitmap src) {
        int size = Math.min(src.getWidth(), src.getHeight());
        int x = (src.getWidth() - size) / 2;
        int y = (src.getHeight() - size) / 2;
        Bitmap square = Bitmap.createBitmap(src, x, y, size, size);
        Bitmap out = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(out);
        Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        Rect rect = new Rect(0, 0, size, size);
        canvas.drawOval(new RectF(rect), paint);
        paint.setXfermode(new PorterDuffXfermode(PorterDuff.Mode.SRC_IN));
        canvas.drawBitmap(square, rect, rect, paint);
        if (square != src) square.recycle();
        return out;
    }
}
