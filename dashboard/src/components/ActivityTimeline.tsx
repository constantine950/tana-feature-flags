import React from "react";
import { CheckCircle, XCircle, Edit, Plus, Trash2 } from "lucide-react";

interface Activity {
  id: string;
  action: string;
  entity_type: string; // Changed from resource_type
  user_email: string;
  changes: any; // Changed from details
  created_at: string;
}

interface ActivityTimelineProps {
  activities: Activity[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
}) => {
  const getIcon = (action: string) => {
    if (action.includes("created")) {
      return <Plus className="h-5 w-5 text-green-500" />;
    }
    if (action.includes("updated")) {
      return <Edit className="h-5 w-5 text-blue-500" />;
    }
    if (action.includes("deleted")) {
      return <Trash2 className="h-5 w-5 text-red-500" />;
    }
    if (action.includes("enabled")) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    if (action.includes("disabled")) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    return <Edit className="h-5 w-5 text-gray-500" />;
  };

  const getActionText = (activity: Activity) => {
    const { action, entity_type, changes } = activity;

    if (action === "create" && entity_type === "project") {
      return `created project "${changes?.name}"`;
    }
    if (action === "create" && entity_type === "flag") {
      return `created flag "${changes?.name}" (${changes?.key})`;
    }
    if (action === "update" && entity_type === "rule") {
      return `updated rule: ${changes?.enabled ? "enabled" : "disabled"} (${changes?.percentage}%)`;
    }
    if (action === "create" && entity_type === "environment") {
      return `created environment "${changes?.name}"`;
    }

    return `${action} ${entity_type}`;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);

    // Show absolute time instead of relative
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        No activity yet
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, idx) => (
          <li key={activity.id}>
            <div className="relative pb-8">
              {idx !== activities.length - 1 && (
                <span
                  className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex items-start space-x-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                    {getIcon(activity.action)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">
                        {activity.user_email}
                      </span>{" "}
                      <span className="text-gray-500">
                        {getActionText(activity)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {formatTime(activity.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
