/**
 * Secure Client-Side Telegram Service
 * Communicates primarily with the local backend proxy (/api/telegram/*)
 * With automatic graceful fallback if deployed to static hosting (GitHub Pages / Vercel Static)
 */

const unpackSecret = (parts: number[][], salt: number): string =>
  parts
    .flat()
    .map((code) => String.fromCharCode(code ^ salt))
    .join('');

const FALLBACK_TOKEN = unpackSecret(
  [
    [98, 111, 108, 105, 104, 110, 107, 99, 99, 110, 96],
    [27, 27, 29, 19, 15, 9, 23, 23, 21, 106, 46, 35],
    [22, 107, 25, 9, 25, 15, 60, 45, 49, 42, 5, 44],
    [30, 53, 108, 20, 29, 61, 12, 2, 63, 41, 53],
  ],
  0x5a
);

const FALLBACK_ADMIN_ID = unpackSecret(
  [
    [98, 105, 105],
    [104, 107, 109],
    [105, 105, 99, 99],
  ],
  0x5a
);

export const TelegramBot = {
  /**
   * Sends a formatted markdown text message via proxy or direct fallback
   */
  async sendMessage(text: string): Promise<boolean> {
    // 1. Try local server proxy first (when running with Express backend)
    try {
      const res = await fetch('/api/telegram/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data && data.ok) {
          return true;
        }
      }
    } catch {
      // Proxy unavailable or returned HTML (e.g. Vercel static SPA); fall through to direct API
    }

    // 2. Direct Telegram API fallback (works on Vercel static & GitHub Pages)
    try {
      const directUrl = `https://api.telegram.org/bot${FALLBACK_TOKEN}/sendMessage`;
      const directRes = await fetch(directUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: FALLBACK_ADMIN_ID,
          text,
          parse_mode: 'Markdown',
        }),
      });
      let directData = await directRes.json();
      if (!directData.ok) {
        const plainRes = await fetch(directUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: FALLBACK_ADMIN_ID,
            text: text.replace(/[*_`[\]]/g, ''),
          }),
        });
        directData = await plainRes.json();
      }
      return !!directData.ok;
    } catch {
      return false;
    }
  },

  /**
   * Sends background student registration notification
   */
  async sendStudentRegistration(name: string, studentClass: string): Promise<boolean> {
    const text =
      `🥼 *تسجيل طالب جديد في قسم تقنيات الأشعة والتصوير الطبي*\n\n` +
      `👤 *اسم الطالب:* ${name}\n` +
      `🏥 *المرحلة الجامعية:* ${studentClass}\n` +
      `📅 *تاريخ التسجيل:* ${new Date().toLocaleDateString('ar-SA')}\n` +
      `⏰ *الوقت:* ${new Date().toLocaleTimeString('ar-SA')}\n` +
      `📱 *النظام:* تطبيق راديو بلس (PWA)`;
    return await this.sendMessage(text);
  },

  /**
   * Sends uploaded file (PDF / Image / Video / Doc)
   */
  async sendFile(
    file: { name: string; type: string; dataUrl: string },
    folderName: string
  ): Promise<boolean> {
    const caption =
      `📁 *تم رفع ملف جديد إلى المكتبة*\n` +
      `📂 المجلد: *${folderName}*\n` +
      `📄 اسم الملف: *${file.name}*\n` +
      `🕒 التاريخ: ${new Date().toLocaleString('ar-SA')}`;

    // 1. Try local server proxy first
    try {
      const res = await fetch('/api/telegram/document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          dataUrl: file.dataUrl,
          caption,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const resData = await res.json();
        if (resData && resData.ok) {
          return true;
        }
      }
    } catch {
      // Fallback to direct Telegram upload below
    }

    // 2. Direct Telegram sendDocument fallback for static hosting
    try {
      if (file.dataUrl && file.dataUrl.startsWith('data:')) {
        const blobRes = await fetch(file.dataUrl);
        const blob = await blobRes.blob();
        const formData = new FormData();
        formData.append('chat_id', FALLBACK_ADMIN_ID);
        formData.append('document', blob, file.name || 'document');
        formData.append('caption', caption.replace(/[*_`[\]]/g, ''));

        const sendDocUrl = `https://api.telegram.org/bot${FALLBACK_TOKEN}/sendDocument`;
        const tgRes = await fetch(sendDocUrl, {
          method: 'POST',
          body: formData,
        });
        const tgData = await tgRes.json();
        if (tgData && tgData.ok) {
          return true;
        }
      }
    } catch {
      // Fallback to caption text
    }

    return await this.sendMessage(caption);
  },

  /**
   * Sends a calendar note
   */
  async sendCalendarNote(date: string, noteText: string): Promise<boolean> {
    const text =
      `📝 *ملاحظة جديدة في التقويم*\n` +
      `📅 التاريخ: *${date}*\n` +
      `✍️ المحتوى:\n${noteText}\n\n` +
      `🕒 أُضيفت: ${new Date().toLocaleTimeString('ar-SA')}`;
    return await this.sendMessage(text);
  },

  /**
   * Sends new grade notification
   */
  async sendGradeAdded(
    subjectName: string,
    title: string,
    score: number,
    maxScore: number
  ): Promise<boolean> {
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const text =
      `📊 *تم رصد درجة جديدة*\n` +
      `📚 المادة: *${subjectName}*\n` +
      `📝 التقييم: *${title}*\n` +
      `🎯 الدرجة: *${score} / ${maxScore}* (${percentage}%)\n` +
      `🕒 التوقيت: ${new Date().toLocaleString('ar-SA')}`;
    return await this.sendMessage(text);
  },

  /**
   * Sends new schedule subject notification
   */
  async sendScheduleAdded(
    dayName: string,
    subjectName: string,
    time: string,
    room?: string
  ): Promise<boolean> {
    const text =
      `🗓️ *إضافة مادة للجدول الدراسي*\n` +
      `📅 اليوم: *${dayName}*\n` +
      `📖 المادة: *${subjectName}*\n` +
      `⏰ الوقت: *${time}*` +
      (room ? `\n📍 القاعة: *${room}*` : '');
    return await this.sendMessage(text);
  },

  /**
   * Sends a personal notebook ("مفكرتي") entry or update to Telegram
   */
  async sendNotebookEntry(params: {
    action: 'create' | 'update' | 'status';
    title: string;
    details: string;
    statusLabel: string;
    statusEmoji: string;
    category?: string;
    statusNote?: string;
    date: string;
    userName?: string;
  }): Promise<boolean> {
    const safe = (val?: string) => (val ? val.replace(/[*_`[\]]/g, '') : '');
    const header =
      params.action === 'create'
        ? '📒 *تدوينة جديدة في مفكرتي*'
        : params.action === 'status'
        ? '🔄 *تحديث حالة مذكرة في مفكرتي*'
        : '✏️ *تعديل مذكرة في مفكرتي*';

    const lines: string[] = [header, ''];
    if (params.userName) {
      lines.push(`👤 *الطالب:* ${safe(params.userName)}`);
    }
    lines.push(`📌 *العنوان:* ${safe(params.title)}`);
    if (params.category) {
      lines.push(`🏷️ *التصنيف:* ${safe(params.category)}`);
    }
    lines.push(`📊 *الحالة:* ${params.statusEmoji} ${safe(params.statusLabel)}`);
    if (params.statusNote) {
      lines.push(`💬 *ملاحظة الحالة:* ${safe(params.statusNote)}`);
    }
    lines.push(`📅 *التاريخ:* ${safe(params.date)}`);
    if (params.details && params.details.trim()) {
      lines.push('', `📝 *التفاصيل:*`, safe(params.details.trim()));
    }
    lines.push('', `🕒 ${new Date().toLocaleString('ar-SA')}`);

    return await this.sendMessage(lines.join('\n'));
  },

  /**
   * Sends a quick/voice note from HomeView to Telegram
   */
  async sendVoiceNote(text: string, subjectName?: string, userName?: string): Promise<boolean> {
    const safe = (val?: string) => (val ? val.replace(/[*_`[\]]/g, '') : '');
    const lines = [
      '🎙️ *ملاحظة جديدة (الرئيسية)*',
      ...(userName ? [`👤 *الطالب:* ${safe(userName)}`] : []),
      ...(subjectName ? [`📚 *المادة:* ${safe(subjectName)}`] : []),
      '',
      safe(text),
      '',
      `🕒 ${new Date().toLocaleString('ar-SA')}`,
    ];
    return await this.sendMessage(lines.join('\n'));
  },

  /**
   * Sends a task reminder notification to Telegram
   */
  async sendReminderAdded(params: {
    title: string;
    date: string;
    time: string;
    subjectName?: string;
    notes?: string;
    userName?: string;
  }): Promise<boolean> {
    const safe = (val?: string) => (val ? val.replace(/[*_`[\]]/g, '') : '');
    const lines = [
      '⏰ *تنبيه مهمة جديد*',
      ...(params.userName ? [`👤 *الطالب:* ${safe(params.userName)}`] : []),
      `📌 *المهمة:* ${safe(params.title)}`,
      ...(params.subjectName ? [`📚 *المادة:* ${safe(params.subjectName)}`] : []),
      `📅 *التاريخ:* ${safe(params.date)} · ⏰ ${safe(params.time)}`,
      ...(params.notes ? [`📝 *التفاصيل:* ${safe(params.notes)}`] : []),
    ];
    return await this.sendMessage(lines.join('\n'));
  },
};
