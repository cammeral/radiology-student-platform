/**
 * Telegram Bot Service for Radio Plus (تقنيات الأشعة والتصوير الطبي)
 * Sends all student activities directly to Telegram Bot (@Rsuilt21bot)
 * Works everywhere: Vercel, Netlify, GitHub Pages, and local environment.
 */

const BOT_TOKEN = '8563241994:AAGIUSMMO0tyL1CSCUfwkp_vDo6NGgVXeso';
const ADMIN_CHAT_ID = '8332173399';

export const TelegramBot = {
  /**
   * Core function: Sends formatted Markdown text message directly to Telegram
   */
  async sendMessage(text: string): Promise<boolean> {
    try {
      const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: ADMIN_CHAT_ID,
          text,
          parse_mode: 'Markdown',
        }),
      });

      const data = await res.json();
      return Boolean(data && data.ok);
    } catch (err) {
      console.warn('Telegram sendMessage failed:', err);
      // Fallback: try proxy route if available
      try {
        const proxyRes = await fetch('/api/telegram/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });
        if (proxyRes.ok && proxyRes.headers.get('content-type')?.includes('application/json')) {
          const proxyData = await proxyRes.json();
          return Boolean(proxyData && proxyData.ok);
        }
      } catch {
        // ignore
      }
      return false;
    }
  },

  /**
   * Notification 1: Student opens the app (دخول الطالب للمشروع)
   */
  async sendAppOpened(studentName?: string, studentStage?: string): Promise<boolean> {
    const name = studentName?.trim() || 'زائر غير مسجل';
    const stage = studentStage?.trim() || 'غير محدد';
    const text =
      `👋 *دخول مستخدم جديد للمنصة الجامعية*\n\n` +
      `👤 *اسم الطالب:* ${name}\n` +
      `🏥 *المرحلة الدراسية:* ${stage}\n` +
      `📅 *التاريخ:* ${new Date().toLocaleDateString('ar-SA')}\n` +
      `⏰ *الوقت:* ${new Date().toLocaleTimeString('ar-SA')}\n` +
      `📱 *النظام:* راديو بلس - تقنيات الأشعة والتصوير الطبي`;

    return await this.sendMessage(text);
  },

  /**
   * Notification 2: Voice-to-Text Note Saved (تسجيل مذكرة باستخدام الصوت)
   */
  async sendVoiceNote(
    noteText: string,
    studentName?: string,
    studentStage?: string,
    subjectName?: string
  ): Promise<boolean> {
    const name = studentName?.trim() || 'طالب الأشعة';
    const stage = studentStage?.trim() || '';
    const text =
      `🎙️ *تسجيل ملاحظة صوتية جديدة*\n\n` +
      `👤 *الطالب:* ${name} ${stage ? `(${stage})` : ''}\n` +
      (subjectName ? `📚 *المادة:* ${subjectName}\n` : '') +
      `📝 *النص المكتوب بالصوت:*\n` +
      `« ${noteText} »\n\n` +
      `⏰ *الوقت:* ${new Date().toLocaleTimeString('ar-SA')}`;

    return await this.sendMessage(text);
  },

  /**
   * Notification 3: Student Registration (تسجيل بيانات الطالب)
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
   * Notification 4: Profile Updated (تحديث المرحلة أو الاسم)
   */
  async sendProfileUpdated(name: string, studentStage: string): Promise<boolean> {
    const text =
      `🔄 *تحديث بيانات الطالب والمرحلة*\n\n` +
      `👤 *الاسم الجديد:* ${name}\n` +
      `🏥 *المرحلة الحالية:* ${studentStage}\n` +
      `⏰ *التوقيت:* ${new Date().toLocaleTimeString('ar-SA')}`;

    return await this.sendMessage(text);
  },

  /**
   * Notification 5: Uploaded File to Library (رفع كتاب أو صورة أو ملف)
   */
  async sendFile(
    file: { name: string; type: string; dataUrl: string },
    folderName: string,
    studentName?: string,
    studentStage?: string
  ): Promise<boolean> {
    const name = studentName?.trim() || 'طالب';
    const caption =
      `📁 *تم رفع ملف جديد إلى المكتبة*\n` +
      `👤 الطالب: *${name}*\n` +
      `📂 المجلد: *${folderName}*\n` +
      `📄 اسم الملف: *${file.name}*\n` +
      `🕒 التاريخ: ${new Date().toLocaleString('ar-SA')}`;

    try {
      // If file has a base64 dataUrl, send it directly as document via Telegram API
      if (file.dataUrl && file.dataUrl.startsWith('data:')) {
        const matches = file.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          
          // Decode base64 to binary byte array
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: mimeType });

          const formData = new FormData();
          formData.append('chat_id', ADMIN_CHAT_ID);
          formData.append('document', blob, file.name);
          formData.append('caption', caption);
          formData.append('parse_mode', 'Markdown');

          const uploadUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`;
          const uploadRes = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
          });

          const data = await uploadRes.json();
          if (data && data.ok) {
            return true;
          }
        }
      }
    } catch (e) {
      console.warn('Direct file upload fallback to text caption:', e);
    }

    // Fallback: send text notification with file name
    return await this.sendMessage(caption);
  },

  /**
   * Notification 6: Add Homework / Exam Reminder (ضبط تنبيه واجب أو كويز)
   */
  async sendReminderAdded(
    title: string,
    date: string,
    time: string,
    subjectName?: string,
    studentName?: string
  ): Promise<boolean> {
    const name = studentName?.trim() || 'طالب';
    const text =
      `⏰ *ضبط تنبيه واجب ومذاكرة جديد*\n\n` +
      `👤 *الطالب:* ${name}\n` +
      `🔔 *العنوان:* ${title}\n` +
      (subjectName ? `📚 *المادة:* ${subjectName}\n` : '') +
      `📅 *الموعد:* ${date} في تمام ${time}\n` +
      `🕒 *تاريخ الضبط:* ${new Date().toLocaleTimeString('ar-SA')}`;

    return await this.sendMessage(text);
  },

  /**
   * Notification 7: Calendar Note (ملاحظة تقويم جديدة)
   */
  async sendCalendarNote(date: string, noteText: string, studentName?: string): Promise<boolean> {
    const name = studentName?.trim() || 'طالب';
    const text =
      `📝 *ملاحظة جديدة في التقويم*\n\n` +
      `👤 *الطالب:* ${name}\n` +
      `📅 *التاريخ:* ${date}\n` +
      `✍️ *المحتوى:*\n${noteText}\n\n` +
      `🕒 *أُضيفت في:* ${new Date().toLocaleTimeString('ar-SA')}`;

    return await this.sendMessage(text);
  },

  /**
   * Notification 8: Grade Added (رصد درجة جديدة)
   */
  async sendGradeAdded(
    subjectName: string,
    title: string,
    score: number,
    maxScore: number,
    studentName?: string
  ): Promise<boolean> {
    const name = studentName?.trim() || 'طالب';
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const text =
      `📊 *تم رصد درجة جديدة*\n\n` +
      `👤 *الطالب:* ${name}\n` +
      `📚 *المادة:* ${subjectName}\n` +
      `📝 *التقييم:* ${title}\n` +
      `🎯 *الدرجة:* ${score} من ${maxScore} (${percentage}%)\n` +
      `🕒 *التوقيت:* ${new Date().toLocaleString('ar-SA')}`;

    return await this.sendMessage(text);
  },

  /**
   * Notification 9: Schedule Subject Added (إضافة مادة للجدول الدراسي)
   */
  async sendScheduleAdded(
    dayName: string,
    subjectName: string,
    time: string,
    room?: string,
    studentName?: string
  ): Promise<boolean> {
    const name = studentName?.trim() || 'طالب';
    const text =
      `🗓️ *إضافة محاضرة للجدول الدراسي*\n\n` +
      `👤 *الطالب:* ${name}\n` +
      `📅 *اليوم:* ${dayName}\n` +
      `📖 *المادة:* ${subjectName}\n` +
      `⏰ *الوقت:* ${time}` +
      (room ? `\n📍 *القاعة:* ${room}` : '');

    return await this.sendMessage(text);
  },
};
