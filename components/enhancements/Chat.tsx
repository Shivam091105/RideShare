import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Message = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  created_at: string | null;
};

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    let mounted = true;
    // load last 50 notifications as chat messages
    supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (!error && mounted && data) {
          setMessages(data.reverse() as Message[]);
        }
      });

    const subscription = supabase
      .channel('public:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        setMessages((m) => [...m, payload.new as Message]);
      })
      .subscribe();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const send = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      alert('Please sign in to chat');
      return;
    }
    const insert = {
      user_id: user.id,
      title: 'chat',
      message: text,
    };
    const { error } = await supabase.from('notifications').insert([insert]);
    if (error) {
      console.error(error);
      alert('Failed to send');
    } else {
      setText('');
    }
  };

  return (
    <div className="bg-white rounded-md shadow p-4">
      <div className="h-64 overflow-auto border rounded p-2 mb-3">
        {messages.map((m) => (
          <div key={m.id} className="mb-2">
            <div className="text-xs text-gray-500">{new Date(m.created_at || '').toLocaleString()}</div>
            <div className="text-sm">{m.message}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded px-3 py-2"
        />
        <button onClick={send} className="px-4 py-2 rounded bg-blue-600 text-white">Send</button>
      </div>
    </div>
  );
};

export default Chat;