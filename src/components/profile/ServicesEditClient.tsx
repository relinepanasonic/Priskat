"use client";

import { useState, useTransition, useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Plus, Trash2, HeartHandshake } from "lucide-react";
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
  initialServices: any[];
}

export default function ServicesEditClient({ userId, initialServices }: Props) {
  const supabase = createClient();
  const [kotaOptions, setKotaOptions] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  const { register, control, handleSubmit, reset, formState: { isDirty } } = useForm({
    defaultValues: {
      services: initialServices?.length > 0 ? initialServices : [{ camp: "", angkatan: "", kota: "", position: "" }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "services"
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
      await supabase.from("profiles").update({ services_history: data.services }).eq("id", userId);
      setSuccess(true);
      reset(data);
    });
  }

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold text-brand-gold mb-4 flex items-center gap-2">
        <HeartHandshake className="w-5 h-5" /> My Services
      </h2>
      <div className="card-3d p-5 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <p className="text-sm text-brand-muted mb-4">Update your volunteer services in the community.</p>
          
          <div className="space-y-4">
            {fields.map((item, index) => (
              <div key={item.id} className="relative bg-[#1a1d24] border border-[#333] rounded-xl p-4 transition-colors hover:border-brand-gold/30">
                {fields.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => remove(index)}
                    className="absolute top-3 right-3 p-1.5 text-brand-muted hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                
                <h4 className="text-xs font-bold text-brand-gold uppercase tracking-wider mb-3">Service #{index + 1}</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-brand-light mb-1">Service Role / Position</label>
                    <input
                      {...register(`services.${index}.position`, { required: true })}
                      placeholder="e.g. Fasilitator, Ketua Panitia, etc."
                      className="w-full rounded-lg border border-brand-border py-2.5 px-3 text-sm bg-brand-dark text-white focus:border-brand-gold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-brand-light mb-1">Camp Name</label>
                    <select
                      {...register(`services.${index}.camp`, { required: true })}
                      className="w-full rounded-lg border border-brand-border py-2.5 px-3 text-sm bg-brand-dark text-white focus:border-brand-gold focus:outline-none"
                    >
                      <option value="">Choose a camp...</option>
                      {ALUMNI_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-brand-light mb-1">Angkatan</label>
                      <input
                        {...register(`services.${index}.angkatan`, { required: true })}
                        placeholder="e.g. 19"
                        className="w-full rounded-lg border border-brand-border py-2.5 px-3 text-sm bg-brand-dark text-white focus:border-brand-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-brand-light mb-1">Kota</label>
                      <select
                        {...register(`services.${index}.kota`, { required: true })}
                        className="w-full rounded-lg border border-brand-border py-2.5 px-3 text-sm bg-brand-dark text-white focus:border-brand-gold focus:outline-none"
                      >
                        <option value="">City...</option>
                        {kotaOptions.map(kota => (
                          <option key={kota} value={kota}>{kota}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => append({ camp: "", angkatan: "", kota: "", position: "" })}
            className="w-full py-3 border border-dashed border-[#333] rounded-xl text-sm font-bold text-brand-muted hover:text-brand-gold hover:border-brand-gold/50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Another Service
          </button>

          <Button type="submit" loading={isPending} className="w-full py-3">
            {success && !isDirty ? "Saved!" : "Save My Services"}
          </Button>
        </form>
      </div>
    </section>
  );
}

