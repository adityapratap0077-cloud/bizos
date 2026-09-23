'use client';

import { useEffect } from 'react';

const CHAT_URL = 'https://banaobot.onrender.com/b/0VJsWjEGIlmo5bb6TZ_tSl9VogvgYL5W?embed=1';

/**
 * Floating BanaoBot chat widget. Injects a chat bubble button fixed to the
 * bottom-right corner; clicking it toggles a panel with the embedded bot.
 * Rendered once in the root layout so it is available on every page.
 */
export function ChatWidget() {
  useEffect(() => {
    if (document.getElementById('bizos-chat-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'bizos-chat-btn';
    btn.textContent = '💬';
    btn.setAttribute('aria-label', 'Open chat');
    btn.style.cssText =
      'position:fixed;right:20px;bottom:20px;width:60px;height:60px;' +
      'border-radius:50%;background:#e85d26;border:2px solid #16130e;' +
      'box-shadow:4px 4px 0 #16130e;font-size:26px;cursor:pointer;z-index:999999;';

    const panel = document.createElement('div');
    panel.id = 'bizos-chat-panel';
    panel.style.cssText =
      'position:fixed;right:20px;bottom:96px;' +
      'width:min(380px,calc(100vw - 40px));height:min(560px,calc(100vh - 130px));' +
      'border:2px solid #16130e;border-radius:12px;overflow:hidden;' +
      'box-shadow:6px 6px 0 #16130e;background:#faf6ee;z-index:999999;display:none;';

    const frame = document.createElement('iframe');
    frame.src = CHAT_URL;
    frame.title = 'Chat';
    frame.style.cssText = 'width:100%;height:100%;border:0;';

    const close = document.createElement('button');
    close.textContent = '×';
    close.setAttribute('aria-label', 'Close chat');
    close.style.cssText =
      'position:absolute;top:8px;right:10px;width:30px;height:30px;' +
      'border-radius:50%;background:#16130e;color:#faf6ee;border:none;' +
      'font-size:18px;line-height:1;cursor:pointer;';
    close.onclick = () => {
      panel.style.display = 'none';
    };

    btn.onclick = () => {
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    };

    panel.appendChild(frame);
    panel.appendChild(close);
    document.body.appendChild(btn);
    document.body.appendChild(panel);

    return () => {
      btn.remove();
      panel.remove();
    };
  }, []);

  return null;
}
