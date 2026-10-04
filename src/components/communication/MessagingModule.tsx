import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { AppUser } from '../../types';
import { 
  MessageSquare, 
  Send, 
  Image as ImageIcon, 
  X, 
  CheckCheck, 
  Search,
  Maximize2,
  ArrowLeft
} from 'lucide-react';
import { MASTER_ADMIN_USER } from '../../lib/constants';

export const MessagingModule: React.FC = () => {
  const { currentUser, users, messages, sendMessage } = useData();

  if (!currentUser) return null;

  const isStudent = currentUser.role === 'student';
  const isTeacher = currentUser.role === 'teacher';
  const isAdmin = currentUser.role === 'admin';

  const contactList: AppUser[] = [
    ...(isAdmin ? [] : [MASTER_ADMIN_USER]),
    ...users.filter(u => u.id !== currentUser.id && (
      isAdmin ? true :
      isStudent ? (u.role === 'teacher' || (u.grade === currentUser.grade && u.section === currentUser.section)) :
      isTeacher ? (u.role === 'admin' || (u.grade === currentUser.grade && u.section === currentUser.section) || u.role === 'teacher') : true
    ))
  ];

  const [selectedRecipientId, setSelectedRecipientId] = useState<string>(contactList[0]?.id || '');
  const [mobileInThread, setMobileInThread] = useState<boolean>(false);
  const [msgText, setMsgText] = useState('');
  const [attachedImageBase64, setAttachedImageBase64] = useState<string | null>(null);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
  const [searchContact, setSearchContact] = useState('');

  const selectedRecipient = contactList.find(c => c.id === selectedRecipientId) || contactList[0];

  const conversationMessages = messages.filter(
    m => (m.senderId === currentUser.id && m.recipientId === selectedRecipient?.id) ||
         (m.senderId === selectedRecipient?.id && m.recipientId === currentUser.id)
  );

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipient || (!msgText.trim() && !attachedImageBase64)) return;

    sendMessage(
      selectedRecipient.id,
      selectedRecipient.name,
      msgText.trim() || 'Attached an image file.',
      attachedImageBase64 || undefined
    );

    setMsgText('');
    setAttachedImageBase64(null);
  };

  const filteredContacts = contactList.filter(c => 
    c.name.toLowerCase().includes(searchContact.toLowerCase()) ||
    c.role.toLowerCase().includes(searchContact.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Banner - hidden when deep inside a thread on tiny mobile screens to maximize chat area */}
      <div className={`${mobileInThread ? 'hidden sm:flex' : 'flex'} bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex-col md:flex-row md:items-center justify-between gap-3`}>
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider mb-1">
            <MessageSquare className="w-4 h-4" />
            <span>Direct Faculty &amp; Student Messaging</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Academic Chat &amp; Media Attachments
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 sm:mt-1">
            Send questions and photos of handwritten notes or diagrams directly to your teachers.
          </p>
        </div>
      </div>

      {/* Main Messaging Container with mobile dynamic viewport sizing */}
      <div className="grid grid-cols-1 md:grid-cols-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden h-[calc(100dvh-180px)] sm:h-[calc(100vh-220px)] min-h-[460px]">
        {/* Contact List (Hidden on mobile if user is inside a conversation thread) */}
        <div className={`${mobileInThread ? 'hidden md:block' : 'block'} border-r border-slate-200 p-3 sm:p-4 bg-slate-50/50 space-y-3 overflow-y-auto`}>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchContact}
              onChange={(e) => setSearchContact(e.target.value)}
              placeholder="Search contacts..."
              className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => {
                const isSelected = selectedRecipient?.id === contact.id;
                const convMsgs = messages.filter(
                  m => (m.senderId === contact.id && m.recipientId === currentUser.id) ||
                       (m.senderId === currentUser.id && m.recipientId === contact.id)
                );
                const lastMsg = convMsgs[convMsgs.length - 1];

                return (
                  <button
                    key={contact.id}
                    onClick={() => {
                      setSelectedRecipientId(contact.id);
                      setMobileInThread(true);
                    }}
                    className={`w-full text-left p-2.5 sm:p-3 rounded-xl border transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-200 shadow-2xs'
                        : 'bg-white border-slate-200/60 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-600 shrink-0">
                      {contact.name.charAt(0)}
                    </div>
                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-slate-900 truncate">{contact.name}</span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 capitalize">
                          {contact.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {lastMsg ? (lastMsg.imageUrl ? '📷 [Attached Photo]' : lastMsg.content) : 'Start discussion'}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 text-center py-8">No contacts found.</p>
            )}
          </div>
        </div>

        {/* Chat Stream & Composer (Visible on desktop or when mobileInThread is true) */}
        <div className={`${!mobileInThread ? 'hidden md:flex' : 'flex'} md:col-span-2 flex-col justify-between h-full bg-white`}>
          {selectedRecipient ? (
            <>
              {/* Top Header of Chat with Mobile Back Button */}
              <div className="p-3 sm:p-4 border-b border-slate-200 bg-white flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => setMobileInThread(false)}
                    className="md:hidden p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Back to contacts list"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900">{selectedRecipient.name}</h3>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 capitalize leading-none mt-0.5">
                      {selectedRecipient.role} {selectedRecipient.grade ? `• ${selectedRecipient.grade}` : ''}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Direct Thread</span>
              </div>

              {/* Message List */}
              <div className="p-3 sm:p-4 flex-1 overflow-y-auto space-y-3 bg-slate-50/30">
                {conversationMessages.length > 0 ? (
                  conversationMessages.map((m) => {
                    const isMe = m.senderId === currentUser.id;
                    return (
                      <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[85%] sm:max-w-md p-3 sm:p-3.5 rounded-2xl text-xs space-y-1.5 shadow-2xs ${
                            isMe
                              ? 'bg-indigo-600 text-white rounded-br-xs'
                              : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                          }`}
                        >
                          <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>

                          {/* Image Attachment in Chat */}
                          {m.imageUrl && (
                            <div 
                              className="pt-1 cursor-pointer group relative overflow-hidden rounded-xl border border-white/20"
                              onClick={() => setLightboxImageUrl(m.imageUrl || null)}
                            >
                              <img 
                                src={m.imageUrl} 
                                alt="Sent photo" 
                                className="max-h-48 sm:max-h-56 w-auto object-cover rounded-xl transition-transform group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[11px] font-semibold">
                                <Maximize2 className="w-4 h-4 mr-1" /> Tap to Expand
                              </div>
                            </div>
                          )}

                          <div className={`flex items-center justify-end gap-1 text-[10px] ${
                            isMe ? 'text-indigo-200' : 'text-slate-400'
                          }`}>
                            <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isMe && <CheckCheck className="w-3.5 h-3.5 text-indigo-300" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-16 space-y-1">
                    <MessageSquare className="w-8 h-8 text-slate-300" />
                    <p className="font-semibold text-xs text-slate-600">No messages exchanged yet</p>
                    <p className="text-[11px]">Send a note or attach an image of your question below.</p>
                  </div>
                )}
              </div>

              {/* Composer */}
              <div className="p-2 sm:p-3 border-t border-slate-200 bg-white space-y-2">
                {/* Attached image preview thumbnail */}
                {attachedImageBase64 && (
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between max-w-sm">
                    <div className="flex items-center gap-2">
                      <img 
                        src={attachedImageBase64} 
                        alt="Preview" 
                        className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                      />
                      <span className="text-[11px] font-medium text-slate-700">Photo attached</span>
                    </div>
                    <button 
                      onClick={() => setAttachedImageBase64(null)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <form onSubmit={handleSend} className="flex items-center gap-1.5 sm:gap-2">
                  {/* Media Upload Button */}
                  <label 
                    className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-xl cursor-pointer transition-colors shrink-0"
                    title="Attach photo of handwritten work, diagrams, or notes"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="text"
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                    placeholder={`Message ${selectedRecipient.name}...`}
                    className="flex-1 px-3 sm:px-3.5 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  <button
                    type="submit"
                    disabled={!msgText.trim() && !attachedImageBase64}
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-all shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs p-6 text-center">
              Select a contact on the left to start messaging.
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImageUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs"
          onClick={() => setLightboxImageUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxImageUrl(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/70 text-white flex items-center justify-center hover:bg-slate-900 transition-colors z-10"
            >
              ✕
            </button>
            <img 
              src={lightboxImageUrl} 
              alt="Expanded photo" 
              className="max-h-[80vh] w-auto object-contain rounded-xl mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};
