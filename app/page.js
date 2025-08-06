"use client";

import { useState, useEffect } from "react";

// Placeholder sample data for stacks and leaderboard
const sampleStacks = Array.from({ length: 8 }).map((_, i) => ({
  id: i,
  title: `Stack ${i + 1}`,
}));
const sampleLeaderboard = Array.from({ length: 5 }).map((_, i) => ({
  id: i,
  name: `User${i + 1}`,
  followers: (5 - i) * 1000,
}));

export default function Home() {
  const [theme, setTheme] = useState("light");
  const [questions, setQuestions] = useState([
    { id: 1, text: "Which editor do you prefer?", options: ["Vim", "VSCode"] },
  ]);
  const [answers, setAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(questions[0]);

  // Theme toggler
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setTheme(saved);
  }, []);

  // Handle answer selection
  const handleAnswer = async (option) => {
    const newAnswers = [
      ...answers,
      { questionId: currentQuestion.id, answer: option },
    ];
    setAnswers(newAnswers);
    // Save to localStorage
    localStorage.setItem("quizAnswers", JSON.stringify(newAnswers));

    if (newAnswers.length < 6) {
      // Fetch next question from OpenAI-powered API
      try {
        const res = await fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: newAnswers }),
        });
        const data = await res.json();
        const nextQ = {
          id: data.id,
          text: data.question,
          options: data.options,
        };
        setQuestions((prev) => [...prev, nextQ]);
        setCurrentQuestion(nextQ);
      } catch (err) {
        console.error("Error fetching next question:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Navbar */}
      <nav className="fixed top-0 w-full px-6 py-4 flex justify-between items-center backdrop-blur-md bg-white/20 dark:bg-gray-800/20 z-10">
        <div className="text-2xl font-bold text-red-600 dark:text-red-300">
          DevStackHub
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <a
            href="/login"
            className="px-4 py-2 bg-green-400 dark:bg-green-600 text-white rounded-lg hover:opacity-90 transition"
          >
            Log in
          </a>
          <a
            href="/dashboard"
            className="px-4 py-2 border border-green-400 dark:border-green-600 text-green-400 dark:text-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-gray-700 transition"
          >
            Dashboard
          </a>
        </div>
      </nav>

      {/* Hero Section with Quiz */}
      <section className="pt-24 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-gray-900 dark:text-gray-100">
          Find Your Dev Stack
        </h1>
        <div className="max-w-xl mx-auto p-6 bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg rounded-2xl shadow-xl">
          <p className="text-xl mb-4 text-gray-800 dark:text-gray-200">
            {currentQuestion.text}
          </p>
          <div className="flex justify-center flex-wrap gap-4">
            {currentQuestion.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                className="px-6 py-3 bg-red-300 dark:bg-red-600 text-white rounded-full hover:scale-105 transform transition"
              >
                {opt}
              </button>
            ))}
          </div>
          {answers.length >= 4 && (
            <button
              onClick={() => {
                /* Explore Stack handler */
              }}
              disabled={answers.length < 6}
              className={`mt-6 px-8 py-3 rounded-full text-white transition ${
                answers.length >= 6
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Explore Stack
            </button>
          )}
        </div>
      </section>

      {/* Stack Grid */}
      <section className="mt-16 px-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Popular Stacks
        </h2>
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {sampleStacks.map((stack) => (
            <div
              key={stack.id}
              className="break-inside bg-white dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-lg transition"
            >
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">
                {stack.title}
              </h3>
              {/* Stack items... */}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm">
                  Item
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Leaderboard */}
      <section className="mt-16 mb-24 px-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Top Creators
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {sampleLeaderboard.map((user) => (
            <div
              key={user.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow flex flex-col items-center"
            >
              <div className="h-16 w-16 bg-gray-300 dark:bg-gray-700 rounded-full mb-2"></div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {user.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user.followers.toLocaleString()} followers
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
