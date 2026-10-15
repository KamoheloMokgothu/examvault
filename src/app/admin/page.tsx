"use client";

import { useState, useEffect } from "react";
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

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [title, setTitle] = useState("");
  const [grade, setGrade] = useState("12");
  const [subject, setSubject] = useState("mathematics");
  const [year, setYear] = useState("2024");
  const [term, setTerm] = useState("4");
  const [language, setLanguage] = useState("English");

  const [paperFile, setPaperFile] = useState<File | null>(null);
  const [memoFile, setMemoFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [papers, setPapers] = useState<Paper[]>([]);
  const [listLoading, setListLoading] = useState(true);

  // Check if already logged in
  useEffect(() => {
    const saved = sessionStorage.getItem("StudyPaperBox_admin");
    if (saved === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch papers when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchPapers();
    }
  }, [isAuthenticated]);

  const fetchPapers = async () => {
    setListLoading(true);
    const { data, error } = await supabase
      .from("papers")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setPapers(data || []);
    }
    setListLoading(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    if (passwordInput === correctPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem("StudyPaperBox_admin", "true");
      setPasswordError("");
    } else {
      setPasswordError("Incorrect password");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("StudyPaperBox_admin");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      let paperUrl = null;
      let memoUrl = null;

      if (paperFile) {
        const paperFileName = `${Date.now()}-${paperFile.name}`;
        const { error: paperError } = await supabase.storage
          .from("papers")
          .upload(paperFileName, paperFile);

        if (paperError) throw paperError;

        const { data: paperData } = supabase.storage
          .from("papers")
          .getPublicUrl(paperFileName);

        paperUrl = paperData.publicUrl;
      }

      if (memoFile) {
        const memoFileName = `${Date.now()}-${memoFile.name}`;
        const { error: memoError } = await supabase.storage
          .from("papers")
          .upload(memoFileName, memoFile);

        if (memoError) throw memoError;

        const { data: memoData } = supabase.storage
          .from("papers")
          .getPublicUrl(memoFileName);

        memoUrl = memoData.publicUrl;
      }

      const { error: insertError } = await supabase.from("papers").insert([
        {
          title,
          grade,
          subject,
          year,
          term,
          language,
          paper_url: paperUrl,
          memo_url: memoUrl,
        },
      ]);

      if (insertError) throw insertError;

      setMessage("✅ Paper added successfully!");
      setTitle("");
      setPaperFile(null);
      setMemoFile(null);
      fetchPapers(); // Refresh the list
    } catch (error: any) {
      console.error(error);
      setMessage("❌ Error: " + (error.message || "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${title}"?`);
    if (!confirmed) return;

    const { error } = await supabase.from("papers").delete().eq("id", id);

    if (error) {
      alert("Error deleting paper: " + error.message);
    } else {
      setMessage("✅ Paper deleted successfully!");
      fetchPapers(); // Refresh the list
    }
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Login</h1>
          <p className="text-gray-500 text-sm mb-6">Enter the password to access the upload page</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
                required
              />
            </div>

            {passwordError && (
              <p className="text-red-600 text-sm">{passwordError}</p>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition"
            >
              Login
            </button>
          </form>
        </div>
      </main>
    );
  }

  // Admin dashboard
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <a href="/" className="text-blue-600 hover:underline text-sm">
              ← Back to StudyPaperBox
            </a>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">Admin</h1>
            <p className="text-gray-500 mt-1">Add or delete past papers</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-600"
          >
            Logout
          </button>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border p-6 space-y-5 mb-10">
          <h2 className="text-lg font-semibold text-gray-800">Add New Paper</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mathematics Grade 12 – November 2024"
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900"
              >
                <option value="8">Grade 8</option>
                <option value="9">Grade 9</option>
                <option value="10">Grade 10</option>
                <option value="11">Grade 11</option>
                <option value="12">Grade 12</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900"
              >
               <option value="">All Subjects</option>
<option value="mathematics">Mathematics</option>
<option value="mathematical-literacy">Mathematical Literacy</option>
<option value="physical-sciences">Physical Sciences</option>
<option value="life-sciences">Life Sciences</option>
<option value="life-orientation">Life Orientation</option>
<option value="accounting">Accounting</option>
<option value="business-studies">Business Studies</option>
<option value="economics">Economics</option>
<option value="consumer-studies">Consumer Studies</option>
<option value="geography">Geography</option>
<option value="history">History</option>
<option value="english">English</option>
<option value="afrikaans">Afrikaans</option>
<option value="sesotho">Sesotho</option>
<option value="setswana">Setswana</option>
<option value="sepedi">Sepedi</option>
<option value="isixhosa">isiXhosa</option>
<option value="isindebele">isiNdebele</option>
<option value="isizulu">isiZulu</option>
<option value="siswati">Siswati</option>
<option value="tshivenda">Tshivenda</option>
<option value="xitsonga">Xitsonga</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900"
              >
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900"
              >
                <option value="1">Term 1</option>
                <option value="2">Term 2 (June)</option>
                <option value="3">Term 3 (Trials)</option>
                <option value="4">Term 4 (Finals)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900"
            >
              <option value="English">English</option>
              <option value="Afrikaans">Afrikaans</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question Paper (PDF)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setPaperFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Memo (PDF)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setMemoFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Add Paper"}
          </button>

          {message && (
            <p className={`text-center text-sm ${message.includes("✅") ? "text-green-600" : "text-red-600"}`}>
              {message}
            </p>
          )}
        </form>

        {/* List of existing papers */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Existing Papers</h2>

          {listLoading ? (
            <p className="text-gray-500 text-sm">Loading papers...</p>
          ) : papers.length === 0 ? (
            <p className="text-gray-500 text-sm">No papers yet.</p>
          ) : (
            <div className="space-y-3">
              {papers.map((paper) => (
                <div
                  key={paper.id}
                  className="flex items-center justify-between border rounded-xl p-4 hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">{paper.title}</p>
                    <p className="text-sm text-gray-500">
                      Grade {paper.grade} • {paper.year} • Term {paper.term}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(paper.id, paper.title)}
                    className="text-sm text-red-600 hover:text-red-800 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}