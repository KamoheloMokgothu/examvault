"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Paper = {
  id: number;
  title: string;
  grade: string;
  subject: string;
  year: string;
  term: string;
  language: string;
  paper_url: string | null;
  memo_url: string | null;
};

export default function Home() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);

  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [term, setTerm] = useState("");

  // Fetch papers from Supabase
  useEffect(() => {
    async function fetchPapers() {
      setLoading(true);

      let query = supabase.from("papers").select("*").order("id", { ascending: false });

      if (grade) query = query.eq("grade", grade);
      if (subject) query = query.eq("subject", subject);
      if (year) query = query.eq("year", year);
      if (term) query = query.eq("term", term);

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching papers:", error);
        setPapers([]);
      } else {
        setPapers(data || []);
      }

      setLoading(false);
    }

    fetchPapers();
  }, [grade, subject, year, term]);

  const clearFilters = () => {
    setGrade("");
    setSubject("");
    setYear("");
    setTerm("");
  };

  const hasActiveFilters = grade || subject || year || term;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">EV</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">ExamVault</h1>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium">
            <a href="#papers" className="text-gray-600 hover:text-blue-600 transition">
              Papers
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition">
              Subjects
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition">
              About
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            Past Exam Papers & Memos
          </h2>
          <p className="text-base md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Free CAPS past papers for Grades 8–12. All subjects. All terms.
            Download question papers and memos instantly.
          </p>
          <a
            href="#papers"
            className="inline-block bg-white text-blue-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition shadow-lg"
          >
            Browse Papers
          </a>
        </div>
      </section>

      {/* Papers Section */}
      <section id="papers" className="max-w-6xl mx-auto px-4 py-12 flex-1 w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Find Past Papers</h3>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Grade</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"              >
                <option value="">All Grades</option>
                <option value="8">Grade 8</option>
                <option value="9">Grade 9</option>
                <option value="10">Grade 10</option>
                <option value="11">Grade 11</option>
                <option value="12">Grade 12</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"              >
                <option value="">All Subjects</option>
                <option value="mathematics">Mathematics</option>
                <option value="mathematical-literacy">Mathematical Literacy</option>
                <option value="physical-sciences">Physical Sciences</option>
                <option value="life-sciences">Life Sciences</option>
                <option value="accounting">Accounting</option>
                <option value="business-studies">Business Studies</option>
                <option value="geography">Geography</option>
                <option value="english">English</option>
                <option value="afrikaans">Afrikaans</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Years</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
                <option value="2019">2019</option>
                <option value="2018">2018</option>
                <option value="2017">2017</option>
                <option value="2016">2016</option>
                <option value="2015">2015</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Term / Exam</label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"              >
                <option value="">All Terms</option>
                <option value="1">Term 1</option>
                <option value="2">Term 2 (June)</option>
                <option value="3">Term 3 (Trials)</option>
                <option value="4">Term 4 (Finals)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <p className="text-sm text-gray-500 mb-4">
          {loading ? (
            "Loading papers..."
          ) : (
            <>
              Showing <span className="font-medium text-gray-700">{papers.length}</span> paper
              {papers.length !== 1 ? "s" : ""}
            </>
          )}
        </p>

        <div className="space-y-3">
          {loading ? (
            <div className="bg-white border rounded-2xl p-12 text-center text-gray-500">
              Loading...
            </div>
          ) : papers.length === 0 ? (
            <div className="bg-white border rounded-2xl p-12 text-center">
              <p className="text-gray-500 text-lg">No papers found</p>
              <p className="text-gray-400 text-sm mt-1">
                Try changing or clearing the filters
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            papers.map((paper) => (
              <div
                key={paper.id}
                className="bg-white border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md hover:border-blue-200 transition"
              >
                <div>
                  <h4 className="font-semibold text-gray-900">{paper.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Grade {paper.grade} • Term {paper.term} • {paper.language}
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <a
                    href={paper.paper_url || "#"}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition"
                  >
                    Question Paper
                  </a>
                  <a
                    href={paper.memo_url || "#"}
                    className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition"
                  >
                    Memo
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">EV</span>
              </div>
              <span className="font-semibold text-gray-800">ExamVault</span>
            </div>
            <p className="text-sm text-gray-500 text-center">
              Free past papers for South African learners • CAPS aligned
            </p>
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} ExamVault
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
