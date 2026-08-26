"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
  created_at: string;
};

type Plan = {
  id: string;
  category_id: string;
  title: string;
  cover_image_url: string | null;
  duration_days: number;
  description: string | null;
  created_at: string;
  devotion_categories?: { name: string } | null;
};

export default function DevotionPlansAdminClient({
  initialCategories,
  initialPlans,
}: {
  initialCategories: Category[];
  initialPlans: Plan[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [plans, setPlans] = useState<Plan[]>(initialPlans);

  const [isSubmittingCat, setIsSubmittingCat] = useState(false);
  const [catName, setCatName] = useState("");

  const [isSubmittingPlan, setIsSubmittingPlan] = useState(false);
  const [planTitle, setPlanTitle] = useState("");
  const [planCategoryId, setPlanCategoryId] = useState("");
  const [planDuration, setPlanDuration] = useState("1");
  const [planCoverUrl, setPlanCoverUrl] = useState("");
  const [planDescription, setPlanDescription] = useState("");

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCat(true);
    
    const { data, error } = await supabase
      .from("devotion_categories")
      .insert([{ name: catName }])
      .select()
      .single();

    if (error) {
      alert("Error creating category: " + error.message);
    } else if (data) {
      setCategories([data as Category, ...categories]);
      setCatName("");
      router.refresh(); // to update server data if needed
    }
    
    setIsSubmittingCat(false);
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planCategoryId) {
      alert("Please select a category");
      return;
    }
    
    setIsSubmittingPlan(true);

    const { data, error } = await supabase
      .from("devotion_plans")
      .insert([{
        title: planTitle,
        category_id: planCategoryId,
        duration_days: parseInt(planDuration) || 1,
        cover_image_url: planCoverUrl || null,
        description: planDescription || null,
      }])
      .select(`
        *,
        devotion_categories (
          name
        )
      `)
      .single();

    if (error) {
      alert("Error creating plan: " + error.message);
    } else if (data) {
      setPlans([data as unknown as Plan, ...plans]);
      setPlanTitle("");
      setPlanCategoryId("");
      setPlanDuration("1");
      setPlanCoverUrl("");
      setPlanDescription("");
      router.refresh();
    }

    setIsSubmittingPlan(false);
  };

  return (
    <div className="space-y-12">
      {/* Category Creation Form */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Create Category</h2>
        <form onSubmit={handleCreateCategory} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name
            </label>
            <input
              type="text"
              required
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="e.g. Lent, Advent, General"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmittingCat}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 transition-colors"
          >
            {isSubmittingCat ? "Creating..." : "Create Category"}
          </button>
        </form>
      </section>

      {/* Plan Creation Form */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Create Plan</h2>
        <form onSubmit={handleCreatePlan} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan Title
              </label>
              <input
                type="text"
                required
                value={planTitle}
                onChange={(e) => setPlanTitle(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="e.g. 40 Days of Purpose"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                required
                value={planCategoryId}
                onChange={(e) => setPlanCategoryId(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                required
                value={planDuration}
                onChange={(e) => setPlanDuration(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cover Image URL (Optional)
              </label>
              <input
                type="url"
                value={planCoverUrl}
                onChange={(e) => setPlanCoverUrl(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="https://..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={planDescription}
              onChange={(e) => setPlanDescription(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Describe what this plan is about..."
            />
          </div>
          <button
            type="submit"
            disabled={isSubmittingPlan}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 transition-colors"
          >
            {isSubmittingPlan ? "Creating..." : "Create Plan"}
          </button>
        </form>
      </section>

      {/* Existing Plans List */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Existing Plans</h2>
        {plans.length === 0 ? (
          <p className="text-gray-500">No plans found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="py-3 px-4 font-medium text-gray-700">Title</th>
                  <th className="py-3 px-4 font-medium text-gray-700">Category</th>
                  <th className="py-3 px-4 font-medium text-gray-700">Duration</th>
                  <th className="py-3 px-4 font-medium text-gray-700">Created At</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900">{p.title}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {p.devotion_categories?.name || "Unknown"}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{p.duration_days} days</td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
