"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

type WorkoutTemplate = {
  id: string;
  name: string;
  createdAt: string;
};

export default function Templates() {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchTemplates = async () => {
      try {
        const res = await fetch("/api/templates");
        if (res.ok) {
          const data = await res.json();
          setTemplates(data);
        } else {
          throw new Error("Failed to fetch templates");
        }
      } catch (error) {
        console.error("Failed to fetch templates:", error);
        // For demo, use empty data to show the "no templates" message
        setTemplates([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [isAuthenticated, router]);

  if (isLoading) {
    return <div className="min-h-screen p-8">Loading templates...</div>;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Workout Templates</h1>
        <Link href="/templates/create" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Create New
        </Link>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-gray-300 rounded-lg">
          <p className="mb-4">No templates found. Create your first workout template!</p>
          <Link href="/templates/create" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Create Template
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <Link href={`/templates/${template.id}`} key={template.id} passHref>
              <div className="border border-gray-300 dark:border-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                <h2 className="font-semibold text-lg">{template.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Created {new Date(template.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
