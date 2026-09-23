package com.varius.app;

import android.content.Context;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.widget.Button;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

public class MainActivity extends BridgeActivity {

    private static final String TAG = "VariusOffline";
    private static final long READY_FALLBACK_MS = 6000;

    private View offlineView;
    private WebView webView;
    private boolean mainFrameError = false;
    private boolean webReady = false;
    private final Handler handler = new Handler(Looper.getMainLooper());

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.d(TAG, "onCreate iniciado");

        webView = getBridge().getWebView();

        offlineView = getLayoutInflater().inflate(R.layout.offline_screen, null);
        offlineView.setVisibility(View.GONE);
        addContentView(offlineView, new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT));

        Button retry = offlineView.findViewById(R.id.offlineRetry);
        retry.setOnClickListener(v -> {
            Log.d(TAG, "Reintento pulsado");
            webReady = false;
            webView.reload();
        });

        getBridge().setWebViewClient(new BridgeWebViewClient(getBridge()) {
            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                Log.d(TAG, "onReceivedError mainFrame=" + request.isForMainFrame()
                        + " url=" + request.getUrl() + " err="
                        + (error != null ? error.getDescription() : "null"));
                if (request.isForMainFrame()) {
                    mainFrameError = true;
                    showOffline();
                }
                super.onReceivedError(view, request, error);
            }

            @Override
            public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                mainFrameError = false;
                webReady = false;
                scheduleReadyFallback();
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                Log.d(TAG, "onPageFinished url=" + url + " mainFrameError=" + mainFrameError);
            }
        });

        webView.addJavascriptInterface(new AndroidReadyBridge(), "AndroidApp");
        webView.setAlpha(0f);
        webView.reload();
        scheduleReadyFallback();

        if (!isNetworkAvailable()) {
            Log.d(TAG, "Sin red al arrancar, mostrando pantalla offline");
            showOffline();
        }

        ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        cm.registerDefaultNetworkCallback(new ConnectivityManager.NetworkCallback() {
            @Override
            public void onAvailable(Network network) {
                Log.d(TAG, "Red recuperada");
                if (offlineView.getVisibility() == View.VISIBLE) {
                    runOnUiThread(() -> webView.reload());
                }
            }
        });
    }

    class AndroidReadyBridge {
        @JavascriptInterface
        public void ready() {
            Log.d(TAG, "Web señaló ready");
            runOnUiThread(() -> onWebReady());
        }
    }

    private void onWebReady() {
        if (webReady) return;
        webReady = true;
        if (mainFrameError) return;
        if (offlineView.getVisibility() == View.VISIBLE && !isNetworkAvailable()) return;
        Log.d(TAG, "Mostrando web");
        hideOffline();
        if (webView.getAlpha() < 1f) {
            webView.animate().alpha(1f).setDuration(200).start();
        }
    }

    private void scheduleReadyFallback() {
        handler.postDelayed(() -> {
            if (!webReady && !mainFrameError && isNetworkAvailable()) {
                Log.d(TAG, "Fallback de ready, mostrando web igualmente");
                webReady = true;
                hideOffline();
                webView.animate().alpha(1f).setDuration(200).start();
            }
        }, READY_FALLBACK_MS);
    }

    private boolean isNetworkAvailable() {
        ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        Network nw = cm.getActiveNetwork();
        if (nw == null) return false;
        NetworkCapabilities caps = cm.getNetworkCapabilities(nw);
        return caps != null && (caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)
                || caps.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR)
                || caps.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET));
    }

    private void showOffline() {
        runOnUiThread(() -> {
            Log.d(TAG, "Mostrando pantalla offline");
            webView.animate().cancel();
            webView.setAlpha(0f);
            offlineView.setVisibility(View.VISIBLE);
        });
    }

    private void hideOffline() {
        runOnUiThread(() -> {
            if (offlineView.getVisibility() == View.VISIBLE) {
                Log.d(TAG, "Ocultando pantalla offline");
                offlineView.setVisibility(View.GONE);
            }
        });
    }
}
