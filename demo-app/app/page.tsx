"use client";

import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { FLAGS } from "@/lib/flags";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

function App() {
  const [userId] = useState<string>(() => {
    if (typeof window === "undefined") return "";

    let id = localStorage.getItem("demo_user_id");
    if (!id) {
      id = "demo_user_" + Math.random().toString(36).slice(2, 9);
      localStorage.setItem("demo_user_id", id);
    }
    return id;
  });

  const { flags, loading } = useFeatureFlags(userId);

  const darkMode = flags[FLAGS.DARK_MODE];

  const rootClassName = darkMode ? "dark" : "";

  if (loading || !userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Loading features...</div>
      </div>
    );
  }

  return (
    <div className={rootClassName}>
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
        <Toaster position="bottom-right" />

        {/* Header */}
        <header className="border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">T</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Tana Store
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Demo App • User: {userId}
                  </p>
                </div>
              </div>

              {flags[FLAGS.PREMIUM_BADGE] && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  ⭐ Premium Member
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Discount Banner */}
        {flags[FLAGS.DISCOUNT_BANNER] && (
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <p className="text-center text-sm font-medium">
                🎉 Special Offer: 50% OFF on all items! Use code: TANA50
              </p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Feature Status Panel */}
          <div className="mb-12 bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border-2 border-dashed border-gray-300 dark:border-gray-600">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🎛️ Active Features
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(FLAGS).map(([name, key]) => (
                <div key={key} className="flex items-center space-x-2 text-sm">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      flags[key] ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    {name.replace(/_/g, " ")}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      flags[key] ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {flags[key] ? "ON" : "OFF"}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Toggle these features in your Tana dashboard to see changes in ~5
              seconds
            </p>
          </div>

          {/* Product Grid */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Featured Products
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600" />
                <div className="p-4 bg-white dark:bg-gray-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Product {i}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                    Amazing product description here
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${99 - i * 10}
                    </span>

                    {flags[FLAGS.NEW_CHECKOUT] ? (
                      <button
                        onClick={() =>
                          toast.success("Added to cart! (New Checkout)")
                        }
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all"
                      >
                        🛒 Buy Now
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          toast.success("Added to cart! (Old Checkout)")
                        }
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              🎮 How to Test
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800 dark:text-blue-200">
              <li>Go to your Tana dashboard</li>
              <li>Open your project and select the environment</li>
              <li>Toggle any of the feature flags on/off</li>
              <li>Wait ~5 seconds and watch this page update automatically!</li>
            </ol>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
