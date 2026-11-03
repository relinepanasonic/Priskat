package com.ruangiman.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Our own plugin: the web app feeds the home-screen widget through it
        registerPlugin(RuangWidgetPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
