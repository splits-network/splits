"use client";

import Link from "next/link";

export default function ShowcasePage() {
  const designers = [
    {
      number: "one",
      name: "Split-Screen Editorial",
      color: "bg-blue-500",
    },
    {
      number: "two",
      name: "Magazine Editorial",
      color: "bg-purple-500",
    },
    {
      number: "three",
      name: "Swiss Typography",
      color: "bg-red-500",
    },
    {
      number: "four",
      name: "Cinematic Editorial",
      color: "bg-amber-500",
    },
    {
      number: "five",
      name: "Data Observatory",
      color: "bg-cyan-500",
    },
    {
      number: "six",
      name: "Retro Memphis",
      color: "bg-pink-500",
    },
    {
      number: "seven",
      name: "Industrial Blueprint",
      color: "bg-slate-500",
    },
    {
      number: "eight",
      name: "Blueprint Construction",
      color: "bg-orange-500",
    },
    {
      number: "nine",
      name: "Clean Architecture",
      color: "bg-emerald-500",
    },
    {
      number: "ten",
      name: "Mission Control",
      color: "bg-indigo-500",
    },
  ];

  const pageTypes = [
    { label: "Landing", path: "landing" },
    { label: "Article", path: "articles" },
    { label: "Lists", path: "lists" },
    { label: "Modals", path: "modals" },
    { label: "Dashboard", path: "dashboards" },
    { label: "Messages", path: "messages" },
  ];

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Design System Showcase</h1>
          <p className="text-xl opacity-70">
            10 Unique Design Variants × 6 Page Types = 60 Pages
          </p>
        </div>

        {/* Designer Grid */}
        <div className="grid gap-8">
          {designers.map((designer) => (
            <div
              key={designer.number}
              className="card bg-base-100 shadow-xl overflow-hidden"
            >
              {/* Designer Header */}
              <div className={`${designer.color} p-6 text-white`}>
                <h2 className="text-3xl font-bold">
                  Designer {designer.number.charAt(0).toUpperCase() + designer.number.slice(1)}
                </h2>
                <p className="text-lg opacity-90">{designer.name}</p>
              </div>

              {/* Page Links */}
              <div className="card-body">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  {pageTypes.map((pageType) => (
                    <Link
                      key={pageType.path}
                      href={`/${pageType.path}/${designer.number}`}
                      className="btn btn-outline hover:btn-primary transition-all"
                    >
                      <i className="fa-regular fa-file mr-2"></i>
                      {pageType.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Stats */}
        <div className="mt-12 text-center">
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Total Designers</div>
              <div className="stat-value">10</div>
            </div>
            <div className="stat">
              <div className="stat-title">Page Types</div>
              <div className="stat-value">6</div>
            </div>
            <div className="stat">
              <div className="stat-title">Total Pages</div>
              <div className="stat-value">60</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
