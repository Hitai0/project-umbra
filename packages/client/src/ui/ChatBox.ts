import { ChatMessagePayload } from '@mmo/shared';

export class ChatBox {
  private messagesContainer: HTMLElement;
  private form: HTMLFormElement;
  private input: HTMLInputElement;
  private onSendMessage: (text: string) => void;
  private currentChannel: 'all' | 'battle' = 'all';

  constructor(onSendMessage: (text: string) => void) {
    this.onSendMessage = onSendMessage;
    this.messagesContainer = document.getElementById('chat-messages')!;
    this.form = document.getElementById('chat-form') as HTMLFormElement;
    this.input = document.getElementById('chat-input') as HTMLInputElement;

    this.setupListeners();
  }

  private setupListeners() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = this.input.value.trim();
      if (text) {
        this.onSendMessage(text);
        this.input.value = '';
      }
      this.input.blur();
    });

    // Press Enter to focus chat
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && document.activeElement !== this.input) {
        e.preventDefault();
        this.input.focus();
      }
    });

    // Tab buttons
    const tabs = document.querySelectorAll('.chat-tab');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentChannel = tab.getAttribute('data-channel') as 'all' | 'battle';
      });
    });
  }

  public addMessage(msg: ChatMessagePayload) {
    const el = document.createElement('div');
    el.className = 'chat-msg';

    if (msg.senderName === 'System') {
      el.classList.add('system');
      el.textContent = `[System] ${msg.text}`;
    } else if (msg.senderName === 'Battle') {
      el.classList.add('battle');
      el.textContent = `[Battle] ${msg.text}`;
    } else {
      el.innerHTML = `<span class="sender">${msg.senderName}:</span> ${this.escapeHtml(msg.text)}`;
    }

    this.messagesContainer.appendChild(el);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  private escapeHtml(text: string): string {
    return text.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m] || m));
  }
}
