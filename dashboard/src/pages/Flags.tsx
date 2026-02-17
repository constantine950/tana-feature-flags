import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Settings, ArrowLeft, Flag, Trash2 } from "lucide-react";
import { Layout } from "../components/Layout";
import { Modal } from "../components/Modal";
import { Drawer } from "../components/Drawer";
import { Badge } from "../components/Badge";
import { EmptyState } from "../components/EmptyState";
import { Project, Environment, FlagWithRule, FlagRule } from "../types";
import {
  analyticsApi,
  environmentsApi,
  flagsApi,
  projectsApi,
} from "../../lib/api";
import toast from "react-hot-toast";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { FlagRowSkeleton } from "../components/Skeleton";

export const Flags: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [selectedEnv, setSelectedEnv] = useState<string>("");
  const [flags, setFlags] = useState<FlagWithRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [flagStats, setFlagStats] = useState<any>(null);
  const [togglingFlag, setTogglingFlag] = useState<string | null>(null);
  const [confirmDeleteFlag, setConfirmDeleteFlag] = useState<string | null>(
    null,
  );
  const [deletingFlag, setDeletingFlag] = useState(false);
  const [loadingFlags, setLoadingFlags] = useState(false);

  // Create flag modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [flagKey, setFlagKey] = useState("");
  const [flagName, setFlagName] = useState("");
  const [flagDescription, setFlagDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // Rule drawer
  const [showRuleDrawer, setShowRuleDrawer] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<FlagWithRule | null>(null);
  const [ruleEnabled, setRuleEnabled] = useState(false);
  const [rulePercentage, setRulePercentage] = useState(0);
  const [ruleWhitelist, setRuleWhitelist] = useState("");
  const [ruleBlacklist, setRuleBlacklist] = useState("");
  const [savingRule, setSavingRule] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadProject();
      loadEnvironments();
    }
  }, [projectId]);

  useEffect(() => {
    if (selectedEnv) {
      loadFlags();
    }
  }, [selectedEnv]);

  const loadProject = async () => {
    try {
      const data = await projectsApi.get(projectId!);
      setProject(data.project);
    } catch (err) {
      console.error("Failed to load project:", err);
    }
  };

  const loadEnvironments = async () => {
    try {
      const data = await environmentsApi.list(projectId!);
      setEnvironments(data.environments || []);
      if (data.environments && data.environments.length > 0) {
        setSelectedEnv(data.environments[0].id);
      }
    } catch (err) {
      console.error("Failed to load environments:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadFlags = async () => {
    setLoadingFlags(true);
    try {
      const data = await flagsApi.list(projectId!, selectedEnv);
      setFlags(data.flags || []);
    } catch (err) {
      console.error("Failed to load flags:", err);
    } finally {
      setLoadingFlags(false);
    }
  };

  const handleCreateFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCreating(true);

    try {
      await flagsApi.create(projectId!, flagKey, flagName, flagDescription);
      toast.success("Flag created!");
      setShowCreateModal(false);
      setFlagKey("");
      setFlagName("");
      setFlagDescription("");
      loadFlags();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Failed to create flag");
    } finally {
      setCreating(false);
    }
  };

  const openRuleDrawer = async (flag: FlagWithRule) => {
    setSelectedFlag(flag);

    // Load stats
    try {
      const data = await analyticsApi.getFlagStats(flag.id);
      setFlagStats(data.stats);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }

    if (flag.rule) {
      setRuleEnabled(flag.rule.enabled);
      setRulePercentage(flag.rule.percentage);
      setRuleWhitelist(flag.rule.user_whitelist.join(", "));
      setRuleBlacklist(flag.rule.user_blacklist.join(", "));
    } else {
      setRuleEnabled(false);
      setRulePercentage(0);
      setRuleWhitelist("");
      setRuleBlacklist("");
    }

    setShowRuleDrawer(true);
  };

  const handleSaveRule = async () => {
    if (!selectedFlag) return;
    setSavingRule(true);

    try {
      await flagsApi.updateRule(selectedFlag.id, selectedEnv, {
        enabled: ruleEnabled,
        percentage: rulePercentage,
        userWhitelist: ruleWhitelist
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        userBlacklist: ruleBlacklist
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      toast.success("Rule saved!");
      setShowRuleDrawer(false);
      loadFlags();
    } catch (err) {
      toast.error("Failed to save rule");
    } finally {
      setSavingRule(false);
    }
  };

  const handleQuickToggle = async (flag: FlagWithRule, e: React.MouseEvent) => {
    e.stopPropagation();
    if (togglingFlag === flag.id) return;

    setTogglingFlag(flag.id);
    const newEnabled = !flag.rule?.enabled;

    try {
      await flagsApi.updateRule(flag.id, selectedEnv, {
        enabled: newEnabled,
        percentage: flag.rule?.percentage ?? 0,
        userWhitelist: flag.rule?.user_whitelist ?? [],
        userBlacklist: flag.rule?.user_blacklist ?? [],
      });
      toast.success(`${flag.name} ${newEnabled ? "enabled" : "disabled"}`);
      loadFlags();
    } catch (err) {
      toast.error("Failed to toggle flag");
    } finally {
      setTogglingFlag(null);
    }
  };

  const handleDeleteFlag = async () => {
    if (!confirmDeleteFlag) return;
    setDeletingFlag(true);

    try {
      await flagsApi.delete(confirmDeleteFlag);
      toast.success("Flag deleted");
      setConfirmDeleteFlag(null);
      loadFlags();
    } catch (err) {
      toast.error("Failed to delete flag");
    } finally {
      setDeletingFlag(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Active</Badge>;
      case "inactive":
        return <Badge variant="warning">Inactive</Badge>;
      case "archived":
        return <Badge variant="default">Archived</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRolloutBadge = (rule?: FlagRule | null) => {
    if (!rule) {
      return <Badge variant="default">Not configured</Badge>;
    }

    if (!rule.enabled) {
      return <Badge variant="danger">Disabled</Badge>;
    }

    if (rule.percentage === 100) {
      return <Badge variant="success">100% Enabled</Badge>;
    }

    if (rule.percentage === 0) {
      return <Badge variant="warning">0% Enabled</Badge>;
    }

    return <Badge variant="info">{rule.percentage}% Rollout</Badge>;
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

  if (environments.length === 0) {
    return (
      <Layout>
        <div className="px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(`/projects/${projectId}`)}
            className="mb-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to project
          </button>

          <EmptyState
            icon={<Flag className="h-12 w-12" />}
            title="No environments"
            description="Create an environment first before adding flags"
            action={{
              label: "Go to Project",
              onClick: () => navigate(`/projects/${projectId}`),
            }}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(`/projects/${projectId}`)}
          className="mb-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to project
        </button>

        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {project?.name} - Feature Flags
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage feature flags and rollout rules
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Flag
            </button>
          </div>
        </div>

        {/* Environment Selector */}
        <div className="mt-6">
          <label
            htmlFor="environment"
            className="block text-sm font-medium text-gray-700"
          >
            Environment
          </label>
          <select
            id="environment"
            value={selectedEnv}
            onChange={(e) => setSelectedEnv(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {environments.map((env) => (
              <option key={env.id} value={env.id}>
                {env.name} ({env.key})
              </option>
            ))}
          </select>
        </div>

        {loadingFlags ? (
          <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {[1, 2, 3].map((i) => (
                <FlagRowSkeleton key={i} />
              ))}
            </ul>
          </div>
        ) : flags.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon={<Flag className="h-12 w-12" />}
              title="No flags"
              description="Create your first feature flag"
              action={{
                label: "Create Flag",
                onClick: () => setShowCreateModal(true),
              }}
            />
          </div>
        ) : (
          <div className="mt-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {flags.map((flag) => (
                  <li
                    key={flag.id}
                    className="px-4 py-4 sm:px-6 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {/* Quick Toggle */}
                        <button
                          onClick={(e) => handleQuickToggle(flag, e)}
                          disabled={togglingFlag === flag.id}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 ${
                            flag.rule?.enabled ? "bg-indigo-600" : "bg-gray-200"
                          }`}
                          title={
                            flag.rule?.enabled
                              ? "Click to disable"
                              : "Click to enable"
                          }
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              flag.rule?.enabled
                                ? "translate-x-5"
                                : "translate-x-0"
                            }`}
                          />
                        </button>

                        <div className="min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {flag.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                              {flag.key}
                            </code>
                            {flag.description && (
                              <span className="ml-2 text-xs truncate">
                                {flag.description}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 ml-4">
                        {getRolloutBadge(flag.rule)}

                        <button
                          onClick={() => openRuleDrawer(flag)}
                          className="text-gray-400 hover:text-indigo-600 transition-colors"
                          title="Configure"
                        >
                          <Settings className="h-5 w-5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteFlag(flag.id);
                          }}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Create Flag Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setError("");
          setFlagKey("");
          setFlagName("");
          setFlagDescription("");
        }}
        title="Create Feature Flag"
      >
        <form onSubmit={handleCreateFlag}>
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="flagKey"
                className="block text-sm font-medium text-gray-700"
              >
                Key
              </label>
              <input
                type="text"
                id="flagKey"
                required
                value={flagKey}
                onChange={(e) =>
                  setFlagKey(
                    e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                  )
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder="new_checkout_flow"
              />
              <p className="mt-1 text-xs text-gray-500">
                Lowercase letters, numbers, and underscores only
              </p>
            </div>

            <div>
              <label
                htmlFor="flagName"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                type="text"
                id="flagName"
                required
                value={flagName}
                onChange={(e) => {
                  const name = e.target.value;
                  setFlagName(name);
                  if (!flagKey) {
                    setFlagKey(
                      name
                        .toLowerCase()
                        .replace(/\s+/g, "_")
                        .replace(/[^a-z0-9_]/g, ""),
                    );
                  }
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder="New Checkout Flow"
              />
            </div>

            <div>
              <label
                htmlFor="flagDescription"
                className="block text-sm font-medium text-gray-700"
              >
                Description (optional)
              </label>
              <textarea
                id="flagDescription"
                rows={3}
                value={flagDescription}
                onChange={(e) => setFlagDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder="Redesigned checkout experience..."
              />
            </div>
          </div>

          <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <button
              type="submit"
              disabled={creating}
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Flag"}
            </button>
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Rule Configuration Drawer */}
      <Drawer
        isOpen={showRuleDrawer}
        onClose={() => setShowRuleDrawer(false)}
        title={`Configure: ${selectedFlag?.name}`}
      >
        <div className="space-y-6">
          {flagStats && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Evaluation Stats
              </h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {flagStats.totalEvaluations}
                  </div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {flagStats.enabledCount}
                  </div>
                  <div className="text-xs text-gray-500">Enabled</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {flagStats.disabledCount}
                  </div>
                  <div className="text-xs text-gray-500">Disabled</div>
                </div>
              </div>
            </div>
          )}

          {/* Enable/Disable Toggle */}
          <div>
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Enabled</span>
              <button
                type="button"
                onClick={() => setRuleEnabled(!ruleEnabled)}
                className={`${
                  ruleEnabled ? "bg-indigo-600" : "bg-gray-200"
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    ruleEnabled ? "translate-x-5" : "translate-x-0"
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </label>
            <p className="mt-1 text-xs text-gray-500">
              Master switch - flag must be enabled to work
            </p>
          </div>

          {/* Percentage Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rollout Percentage: {rulePercentage}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={rulePercentage}
              onChange={(e) => setRulePercentage(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Percentage of users who will see this feature
            </p>
          </div>

          {/* User Whitelist */}
          <div>
            <label
              htmlFor="whitelist"
              className="block text-sm font-medium text-gray-700"
            >
              User Whitelist
            </label>
            <textarea
              id="whitelist"
              rows={3}
              value={ruleWhitelist}
              onChange={(e) => setRuleWhitelist(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              placeholder="user_1, user_2, user_3"
            />
            <p className="mt-1 text-xs text-gray-500">
              Comma-separated user IDs. Always enabled for these users.
            </p>
          </div>

          {/* User Blacklist */}
          <div>
            <label
              htmlFor="blacklist"
              className="block text-sm font-medium text-gray-700"
            >
              User Blacklist
            </label>
            <textarea
              id="blacklist"
              rows={3}
              value={ruleBlacklist}
              onChange={(e) => setRuleBlacklist(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              placeholder="user_4, user_5"
            />
            <p className="mt-1 text-xs text-gray-500">
              Comma-separated user IDs. Always disabled for these users.
            </p>
          </div>

          {/* Evaluation Order Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Evaluation Order
            </h4>
            <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
              <li>Check if flag is enabled (master switch)</li>
              <li>Check blacklist → disabled if user in list</li>
              <li>Check whitelist → enabled if user in list</li>
              <li>Check percentage → enabled if user's bucket &lt; %</li>
            </ol>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t">
            <button
              onClick={handleSaveRule}
              disabled={savingRule}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {savingRule ? "Saving..." : "Save Rule"}
            </button>
          </div>
        </div>
      </Drawer>
    </Layout>
  );
};
