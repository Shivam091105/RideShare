import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const PaymentSimulator: React.FC = () => {
  const [amount, setAmount] = useState(50);
  const [status, setStatus] = useState<string | null>(null);

  const pay = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      alert('Sign in required');
      return;
    }
    const fakePayment = {
      payer_id: user.id,
      amount,
      currency: 'INR',
      payment_method: 'card_sim',
      status: 'success',
      ride_id: 'simulated-ride-' + Date.now(),
    };
    const { error } = await supabase.from('payments').insert([fakePayment]);
    if (error) {
      console.error(error);
      setStatus('failed: ' + error.message);
    } else {
      setStatus('Payment simulated successfully ✓');
    }
  };

  return (
    <div className="bg-white rounded-md shadow p-4">
      <h3 className="text-lg font-medium mb-3">Payment Simulator</h3>
      <div className="flex items-center gap-3 mb-3">
        <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="border rounded px-3 py-2 w-32" />
        <span>INR</span>
      </div>
      <button onClick={pay} className="px-4 py-2 rounded bg-green-600 text-white">Simulate Payment</button>
      {status && <div className="mt-3 text-sm text-gray-700">{status}</div>}
    </div>
  );
};

export default PaymentSimulator;