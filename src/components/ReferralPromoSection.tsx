import React from 'react';
import { Button } from "@/components/ui/button";
import { Gift } from 'lucide-react';

const ReferralPromoSection: React.FC = () => {
  return (
    <section id="referral-promo" className="py-8 bg-[hsl(var(--primary-color))] text-white rounded-lg shadow-lg my-8 p-6 text-center">
      <h2 className="text-4xl font-bold mb-4">🤝 Invite Friends & Earn!</h2>
      <p className="text-lg mb-6">
        Refer a friend to Tasko and both of you will earn ₱50 credits!
      </p>
      <Button className="bg-[hsl(var(--secondary-color))] hover:bg-[#e05a00] text-white text-lg px-8 py-4 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2 mx-auto">
        <Gift size={24} /> Refer Now!
      </Button>
    </section>
  );
};

export default ReferralPromoSection;