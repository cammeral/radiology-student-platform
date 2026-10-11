import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { AppState, ScheduleItem, DayOfWeek, DayCalendarNote } from '../types';
import { ConfirmModal } from './ConfirmModal';
import { VoiceInputButton } from './VoiceInputButton';
import { 
  Calendar as CalendarIcon, Clock, Plus, Trash2, 
  MapPin, ChevronRight, ChevronLeft, Edit3, FileText, Check, BookOpen, Star,
  Mic, Copy, CheckCheck, Sparkles, X
} from 'lucide-react';

interface CalendarScheduleViewProps {
  state: AppState;
  onAddScheduleItem: (item: ScheduleItem) => void;
  onDeleteScheduleItem: (id: string) => void;
  onSaveCalendarNote?: (date: string, text: string) => void;
  onAddCalendarNote?: (date: string, text: string, source?: 'voice' | 'manual', subjectName?: string) => void;
  onUpdateCalendarNote?: (id: string, text: string) => void;
  onDeleteCalendarNoteItem?: (id: string) => void;
  onDeleteCalendarNote?: (date: string) => void;
}

const DAYS_NAMES = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

const TIME_PRESETS = [
  '08:30 ص', '10:00 ص', '11:30 ص', '01:00 م', '02:30 م'
];

const getTodayDateStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const CalendarScheduleView: React.FC<CalendarScheduleViewProps> = ({
  state,
  onAddScheduleItem,
  onDeleteScheduleItem,
  onSaveCalendarNote,
  onAddCalendarNote,
  onUpdateCalendarNote,
  onDeleteCalendarNoteItem,
  onDeleteCalendarNote,
}) => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'schedule'>('calendar');

  // ===================== CALENDAR STATE =====================
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(getTodayDateStr());
  
  // Note creation / editing state
  const [isWritingNote, setIsWritingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  // Deletion confirm states
  const [noteIdToDelete, setNoteIdToDelete] = useState<string | null>(null);
  const [confirmDeleteAllDateNotes, setConfirmDeleteAllDateNotes] = useState(false);
  const [scheduleItemToDelete, setScheduleItemToDelete] = useState<string | null>(null);

  // Month navigation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'كانون الثاني / يناير', 'شباط / فبراير', 'آذار / مارس', 'نيسان / أبريل',
    'أيار / مايو', 'حزيران / يونيو', 'تموز / يوليو', 'آب / أغسطس',
    'أيلول / سبتمبر', 'تشرين الأول / أكتوبر', 'تشرين الثاني / نوفمبر', 'كانون الأول / ديسمبر'
  ];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Retrieve all notes for selected calendar day
  const notesForSelectedDay = (state.calendarNotes || []).filter(
    (n) => n.date === selectedCalendarDate
  );

  const getArabicDayNameForDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return DAYS_NAMES[dateObj.getDay()];
    } catch {
      return '';
    }
  };

  const handleSelectDay = (dayNum: number) => {
    const formatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    setSelectedCalendarDate(formatted);
    setIsWritingNote(false);
    setEditingNoteId(null);
    setNoteInput('');
  };

  const handleStartAddNote = () => {
    setEditingNoteId(null);
    setNoteInput('');
    setIsWritingNote(true);
  };

  const handleStartEditNote = (note: DayCalendarNote) => {
    setEditingNoteId(note.id);
    setNoteInput(note.text);
    setIsWritingNote(true);
  };

  const handleCancelNoteForm = () => {
    setIsWritingNote(false);
    setEditingNoteId(null);
    setNoteInput('');
  };

  const handleSaveNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = noteInput.trim();
    if (!trimmed) return;

    if (editingNoteId) {
      if (onUpdateCalendarNote) {
        onUpdateCalendarNote(editingNoteId, trimmed);
      } else if (onSaveCalendarNote) {
        onSaveCalendarNote(selectedCalendarDate, trimmed);
      }
    } else {
      if (onAddCalendarNote) {
        onAddCalendarNote(selectedCalendarDate, trimmed, 'manual');
      } else if (onSaveCalendarNote) {
        onSaveCalendarNote(selectedCalendarDate, trimmed);
      }
    }

    setIsWritingNote(false);
    setEditingNoteId(null);
    setNoteInput('');
  };

  const handleCopyNote = (id: string, text: string) => {
    try {
      navigator.clipboard?.writeText(text);
      setCopiedNoteId(id);
      setTimeout(() => setCopiedNoteId(null), 2000);
    } catch {
      // ignore
    }
  };

  // ===================== SCHEDULE BY DAY STATE =====================
  const [selectedScheduleDay, setSelectedScheduleDay] = useState<DayOfWeek>(
    new Date().getDay() as DayOfWeek
  );
  const [isAddScheduleModal, setIsAddScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    subjectName: '',
    time: '08:30 ص',
    room: '',
    instructor: '',
  });

  const handleAddScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.subjectName.trim()) return;

    onAddScheduleItem({
      id: 'sch_' + Date.now(),
      day: selectedScheduleDay,
      subjectName: scheduleForm.subjectName.trim(),
      time: scheduleForm.time.trim() || '08:30 ص',
      room: scheduleForm.room.trim() || undefined,
      instructor: scheduleForm.instructor.trim() || undefined,
    });

    setScheduleForm({
      subjectName: '',
      time: '08:30 ص',
      room: '',
      instructor: '',
    });
    setIsAddScheduleModal(false);
  };

  const currentDaySchedule = state.schedule.filter((s) => s.day === selectedScheduleDay);

  return (
    <div className="space-y-4 pb-28 pt-2 px-4 max-w-lg mx-auto animate-classic" dir="rtl">
      
      {/* 1. Classic Smooth Sub-Tabs Switcher */}
      <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-2xs">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === 'calendar'
              ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-600/25'
              : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>التقويم والملاحظات</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === 'schedule'
              ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-600/25'
              : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>الجدول الأسبوعي</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* OPTION 1: تقويم الشهر + تنظيم الملاحظات واستيعاب أكثر من ملاحظة */}
      {/* ========================================================= */}
      {activeTab === 'calendar' && (
        <div className="space-y-4 animate-classic">
          
          {/* Classic Calendar Card */}
          <div className="classic-card rounded-3xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>{monthNames[month]} {year}</span>
                </h3>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                  اضغط على أي يوم لاستعراض وإضافة ملاحظاته
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95"
                  title="الشهر السابق"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95"
                  title="الشهر القادم"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekdays names header */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 py-1 border-b border-slate-100 dark:border-slate-800/80">
              {['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map((d, i) => (
                <div key={i}>{d}</div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1.5 pt-1">
              {/* Empty leading days */}
              {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-11" />
              ))}

              {/* Days of the month */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const isSelected = selectedCalendarDate === dateKey;
                const dayNotes = (state.calendarNotes || []).filter(
                  (n) => n.date === dateKey && n.text?.trim()
                );
                const notesCount = dayNotes.length;
                const isToday = getTodayDateStr() === dateKey;

                return (
                  <button
                    key={dayNum}
                    onClick={() => handleSelectDay(dayNum)}
                    className={`h-12 rounded-2xl flex flex-col items-center justify-center relative transition-all duration-200 tabular-nums text-xs font-bold active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-600/30 scale-105 z-10'
                        : isToday
                        ? 'bg-cyan-50 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border border-cyan-400/80'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span>{dayNum}</span>
                    {notesCount > 0 && (
                      <span className="flex items-center gap-0.5 mt-0.5">
                        {notesCount > 1 ? (
                          <span className={`text-[9px] px-1 py-0.2 rounded-full font-black leading-none ${
                            isSelected
                              ? 'bg-amber-300 text-slate-950'
                              : 'bg-amber-500 text-white shadow-xs'
                          }`}>
                            {notesCount}
                          </span>
                        ) : (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected ? 'bg-amber-300' : 'bg-amber-500 animate-pulse'
                            }`}
                          />
                        )}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ======================================================== */}
          {/* Day Journal / Notebook Card: يستوعب ويرتب ملاحظات متعددة */}
          {/* ======================================================== */}
          <div className="classic-card rounded-3xl p-5 space-y-4">
            
            {/* Header: اسم اليوم والتاريخ وعدد الملاحظات وزر الإضافة */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>مفكرة يوم {getArabicDayNameForDate(selectedCalendarDate)}</span>
                    <span className="tabular-nums text-cyan-600 dark:text-cyan-400 font-extrabold text-xs">
                      ({selectedCalendarDate})
                    </span>
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                    {notesForSelectedDay.length > 0
                      ? `${notesForSelectedDay.length} ملاحظة مسجلة في هذا اليوم`
                      : 'لا توجد ملاحظات مسجلة لهذا اليوم'}
                  </span>
                </div>
              </div>

              {!isWritingNote && (
                <button
                  type="button"
                  onClick={handleStartAddNote}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>تدوين ملاحظة +</span>
                </button>
              )}
            </div>

            {/* Note Input / Dictation Form */}
            {isWritingNote && (
              <form onSubmit={handleSaveNoteSubmit} className="space-y-3 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950/70 border border-cyan-500/30 animate-classic">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    <span>{editingNoteId ? 'تعديل نص الملاحظة:' : 'كتابة ملاحظة جديدة لليوم:'}</span>
                  </span>
                  <VoiceInputButton
                    compact
                    label="تحدث ليكتب"
                    onTranscript={(txt) => setNoteInput((prev) => (prev ? `${prev} ${txt}` : txt))}
                  />
                </div>

                <textarea
                  rows={3}
                  placeholder="اكتب تفاصيل الملاحظة هنا، أو اضغط (تحدث ليكتب) للتحدث بالصوت..."
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl p-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition shadow-inner leading-relaxed"
                  autoFocus
                />

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCancelNoteForm}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-cyan-600/25 transition active:scale-95 cursor-pointer"
                  >
                    {editingNoteId ? 'حفظ التعديل' : 'حفظ في مفكرة اليوم 📅'}
                  </button>
                </div>
              </form>
            )}

            {/* List of notes organized for this day */}
            {notesForSelectedDay.length > 0 ? (
              <div className="space-y-2.5">
                {notesForSelectedDay.map((note, index) => {
                  const isCopied = copiedNoteId === note.id;
                  const isVoice = note.source === 'voice';

                  return (
                    <div
                      key={note.id || index}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-950/80 border border-slate-200/90 dark:border-slate-800/90 hover:border-cyan-500/40 transition-all duration-200 shadow-2xs space-y-2"
                    >
                      {/* Top Bar: Badge, Time, Actions */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2">
                        <div className="flex items-center gap-2">
                          {isVoice ? (
                            <span className="px-2.5 py-1 rounded-xl bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 text-[10px] font-black flex items-center gap-1">
                              <Mic className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                              <span>ملاحظة صوتية</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-xl bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 text-[10px] font-black flex items-center gap-1">
                              <Edit3 className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                              <span>تدوين يدوي</span>
                            </span>
                          )}

                          {note.time && (
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold tabular-nums flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{note.time}</span>
                            </span>
                          )}

                          {note.subjectName && (
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-lg font-bold">
                              {note.subjectName}
                            </span>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopyNote(note.id, note.text)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-500/10 transition"
                            title="نسخ نص الملاحظة"
                          >
                            {isCopied ? (
                              <CheckCheck className="w-3.5 h-3.5 text-teal-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartEditNote(note)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/10 transition"
                            title="تعديل الملاحظة"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setNoteIdToDelete(note.id)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 transition"
                            title="حذف الملاحظة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <p className="text-xs text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-wrap font-medium pt-0.5">
                        {note.text}
                      </p>
                    </div>
                  );
                })}

                {/* Clear all notes for this date */}
                {notesForSelectedDay.length > 1 && (
                  <div className="pt-1 text-center">
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteAllDateNotes(true)}
                      className="text-[11px] text-rose-500 hover:text-rose-600 font-bold hover:underline"
                    >
                      حذف جميع ملاحظات يوم ({selectedCalendarDate})
                    </button>
                  </div>
                )}
              </div>
            ) : (
              !isWritingNote && (
                <div className="text-center py-7 text-slate-600 dark:text-slate-400 text-xs space-y-3 bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80 p-5">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 mx-auto flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    لا توجد ملاحظات مسجلة ليوم {getArabicDayNameForDate(selectedCalendarDate)} ({selectedCalendarDate}).
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    يمكنك تدوين ملاحظة جديدة هنا، أو تسجيل ملاحظة صوتية من الصفحة الرئيسية وسيتم حفظها هنا تلقائياً.
                  </p>
                  <button
                    onClick={handleStartAddNote}
                    className="px-4 py-2 rounded-2xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 font-bold text-xs border border-cyan-200 dark:border-cyan-800 transition active:scale-95 inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>تدوين ملاحظة جديدة لهذا اليوم</span>
                  </button>
                </div>
              )
            )}
          </div>

          {/* Confirm Delete Single Note Modal */}
          <ConfirmModal
            isOpen={!!noteIdToDelete}
            title="تأكيد حذف الملاحظة"
            message="هل أنت متأكد من رغبتك في حذف هذه الملاحظة من التقويم؟"
            onCancel={() => setNoteIdToDelete(null)}
            onConfirm={() => {
              if (noteIdToDelete) {
                if (onDeleteCalendarNoteItem) {
                  onDeleteCalendarNoteItem(noteIdToDelete);
                } else if (onDeleteCalendarNote) {
                  onDeleteCalendarNote(selectedCalendarDate);
                }
                setNoteIdToDelete(null);
              }
            }}
          />

          {/* Confirm Delete All Notes for Selected Date Modal */}
          <ConfirmModal
            isOpen={confirmDeleteAllDateNotes}
            title="تأكيد حذف جميع ملاحظات اليوم"
            message={`هل أنت متأكد من رغبتك في حذف كافة الملاحظات المسجلة ليوم (${selectedCalendarDate})؟`}
            onCancel={() => setConfirmDeleteAllDateNotes(false)}
            onConfirm={() => {
              if (onDeleteCalendarNote) {
                onDeleteCalendarNote(selectedCalendarDate);
              }
              setConfirmDeleteAllDateNotes(false);
            }}
          />

        </div>
      )}

      {/* ========================================================= */}
      {/* OPTION 2: الجدول (كتابة وتعديل المواد حسب كل يوم)          */}
      {/* ========================================================= */}
      {activeTab === 'schedule' && (
        <div className="space-y-4 animate-classic">
          
          {/* Day selection tabs */}
          <div className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar shadow-2xs">
            {DAYS_NAMES.map((name, idx) => {
              const isSelected = selectedScheduleDay === idx;
              const count = state.schedule.filter((s) => s.day === idx).length;

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedScheduleDay(idx as DayOfWeek)}
                  className={`flex-1 min-w-[56px] py-2 px-1 rounded-xl text-center transition-all duration-200 flex flex-col items-center justify-center active:scale-95 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-600/25 font-bold'
                      : 'text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold'
                  }`}
                >
                  <span className="text-xs">{name}</span>
                  <span className={`text-[10px] mt-0.5 tabular-nums ${isSelected ? 'text-cyan-100' : 'text-slate-500 dark:text-slate-500'}`}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Action to add subject for this specific day */}
          <div className="flex items-center justify-between pt-1 px-1">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
              محاضرات يوم {DAYS_NAMES[selectedScheduleDay]} ({currentDaySchedule.length})
            </h3>

            <button
              onClick={() => setIsAddScheduleModal(true)}
              className="px-3.5 py-1.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-cyan-600/20 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة محاضرة لليوم</span>
            </button>
          </div>

          {/* List of subjects for this day */}
          <div className="space-y-2.5">
            {currentDaySchedule.length === 0 ? (
              <div className="classic-card rounded-3xl p-8 text-center">
                <Clock className="w-12 h-12 mx-auto text-cyan-500/60 dark:text-cyan-400/50 mb-2" />
                <p className="text-sm font-black text-slate-900 dark:text-slate-100">
                  لا توجد محاضرات مسجلة ليوم {DAYS_NAMES[selectedScheduleDay]}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  اضغط على زر "+ إضافة محاضرة لليوم" لإدراج الجدول النظري أو العملي أو التدريب السريري.
                </p>
              </div>
            ) : (
              currentDaySchedule.map((item, idx) => (
                <div
                  key={item.id}
                  className="classic-card rounded-2xl p-4 flex items-center justify-between gap-3 hover:border-cyan-400/60 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/50 flex items-center justify-center font-black text-xs shrink-0 tabular-nums shadow-2xs">
                      {idx + 1}
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        {item.subjectName}
                      </h4>
                      <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400 mt-1">
                        <span className="tabular-nums text-cyan-700 dark:text-cyan-300 font-bold flex items-center gap-1 bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200/70 dark:border-cyan-800/40 px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3" />
                          {item.time}
                        </span>
                        {item.room && (
                          <span className="flex items-center gap-1 font-medium">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            {item.room}
                          </span>
                        )}
                        {item.instructor && (
                          <span className="text-slate-500 dark:text-slate-400 font-medium">
                            • {item.instructor}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setScheduleItemToDelete(item.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition active:scale-95"
                    title="حذف المحاضرة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Modal to add subject for this day */}
          {isAddScheduleModal && createPortal(
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-4" dir="rtl">
              <div className="w-full max-w-md max-h-[85dvh] rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-900 dark:text-white animate-classic flex flex-col overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
                  <h3 className="text-sm sm:text-base font-black flex items-center gap-2 text-slate-900 dark:text-white">
                    <Plus className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    إضافة محاضرة ليوم ({DAYS_NAMES[selectedScheduleDay]})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAddScheduleModal(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center transition hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddScheduleSubmit} className="flex flex-col flex-1 min-h-0 pt-4">
                  <div className="flex-1 overflow-y-auto space-y-4 px-0.5 pb-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">اسم المادة أو المحاضرة</label>
                      <input
                        type="text"
                        placeholder="مثال: التشريح الشعاعي، فيزياء الرنين، تقنيات المفراس CT"
                        value={scheduleForm.subjectName}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, subjectName: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition shadow-inner"
                        required
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">الوقت</label>
                      <input
                        type="text"
                        placeholder="مثال: 08:30 ص أو 11:00 ص"
                        value={scheduleForm.time}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs tabular-nums text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition shadow-inner"
                        required
                      />
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {TIME_PRESETS.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setScheduleForm({ ...scheduleForm, time: t })}
                            className={`text-[11px] px-2.5 py-1 rounded-xl tabular-nums transition ${
                              scheduleForm.time === t
                                ? 'bg-cyan-600 text-white font-bold'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">القاعة / المختبر / المستشفى (اختياري)</label>
                        <input
                          type="text"
                          placeholder="مثال: مختبر الأشعة 2"
                          value={scheduleForm.room}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, room: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition shadow-inner"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">الأستاذ / الطبيب المشرف (اختياري)</label>
                        <input
                          type="text"
                          placeholder="أ.د. / د."
                          value={scheduleForm.instructor}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, instructor: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition shadow-inner"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-3 mt-1 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
                    <button
                      type="button"
                      onClick={() => setIsAddScheduleModal(false)}
                      className="w-1/3 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-cyan-600/30 transition active:scale-95 cursor-pointer"
                    >
                      حفظ المحاضرة في الجدول
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body
          )}

          {/* Confirm Delete Schedule Item Modal */}
          <ConfirmModal
            isOpen={!!scheduleItemToDelete}
            title="تأكيد حذف المحاضرة"
            message="هل أنت متأكد من رغبتك في حذف هذه المحاضرة أو جلسة التدريب من الجدول الأسبوعي؟"
            onCancel={() => setScheduleItemToDelete(null)}
            onConfirm={() => {
              if (scheduleItemToDelete) {
                onDeleteScheduleItem(scheduleItemToDelete);
                setScheduleItemToDelete(null);
              }
            }}
          />

        </div>
      )}

    </div>
  );
};
