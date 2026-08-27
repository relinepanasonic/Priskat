"use client";

import { useState, useTransition, useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Plus, Trash2, Shield, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";

const ALUMNI_OPTIONS = [
  "Pria Sejati",
  "Youngman",
  "Bapa Sejati",
  "Patriot",
  "Wanita Berhikmat",
  "Young Woman"
];

interface Props {
  userId: string;
  initialHistory: any[];
}

export default function JourneyEditClient({ userId, initialHistory }: Props) {
  const supabase = createClient();
  const [kotaOptions, setKotaOptions] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  const { register, control, handleSubmit } = useForm({
    defaultValues: {
      camps: initialHistory?.length > 0 ? initialHistory : [{ camp: "", angkatan: "", kota: "" }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "camps"
  });

  useEffect(() => {
    async function fetchKota() {
      const { data } = await supabase.from("alumni_database").select("city");
      if (data) {
        setKotaOptions(Array.from(new Set(data.map(d => d.city).filter(Boolean))).sort());
      }
    }
    fetchKota();
  }, [supabase]);

  async function onSubmit(data: any) {
    setSuccess(false);
    startTransition(async () => {
      await supabase.from("profiles").update({ camp_history: data.camps }).eq("id", userId);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    });
  }

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold text-brand-gold mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5" /> My Journey
      </h2>
      <div className="card-3d p-4 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <p className="text-xs text-brand-muted mb-3">Update the camps you have completed.</p>
          
          <div className="space-y-3">
            {fields.map((item, index) => (
              <div key={item.id} className="flex items-center gap-2">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <select
                    {...register(`camps.${index}.camp`, { required: true })}
                    className="w-full rounded-lg border border-brand-border py-2 px-2 text-xs bg-[#1a1d24] text-white focus:border-brand-gold focus:outline-none"
                  >
                    <option value="">Camp...</option>
                    {ALUMNI_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  
                  <input
                    {...register(`camps.${index}.angkatan`, { required: true })}
                    placeholder="Angk..."
                    className="w-full rounded-lg border border-brand-border py-2 px-2 text-xs bg-[#1a1d24] text-white focus:border-brand-gold focus:outline-none"
                  />
                  
                  <select
                    {...register(`camps.${index}.kota`, { required: true })}
                    className="w-full rounded-lg border border-brand-border py-2 px-2 text-xs bg-[#1a1d24] text-white focus:border-brand-gold focus:outline-none"
                  >
                    <option value="">Kota...</option>
                    {kotaOptions.map(kota => (
                      <option key={kota} value={kota}>{kota}</option>
                    ))}
                  </select>
                </div>
                {fields.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => remove(index)}
                    className="p-2 bg-red-900/30 text-red-500 rounded-lg hover:bg-red-900/50 flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => append({ camp: "", angkatan: "", kota: "" })}
              className="flex items-center gap-1 text-xs font-bold text-brand-gold hover:text-white transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Add new camp
            </button>

            <Button type="submit" loading={isPending} className="py-2 px-4 text-xs h-auto">
              {success ? "Saved!" : "Save Journey"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
