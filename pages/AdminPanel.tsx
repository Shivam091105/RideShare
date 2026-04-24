import React from 'react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AdminPanel: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('payments').select('*').limit(50).then(({ data, error }) => {
      if (!error && data) setPayments(data);
    });
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Admin Dashboard</h2>
      <div className="bg-white rounded shadow p-4">
        <h3 className="font-medium mb-2">Recent Payments</h3>
        <div className="overflow-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="px-2 py-1">id</th>
                <th className="px-2 py-1">payer</th>
                <th className="px-2 py-1">amount</th>
                <th className="px-2 py-1">status</th>
                <th className="px-2 py-1">created_at</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id}>
                  <td className="px-2 py-1">{p.id}</td>
                  <td className="px-2 py-1">{p.payer_id}</td>
                  <td className="px-2 py-1">{p.amount}</td>
                  <td className="px-2 py-1">{p.status}</td>
                  <td className="px-2 py-1">{new Date(p.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;