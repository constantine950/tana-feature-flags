import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Copy, RefreshCw, Trash2, ArrowLeft } from "lucide-react";
import { Layout } from "../components/Layout";
import { Modal } from "../components/Modal";
import { EmptyState } from "../components/EmptyState";
import { Project, Environment } from "../types";
import { analyticsApi, environmentsApi, projectsApi } from "../../lib/api";
import { ActivityTimeline } from "../components/ActivityTimeline";
import toast from "react-hot-toast";
import { ConfirmDialog } from "../components/ConfirmDialog";

export const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateEnvModal, setShowCreateEnvModal] = useState(false);
  const [envName, setEnvName] = useState("");
  const [envKey, setEnvKey] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [newApiKey, setNewApiKey] = useState("");
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [confirmDeleteEnv, setConfirmDeleteEnv] = useState<string | null>(null);
  const [confirmRotateEnv, setConfirmRotateEnv] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (id) {
      loadProject();
      loadEnvironments();
      loadActivity();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      const data = await projectsApi.get(id!);
      setProject(data.project);
    } catch (err) {
      console.error("Failed to load project:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadEnvironments = async () => {
    try {
      const data = await environmentsApi.list(id!);
      setEnvironments(data.environments || []);
    } catch (err) {
      console.error("Failed to load environments:", err);
    }
  };

  const loadActivity = async () => {
    setLoadingActivity(true);
    try {
      const data = await analyticsApi.getProjectActivity(id!, 20);
      setActivities(data.logs || []);
    } catch (err) {
      console.error("Failed to load activity:", err);
    } finally {
      setLoadingActivity(false);
    }
  };

  const handleCreateEnv = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCreating(true);

    try {
      const data = await environmentsApi.create(id!, envName, envKey);
      setNewApiKey(data.environment.apiKey);
      setEnvName("");
      setEnvKey("");
      loadEnvironments();
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || "Failed to create environment",
      );
      setCreating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleRotateKey = async () => {
    if (!confirmRotateEnv) return;
    setConfirming(true);
    try {
      const data = await environmentsApi.rotateKey(confirmRotateEnv);
      copyToClipboard(data.apiKey);
      toast.success("New API key copied!");
      setConfirmRotateEnv(null);
    } catch (err) {
      toast.error("Failed to rotate key");
    } finally {
      setConfirming(false);
    }
  };

  const handleDeleteEnv = async () => {
    if (!confirmDeleteEnv) return;
    setConfirming(true);
    try {
      await environmentsApi.delete(confirmDeleteEnv);
      toast.success("Environment deleted");
      setConfirmDeleteEnv(null);
      loadEnvironments();
      loadActivity();
    } catch (err) {
      toast.error("Failed to delete");
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">
            Project not found
          </h3>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to projects
        </button>

        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">
              {project.name}
            </h1>
            {project.description && (
              <p className="mt-2 text-sm text-gray-700">
                {project.description}
              </p>
            )}
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => navigate(`/projects/${id}/flags`)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              View Flags
            </button>
          </div>
        </div>

        <div className="mt-8">
          <div className="sm:flex sm:items-center mb-4">
            <div className="sm:flex-auto">
              <h2 className="text-lg font-medium text-gray-900">
                Environments
              </h2>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => setShowCreateEnvModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Environment
              </button>
            </div>
          </div>

          {environments.length === 0 ? (
            <EmptyState
              icon={<Plus className="h-12 w-12" />}
              title="No environments"
              description="Create your first environment to get started"
              action={{
                label: "Create Environment",
                onClick: () => setShowCreateEnvModal(true),
              }}
            />
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {environments.map((env) => (
                  <li key={env.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {env.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Key:{" "}
                          <code className="bg-gray-100 px-2 py-1 rounded">
                            {env.key}
                          </code>
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setConfirmRotateEnv(env.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Rotate API Key"
                        >
                          <RefreshCw className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteEnv(env.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Environment"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Recent Activity Section */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Recent Activity
          </h2>
          {loadingActivity ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : (
            <div className="bg-white shadow sm:rounded-lg p-6">
              <ActivityTimeline activities={activities} />
            </div>
          )}
        </div>
      </div>

      {/* Create Environment Modal */}
      <Modal
        isOpen={showCreateEnvModal}
        onClose={() => {
          if (!newApiKey) {
            setShowCreateEnvModal(false);
            setError("");
            setEnvName("");
            setEnvKey("");
            setCreating(false);
          }
        }}
        title={newApiKey ? "API Key Created" : "Create Environment"}
      >
        {newApiKey ? (
          <div>
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800 font-medium mb-2">
                ⚠️ Save this API key - it won't be shown again!
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <div className="flex">
                <input
                  type="text"
                  readOnly
                  value={newApiKey}
                  className="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border font-mono text-sm"
                />
                <button
                  onClick={() => copyToClipboard(newApiKey)}
                  className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-r-md"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setNewApiKey("");
                setShowCreateEnvModal(false);
                setCreating(false);
              }}
              className="w-full inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreateEnv}>
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-800">{error}</div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="envName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="envName"
                  required
                  value={envName}
                  onChange={(e) => setEnvName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  placeholder="Production"
                />
              </div>

              <div>
                <label
                  htmlFor="envKey"
                  className="block text-sm font-medium text-gray-700"
                >
                  Key
                </label>
                <input
                  type="text"
                  id="envKey"
                  required
                  value={envKey}
                  onChange={(e) =>
                    setEnvKey(
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                    )
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  placeholder="prod"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Lowercase letters, numbers, and dashes only
                </p>
              </div>
            </div>

            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
              <button
                type="submit"
                disabled={creating}
                className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateEnvModal(false)}
                className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </Modal>
      <ConfirmDialog
        isOpen={!!confirmRotateEnv}
        onClose={() => setConfirmRotateEnv(null)}
        onConfirm={handleRotateKey}
        title="Rotate API Key"
        message="Old API key stops working immediately. Update your apps with the new key."
        confirmLabel="Rotate Key"
        confirmVariant="primary"
        loading={confirming}
      />
      <ConfirmDialog
        isOpen={!!confirmDeleteEnv}
        onClose={() => setConfirmDeleteEnv(null)}
        onConfirm={handleDeleteEnv}
        title="Delete Environment"
        message="This will permanently delete all flag rules for this environment."
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={confirming}
      />
    </Layout>
  );
};
