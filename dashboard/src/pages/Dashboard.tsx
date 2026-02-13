import React from "react";
import { Layout } from "../components/Layout";

export const Dashboard: React.FC = () => {
  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Tana Feature Flags
            </h1>
            <p className="text-gray-500">Your projects will appear here</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};
